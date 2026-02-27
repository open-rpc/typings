import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
  GetParamsTypings,
} from "./generator-interface";

import { ContentDescriptorObject, MethodObject, OpenrpcDocument as OpenRPC } from "./types";
import { languageSafeName, getTitle } from "@json-schema-tools/transpiler/build/utils";
import titleizer from "@json-schema-tools/titleizer";

export const getMethodAliasName: GetMethodAliasName = (method) => {
  return languageSafeName(method.name);
};

const getParamsTyping = (method: MethodObject) => {
  const params = (method.params as ContentDescriptorObject[]).map(
    (param) => `${param.name}: ${languageSafeName(getTitle(titleizer(param.schema)))}`,
  ).join(", ");

  return params;
}

const getMethodTyping = (method: MethodObject) => {
  const mResult = method.result as ContentDescriptorObject;
  let result = `RpcRequest<void>`;

  if(mResult !== undefined) {
    const mutableSchema = (mResult.schema === true || mResult.schema === false) ? mResult.schema : { ...mResult.schema };
    const resultName = getTitle(titleizer(mutableSchema));
    result = `RpcRequest<${languageSafeName(resultName)}>`;
  }

  const methodAliasName = getMethodAliasName(method);
  const params = getParamsTyping(method);

  const paramString = (params.length > 0) ? `, ${params}` : "";

  return `pub fn ${methodAliasName}(&mut self${paramString}) -> ${result};`;
};

export const getMethodTypings: GetMethodTypings = (openrpcDocument: OpenRPC) => {
  return (openrpcDocument.methods as MethodObject[])
    .map((method: MethodObject) => getMethodTyping(method))
    .join("\n");
};

export const getParamsTypings: GetParamsTypings = (openrpcDocument: OpenRPC) => {
  return (openrpcDocument.methods as MethodObject[])
    .map((method: MethodObject) => getParamsTyping(method))
    .join("\n");
};

const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
  getParamsTypings,
  getParamsTyping,
};

export default generator;
