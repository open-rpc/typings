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
  if (interfaceTypes.includes(schema.type) || schema.anyOf !== undefined || schema.oneOf !== undefined) {
    prefix = "I";
  }

  const contentDescriptorName = _.startCase(contentDescriptor.name).replace(/\s/g, "");

  return `${prefix}${contentDescriptorName}`;
};

const getTypingForContentDescriptor = (contentDescriptor: any): Promise<string> => {
  const generateId = contentDescriptor.isParam ? generateMethodParamId : generateMethodResultId;
  let typeName;
  typeName = getTypeName(contentDescriptor);

  return compile(
    contentDescriptor.schema,
    typeName,
    { bannerComment: "", declareExternallyReferenced: false },
  );
};

const getMethodTypingsMap: TGetMethodTypingsMap = async (openrpcSchema) => {
  const { methods } = openrpcSchema;

  const allCD = [
    ..._.chain(methods).map("params").flatten().map((cd) => ({ ...cd, isParam: true })).value() as [],
    ..._.map(methods, "result"),
  ];

  const cdWithNullFix = _.map(allCD, (cd: any) => {
    if (cd.schema.oneOf) { // this should be recursive
      cd.schema.oneOf = _.filter(cd.schema.oneOf, (subschema: any) => subschema.type !== "null");
    }
    return cd;
  });

  const fixedDupesAllCD = _.map(
    cdWithNullFix,
    (cd: ContentDescriptorObject, index, collection): ContentDescriptorObject => {
      let hits = 0;
      const nameWithoutChange = cd.name;
      const stringifiedCd = JSON.stringify(cd.schema);

      _.each(
        collection as ContentDescriptorObject[],
        (cdToCheck) => {
          if (cdToCheck.name === nameWithoutChange) {
            if (JSON.stringify(cdToCheck.schema) !== stringifiedCd) {
              hits += 1;
            }
          }
        });

      if (hits > 1) {
        cd.name = cd.name + (hits - 1);
      }

      return cd;
    });

  const dedupedContentDescriptors = _.uniqBy(fixedDupesAllCD, "name");

  const typingsForContentDescriptors = await Promise.all(
    _.map(dedupedContentDescriptors, getTypingForContentDescriptor),
  );

  const typings = _.chain(methods)
    .map((method) => {
      const r = [];
      const result = method.result as ContentDescriptorObject;
      const params = method.params as ContentDescriptorObject[];
      return [
        {
          typeId: generateMethodResultId(method, result),
          typeName: getTypeName(result),
          typing: "",
        },
        ..._.map(params, (param) => ({
          typeId: generateMethodParamId(method, param),
          typeName: getTypeName(param),
          typing: "",
        })),
      ];
    })
    .flatten()
    .keyBy("typeId")
    .value();

  typings[Object.keys(typings)[0]].typing = typingsForContentDescriptors.join("");

  return typings;
};

const getMethodTypeAlias: TGetMethodTypeAlias = (method, typeDefs) => {
  const result = method.result as ContentDescriptorObject;
  const resultTypeName = `Promise<${typeDefs[generateMethodResultId(method, result)].typeName}>`;

  const functionTypeName = getMethodAliasName(method);

  const params = _.map(
    method.params as ContentDescriptorObject[],
    (param) => `${param.name}: ${typeDefs[generateMethodParamId(method, param)].typeName}`,
  ).join(", ");

  return `export type ${functionTypeName} = (${params}) => ${resultTypeName};`;
};

const generator: IGenerator = {
  getMethodAliasName,
  getMethodTypeAlias,
  getMethodTypingsMap,
};

export default generator;
