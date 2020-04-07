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
  const mResult = method.result as ContentDescriptorObject;
  const resultName = languageSafeName(ensureSchemaTitles({ ...mResult.schema }).title as string);

  const methodAliasName = getMethodAliasName(method);

  const params = (method.params as ContentDescriptorObject[]).map(
    (param) => `${param.name} ${languageSafeName(ensureSchemaTitles(param.schema).title as string)}`,
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


const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
};

export default generator;
