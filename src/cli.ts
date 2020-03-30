#!/usr/bin/env node

import program, { CommanderStatic } from "commander";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import { OpenrpcDocument as OpenRPC } from "@open-rpc/meta-schema";
import { generateTypingsFile, TypingsOptions } from "./generate-typings-file";
import { OpenRPCTypingsSupportedLanguages } from "./";
const version = require("../package.json").version; // tslint:disable-line

function parseTypingsOptions(programOpt: CommanderStatic): TypingsOptions[] {
  if (!programOpt.outputRs && !programOpt.outputTs && !programOpt.outputGo) {
    throw Error("Please specify an output directory for typings.");
  }

  const options = [];

  if (programOpt.outputRs) {
    options.push(makeOptions(programOpt.nameRs, programOpt.outputRs, "rust"));
  }

  if (programOpt.outputTs) {
    options.push(makeOptions(programOpt.nameTs, programOpt.outputTs, "typescript"));
  }

  if (programOpt.outputGo) {
    options.push(makeOptions(programOpt.nameGo, programOpt.outputGo, "go"));
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

program
  .version(version, "-v, --version")
  .option(
    "-d, --document [openrpcDocument]",
    "JSON string, or a filepath or remote URL pointing to an Open-RPC JSON document",
    "./openrpc.json",
  )
  .option(
    "--output-rs [directory]",
    "path to output dir of Rust typings",
  )
  .option(
    "--output-ts [directory]",
    "path to output dir of Typescript typings",
  )
  .option(
    "--output-go [directory]",
    "path to output dir of Go typings",
  )
  .option(
    "--name-rs [file]",
    "file name to input of Rust typings",
    "./index",
  )
  .option(
    "--name-ts [file]",
    "file name to input of Typescript typings",
    "./index",
  )
  .option(
    "--name-go [file]",
    "file name to input of Go typings",
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
