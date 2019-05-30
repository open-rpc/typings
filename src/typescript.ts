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

  const subSchemas = _.chain(subS)
    .flatten()
    .compact()
    .value();

  return _.chain(subSchemas)
    .map(collectAndRefSchemas)
    .flattenDeep()
    .concat([newS])
    .value();
};

const schemaToRef = (s: Schema) => ({ $ref: `#/definitions/${getSchemaTypeName(s)}` });

/**
 * Exported Methods
 */
export const getMethodAliasName: GetMethodAliasName = ({ name }: MethodObject): string => {
  return getSchemaTypeName({ title: name, type: "function" });
};

export const getSchemaTypeName: GetSchemaTypeName = (s: Schema): string => toSafeString(s.title);
const isComment = (line: string) => {
  const trimmed = line.trim();
  return _.startsWith(trimmed, "/**") || _.startsWith(trimmed, "*") || _.startsWith(trimmed, "*/");
};
const getDefs = (lines: string) => {
  let commentBuffer: string[] = [];
  return _.chain(lines.split("\n"))
    .reduce((memoLines: any[], line) => {
      const lastItem = _.last(memoLines);
      const singleLine = line.match(/export (.*);/);

      if (isComment(line)) {
        commentBuffer.push(line);
      } else if (singleLine) {
        memoLines.push([...commentBuffer, line]);
        commentBuffer = [];
      } else {
        const interfaceMatch = line.match(/export (.*)/);
        if (interfaceMatch) {
          memoLines.push([...commentBuffer, line]);
          commentBuffer = [];
        } else if (_.isArray(lastItem)) {
          lastItem.push(line);
          if (line === "}") {
            memoLines.push("");
          }
        }
      }

      return memoLines;
    }, [])
    .compact()
    .uniqBy((exportLine) => {
      const toTest = exportLine instanceof Array ?
        _.reject(exportLine, isComment)[0] : exportLine;
      const [all, exportType, name, rest] = toTest.match(/export\s(type|interface|enum)\s(\S*)/);
      return name;
    })
    .flattenDeep()
    .join("\n")
    .value();
};

const compileOpts = { bannerComment: "", declareExternallyReferenced: false };
export const getSchemaTypings: GetSchemaTypings = async (openrpcDocument: OpenRPC) => {
  const { methods } = openrpcDocument;

  const megaSchema = _.chain(methods)
    .map("params")
    .flatten()
    .concat(_.map(methods, "result"))
    .map("schema")
    .uniqBy("title")
    .map(collectAndRefSchemas)
    .flatten()
    .uniqBy("title")
    .map((s: Schema, i: number, collection: any) => {
      return compile({
        ...s,
        definitions: _.keyBy(collection, getSchemaTypeName),
      }, "", compileOpts);
    })
    .value();

  const types = await Promise.all(megaSchema);

  const trimmedAndJoined = _.map(types, _.trim).join("\n").trim();
  const defs = getDefs(trimmedAndJoined);
  return defs;
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
