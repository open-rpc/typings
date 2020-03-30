import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
} from "./generator-interface";

import { ContentDescriptorObject, MethodObject, OpenrpcDocument as OpenRPC } from "@open-rpc/meta-schema";
import { languageSafeName, ensureSchemaTitles } from "@etclabscore/json-schema-to-types/build/utils";

export const getMethodAliasName: GetMethodAliasName = (method) => {
  return languageSafeName(method.name);
};

const getMethodTyping = (method: MethodObject) => {
  const mResult = method.result as ContentDescriptorObject;
  const resultName = ensureSchemaTitles({ ...mResult.schema });
  const result = `RpcRequest<${languageSafeName(resultName.title as string)}>`;

  const methodAliasName = getMethodAliasName(method);

  const params = (method.params as ContentDescriptorObject[]).map(
    (param) => `${param.name}: ${languageSafeName(ensureSchemaTitles(param.schema).title as string)}`,
  ).join(", ");

  const paramString = (params.length > 0) ? `, ${params}` : "";

  return `pub fn ${methodAliasName}(&mut self${paramString}) -> ${result};`;
};

export const getMethodTypings: GetMethodTypings = (openrpcDocument: OpenRPC) => {
  return openrpcDocument.methods
    .map((method: MethodObject) => getMethodTyping(method))
    .join("\n");
};

const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
};

export default generator;
