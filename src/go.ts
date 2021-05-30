import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
} from "./generator-interface";
import { ContentDescriptorObject, MethodObject } from "@open-rpc/meta-schema";

import { languageSafeName, getTitle } from "@json-schema-tools/transpiler/build/utils";
import titleizer from "@json-schema-tools/titleizer";

export const getMethodAliasName: GetMethodAliasName = (method) => {
  return languageSafeName(method.name);
};

const getMethodTyping = (method: MethodObject): string => {
  const mResult = method.result as ContentDescriptorObject;
  const mutableSchema = (mResult.schema === true || mResult.schema === false) ? mResult.schema : { ...mResult.schema };
  const resultName = languageSafeName(getTitle(titleizer(mutableSchema)));

  const methodAliasName = getMethodAliasName(method);

  const params = (method.params as ContentDescriptorObject[]).map(
    (param) => `${param.name} ${languageSafeName(getTitle(titleizer(param.schema)))}`,
  ).join(", ");

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


const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
};

export default generator;
