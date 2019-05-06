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
  params: IContentDescriptorTyping[];
  result: IContentDescriptorTyping;
}

/**
 * A class to handle all the tasks relating to types for the OpenRPC Document.
 */
export default class MethodTypings {
  private typingMapByLanguage: ITypingMapByLanguage = {};

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
   * Gives you all the [[IMethodTypings]] for a given method.
   *
   * @param method The method you need the types for.
   * @param langeuage The langauge you want the signature to be in.
   *
   * @returns A string containing all the typings
   *
   */
  public getTypingsForMethod(method: MethodObject, language: TLanguages): IMethodTypings {
    if (Object.keys(this.typingMapByLanguage).length === 0) {
      throw new Error("typings have not yet been generated. Please run generateTypings first.");
    }

    const typingsMap = this.typingMapByLanguage[language];

    const typings = values(typingsMap);
    const typingsForMethod = filter(typings, ({ typeId }) => _.startsWith(typeId, method.name));
    const paramsAndResult = partition(typingsForMethod, ({ typeId }) => typeId.includes("result"));
    const methodTypings = zipObject(["result", "params"], paramsAndResult);

    return {
      params: methodTypings.params,
      result: methodTypings.result[0],
    };
  }

  /**
   * Gives you all the [[IContentDescriptorTyping.typings]] needed for a particular method.
   *
   * @param method The method you need the types for.
   * @param langeuage The langauge you want the signature to be in.
   *
   * @returns A string containing all the typings joined together.
   *
   */
  public getTypeDefinitionsForMethod(method: MethodObject, language: TLanguages): string {
    if (Object.keys(this.typingMapByLanguage).length === 0) {
      throw new Error("typings have not yet been generated. Please run generateTypings first.");
    }

    const typings = _.chain(this.getTypingsForMethod(method, language))
      .values()
      .flatten()
      .value();

    return this.typingsToString(typings);
  }

  /**
   * A method that returns all the types as a string, useful to directly inserting into code.
   *
   * @param langeuage The langauge you want the signature to be in.
   *
   * @returns A string containing all the typings
   *
   */
  public getAllUniqueTypings(language: TLanguages): string {
    if (Object.keys(this.typingMapByLanguage).length === 0) {
      throw new Error("typings have not yet been generated. Please run generateTypings first.");
    }

    const typings = _.chain(this.typingMapByLanguage[language])
      .values()
      .uniqBy("typeName")
      .value();

    return this.typingsToString(typings);
  }

  /**
   * A method that returns a function signature in the specified language
   *
   * @param method The OpenRPC Method that you want a signature for.
   * @param langeuage The langauge you want the signature to be in.
   *
   * @returns A string containing a function signature.
   */
  public getFunctionSignature(method: MethodObject, language: TLanguages): string {
    if (Object.keys(this.typingMapByLanguage).length === 0) {
      throw new Error("typings have not yet been generated. Please run generateTypings first.");
    }

    const sig = generators[language]
      .getFunctionSignature(method, this.typingMapByLanguage[language]);

    return sig;
  }

  private typingsToString(typings: IContentDescriptorTyping[]): string {
    return _.chain(typings)
      .map("typing")
      .compact()
      .value()
      .join("\n");
  }
}
