import typescript from "./typescript";
import rust from "./rust";
import { IGenerator, IContentDescriptorTyping, IMethodTypingsMap } from "./generator-interface";
import { OpenRPC, MethodObject, ContentDescriptorObject } from "@open-rpc/meta-schema";
import _, { values, filter, partition, zipObject } from "lodash";

interface IGenerators {
  typescript: IGenerator;
  rust: IGenerator;
  [key: string]: IGenerator;
}

type TLanguages = "typescript" | "rust";
const languages: TLanguages[] = ["typescript", "rust"];

const generators: IGenerators = {
  rust,
  typescript,
};

interface ITypingMapByLanguage {
  [language: string]: IMethodTypingsMap;
}

export interface IMethodTypings {
  methodAliasName: string;
  methodTyping: string;
  params: IContentDescriptorTyping[];
  result: IContentDescriptorTyping;
}

export interface IToStringOptions {
  includeMethodAliasTypings?: boolean;
  includeContentDescriptorTypings?: boolean;
}

const toStringOptionsDefaults = {
  includeContentDescriptorTypings: true,
  includeMethodAliasTypings: true,
};

/**
 * A class to handle all the tasks relating to types for the OpenRPC Document.
 */
export default class MethodTypings {
  private typingMapByLanguage: ITypingMapByLanguage = {};
  private toStringOptionsDefaults: IToStringOptions = {
    includeContentDescriptorTypings: true,
    includeMethodAliasTypings: true,
  };

  constructor(private openrpcDocument: OpenRPC) { }

  /**
   * A method to generate all the typings. This does most of the heavy lifting, and is quite slow.
   * You should call this method first.
   */
  public async generateTypings() {
    await Promise.all(languages.map(async (language) => {
      this.typingMapByLanguage[language] = await generators[language]
        .getMethodTypingsMap(this.openrpcDocument);
    }));

    return true;
  }

  /**
   * A method that returns all the method type aliases as a string, useful to directly inserting into code.
   *
   * @param language The langauge you want the signature to be in.
   *
   * @returns A string containing all the typings.
   *
   */
  public getAllContentDescriptorTypings(language: TLanguages): string {
    this.guard();

    return this.typingsToString(_.values(this.typingMapByLanguage[language]));
  }

  /**
   * A method that returns all the types as a string, useful to directly inserting into code.
   *
   * @param langeuage The langauge you want the signature to be in.
   *
   * @returns A string containing all the typings.
   *
   */
  public getAllMethodAliasTypings(language: TLanguages): string {
    this.guard();

    const generatorForLang = generators[language];
    const typingsMapForLang = this.typingMapByLanguage[language];

    return _.chain(this.openrpcDocument.methods)
      .map((method) => generatorForLang.getMethodTypeAlias(method, typingsMapForLang))
      .join("\n")
      .value();
  }

  /**
   * A configurable way to output the typings into a string.
   *
   * @param language The language you want the typings to be
   * @param options include or filter particular parts of the output.
   *
   * @returns a multi-line string containing the types in the language specified.
   */
  public toString(language: TLanguages, options: IToStringOptions = this.toStringOptionsDefaults): string {
    this.guard();

    const typings = [];
    if (options.includeContentDescriptorTypings) {
      typings.push(this.getAllContentDescriptorTypings(language));
    }

    if (options.includeMethodAliasTypings) {
      typings.push(this.getAllMethodAliasTypings(language));
    }

    return typings.join("\n");
  }

  /**
   * A method that returns a type alias for a given method
   *
   * @param method The OpenRPC Method that you want a signature for.
   * @param language The langauge you want the signature to be in.
   *
   * @returns A string containing a type alias for a function signature of
   * the same signature as the passed in method.
   *
   * @example
   * ```typescript
   *
   * const openrpcTypings = new OpenRPCTypings(examples.simpleMath);
   * const additionMethod = examples.simpleMath.examples
   *   .find((method) => method.name === "addition");
   * const additionFunctionTypeAlias = openrpcTypings.getMethodTypeAlias(additionMethod, "typescript");
   * // "export TAddition = (a: number, b: number) => number"
   * ```
   *
   */
  public getMethodAliasTyping(method: MethodObject, language: TLanguages): string {
    this.guard();

    const sig = generators[language]
      .getMethodTypeAlias(method, this.typingMapByLanguage[language]);

    return sig;
  }

  /**
   * Gives you all the [[IMethodTypings]] for a given method.
   *
   * @param method The method you need typing for.
   * @param language The langauge you want the signature to be in.
   *
   * @returns the typings for the method.
   *
   */
  public getMethodTypings(method: MethodObject, language: TLanguages): IMethodTypings {
    this.guard();

    const typingsMap = this.typingMapByLanguage[language];

    const typings = values(typingsMap);
    const typingsForMethod = filter(typings, ({ typeId }) => _.startsWith(typeId, method.name));
    const paramsAndResult = partition(typingsForMethod, ({ typeId }) => typeId.includes("result"));
    const methodTypings = zipObject(["result", "params"], paramsAndResult);

    const generatorForLanguage = generators[language];

    return {
      methodAliasName: generatorForLanguage.getMethodAliasName(method),
      methodTyping: generatorForLanguage.getMethodTypeAlias(method, typingsMap),
      params: methodTypings.params,
      result: methodTypings.result[0],
    };
  }

  private typingsToString(typings: IContentDescriptorTyping[]): string {
    const compacted = _.chain(typings)
      .map("typing")
      .compact()
      .value() as string[];

    return compacted.join("\n");
  }

  private guard() {
    if (Object.keys(this.typingMapByLanguage).length === 0) {
      throw new Error("typings have not yet been generated. Please run generateTypings first.");
    }
  }

}
