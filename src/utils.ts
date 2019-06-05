import { Schema, MethodObject, OpenRPC, ContentDescriptorObject } from "@open-rpc/meta-schema";
import _ from "lodash";
import { GetSchemaTypeName } from "./generator-interface";
import { toSafeString } from "json-schema-to-typescript/dist/src/utils";

const schemaToRef = (s: Schema) => ({ $ref: `#/definitions/${getSchemaTypeName(s)}` });

export const getMethodAliasName = ({ name }: MethodObject): string => {
  return getSchemaTypeName({ title: name, type: "function" });
};

export const getSchemaTypeName = (s: Schema): string => toSafeString(s.title);

export const collectAndRefSchemas = (schema: Schema): Schema[] => {
  const newS: Schema = { ...schema };
  const subS: Schema[][] = [];

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

    if (schema.items instanceof Array) {
      newS.items = schema.items.map(schemaToRef);
    } else {
      newS.items = schemaToRef(schema.items);
    }
  }

  if (schema.properties) {
    subS.push(Object.values(schema.properties));
    newS.properties = _.mapValues(schema.properties, schemaToRef);
  }

  const subSchemas: Schema[] = _.chain(subS)
    .flatten()
    .compact()
    .value();

  const collectedSubSchemas: Schema[] = _.map(subSchemas, collectAndRefSchemas);

  return _.chain(collectedSubSchemas)
    .push([newS])
    .flatten()
    .value();
};

export const getSchemasForOpenRPCDocument = (openrpcDocument: OpenRPC): Schema[] => {
  const { methods } = openrpcDocument;

  const params = _.flatMap(methods, (method) => method.params as ContentDescriptorObject[]);
  const result = _.map(methods, (method) => method.result as ContentDescriptorObject);

  return _.chain(params.concat(result))
    .map("schema")
    .map(collectAndRefSchemas)
    .flatten()
    .uniqBy("title")
    .map((schema, i, collection) => ({ ...schema, definitions: _.keyBy(collection, getSchemaTypeName) }))
    .value();
};
