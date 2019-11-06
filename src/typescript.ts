import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
} from "./generator-interface";
import _ from "lodash";
import { ContentDescriptorObject, MethodObject, Schema } from "@open-rpc/meta-schema";
import { getSchemasForOpenRPCDocument } from "./utils";
import { languageSafeName, ensureSchemaTitles } from "@etclabscore/json-schema-to-types/build/utils";

export const getMethodAliasName: GetMethodAliasName = (method) => {
  return languageSafeName(method.name);
};

const getMethodTyping = (method: MethodObject): string => {
  const result = method.result as ContentDescriptorObject;
  const resultName = ensureSchemaTitles({ ...result.schema });
  const resultTypeName = `Promise<${languageSafeName(resultName.title)}>`;

  const methodAliasName = getMethodAliasName(method);

  const params = _.map(
    method.params as ContentDescriptorObject[],
    (param) => `${param.name}${param.required ? "" : "?"}: ${languageSafeName(ensureSchemaTitles(param.schema).title)}`,
  ).join(", ");

  return `export type ${methodAliasName} = (${params}) => ${resultTypeName};`;
};

export const getMethodTypings: GetMethodTypings = (openrpcDocument) => {
  return _.chain(openrpcDocument.methods)
    .map((method) => getMethodTyping(method))
    .join("\n")
    .value();
};

const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
};

export default generator;
