import { OpenRPC, MethodObject } from "@open-rpc/meta-schema";

export interface IContentDescriptorTyping {
  typeId: string;
  typeName: string;
  typing: string;
}

export interface IMethodTypingsMap {
  [k: string]: IContentDescriptorTyping;
}

export type TGetMethodTypingsMap = (openrpcSchema: OpenRPC) => Promise<IMethodTypingsMap>;
export type TGetMethodTypeAlias = (method: MethodObject, typeDefs: IMethodTypingsMap) => string;
export type TGetMethodAliasName = (method: MethodObject) => string;

export interface IGenerator {
  getMethodTypingsMap: TGetMethodTypingsMap;
  getMethodTypeAlias: TGetMethodTypeAlias;
  getMethodAliasName: TGetMethodAliasName;
}
