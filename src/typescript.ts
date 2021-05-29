import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
} from "./generator-interface";
import { languageSafeName, getTitle } from "@json-schema-tools/transpiler/build/utils";
import titleizer from "@json-schema-tools/titleizer";
import { ContentDescriptorObject, MethodObject } from "@open-rpc/meta-schema";

export const getMethodAliasName: GetMethodAliasName = (method) => {
  return languageSafeName(method.name);
};

const getMethodTyping = (method: MethodObject): string => {
  const result = method.result as ContentDescriptorObject;
  const mutableSchema = (result.schema === true || result.schema === false) ? result.schema : { ...result.schema };
  const resultName = getTitle(titleizer(mutableSchema));
  const resultTypeName = `Promise<${languageSafeName(resultName)}>`;

  const methodAliasName = getMethodAliasName(method);

  const params = (method.params as ContentDescriptorObject[]).map(
    (param) => [
      `${param.name}${param.required === false ? "?" : ""}: `,
      `${languageSafeName(getTitle(titleizer(param.schema)))}`,
    ].join(""),
  ).join(", ");

  return `export type ${methodAliasName} = (${params}) => ${resultTypeName};`;
};

export const getMethodTypings: GetMethodTypings = (openrpcDocument) => {
  return (openrpcDocument.methods as MethodObject[])
    .map((method: MethodObject) => getMethodTyping(method))
    .join("\n");
};

const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
};

export default generator;
