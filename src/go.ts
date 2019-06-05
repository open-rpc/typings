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
import { quicktype, SchemaTypeSource, TypeSource } from "quicktype";

/**
 * Helper methods
 */
const collectAndRefSchemas = (schema: Schema): Schema[] => {
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

  return collectedSubSchemas;
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
  return _.startsWith(trimmed, "//");
};
const getDefs = (lines: string) => {
  let commentBuffer: string[] = [];
  return _.chain(lines.split("\n"))
    .reduce((memoLines: any[], line) => {
      const lastItem = _.last(memoLines);
      const singleline = line.match(/type (.*) (?!struct$)(.*)/);

      if (isComment(line)) {
        commentBuffer.push(line);
      } else if (singleline) {
        memoLines.push([...commentBuffer, line]);
        commentBuffer = [];
      } else {
        const isStruct = line.match(/type (.*) struct {/);
        if (isStruct) {
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
      const toTest = exportLine instanceof Array ? exportLine[0] : exportLine;
      const [all, name, rest] = toTest.match(/type (\S*)/);
      return name;
    })
    .flattenDeep()
    .join("\n")
    .value();
};

const compileOpts = { bannerComment: "", declareExternallyReferenced: false };
export const getSchemaTypings: GetSchemaTypings = async (openrpcDocument: OpenRPC) => {
  const { methods } = openrpcDocument;

  const params = _.map(methods, (method) => method.params as ContentDescriptorObject[]);
  const result = _.map(methods, (method) => method.result as ContentDescriptorObject);

  const megaSchema: Schema[] = _.chain([..._.flatten(params), ...result])
    .map("schema")
    .map(collectAndRefSchemas)
    .flatten()
    .uniqBy("title")
    .map(async (s: Schema, i: number, collection: any) => {
      const schemaForQuicktype = {
        ...s,
        definitions: _.keyBy(collection, getSchemaTypeName),
      };
      const typingsForSchema = await quicktype({
        lang: "go",
        leadingComments: undefined,
        rendererOptions: { "just-types": "true" },
        sources: [{
          kind: "schema",
          name: getSchemaTypeName(s),
          schema: JSON.stringify(schemaForQuicktype),
        }],
      });

      return typingsForSchema.lines;
    })
    .value();

  const types = _.chain(await Promise.all(megaSchema))
    .flatten()
    .compact()
    .map(_.trimEnd)
    .join("\n")
    .trim()
    .value();

  return getDefs(types);
};

const getMethodTyping = (method: MethodObject) => {
  const result = method.result as ContentDescriptorObject;
  const resultTypeName = getSchemaTypeName(result.schema);

  const methodAliasName = getMethodAliasName(method);

  const params = _.map(
    method.params as ContentDescriptorObject[],
    (param) => `${param.name} ${getSchemaTypeName(param.schema)}`,
  ).join(", ");

  return `\t${methodAliasName}(${params}) (error, ${resultTypeName})`;
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
  getSchemaTypings,
};

export default generator;
