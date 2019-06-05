import {
  Generator,
  GetMethodTypings,
  GetSchemaTypings,
  GetMethodAliasName,
  GetSchemaTypeName,
} from "./generator-interface";
import { generateMethodParamId, generateMethodResultId } from "@open-rpc/schema-utils-js";
import { quicktype, SchemaTypeSource, TypeSource } from "quicktype";
import { ContentDescriptorObject, MethodObject, OpenRPC } from "@open-rpc/meta-schema";
import _ from "lodash";
import { toSafeString } from "json-schema-to-typescript/dist/src/utils";

const getQuickTypeSources = (contentDescriptors: ContentDescriptorObject[]): SchemaTypeSource[] => {
  return _.chain(contentDescriptors)
    .map((contentDescriptor) => ({
      kind: "schema",
      name: getSchemaTypeName(contentDescriptor),
      schema: JSON.stringify(contentDescriptor.schema),
    } as SchemaTypeSource))
    .value() as SchemaTypeSource[];
};

const deriveString = "#[derive(Serialize, Deserialize)]";
const handyDeriveString = "#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]";
const cfgDeriveString = "#[cfg_attr(test, derive(Random))]";
const untaggedString = "#[serde(untagged)]";

const handleEachContentDescriptor = async (contentDescriptor: ContentDescriptorObject) => {
  const sources = getQuickTypeSources([contentDescriptor]);
  const result = await quicktype({
    lang: "rust",
    leadingComments: undefined,
    rendererOptions: { "just-types": "true" },
    sources,
  });

  return _.chain(result.lines)
    .filter((line) => !_.startsWith(line, "//"))
    .reduce((memoLines: any[], line) => {
      const lastItem = _.last(memoLines);
      const interfaceMatch = line.match(/pub (struct|enum) (.*) {/);

      if (interfaceMatch) {
        const toAdd = [handyDeriveString, cfgDeriveString];

        if (interfaceMatch[1] === "enum") {
          toAdd.push(untaggedString);
        }

        toAdd.push(line);

        memoLines.push(toAdd);
      } else if (_.isArray(lastItem)) {
        lastItem.push(line);
        if (line === "}") {
          memoLines.push("");
        }
      } else {
        memoLines.push(line);
      }

      return memoLines;
    }, [])
    .filter((line: string) => line !== untaggedString && line !== deriveString)
    .compact()
    .value();
};

interface TypeRegexes {
  [key: string]: RegExp;
}

const typeRegexes: TypeRegexes = {
  alias: /pub type (.*) = (.*)\;/,
  complex: /pub (struct|enum) (.*) {/,
  decleration: /use (.*)\;/,
  enum: /pub enum (.*) {/,
  struct: /pub struct (.*) {/,
};

const getSchemaTypings: GetSchemaTypings = async (openrpcSchema) => {
  const methods = _.cloneDeep(openrpcSchema.methods);

  const allCD = [
    ..._.chain(methods).map("params").flatten().value() as ContentDescriptorObject[],
    ..._.map(methods, "result"),
  ] as ContentDescriptorObject[];

  const cdWithNullFix = _.map(allCD, (cd) => {
    if (cd.schema.oneOf) { // this should be recursive
      cd.schema.oneOf = _.filter(cd.schema.oneOf, (subschema: any) => subschema.type !== "null");
    }
    return cd;
  });

  const fixedDupesAllCD = _.map(
    cdWithNullFix,
    (cd: ContentDescriptorObject, index, collection): ContentDescriptorObject => {
      let hits = 0;
      const nameWithoutChange = cd.name;
      const stringifiedCd = JSON.stringify(cd.schema);

      _.each(
        collection as ContentDescriptorObject[],
        (cdToCheck) => {
          if (cdToCheck.name === nameWithoutChange) {
            if (JSON.stringify(cdToCheck.schema) !== stringifiedCd) {
              hits += 1;
            }
          }
        });

      if (hits > 1) {
        cd.name = cd.name + (hits - 1);
      }

      return cd;
    }) as ContentDescriptorObject[];
  const dedupedContentDescriptors = _.uniqBy(fixedDupesAllCD, "name");

  const typeLinesNested = await Promise.all(_.map(dedupedContentDescriptors, handleEachContentDescriptor));
  const typeLines = _.flatten(typeLinesNested);

  const simpleTypes = _.filter(typeLines, (line) => typeof line === "string") as string[];
  const complexTypes = _.difference(typeLines, simpleTypes);

  // ready to be prepended to the typings output.
  const useDeclerationTypes = _.chain(simpleTypes)
    .filter((line) => typeRegexes.decleration.test(line))
    .uniq()
    .value() as string[];

  const aliasTypes = _.filter(simpleTypes, (line) => typeRegexes.alias.test(line));
  const structTypes: string[][] = _.filter(
    complexTypes,
    (lines: string[]) => _.some(lines, (l) => typeRegexes.struct.test(l)),
  );

  const enumTypes: string[][] = _.filter(
    complexTypes,
    (lines: string[]) => _.some(lines, (l) => typeRegexes.enum.test(l)),
  );

  interface PartialTyping {
    typeName: string;
    typing: string;
  }
  // same as above, but now as a partial IContentDescriptorTyping
  const at: PartialTyping[] = _.map(aliasTypes, (aliasType: string) => {
    const matches = aliasType.match(typeRegexes.alias) as RegExpMatchArray;
    const typeName = matches[1];

    return { typeName, typing: aliasType };
  });

  // same as above, but now as a partial IContentDescriptorTyping
  const etst: PartialTyping[] = _.map([...enumTypes, ...structTypes], (typing: string[]): PartialTyping => {
    const lineMatch = _.find(typing, (l) => typeRegexes.complex.test(l)) as string;
    const matches = lineMatch.match(typeRegexes.complex) as RegExpMatchArray;
    const typeName = matches[2];

    return { typeName, typing: typing.join("\n") };
  }) as PartialTyping[];

  return _.chain([...at, ...etst])
    .groupBy("typeName")
    .values()
    .map((typingsWithSameName) => {
      const uniqued = _.uniqBy(typingsWithSameName, "typing");

      return _.map(uniqued, (typing, i) => {
        const newTypeName = `${typing.typeName}${i === 0 ? "" : 0}`;

        return {
          dupedTypeName: typing.typeName,
          typeName: newTypeName,
          typing: typing.typing.replace(typing.typeName, newTypeName),
        };
      });
    })
    .flatten()
    .uniqBy("typeName")
    .map("typing")
    .unshift(...useDeclerationTypes)
    .join("\n")
    .trim()
    .value();
};

const getMethodTyping = (method: MethodObject) => {
  const mResult = method.result as ContentDescriptorObject;
  const result = `RpcRequest<${getSchemaTypeName(mResult)}>`;

  const methodAliasName = getMethodAliasName(method);

  const params = _.map(
    method.params as ContentDescriptorObject[],
    (param) => `${param.name}: ${getSchemaTypeName(param)}`,
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

export const getSchemaTypeName: GetSchemaTypeName = (contentDescriptor) => {
  return _.chain(contentDescriptor.name).camelCase().upperFirst().value();
};

export const getMethodAliasName: GetMethodAliasName = (method) => {
  return toSafeString(method.name);
};

const generator: Generator = {
  getMethodAliasName,
  getMethodTypings,
  getSchemaTypeName,
  getSchemaTypings,
};

export default generator;
