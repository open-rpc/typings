import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
  GetParamsTyping,
} from "./generator-interface";
import { languageSafeName, getTitle } from "@json-schema-tools/transpiler/build/utils";
import titleizer from "@json-schema-tools/titleizer";
import { ContentDescriptorObject, MethodObject } from "@open-rpc/meta-schema";

export const getMethodAliasName: GetMethodAliasName = (method) => {
  return languageSafeName(method.name);
};

const getParamsTyping = (method: MethodObject, joinString?: string): string => {
  const params = (method.params as ContentDescriptorObject[]).map(
    (param) => [
      `${param.name}${param.required === false ? "?" : ""}: `,
      `${languageSafeName(getTitle(titleizer(param.schema)))}`,
    ].join(""),
  ).join(joinString || ", ");

  return params;
};

const getMethodTyping: GetParamsTyping = (method: MethodObject): string => {
  const methodAliasName = getMethodAliasName(method);
  const params = getParamsTyping(method);
  const result = method.result as ContentDescriptorObject;
  let resultTypeName = "Promise<void>";

  if(result  !== undefined) {
    const mutableSchema = (result.schema === true || result.schema === false) ? result.schema : { ...result.schema };
    const resultName = getTitle(titleizer(mutableSchema));
    resultTypeName = `Promise<${languageSafeName(resultName)}>`;
  }

  return `export type ${methodAliasName} = (${params}) => ${resultTypeName};`;
};

export const getMethodTypings: GetMethodTypings = (openrpcDocument) => {
  return (openrpcDocument.methods as MethodObject[])
    .map((method: MethodObject) => getMethodTyping(method))
    .join("\n");
};

export const getParamsTypings: GetMethodTypings = (openrpcDocument) => {
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
