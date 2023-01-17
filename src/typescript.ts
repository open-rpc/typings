import {
  Generator,
  GetMethodAliasName,
  GetMethodTypings,
  GetParamsTyping,
} from "./generator-interface";
import {
  getTitle,
  languageSafeName,
} from "@json-schema-tools/transpiler/build/utils";
import titleizer from "@json-schema-tools/titleizer";
import { ContentDescriptorObject, MethodObject } from "@open-rpc/meta-schema";

export const getMethodAliasName: GetMethodAliasName = (method) => {
  return languageSafeName(method.name);
};

const getParamsTyping = (method: MethodObject, joinString?: string): string => {
  const params = (method.params as ContentDescriptorObject[]).map(
    (param) =>
      [
        `${param.name}${param.required === false ? "?" : ""}: `,
        `${languageSafeName(getTitle(titleizer(param.schema)))}`,
      ].join(""),
  ).join(joinString || ", ");

  return params;
};

const getMethodTyping: GetParamsTyping = (method: MethodObject): string => {
  const result = method.result as ContentDescriptorObject;
  const mutableSchema = (result.schema === true || result.schema === false)
    ? result.schema
    : { ...result.schema };
  const resultName = getTitle(titleizer(mutableSchema));
  const resultTypeName = `Promise<${languageSafeName(resultName)}>`;

  const methodAliasName = getMethodAliasName(method);
  const params = getParamsTyping(method);

  return `export type ${methodAliasName} = (${params}) => ${resultTypeName};`;
};

export const getMethodTypings: GetMethodTypings = (openrpcDocument) => {
  return [
    ...(openrpcDocument.methods as MethodObject[])
      .map((method: MethodObject) => getMethodTyping(method)),
    `export interface ${languageSafeName(openrpcDocument.info.title)} {`,
    ...(openrpcDocument.methods as MethodObject[])
      .map((method: MethodObject) =>
        `  "${method.name}": ${languageSafeName(method.name)};`
      ),
    `}`,
  ].join("\n");
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
