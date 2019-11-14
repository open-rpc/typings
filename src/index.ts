import typescript from "./typescript";
import rust from "./rust";
import go from "./go";
import { Generator } from "./generator-interface";
import { OpenRPC, MethodObject, ContentDescriptorObject, Schema } from "@open-rpc/meta-schema";
import { getSchemasForOpenRPCDocument } from "./utils";
import JsonSchemaToTypes from "@etclabscore/json-schema-to-types";
import { languageSafeName, ensureSchemaTitles } from "@etclabscore/json-schema-to-types/build/utils";

interface Generators {
  typescript: Generator;
  rust: Generator;
  go: Generator;
  [key: string]: Generator;
}

const generators: Generators = {
  go,
  rust,
  typescript,
};

export type OpenRPCTypingsSupportedLanguages = "rust" | "rs" | "typescript" | "ts" | "go" | "golang";

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

/**
 * A class to handle all the tasks relating to types for the OpenRPC Document.
 */
export default class MethodTypings {
  private transpiler: JsonSchemaToTypes;

  private typingsByLanguage: OpenRPCTypingsByLanguage = {};
  private toStringOptionsDefaults: OpenRPCTypingsToStringOptions = {
    includeMethodAliasTypings: true,
    includeSchemaTypings: true,
  };

  constructor(private openrpcDocument: OpenRPC) {
    const schemas = getSchemasForOpenRPCDocument(openrpcDocument);
    this.transpiler = new JsonSchemaToTypes(schemas);
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
    return this.transpiler.to(language);
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
    return generators[language].getMethodTypings(this.openrpcDocument);
  }

  public getTypingNames(
    language: OpenRPCTypingsSupportedLanguages,
    method: MethodObject,
  ): OpenRPCMethodTypingNames {
    const gen = generators[language];

    const defaultedMethod = this.openrpcDocument.methods.find(({ name }) => name === method.name) as MethodObject;

    const methodResult = defaultedMethod.result as ContentDescriptorObject;
    const methodParams = defaultedMethod.params as ContentDescriptorObject[];

    return {
      method: gen.getMethodAliasName(defaultedMethod),
      params: methodParams.map(({ schema }) => languageSafeName(ensureSchemaTitles(schema).title)),
      result: languageSafeName(ensureSchemaTitles(methodResult.schema).title),
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

    const typings = [];
    if (options.includeSchemaTypings) {
      typings.push(this.getSchemaTypings(language));
    }

    if (options.includeMethodAliasTypings) {
      typings.push(this.getMethodTypings(language));
    }

    return typings.join("\n");
  }
}
