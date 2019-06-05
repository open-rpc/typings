import {
  Generator,
  GetSchemaTypings,
  GetMethodTypings,
} from "./generator-interface";
import _ from "lodash";
import { toSafeString } from "json-schema-to-typescript/dist/src/utils";
import { ContentDescriptorObject, MethodObject, Schema } from "@open-rpc/meta-schema";
import { quicktype } from "quicktype";
import { collectAndRefSchemas, getSchemaTypeName, getMethodAliasName, getSchemasForOpenRPCDocument } from "./utils";

const isComment = (line: string): boolean => {
  const trimmed = line.trim();
  return _.startsWith(trimmed, "//");
};

const getDefs = (lines: string): string => {
  let commentBuffer: string[] = [];

  return _.chain(lines.split("\n"))
    .reduce((memoLines: any[], line) => {
      const lastItem = _.last(memoLines);
      const singleline = line.match(/type (\S*) (?!struct)(.*)/);

      if (isComment(line)) {
        commentBuffer.push(line);
      } else if (singleline) {
        memoLines.push([...commentBuffer, line]);
        commentBuffer = [];
      } else {
        const isStruct = line.match(/type (.*) struct(.*)/);
        if (isStruct) {
          // const docs = genDocs(line)
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
      const [all, name, rest] = toTest.match(/type (\S*)/);
      return name;
    })
    .flattenDeep()
    .join("\n")
    .value();
};

export const getSchemaTypings: GetSchemaTypings = async (openrpcDocument) => {
  const schemas = getSchemasForOpenRPCDocument(openrpcDocument);

  const rawTypes = await Promise.all(schemas.map(async (s: Schema) => {
    const typingsForSchema = await quicktype({
      lang: "go",
      leadingComments: undefined,
      rendererOptions: { "just-types": "true" },
      sources: [{
        kind: "schema",
        name: getSchemaTypeName(s),
        schema: JSON.stringify(s),
      }],
    });

    return typingsForSchema.lines;
  }));

  const types = _.chain(rawTypes)
    .flatten()
    .compact()
    .map(_.trimEnd)
    .join("\n")
    .trim()
    .value();

  return getDefs(types);
};

const getMethodTyping = (method: MethodObject): string => {
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
