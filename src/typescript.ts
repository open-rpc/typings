import {
  IGenerator,
  TGetMethodTypingsMap,
  IContentDescriptorTyping,
  TGetMethodTypeAlias,
} from "./generator-interface";
import _ from "lodash";
import { generateMethodParamId, generateMethodResultId } from "@open-rpc/schema-utils-js";
import { compile } from "json-schema-to-typescript";
import { ContentDescriptorObject, MethodObject } from "@open-rpc/meta-schema";

const getMethodAliasName = ({ name }: MethodObject): string => {
  return getTypeName({ name, schema: { type: "function" } });
};

const getTypeName = (contentDescriptor: ContentDescriptorObject): string => {
  const { schema } = contentDescriptor;

  const interfaceTypes = ["object", undefined];
  let prefix = "T";
  if (interfaceTypes.includes(schema.type)) {
    prefix = "I";
  }

  const contentDescriptorName = _.startCase(contentDescriptor.name).replace(/\s/g, "");

  return `${prefix}${contentDescriptorName}`;
};

const getTypingForContentDescriptor = async (
  method: MethodObject,
  isParam: boolean,
  contentDescriptor: ContentDescriptorObject,
): Promise<IContentDescriptorTyping> => {
  const generateId = isParam ? generateMethodParamId : generateMethodResultId;
  let typeName;
  typeName = getTypeName(contentDescriptor);

  const rawTyping = await compile(
    contentDescriptor.schema,
    typeName,
    { bannerComment: "", declareExternallyReferenced: false },
  );

  const typing = {
    typeId: generateId(method, contentDescriptor),
    typeName,
    typing: rawTyping.trim(),
  };

  return typing;
};

const getMethodTypingsMap: TGetMethodTypingsMap = async (openrpcSchema) => {
  const methodTypingsPromises = _.map(openrpcSchema.methods, async (method) => {
    const mparams = method.params as ContentDescriptorObject[];
    const mresult = method.result;

    const typingsForParams = await Promise.all(
      _.chain(mparams)
        .map((param) => getTypingForContentDescriptor(method, true, param))
        .value() as Array<Promise<IContentDescriptorTyping>>,
    );

    const typingsForResult = await getTypingForContentDescriptor(
      method,
      false,
      mresult as ContentDescriptorObject,
    );

    return [...typingsForParams, typingsForResult];
  });

  const methodTypings: IContentDescriptorTyping[][] = await Promise.all(methodTypingsPromises);

  const finalTypings = _.chain(methodTypings)
    .flatten()
    .map((typing: IContentDescriptorTyping, i) => {
      typing.typing = typing.typing.replace(/extern crate serde_json;/g, "");
      return typing;
    })
    .keyBy("typeId")
    .value();

  return finalTypings;
};

const getMethodTypeAlias: TGetMethodTypeAlias = (method, typeDefs) => {
  const result = method.result as ContentDescriptorObject;
  const resultTypeName = `Promise<${typeDefs[generateMethodResultId(method, result)].typeName}>`;

  const functionTypeName = getMethodAliasName(method);

  const params = _.map(
    method.params as ContentDescriptorObject[],
    (param) => `${param.name}: ${typeDefs[generateMethodParamId(method, param)].typeName}`,
  ).join(", ");

  return `export type ${functionTypeName} = (${params}): ${resultTypeName};`;
};

const generator: IGenerator = {
  getMethodAliasName,
  getMethodTypeAlias,
  getMethodTypingsMap,
};

export default generator;
