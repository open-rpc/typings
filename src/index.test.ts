import MethodTypings from ".";
import { OpenRPC } from "@open-rpc/meta-schema";
import { cloneDeep } from "lodash";

const testOpenRPCDocument = {
  info: {
    title: "jipperjobber",
    version: "3.2.1",
  },
  methods: [
    {
      name: "jibber",
      params: [
        {
          name: "niptip",
          schema: { type: "number" },
        },
      ],
      result: {
        name: "ripslip",
        schema: {
          properties: {
            reepadoop: { type: "number" },
          },
          skeepadeep: { type: "integer" },
        },
        type: "object",
      },
    },
  ],
  openrpc: "1.0.0",
} as OpenRPC;

const expectedNipTipTypescript = "export type TNiptip = number;";
const expectedRipSlipTypescript = [
  "export interface IRipslip {",
  "  reepadoop?: number;",
  "  [k: string]: any;",
  "}",
].join("\n");
const expectedJibberTypescript = "export type TJibber = (niptip: TNiptip) => Promise<IRipslip>;";
const expectedTypescript = [
  expectedNipTipTypescript,
  expectedRipSlipTypescript,
  expectedJibberTypescript,
].join("\n");

const expectedNipTipRust = "";
const expectedRipSlipRust = [
  "pub type Niptip = f64;",
  "#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]",
  "#[cfg_attr(test, derive(Random))]",
  "#[serde(untagged)]",
  "pub enum Ripslip {",
  "    AnythingArray(Vec<Option<serde_json::Value>>),",
  "",
  "    Bool(bool),",
  "",
  "    Double(f64),",
  "",
  "    Integer(i64),",
  "",
  "    RipslipClass(RipslipClass),",
  "",
  "    String(String),",
  "}",
  "#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]",
  "#[cfg_attr(test, derive(Random))]",
  "pub struct RipslipClass {",
  "    #[serde(rename = \"reepadoop\")]",
  "    reepadoop: Option<f64>,",
  "}",
].join("\n");

const expectedJibberRust = "pub fn jibber(&mut self, niptip: Niptip) -> RpcRequest<Ripslip>;";
const expectedRust = [expectedRipSlipRust, expectedJibberRust].join("\n");

describe("MethodTypings", () => {

  it("can be constructed", () => {
    expect(new MethodTypings(testOpenRPCDocument)).toBeInstanceOf(MethodTypings);
  });

  it("can generate typings map", async () => {
    const methodTypings = new MethodTypings(testOpenRPCDocument);

    await methodTypings.generateTypings();

    expect(methodTypings).toBeInstanceOf(MethodTypings);
  });

  describe("getMethodTypings", () => {

    it("throws if types not generated yet", () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      expect(() => methodTypings.getMethodTypings(testOpenRPCDocument.methods[0], "typescript")).toThrow();
    });

    it("returns a string of typings for a method", async () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      await methodTypings.generateTypings();

      expect(methodTypings.getMethodTypings(testOpenRPCDocument.methods[0], "typescript")).toEqual({
        methodAliasName: "TJibber",
        methodTyping: "export type TJibber = (niptip: TNiptip) => Promise<IRipslip>;",
        params: [
          {
            typeId: "jibber/0",
            typeName: "TNiptip",
            typing: expectedNipTipTypescript,
          },
        ],
        result: {
          typeId: "jibber/result",
          typeName: "IRipslip",
          typing: expectedRipSlipTypescript,
        },
      });

      expect(methodTypings.getMethodTypings(testOpenRPCDocument.methods[0], "rust")).toEqual({
        methodAliasName: "Jibber",
        methodTyping: "pub fn jibber(&mut self, niptip: Niptip) -> RpcRequest<Ripslip>;",
        params: [
          {
            typeId: "jibber/0",
            typeName: "Niptip",
            typing: expectedNipTipRust,
          },
        ],
        result: {
          typeId: "jibber/result",
          typeName: "Ripslip",
          typing: expectedRipSlipRust,
        },
      });
    });
  });

  describe("toString", () => {

    it("throws if types not generated yet", () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      expect(() => methodTypings.toString("typescript")).toThrow();
    });

    it("returns a string of typings where the typeNames are unique", async () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      await methodTypings.generateTypings();

      expect(methodTypings.toString("typescript")).toBe(expectedTypescript);
      expect(methodTypings.toString("rust")).toBe(expectedRust);
    });
  });

  describe("getMethodAliasTyping", () => {

    it("throws if types not generated yet", async () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      expect(() => methodTypings.getMethodAliasTyping(testOpenRPCDocument.methods[0], "typescript")).toThrow();
    });

    it("returns the function signature for a method", async () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      await methodTypings.generateTypings();

      expect(methodTypings.getMethodAliasTyping(testOpenRPCDocument.methods[0], "typescript"))
        .toBe("export type TJibber = (niptip: TNiptip) => Promise<IRipslip>;");

      expect(methodTypings.getMethodAliasTyping(testOpenRPCDocument.methods[0], "rust"))
        .toBe("pub fn jibber(&mut self, niptip: Niptip) -> RpcRequest<Ripslip>;");
    });

    it("works when there are no params", async () => {
      const copytestOpenRPCDocument = cloneDeep(testOpenRPCDocument);
      copytestOpenRPCDocument.methods[0].params = [];
      const methodTypings = new MethodTypings(copytestOpenRPCDocument);
      await methodTypings.generateTypings();

      expect(methodTypings.getMethodAliasTyping(copytestOpenRPCDocument.methods[0], "typescript"))
        .toBe("export type TJibber = () => Promise<IRipslip>;");

      expect(methodTypings.getMethodAliasTyping(copytestOpenRPCDocument.methods[0], "rust"))
        .toBe("pub fn jibber(&mut self) -> RpcRequest<Ripslip>;");
    });
  });

  it("gracefully handles openrpc documents with duplicate names for content descriptors", async () => {
    const dupesDocument = {
      info: {
        title: "jipperjobber",
        version: "3.2.1",
      },
      methods: [
        {
          name: "jobber",
          params: [
            {
              name: "ripslip",
              schema: {
                type: "string",
              },
            },
          ],
          result: {
            name: "ripslip",
            schema: {
              oneOf: [
                {
                  format: "int64",
                  type: "integer",
                },
                {
                  items: {
                    format: "int64",
                    type: "integer",
                  },
                  type: "array",
                },
              ],
            },
          },
        },
        {
          name: "jibber",
          params: [
            {
              name: "ripslip",
              schema: {
                type: "string",
              },
            },
            {
              name: "ripslip",
              schema: {
                properties: {
                  ripslip: {
                    type: "boolean",
                  },
                },
                type: "object",
              },
            },
          ],
          result: {
            name: "ripslip",
            schema: {
              format: "int64",
              type: "integer",
            },
          },
        },
      ],
      openrpc: "1.0.0",
    } as OpenRPC;

    const copytestOpenRPCDocument = cloneDeep(dupesDocument);

    const methodTypings = new MethodTypings(copytestOpenRPCDocument);
    await methodTypings.generateTypings();
    expect(methodTypings.toString("rust", { includeContentDescriptorTypings: true, includeMethodAliasTypings: false }))
      .toBe([
        "pub type Ripslip2 = String;",
        "#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]",
        "#[cfg_attr(test, derive(Random))]",
        "#[serde(untagged)]",
        "pub enum Ripslip {",
        "    Integer(i64),",
        "",
        "    IntegerArray(Vec<i64>),",
        "}",
        "#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]",
        "#[cfg_attr(test, derive(Random))]",
        "pub struct Ripslip1 {",
        "    #[serde(rename = \"ripslip\")]",
        "    ripslip: Option<bool>,",
        "}",
      ].join("\n"));
  });
});
