import { existsSync } from "fs";
import { remove, mkdtemp } from "fs-extra";
import { generateTypingsFile, getExtension, TypingsOptions } from "./generate-typings-file";
import testOpenRPCDocument from "./openrpc.fixture";
import { OpenRPCTypingsSupportedLanguages } from "./";

describe("generateTypingsFile()", () => {
  let dirName: string;
  let options: TypingsOptions[];
  beforeAll(async () => {
    dirName = await mkdtemp("open-rpc-types");
    options = [{
      dirName,
      fileName: "typings",
      lang: "rust",
    }, {
      dirName,
      fileName: "typings",
      lang: "typescript",
    }];
  });

  afterAll(async () => {
    await remove(dirName);
  });

  it("generates lanuage specific typings files", async () => {
    await generateTypingsFile(testOpenRPCDocument, options);
    const languages: OpenRPCTypingsSupportedLanguages[] = [ "typescript", "rust" ];
    languages.forEach((language: OpenRPCTypingsSupportedLanguages) => {
      const fileName = `${dirName}/typings${getExtension(language)}`;
      expect(existsSync(fileName)).toBeTruthy();
    });
  });
});
