import {
  IGenerator,
  TGetMethodTypingsMap,
  TGetFunctionSignature,
  IContentDescriptorTyping,
  IMethodTypingsMap,
} from "./generator-interface";
import { generateMethodParamId, generateMethodResultId } from "@open-rpc/schema-utils-js";
import { compile } from "json-schema-to-typescript";
import { quicktype, SchemaTypeSource, TypeSource } from "quicktype";
import { RegexLiteral } from "@babel/types";

import { inspect } from "util"; // for debugging
import { ContentDescriptorObject } from "@open-rpc/meta-schema";
import _ from "lodash";

const getTypeName = (contentDescriptor: ContentDescriptorObject): string => {
  return _.chain(contentDescriptor.name).camelCase().upperFirst().value();
};

const getQuickTypeSources = (contentDescriptors: ContentDescriptorObject[]): SchemaTypeSource[] => {
  return _.chain(contentDescriptors)
    .map((contentDescriptor) => ({
      kind: "schema",
      name: getTypeName(contentDescriptor),
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

const getMethodTypingsMap: TGetMethodTypingsMap = async (openrpcSchema) => {
  const { methods } = openrpcSchema;

  const allCD = [
    ..._.chain(methods).map("params").flatten().value() as ContentDescriptorObject[],
    ..._.map(methods, "result"),
  ] as ContentDescriptorObject[];

  const fixedDupesAllCD = _.map(allCD, (cd: ContentDescriptorObject, index, collection): ContentDescriptorObject => {
    let hits = 0;

    _.each(
      collection as ContentDescriptorObject[],
      (cdToCheck) => {
        if (cdToCheck.name === cd.name) {
          hits++;
        }
      });

    if (hits > 1) {
      cd.name = cd.name + (hits - 1);
    }

    return cd;
  }) as ContentDescriptorObject[];

  const typeLinesNested = await Promise.all(_.map(fixedDupesAllCD, handleEachContentDescriptor));
  const typeLines = _.flatten(typeLinesNested);
  const typeRegexes = {
    alias: /pub type (.*) = (.*)\;/,
    decleration: /use (.*)\;/,
    enum: /pub enum (.*) {/,
    struct: /pub struct (.*) {/,
  };

  const simpleTypes = _.filter(typeLines, (line) => typeof line === "string");
  const complexTypes = _.difference(typeLines, simpleTypes);

  const useDeclerationTypes = _.filter(simpleTypes, (line) => typeRegexes.decleration.test(line.toString()));
  const aliasTypes = _.filter(simpleTypes, (line) => typeRegexes.alias.test(line.toString()));
  const structTypes = _.filter(complexTypes, (lines: string[]) => _.some(lines, (l) => typeRegexes.struct.test(l)));
  const enumTypes = _.filter(complexTypes, (lines: string[]) => _.some(lines, (l) => typeRegexes.enum.test(l)));

  const uniqueStructTypes = _.uniqBy(structTypes, (lines: any) => {
    const regex = /pub (struct|enum) (.*) {/;
    const lineMatch = _.find(lines, (l) => regex.test(l));
    return lineMatch.match(regex)[2]; // typeName
  });

  const allTypings = _.flatten([
    ...useDeclerationTypes,
    ...aliasTypes,
    ...enumTypes,
    ...uniqueStructTypes,
  ]).join("\n").trim();

  const typings = _.chain(methods)
    .map((method) => {
      const r = [];
      const result = method.result as ContentDescriptorObject;
      const params = method.params as ContentDescriptorObject[];
      return [
        {
          typeId: generateMethodResultId(method, result),
          typeName: getTypeName(result),
          typing: "",
        },
        ..._.map(params, (param) => ({
          typeId: generateMethodParamId(method, param),
          typeName: getTypeName(param),
          typing: "",
        })),
      ];
    })
    .flatten()
    .keyBy("typeId")
    .value();

  typings[Object.keys(typings)[0]].typing = allTypings;
  return typings;
};

const getFunctionSignature: TGetFunctionSignature = (method, typeDefs) => {
  const mResult = method.result as ContentDescriptorObject;
  const result = `RpcRequest<${typeDefs[generateMethodResultId(method, mResult)].typeName}>`;

  if (method.params.length === 0) {
    return `pub fn ${method.name}(&mut self) -> ${result};`;
  }

  const params = _.map(
    method.params as ContentDescriptorObject[],
    (param) => `${param.name}: ${typeDefs[generateMethodParamId(method, param)].typeName}`,
  ).join(", ");

  return `pub fn ${method.name}(&mut self, ${params}) -> ${result};`;
};

const generator: IGenerator = {
  getFunctionSignature,
  getMethodTypingsMap,
};

export default generator;
