#!/usr/bin/env node

import program, { CommanderStatic } from "commander";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import { OpenRPC } from "@open-rpc/meta-schema";
import { generateTypingsFile, TypingsOptions } from "./generate-typings-file";
import { OpenRPCTypingsSupportedLanguages } from "./";
const version = require("../package.json").version; // tslint:disable-line

program
  .version(version, "-v, --version")
  .option(
    "-d, --document [openrpcDocument]",
    "JSON string or a Path/Url pointing to an open rpc schema",
    "./openrpc.json",
  )
  .option(
    "--output-rs [directory]",
    "output dir of rust typings",
  )
  .option(
    "--output-ts [directory]",
    "output dir of typescript typings",
  )
  .option(
    "--name-rs [file]",
    "File name of rust typings",
    "./index",
  )
  .option(
    "--name-ts [file]",
    "File name of typescript typings",
    "./index",
  )
  .action(async () => {
    try {
      const openrpcDocument: OpenRPC = await parseOpenRPCDocument(program.document);
      const typingsOptions = parseTypingsOptions(program);
      await generateTypingsFile(openrpcDocument, typingsOptions);
      console.log("Done!"); // tslint:disable-line
    } catch (e) {
      console.error(e.message); // tslint:disable-line
      console.error("Please revise the validation errors above and try again."); // tslint:disable-line
    }
  })
  .parse(process.argv);

function parseTypingsOptions(programOpt: CommanderStatic): TypingsOptions[] {
  if (!programOpt.outputRs && !programOpt.outputTs) {
    throw Error("Please specify an output directory for typings.");
  }

  const options = [];

  if (programOpt.outputRs) {
    options.push(makeOptions(programOpt.nameRs, programOpt.outputRs, "rust"));
  }

  if (programOpt.outputTs) {
    options.push(makeOptions(programOpt.nameTs, programOpt.outputTs, "typescript"));
  }

  return options;
}

function makeOptions(fileName: string, dirName: string, lang: OpenRPCTypingsSupportedLanguages) {
  return {
    dirName,
    fileName,
    lang,
  };
}
