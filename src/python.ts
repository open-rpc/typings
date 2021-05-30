import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
} from "./generator-interface";

import { MethodObject, OpenrpcDocument as OpenRPC } from "@open-rpc/meta-schema";
import { languageSafeName } from "@json-schema-tools/transpiler/build/utils";

const getMethodTyping = (method: MethodObject) => {
  return "";
};

export const getMethodTypings: GetMethodTypings = (openrpcDocument: OpenRPC) => {
  return (openrpcDocument.methods as MethodObject[])
    .map((method: MethodObject) => getMethodTyping(method))
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
