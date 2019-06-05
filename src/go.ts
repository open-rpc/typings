import {
  Generator,
  GetSchemaTypings,
  GetMethodTypings,
  GetMethodAliasName,
  GetSchemaTypeName,
} from "./generator-interface";
import _ from "lodash";
import { generateMethodParamId, generateMethodResultId } from "@open-rpc/schema-utils-js";
import { toSafeString } from "json-schema-to-typescript/dist/src/utils";
import { ContentDescriptorObject, MethodObject, OpenRPC, Schema } from "@open-rpc/meta-schema";
import { quicktype, SchemaTypeSource, TypeSource } from "quicktype";
import { collectAndRefSchemas, getSchemaTypeName, getMethodAliasName } from "./utils";

/**
 * Exported Methods
 */
const getDefs = (lines: string) => {
  return _.chain(lines.split("\n"))
    .reduce((memoLines: any[], line) => {
      const lastItem = _.last(memoLines);
      const singleline = line.match(/type (\S*) (?!struct)(.*)/);

      if (singleline) {
        memoLines.push(line);
      } else {
        const isStruct = line.match(/type (.*) struct(.*)/);
        if (isStruct) {
          memoLines.push([line]);
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
