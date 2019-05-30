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
const expectedReepadoopTypescript = "export type OneOfyqdpe1HS = number;";
const expectedRipSlipTypescript = [
  "",
  "export interface Ripslip {",
  "  reepadoop?: OneOfyqdpe1HS;",
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

  it("defaults any schemas who is missing a title", () => {
    const copy = cloneDeep(testOpenRPCDocument);
    copy.methods[0].params.push({
      name: "flooby",
      schema: { type: "string" },
    });
    const typings = new MethodTypings(copy);
    expect(
      typings.getTypingNames(OpenRPCTypingsSupportedLanguages.typescript, copy.methods[0]).params[1],
    ).toBe("OneOfWxzVcTo3");
  });

  it("can generate typings map", async () => {
    const methodTypings = new MethodTypings(testOpenRPCDocument);

    await methodTypings.generateTypings();

    expect(methodTypings).toBeInstanceOf(MethodTypings);
  });

  describe("getTypingNames", () => {
    it("returns method name, param names and result names", () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      expect(
        methodTypings.getTypingNames(
          OpenRPCTypingsSupportedLanguages.typescript,
          testOpenRPCDocument.methods[0],
        ),
      ).toEqual({
        method: "Jibber",
        params: ["Niptip"],
        result: "Ripslip",
      });
    });

    it("prefixes names with 'unknown' when they aren't recognized json schemas", () => {
      const copy = cloneDeep(testOpenRPCDocument);
      copy.methods[0].params.push({
        name: "flooby",
        schema: {
          scooby: "not real",
        },
      });
      const typings = new MethodTypings(copy);
      expect(
        typings.getTypingNames(OpenRPCTypingsSupportedLanguages.typescript, copy.methods[0]).params[1],
      ).toBe("Unknownfl42CSW8");
    });

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

    it("can optionally receive only method typings", async () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      await methodTypings.generateTypings();

      expect(methodTypings.toString(OpenRPCTypingsSupportedLanguages.typescript, {
        includeMethodAliasTypings: true,
        includeSchemaTypings: false,
      })).toBe(expectedJibberTypescript);
    });

    it("returns a string of typings for all languages", async () => {
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

  it("handles schemas with anyOf, oneOf and allOf", async () => {
    const doc = {
      info: {
        title: "abc",
        version: "3.2.1",
      },
      methods: [
        {
          name: "jobber",
          params: [
            {
              name: "ripslip",
              schema: {
                anyOf: [
                  {
                    title: "bee",
                    type: "string",
                  },
                  {
                    title: "a",
                    type: "string",
                  },
                  {
                    title: "ceee",
                    type: "string",
                  },
                ],
              },
            },
            {
              name: "biperbopper",
              schema: {
                oneOf: [
                  {
                    title: "x",
                    type: "string",
                  },
                  {
                    title: "y",
                    type: "string",
                  },
                  {
                    title: "z",
                    type: "string",
                  },
                ],
              },
            },
            {
              name: "slippyslopper",
              schema: {
                allOf: [
                  {
                    properties: { baz: { title: "baz", type: "number" } },
                    title: "withBaz",
                    type: "object",
                  },
                  {
                    properties: { bar: { title: "bar", type: "number" } },
                    title: "withBar",
                    type: "object",
                  },
                  {
                    properties: { foo: { title: "foo", type: "number" } },
                    title: "withFoo",
                    type: "object",
                  },
                ],
              },
            },
          ],
          result: {
            name: "froppledocks",
            schema: {
              oneOf: [
                {
                  format: "int64",
                  title: "ray",
                  type: "integer",
                },
                {
                  items: [{ title: "may", format: "int64", type: "integer" }],
                  title: "jay",
                  type: "array",
                },
              ],
            },
          },
        },
      ],
      openrpc: "1.0.0",
    } as OpenRPC;

    const methodTypings = new MethodTypings(doc);
    await methodTypings.generateTypings();
    expect(methodTypings.toString(OpenRPCTypingsSupportedLanguages.typescript))
      .toBe(`export type AnyAbcType = AnyOfZH8Kb7HB | OneOfUObjGdU | AllOfhguKC4QU | OneOf1RQN2JlD;
export type AnyOfZH8Kb7HB = Bee;
export type Bee = string;
export type OneOfUObjGdU = X;
export type X = string;
export type AllOfhguKC4QU = WithBaz & WithBar & WithFoo;
export type Baz = number;
export type Bar = number;
export type Foo = number;
export type OneOf1RQN2JlD = Ray | Jay;
export type Ray = number;
export type Jay = [May];
export type May = number;

export interface WithBaz {
  baz?: Baz;
  [k: string]: any;
}
export interface WithBar {
  bar?: Bar;
  [k: string]: any;
}
export interface WithFoo {
  foo?: Foo;
  [k: string]: any;
}

export type Jobber = (ripslip: AnyOfZH8Kb7HB, biperbopper: OneOfUObjGdU, slippyslopper: AllOfhguKC4QU) => Promise<OneOf1RQN2JlD>;`); //tslint:disable-line
  });
});
