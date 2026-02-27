import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
  GetParamsTypings,
  GetParamsTyping,
} from "./generator-interface";

import { MethodObject, OpenrpcDocument as OpenRPC } from "./types";
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

export const getParamsTyping: GetParamsTyping = (method) => {
  return "";
};

export const getParamsTypings: GetParamsTypings = (method) => {
  return "";
};

const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
  getParamsTypings,
  getParamsTyping,
};

export default generator;
