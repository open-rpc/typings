import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
} from "./generator-interface";
import { ContentDescriptorObject, MethodObject } from "@open-rpc/meta-schema";
import { languageSafeName, ensureSchemaTitles } from "@etclabscore/json-schema-to-types/build/utils";

export const getMethodAliasName: GetMethodAliasName = (method) => {
  return languageSafeName(method.name);
};

const getMethodTyping = (method: MethodObject): string => {
  const result = method.result as ContentDescriptorObject;
  const resultName = ensureSchemaTitles({ ...result.schema });
  const resultTypeName = `Promise<${languageSafeName(resultName.title)}>`;

  const methodAliasName = getMethodAliasName(method);

  const params = (method.params as ContentDescriptorObject[]).map(
    (param) => [
      `${param.name}${param.required ? "" : "?"}: `,
      `${languageSafeName(ensureSchemaTitles(param.schema).title)}`,
    ].join(""),
  ).join(", ");

  return `export type ${methodAliasName} = (${params}) => ${resultTypeName};`;
};

export const getMethodTypings: GetMethodTypings = (openrpcDocument) => {
  return openrpcDocument.methods
    .map((method) => getMethodTyping(method))
    .join("\n");
};

const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
};

export default generator;
