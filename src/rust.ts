import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
} from "./generator-interface";

import { ContentDescriptorObject, MethodObject, OpenRPC } from "@open-rpc/meta-schema";
import { languageSafeName, ensureSchemaTitles } from "@etclabscore/json-schema-to-types/build/utils";

const getMethodTyping = (method: MethodObject) => {
  const mResult = method.result as ContentDescriptorObject;
  const resultName = ensureSchemaTitles({ ...mResult.schema });
  const result = `RpcRequest<${languageSafeName(resultName.title)}>`;

  const methodAliasName = getMethodAliasName(method);

  const params = (method.params as ContentDescriptorObject[]).map(
    (param) => `${param.name}: ${languageSafeName(ensureSchemaTitles(param.schema).title)}`,
  ).join(", ");

  const paramString = (params.length > 0) ? `, ${params}` : "";

  return `pub fn ${method.name}(&mut self${paramString}) -> ${result};`;
};

export const getMethodTypings: GetMethodTypings = (openrpcDocument: OpenRPC) => {
  return openrpcDocument.methods
    .map((method) => getMethodTyping(method))
    .join("\n");
};

export const getMethodAliasName: GetMethodAliasName = (method) => {
  return languageSafeName(method.name);
};

const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
};

export default generator;
