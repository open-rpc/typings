import { OpenrpcDocument as OpenRPC, MethodObject } from "@open-rpc/meta-schema";

export type GetMethodTypings = (openrpcSchema: OpenRPC) => string;
export type GetParamsTypings = (openrpcSchema: OpenRPC) => string;
export type GetParamsTyping = (method: MethodObject, joinString?: string) => string;

export type GetMethodAliasName = (method: MethodObject) => string;

export interface Generator {
  getMethodTypings: GetMethodTypings;
  getMethodAliasName: GetMethodAliasName;
  getParamsTypings: GetParamsTypings;
  getParamsTyping: GetParamsTyping;
}
