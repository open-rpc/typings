import {
  Generator,
  GetMethodTypings,
} from "./generator-interface";
import _ from "lodash";
import { toSafeString } from "json-schema-to-typescript/dist/src/utils";
import { ContentDescriptorObject, MethodObject, Schema } from "@open-rpc/meta-schema";
import { getSchemaTypeName, getMethodAliasName, getSchemasForOpenRPCDocument } from "./utils";

const getMethodTyping = (method: MethodObject): string => {
  const result = method.result as ContentDescriptorObject;
  const resultTypeName = getSchemaTypeName(result.schema);

  const methodAliasName = getMethodAliasName(method);

  const params = _.map(
    method.params as ContentDescriptorObject[],
    (param) => `${param.name} ${getSchemaTypeName(param.schema)}`,
  ).join(", ");

  return `\t${methodAliasName}(${params}) (${resultTypeName}, error)`;
};

export const getMethodTypings: GetMethodTypings = (openrpcDocument) => {
  const fns = openrpcDocument.methods.map(getMethodTyping);
  return [
    `type ${toSafeString(openrpcDocument.info.title)} interface {`,
    fns.join("\n"),
    "}",
  ].join("\n");
};

const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
  getSchemaTypeName,
};

export default generator;
