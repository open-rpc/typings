import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
  GetParamsTypings,
} from "./generator-interface";
import { ContentDescriptorObject, MethodObject } from "./types";

import { languageSafeName, getTitle } from "@json-schema-tools/transpiler/build/utils";
import titleizer from "@json-schema-tools/titleizer";

export const getMethodAliasName: GetMethodAliasName = (method) => {
  return languageSafeName(method.name);
};

const getParamsTyping = (method: MethodObject): string => {
  const params = (method.params as ContentDescriptorObject[]).map(
    (param) => `${param.name} ${languageSafeName(getTitle(titleizer(param.schema)))}`,
  ).join(", ");
  return params;
}

const getMethodTyping = (method: MethodObject): string => {
  const mResult = method.result as ContentDescriptorObject;
  const methodAliasName = getMethodAliasName(method);
  const params = getParamsTyping(method);

  if(mResult === undefined) {
    return `\t${methodAliasName}(${params}) error`;
  }

  const mutableSchema = (mResult.schema === true || mResult.schema === false) ? mResult.schema : { ...mResult.schema };
  const resultName = languageSafeName(getTitle(titleizer(mutableSchema)));

  return `\t${methodAliasName}(${params}) (${resultName}, error)`;
};

export const getMethodTypings: GetMethodTypings = (openrpcDocument) => {
  const fns = (openrpcDocument.methods as MethodObject[]).map(getMethodTyping);
  return [
    `type ${languageSafeName(openrpcDocument.info.title)} interface {`,
    fns.join("\n"),
    "}",
  ].join("\n");
};

export const getParamsTypings: GetParamsTypings = (openrpcDocument) => {
  const types = (openrpcDocument.methods as MethodObject[]).map(getParamsTyping);
  return types.join("\n");
};

const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
  getParamsTypings,
  getParamsTyping,
};

export default generator;
