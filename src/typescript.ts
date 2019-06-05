import {
  Generator,
  GetSchemaTypings,
  GetMethodTypings,
} from "./generator-interface";
import _ from "lodash";
import { compile } from "json-schema-to-typescript";
import { ContentDescriptorObject, MethodObject, Schema } from "@open-rpc/meta-schema";
import { collectAndRefSchemas, getSchemaTypeName, getMethodAliasName } from "./utils";

const isComment = (line: string): boolean => {
  const trimmed = line.trim();
  return _.startsWith(trimmed, "/**") || _.startsWith(trimmed, "*") || _.startsWith(trimmed, "*/");
};

const getDefs = (lines: string): string => {
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

export const getSchemaTypings: GetSchemaTypings = async (openrpcDocument) => {
  const { methods } = openrpcDocument;

  const params = _.map(methods, (method) => method.params as ContentDescriptorObject[]);
  const result = _.map(methods, (method) => method.result as ContentDescriptorObject);

  const megaSchema: Schema[] = _.chain([..._.flatten(params), ...result])
    .map("schema")
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

const getMethodTyping = (method: MethodObject): string => {
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
