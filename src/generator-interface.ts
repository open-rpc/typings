import { OpenRPC, MethodObject, Schema } from "@open-rpc/meta-schema";

export type GetMethodTypings = (openrpcSchema: OpenRPC) => string;
export type GetMethodAliasName = (method: MethodObject) => string;
export type GetSchemaTypeName = (schema: Schema) => string;

export interface Generator {
  getMethodTypings: GetMethodTypings;
  getMethodAliasName: GetMethodAliasName;
}
