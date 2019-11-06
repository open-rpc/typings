import {
  Generator,
  GetMethodTypings,
  GetMethodAliasName,
  GetSchemaTypeName,
} from "./generator-interface";

import { ContentDescriptorObject, MethodObject, OpenRPC } from "@open-rpc/meta-schema";
import _ from "lodash";
import { languageSafeName, ensureSchemaTitles } from "@etclabscore/json-schema-to-types/build/utils";

const getMethodTyping = (method: MethodObject) => {
  const mResult = method.result as ContentDescriptorObject;
  const resultName = ensureSchemaTitles({ ...mResult.schema });
  const result = `RpcRequest<${languageSafeName(resultName.title)}>`;

  const methodAliasName = getMethodAliasName(method);

  const params = _.map(
    method.params as ContentDescriptorObject[],
    (param) => `${param.name}: ${languageSafeName(ensureSchemaTitles(param.schema).title)}`,
  ).join(", ");

  const paramString = (params.length > 0) ? `, ${params}` : "";

  return `pub fn ${method.name}(&mut self${paramString}) -> ${result};`;
};

export const getMethodTypings: GetMethodTypings = (openrpcDocument: OpenRPC) => {
  return _.chain(openrpcDocument.methods)
    .map((method) => getMethodTyping(method))
    .join("\n")
    .value();
};

export const getMethodAliasName: GetMethodAliasName = (method) => {
  return languageSafeName(method.name);
};

const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
};

export default generator;
