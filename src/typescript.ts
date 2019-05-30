import {
  Generator,
  GetSchemaTypings,
  GetMethodTypings,
  GetMethodAliasName,
  GetSchemaTypeName,
} from "./generator-interface";
import _ from "lodash";
import { generateMethodParamId, generateMethodResultId } from "@open-rpc/schema-utils-js";
import { compile } from "json-schema-to-typescript";
import { toSafeString } from "json-schema-to-typescript/dist/src/utils";
import { ContentDescriptorObject, MethodObject, OpenRPC, Schema } from "@open-rpc/meta-schema";

/**
 * Helper methods
 */
const collectAndRefSchemas = (schema: Schema): Schema[] => {
  const newS: Schema = { ...schema };
  const subS = [];

  if (schema.anyOf) {
    subS.push(schema.anyOf);
    newS.anyOf = schema.anyOf.map(schemaToRef);
  }

  if (schema.allOf) {
    subS.push(schema.allOf);
    newS.allOf = schema.allOf.map(schemaToRef);
  }

  if (schema.oneOf) {
    subS.push(schema.oneOf);
    newS.oneOf = schema.oneOf.map(schemaToRef);
  }

  if (schema.items) {
    subS.push(schema.items);
    newS.items = schema.items.map(schemaToRef);
  }

  if (schema.properties) {
    subS.push(Object.values(schema.properties));
    newS.properties = _.mapValues(schema.properties, schemaToRef);
  }

  const subSchemas = _.chain(subS)
    .flatten()
    .compact()
    .value();

  return _.chain(subSchemas)
    .map(collectAndRefSchemas)
    .flattenDeep()
    .concat([newS])
    .uniqBy("title")
    .value();
};

const schemaToRef = (s: Schema) => ({ $ref: `#/definitions/${getSchemaTypeName(s)}` });
const extendMegaSchema = (ms: Schema, s: Schema): Schema => {
  const schemaTypeName = getSchemaTypeName(s);

  if (ms.definitions[schemaTypeName]) { return ms; }

  const schemas = collectAndRefSchemas(s);

  return {
    definitions: {
      ...ms.definitions,
      ..._.keyBy(schemas, getSchemaTypeName),
    },
    oneOf: [
      ...ms.oneOf,
      schemaToRef(s),
    ],
  } as Schema;
};

/**
 * Exported Methods
 */
export const getMethodAliasName: GetMethodAliasName = ({ name }: MethodObject): string => {
  return getSchemaTypeName({ title: name, type: "function" });
};

export const getSchemaTypeName: GetSchemaTypeName = (s: Schema): string => toSafeString(s.title);

export const getSchemaTypings: GetSchemaTypings = async (openrpcDocument: OpenRPC) => {
  const { methods } = openrpcDocument;

  const megaSchema = _.chain(methods)
    .map("params")
    .flatten()
    .concat(_.map(methods, "result"))
    .map("schema")
    .uniqBy(JSON.stringify)
    .reduce(extendMegaSchema, { definitions: {}, oneOf: [] } as Schema)
    .value();
  return await compile(
    megaSchema,
    `Any${getSchemaTypeName(openrpcDocument.info)}Type`,
    { bannerComment: "", declareExternallyReferenced: true },
  );
};

const getMethodTyping = (method: MethodObject) => {
  const result = method.result as ContentDescriptorObject;
  const resultTypeName = `Promise<${getSchemaTypeName(result.schema)}>`;

  const methodAliasName = getMethodAliasName(method);

  const params = _.map(
    method.params as ContentDescriptorObject[],
    (param) => `${param.name}: ${getSchemaTypeName(param.schema)}`,
  ).join(", ");

  return `export type ${methodAliasName} = (${params}) => ${resultTypeName};`;
};

export const getMethodTypings: GetMethodTypings = (openrpcDocument) => {
  return _.chain(openrpcDocument.methods)
    .map((method) => getMethodTyping(method))
    .join("\n")
    .value();
};

const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
  getSchemaTypeName,
  getSchemaTypings,
};

export default generator;
