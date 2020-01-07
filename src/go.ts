import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
} from "./generator-interface";
import { ContentDescriptorObject, MethodObject } from "@open-rpc/meta-schema";
import { languageSafeName, ensureSchemaTitles } from "@etclabscore/json-schema-to-types/build/utils";

const getMethodTyping = (method: MethodObject): string => {
  const mResult = method.result as ContentDescriptorObject;
  const resultName = languageSafeName(ensureSchemaTitles({ ...mResult.schema }).title);

  const methodAliasName = getMethodAliasName(method);

  const params = (method.params as ContentDescriptorObject[]).map(
    (param) => `${param.name} ${languageSafeName(ensureSchemaTitles(param.schema).title)}`,
  ).join(", ");

  return `\t${methodAliasName}(${params}) (${resultName}, error)`;
};

export const getMethodTypings: GetMethodTypings = (openrpcDocument) => {
  const fns = openrpcDocument.methods.map(getMethodTyping);
  return [
    `type ${languageSafeName(openrpcDocument.info.title)} interface {`,
    fns.join("\n"),
    "}",
  ].join("\n");
};

export const getMethodAliasName: GetMethodAliasName = (method) => {
  return languageSafeName(method.name);
};

const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
};

export default generator;
