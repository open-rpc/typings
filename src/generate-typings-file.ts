import { ensureDir, emptyDir, writeFile } from "fs-extra";

import MethodTypings, { OpenRPCTypingsSupportedLanguages } from "./";
import { OpenRPC } from "@open-rpc/meta-schema";

export interface TypingsOptions {
  fileName: string;
  dirName: string;
  lang: OpenRPCTypingsSupportedLanguages;
}

export function getExtension(lang: OpenRPCTypingsSupportedLanguages): string {
  const language: {[index: string]: string} = {
    rust: ".rs",
    typescript: ".ts",
  };

  return language[lang];
}

export async function generateTypingsFile(openrpcDocument: OpenRPC, options: TypingsOptions[]) {
  const methodTypings = new MethodTypings(openrpcDocument);
  await methodTypings.generateTypings();

  return await Promise.all(options.map(async (option: TypingsOptions) => {
    const typings = methodTypings.toString(option.lang);
    const typingsFileName = `${option.dirName}/${option.fileName}${getExtension(option.lang)}`;

    return await writeFile(typingsFileName, typings, "utf8");
  }));
}
