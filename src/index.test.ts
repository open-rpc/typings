import MethodTypings, { OpenRPCTypingsSupportedLanguages } from ".";
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
          name: "jibberNiptip",
          schema: { title: "niptip", type: "number" },
        },
      ],
      result: {
        name: "jibberRipslip",
        schema: {
          properties: {
            reepadoop: { type: "number" },
            skeepadeep: { title: "skeepadeep", type: "integer" },
          },
          title: "ripslip",
        },
        type: "object",
      },
    },
  ],
  openrpc: "1.0.0",
} as OpenRPC;

const expectedAnyTypeTypescript = "export type AnyJipperjobberType = Niptip | Ripslip;";
const expectedNipTipTypescript = "export type Niptip = number;";
const expectedSkeepadeepTypescript = "export type Skeepadeep = number;";
const expectedReepadoopTypescript = "export type Yqdpe1HS = number;";
const expectedRipSlipTypescript = [
  "",
  "export interface Ripslip {",
  "  reepadoop?: Yqdpe1HS;",
  "  skeepadeep?: Skeepadeep;",
  "  [k: string]: any;",
  "}",
  "",
].join("\n");
const expectedJibberTypescript = "export type Jibber = (jibberNiptip: Niptip) => Promise<Ripslip>;";
const expectedTypescript = [
  expectedAnyTypeTypescript,
  expectedNipTipTypescript,
  expectedReepadoopTypescript,
  expectedSkeepadeepTypescript,
  expectedRipSlipTypescript,
  expectedJibberTypescript,
].join("\n");

const expectedNipTipRust = "";
const expectedRipSlipRust = [
  "pub type JibberNiptip = f64;",
  "#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]",
  "#[cfg_attr(test, derive(Random))]",
  "#[serde(untagged)]",
  "pub enum JibberRipslip {",
  "    AnythingArray(Vec<Option<serde_json::Value>>),",
  "",
  "    Bool(bool),",
  "",
  "    Double(f64),",
  "",
  "    Integer(i64),",
  "",
  "    JibberRipslipClass(JibberRipslipClass),",
  "",
  "    String(String),",
  "}",
  "#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]",
  "#[cfg_attr(test, derive(Random))]",
  "pub struct JibberRipslipClass {",
  "    #[serde(rename = \"reepadoop\")]",
  "    reepadoop: Option<f64>,",
  "",
  "    #[serde(rename = \"skeepadeep\")]",
  "    skeepadeep: Option<i64>,",
  "}",
].join("\n");

const expectedJibberRust = "pub fn jibber(&mut self, jibberNiptip: JibberNiptip) -> RpcRequest<JibberRipslip>;";
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
      expect(() => methodTypings.getMethodTypings(OpenRPCTypingsSupportedLanguages.typescript)).toThrow();
    });

    it("returns a MethodTypings object for a method", async () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      await methodTypings.generateTypings();

      expect(methodTypings.getMethodTypings(OpenRPCTypingsSupportedLanguages.typescript))
        .toEqual("export type Jibber = (jibberNiptip: Niptip) => Promise<Ripslip>;");

      expect(methodTypings.getMethodTypings(OpenRPCTypingsSupportedLanguages.rust))
        .toEqual("pub fn jibber(&mut self, jibberNiptip: JibberNiptip) -> RpcRequest<JibberRipslip>;");
    });
  });

  describe("toString", () => {

    it("throws if types not generated yet", () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      expect(() => methodTypings.toString(OpenRPCTypingsSupportedLanguages.typescript)).toThrow();
    });

    it("returns a string of typings where the typeNames are unique", async () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      await methodTypings.generateTypings();

      expect(methodTypings.toString(OpenRPCTypingsSupportedLanguages.typescript)).toBe(expectedTypescript);
      expect(methodTypings.toString(OpenRPCTypingsSupportedLanguages.rust)).toBe(expectedRust);
    });
  });

  describe("getMethodTypings", () => {

    it("throws if types not generated yet", async () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      expect(() => methodTypings.getMethodTypings(OpenRPCTypingsSupportedLanguages.typescript)).toThrow();
    });

    it("returns the function signature for a method", async () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      await methodTypings.generateTypings();

      expect(methodTypings.getMethodTypings(OpenRPCTypingsSupportedLanguages.typescript))
        .toBe("export type Jibber = (jibberNiptip: Niptip) => Promise<Ripslip>;");

      expect(methodTypings.getMethodTypings(OpenRPCTypingsSupportedLanguages.rust))
        .toBe("pub fn jibber(&mut self, jibberNiptip: JibberNiptip) -> RpcRequest<JibberRipslip>;");
    });

    it("works when there are no params", async () => {
      const copytestOpenRPCDocument = cloneDeep(testOpenRPCDocument);
      copytestOpenRPCDocument.methods[0].params = [];
      const methodTypings = new MethodTypings(copytestOpenRPCDocument);
      await methodTypings.generateTypings();

      expect(methodTypings.getMethodTypings(OpenRPCTypingsSupportedLanguages.typescript))
        .toBe("export type Jibber = () => Promise<Ripslip>;");

      expect(methodTypings.getMethodTypings(OpenRPCTypingsSupportedLanguages.rust))
        .toBe("pub fn jibber(&mut self) -> RpcRequest<JibberRipslip>;");
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
                  items: [{ format: "int64", type: "integer" }],
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
    expect(
      methodTypings.toString(
        OpenRPCTypingsSupportedLanguages.rust,
        { includeSchemaTypings: true, includeMethodAliasTypings: false },
      ),
    ).toBe([
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
