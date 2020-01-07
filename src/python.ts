import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
} from "./generator-interface";

import { MethodObject, OpenRPC } from "@open-rpc/meta-schema";
import { languageSafeName } from "@etclabscore/json-schema-to-types/build/utils";

const getMethodTyping = (method: MethodObject) => {
  return "";
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
