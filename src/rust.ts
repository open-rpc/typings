import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
} from "./generator-interface";

import { ContentDescriptorObject, MethodObject, OpenrpcDocument as OpenRPC } from "@open-rpc/meta-schema";
import { languageSafeName, getTitle } from "@json-schema-tools/transpiler/build/utils";
import titleizer from "@json-schema-tools/transpiler/build/titleizer";

export const getMethodAliasName: GetMethodAliasName = (method) => {
  return languageSafeName(method.name);
};

const getMethodTyping = (method: MethodObject) => {
  const mResult = method.result as ContentDescriptorObject;
  const mutableSchema = (mResult.schema === true || mResult.schema === false) ? mResult.schema : { ...mResult.schema };
  const resultName = getTitle(titleizer(mutableSchema));
  const result = `RpcRequest<${languageSafeName(resultName)}>`;

  const methodAliasName = getMethodAliasName(method);

  const params = (method.params as ContentDescriptorObject[]).map(
    (param) => `${param.name}: ${languageSafeName(getTitle(titleizer(param.schema)))}`,
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
