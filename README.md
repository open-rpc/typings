# OpenRPC Typings

<center>
  <span>
    <img alt="CircleCI branch" src="https://img.shields.io/circleci/project/github/open-rpc/typings/master.svg">
    <img src="https://codecov.io/gh/open-rpc/typings/branch/master/graph/badge.svg" />
    <img alt="Dependabot status" src="https://api.dependabot.com/badges/status?host=github&repo=open-rpc/typings" />
    <img alt="Chat on Discord" src="https://img.shields.io/badge/chat-on%20discord-7289da.svg" />
    <img alt="npm" src="https://img.shields.io/npm/dt/@open-rpc/typings.svg" />
    <img alt="GitHub release" src="https://img.shields.io/github/release/open-rpc/typings.svg" />
    <img alt="GitHub commits since latest release" src="https://img.shields.io/github/commits-since/open-rpc/typings/latest.svg" />
  </span>
</center>

## Installing

`npm install @open-rpc/typings`

## CLI

```bash
$ open-rpc-typings --help
Usage: cli [options]

Options:
  -v, --version                     output the version number
  -d, --document [openrpcDocument]  JSON string or a Path/Url pointing to an open rpc schema (default: "./openrpc.json")
  --output-rs [directory]           output dir of rust typings
  --output-ts [directory]           output dir of typescript typings
  --output-go [directory]           output dir of go typings
  --name-rs [file]                  File name of rust typings (default: "./index")
  --name-ts [file]                  File name of typescript typings (default: "./index")
  --name-go [file]                  File name of go typings (default: "./index")
  -h, --help                        output usage information

```

## JS/TS SDK

```typescript
import OpenRPCTypings from "@open-rpc/typings";


const typings = new OpenRPCTypings(OpenRPCDocument);

await typings.generate()

const rustTypings = typings.getAllUniqueTypings("rust");
```
