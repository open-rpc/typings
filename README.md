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


## CLI

Example:

```bash
$ open-rpc-typings
    -d https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/simple-math-openrpc.json
    -o ./open-rpc-types
```

## JS/TS SDK

```typescript
import OpenRPCTypings from "@open-rpc/typings";


const typings = new Typings(OpenRPCTypings);

await typings.generate()

const rustTypings = typings.getAllUniqueTypings("rust");
```
