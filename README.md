# OpenRPC Typings

<center>
  <span>
    <img alt="CircleCI branch" src="https://img.shields.io/circleci/project/github/open-rpc/typings/master.svg">
    <img src="https://codecov.io/gh/open-rpc/typings/branch/master/graph/badge.svg" />
    <img alt="Dependabot status" src="https://api.dependabot.com/badges/status?host=github&repo=open-rpc/typings" />
    <img alt="npm" src="https://img.shields.io/npm/dt/@open-rpc/typings.svg" />
    <img alt="GitHub release" src="https://img.shields.io/github/release/open-rpc/typings.svg" />
    <img alt="GitHub commits since latest release" src="https://img.shields.io/github/commits-since/open-rpc/typings/latest.svg" />
  </span>
</center>

A tool to produce language-specific typings given an OpenRPC document. 

This package will extract the json-schemas from your document, and give you types for them (and language-specific functionality for dealing with data of that json schema type).

Need help or have a question? Join us on our [Discord](https://discord.gg/gREUKuF)!

## Installing

`npm install @open-rpc/typings`

## CLI

```bash
$ open-rpc-typings --help
Usage: cli [options]

Options:
  -v, --version                     print the version number
  -d, --document [openrpcDocument]  JSON string, or a filepath or remote URL pointing to an Open-RPC JSON document (default: "./openrpc.json")
  --output-rs [directory]           path to output dir of Rust typings
  --output-ts [directory]           path to output dir of Typescript typings
  --output-go [directory]           path to output dir of Go typings
  --name-rs [file]                  file name to input of Rust typings (default: "./index")
  --name-ts [file]                  file name to input of Typescript typings (default: "./index")
  --name-go [file]                  file name to input of Go typings (default: "./index")
  -h, --help                        print usage information

```

## JS/TS SDK

```typescript
import OpenRPCTypings from "@open-rpc/typings";


const typings = new OpenRPCTypings(OpenRPCDocument);

await typings.generate()

const rustTypings = typings.toString("rust");
```
