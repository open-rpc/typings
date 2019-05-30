import typescript from "./typescript";
import rust from "./rust";
import { Generator } from "./generator-interface";
import { OpenRPC, MethodObject, ContentDescriptorObject, Schema } from "@open-rpc/meta-schema";
import _, { values, filter, partition, zipObject } from "lodash";
import { generateMethodParamId, generateMethodResultId } from "@open-rpc/schema-utils-js";
import { createHash } from "crypto";

interface Generators {
  typescript: Generator;
  rust: Generator;
  [key: string]: Generator;
}

export enum OpenRPCTypingsSupportedLanguages { "typescript", "rust" }

const generators: Generators = {
  rust,
  typescript,
};

interface OpenRPCTypings {
  schemas: string;
  methods: string;
}

export interface OpenRPCTypingsByLanguage {
  [language: string]: OpenRPCTypings;
}

export interface OpenRPCMethodTypingNames {
  method: string;
  params: string[];
  result: string;
}

export interface OpenRPCTypingsToStringOptions {
  includeMethodAliasTypings?: boolean;
  includeSchemaTypings?: boolean;
}

const getDefaultTitleForSchema = (schema: Schema): string => {
  const hash = createHash("sha1").update(JSON.stringify(schema)).digest("base64").slice(0, 8);
  const { oneOf, anyOf, allOf } = schema;
  const prefix = schema.type || oneOf ? "oneOf" : anyOf ? "anyOf" : allOf ? "allOf" : "unknown";
  return `${prefix}${hash}`;
};

const ensureSchemaTitles = (s: Schema) => {
  const newS: Schema = { ...s };

  if (s.anyOf) { newS.anyOf = s.anyOf.map(ensureSchemaTitles); }
  if (s.allOf) { newS.allOf = s.allOf.map(ensureSchemaTitles); }
  if (s.oneOf) { newS.oneOf = s.oneOf.map(ensureSchemaTitles); }
  if (s.items) { newS.items = s.items.map(ensureSchemaTitles); }
  if (s.properties) { newS.properties = _.mapValues(s.properties, ensureSchemaTitles); }

  if (s.title === undefined) {
    newS.title = getDefaultTitleForSchema(s);
  }

  return newS;
};

/**
 * A class to handle all the tasks relating to types for the OpenRPC Document.
 */
export default class MethodTypings {
  private typingsByLanguage: OpenRPCTypingsByLanguage = {};
  private toStringOptionsDefaults: OpenRPCTypingsToStringOptions = {
    includeMethodAliasTypings: true,
    includeSchemaTypings: true,
  };
  private openrpcDocument: OpenRPC;

  constructor(openrpcDocument: OpenRPC) {
    const methodsWithSchemaTitles = openrpcDocument.methods.map((method: any) => ({
      ...method as MethodObject,
      params: method.params.map((param: ContentDescriptorObject) => ({
        ...param,
        schema: ensureSchemaTitles(param.schema),
      })),
      result: {
        ...method.result,
        schema: ensureSchemaTitles(method.result.schema),
      },
    })) as MethodObject[];

    this.openrpcDocument = {
      ...openrpcDocument,
      methods: methodsWithSchemaTitles,
    };
  }

  /**
   * A method to generate all the typings. This does most of the heavy lifting, and is quite slow.
   * You should call this method first.
   */
  public async generateTypings() {
    await Promise.all(["rust", "typescript"].map(async (language) => {
      const gen = generators[language];
      const schemas = await gen.getSchemaTypings(this.openrpcDocument);
      const methods = gen.getMethodTypings(this.openrpcDocument);
      this.typingsByLanguage[language] = { schemas, methods };
    }));

    return true;
  }

  public getTypingsByLanguage(language: OpenRPCTypingsSupportedLanguages) {
    this.guard();
    const lang = OpenRPCTypingsSupportedLanguages[language];
    return this.typingsByLanguage[lang];
  }

  /**
   * A method that returns all the typings for the schemas in an [[OpenRPC]] Document.
   *
   * @param language The langauge you want the signature to be in.
   *
   * @returns A string containing all the typings.
   *
   */
  public getSchemaTypings(language: OpenRPCTypingsSupportedLanguages): string {
    return this.getTypingsByLanguage(language).schemas;
  }

  /**
   * A method that returns all the method signature type aliases, called Method Typings,
   * for the [[@open-rpc/meta-schema#MethodObject]] in an [[@open-rpc/meta-schema#MethodObject]] Document.
   *
   * @param language The langauge you want the signature to be in.
   *
   * @returns A string containing all the typings.
   *
   */
  public getMethodTypings(language: OpenRPCTypingsSupportedLanguages): string {
    return this.getTypingsByLanguage(language).methods;
  }

  public getTypingNames(
    language: OpenRPCTypingsSupportedLanguages,
    method: MethodObject,
  ): OpenRPCMethodTypingNames {
    const lang = OpenRPCTypingsSupportedLanguages[language];
    const gen = generators[lang];

    const defaultedMethod = _.find(this.openrpcDocument.methods, { name: method.name }) as MethodObject;

    const methodResult = defaultedMethod.result as ContentDescriptorObject;
    const methodParams = defaultedMethod.params as ContentDescriptorObject[];
    return {
      method: gen.getMethodAliasName(defaultedMethod),
      params: methodParams.map(({ schema }) => gen.getSchemaTypeName(schema)),
      result: gen.getSchemaTypeName(methodResult.schema),
    };
  }

  /**
   * A configurable way to output the typings into a string.
   *
   * @param language The language you want the typings to be
   * @param options include or filter particular parts of the output.
   *
   * @returns a multi-line string containing the types in the language specified.
   */
  public toString(
    language: OpenRPCTypingsSupportedLanguages,
    options: OpenRPCTypingsToStringOptions = this.toStringOptionsDefaults,
  ): string {
    this.guard();

    const typings = [];
    if (options.includeSchemaTypings) {
      typings.push(this.getSchemaTypings(language));
    }

    if (options.includeMethodAliasTypings) {
      typings.push(this.getMethodTypings(language));
    }

    return typings.join("\n");
  }

  private guard() {
    if (Object.keys(this.typingsByLanguage).length === 0) {
      throw new Error("typings have not yet been generated. Please run generateTypings first.");
    }
  }

}
