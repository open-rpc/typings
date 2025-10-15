import typescript from "./typescript";
import rust from "./rust";
import go from "./go";
import python from "./python";
import { Generator } from "./generator-interface";
import { OpenrpcDocument as OpenRPC, MethodObject, ContentDescriptorObject } from "@open-rpc/meta-schema";
import { getSchemasForOpenRPCDocument, deepClone } from "./utils";
import Transpiler from "@json-schema-tools/transpiler";
import { languageSafeName, getTitle } from "@json-schema-tools/transpiler/build/utils";
import titleizer from "@json-schema-tools/titleizer";

interface Generators {
  typescript: Generator;
  rust: Generator;
  go: Generator;
  python: Generator;
  [key: string]: Generator;
}

const generators: Generators = {
  go,
  python,
  rust,
  typescript,
};

const languageAliases: { [key in OpenRPCTypingsSupportedLanguages]: OpenRPCTypingsSupportedLanguages } = {
  "ts": "typescript",
  "rs": "rust",
  "golang": "go",
  "py": "python",
  "rust": "rust",
  "typescript": "typescript",
  "go": "go",
  "python": "python",
};

export type OpenRPCTypingsSupportedLanguages = "rust" | "rs" | "typescript" | "ts" | "go" | "golang" | "py" | "python";

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
  private transpiler: Transpiler;

  private toStringOptionsDefaults: OpenRPCTypingsToStringOptions = {
    includeMethodAliasTypings: true,
    includeSchemaTypings: true,
  };

  constructor(private openrpcDocument: OpenRPC) {
    const schemas = getSchemasForOpenRPCDocument(openrpcDocument);
    this.transpiler = new Transpiler(deepClone(schemas));
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

  public getParamsTypings(language: OpenRPCTypingsSupportedLanguages): string {
    return generators[language].getParamsTypings(this.openrpcDocument);
  }

  public getParamsTyping(language: OpenRPCTypingsSupportedLanguages, method: MethodObject, joinString: string): string {
    return generators[language].getParamsTyping(method, joinString);
  }

  public getEmptyResultType(language: OpenRPCTypingsSupportedLanguages): string {
    const standardizedLanguage = languageAliases[language];
    switch(standardizedLanguage) {
      case "typescript":
        return "Promise<void>";

      case "rust":
        return "RpcRequest<void>";

      case "go":
        return "void";

      case "python":
        return "None";
      
      /* istanbul ignore next */
      default:
        /* istanbul ignore next */
        throw new Error(`Cannot resolve empty result type for unknown language: ${language}`);
  }
}

  public getTypingNames(
    language: OpenRPCTypingsSupportedLanguages,
    method: MethodObject,
  ): OpenRPCMethodTypingNames {
    const standardizedLanguage = languageAliases[language];
    const gen = generators[standardizedLanguage];

    const defaultedMethod = (this.openrpcDocument.methods as MethodObject[]).find(({ name }) => name === method.name) as MethodObject;

    const methodResult = defaultedMethod.result as ContentDescriptorObject;
    const methodParams = defaultedMethod.params as ContentDescriptorObject[];

    return {
      method: gen.getMethodAliasName(defaultedMethod),
      params: methodParams.map(({ schema }) => languageSafeName(getTitle(titleizer(schema)))),
      result: methodResult ? languageSafeName(getTitle(titleizer(methodResult.schema))) : this.getEmptyResultType(standardizedLanguage),
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

    const typings: string[] = [];
    if (options.includeSchemaTypings) {
      typings.push(this.getSchemaTypings(language));
    }

    if (options.includeMethodAliasTypings) {
      typings.push(this.getMethodTypings(language));
    }

    return typings.join("\n");
  }
}
