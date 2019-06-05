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
          schema: {
            title: "niptip",
            type: "number",
          },
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
          type: "object",
        },
        type: "object",
      },
    },
  ],
  openrpc: "1.0.0",
} as OpenRPC;

const expectedNipTipTypescript = "export type Niptip = number;";
const expectedSkeepadeepTypescript = "export type Skeepadeep = number;";
const expectedReepadoopTypescript = "export type NumberYqdpe1HS = number;";
const expectedRipSlipTypescript = [
  "export interface Ripslip {",
  "  reepadoop?: NumberYqdpe1HS;",
  "  skeepadeep?: Skeepadeep;",
  "  [k: string]: any;",
  "}",
].join("\n");
const expectedJibberTypescript = "export type Jibber = (jibberNiptip: Niptip) => Promise<Ripslip>;";
const expectedTypescript = [
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
  "pub struct JibberRipslip {",
  "    #[serde(rename = \"reepadoop\")]",
  "    reepadoop: Option<f64>,",
  "",
  "    #[serde(rename = \"skeepadeep\")]",
  "    skeepadeep: Option<i64>,",
  "}",
].join("\n");

const expectedJibberRust = "pub fn jibber(&mut self, jibberNiptip: JibberNiptip) -> RpcRequest<JibberRipslip>;";
const expectedRust = [expectedRipSlipRust, expectedJibberRust].join("\n");

const expectedNipTipGo = "type Niptip float64";
const expectedSkeepadeepGo = "type Skeepadeep int64";
const expectedReepadoopGo = "type NumberYqdpe1HS float64";
const expectedRipSlipGo = [
  "type Ripslip struct {",
  "\tReepadoop  *float64 `json:\"reepadoop\"`",
  "\tSkeepadeep *int64   `json:\"skeepadeep\"`",
  "}",
].join("\n");
const expectedJibberGo = [
  "type Jipperjobber interface {",
  "\tJibber(jibberNiptip Niptip) (error, Ripslip)",
  "}",
].join("\n");
const expectedGo = [
  expectedNipTipGo,
  expectedReepadoopGo,
  expectedSkeepadeepGo,
  expectedRipSlipGo,
  expectedJibberGo,
].join("\n");

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
      typings.getTypingNames("typescript", copy.methods[0]).params[1],
    ).toBe("StringWxzVcTo3");
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
          "typescript",
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
        typings.getTypingNames("typescript", copy.methods[0]).params[1],
      ).toBe("UnknownFl42CSW8");
    });

  });

  describe("getMethodTypings", () => {

    it("throws if types not generated yet", () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      expect(() => methodTypings.getMethodTypings("typescript")).toThrow();
    });

    it("returns a MethodTypings object for a method", async () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      await methodTypings.generateTypings();

      expect(methodTypings.getMethodTypings("typescript"))
        .toEqual("export type Jibber = (jibberNiptip: Niptip) => Promise<Ripslip>;");

      expect(methodTypings.getMethodTypings("rust"))
        .toEqual("pub fn jibber(&mut self, jibberNiptip: JibberNiptip) -> RpcRequest<JibberRipslip>;");

      expect(methodTypings.getMethodTypings("go"))
        .toEqual([
          "type Jipperjobber interface {",
          "\tJibber(jibberNiptip Niptip) (error, Ripslip)",
          "}",
        ].join("\n"));
    });

    it("works when there are no params", async () => {
      const copytestOpenRPCDocument = cloneDeep(testOpenRPCDocument);
      copytestOpenRPCDocument.methods[0].params = [];
      const methodTypings = new MethodTypings(copytestOpenRPCDocument);
      await methodTypings.generateTypings();

      expect(methodTypings.getMethodTypings("typescript"))
        .toBe("export type Jibber = () => Promise<Ripslip>;");

      expect(methodTypings.getMethodTypings("rust"))
        .toBe("pub fn jibber(&mut self) -> RpcRequest<JibberRipslip>;");

      expect(methodTypings.getMethodTypings("go"))
        .toEqual([
          "type Jipperjobber interface {",
          "\tJibber() (error, Ripslip)",
          "}",
        ].join("\n"));
    });
  });

  describe("toString", () => {

    it("throws if types not generated yet", () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      expect(() => methodTypings.toString("typescript")).toThrow();
    });

    it("can optionally receive only method typings", async () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      await methodTypings.generateTypings();

      expect(methodTypings.toString("typescript", {
        includeMethodAliasTypings: true,
        includeSchemaTypings: false,
      })).toBe(expectedJibberTypescript);
    });

    it("returns a string of typings for all languages", async () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      await methodTypings.generateTypings();

      expect(methodTypings.toString("typescript")).toBe(expectedTypescript);
      expect(methodTypings.toString("rust")).toBe(expectedRust);
      expect(methodTypings.toString("go")).toBe(expectedGo);
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
                  items: { type: "string" },
                  type: "array",
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
        "rust",
        { includeSchemaTypings: true, includeMethodAliasTypings: false },
      ),
    ).toBe([
      "pub type Ripslip2 = String;",
      "pub type Ripslip = Vec<RipslipElement>;",
      "#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]",
      "#[cfg_attr(test, derive(Random))]",
      "#[serde(untagged)]",
      "pub enum RipslipElement {",
      "    Integer(i64),",
      "",
      "    String(String),",
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
              name: "ripper",
              schema: {
                type: "string",
              },
            },
            {
              name: "ripslip",
              schema: {
                anyOf: [
                  {
                    description: "its a b.",
                    title: "bee",
                    type: "number",
                  },
                  {
                    title: "a",
                    type: "string",
                  },
                  {
                    title: "ceee",
                    type: "boolean",
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
                    type: "number",
                  },
                  {
                    title: "y",
                    type: "string",
                  },
                  {
                    title: "z",
                    type: "boolean",
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
              type: "string",
            },
          },
        },
      ],
      openrpc: "1.0.0",
    } as OpenRPC;

    const methodTypings = new MethodTypings(doc);
    await methodTypings.generateTypings();
    expect(methodTypings.toString("typescript"))
      .toBe(`export type StringWxzVcTo3 = string;
/**
 * its a b.
 */
export type Bee = number;
export type A = string;
export type Ceee = boolean;
export type AnyOfBWswD897 = Bee | A | Ceee;
export type X = number;
export type Y = string;
export type Z = boolean;
export type OneOfDgZSW92J = X | Y | Z;
export type Baz = number;
export interface WithBaz {
  baz?: Baz;
  [k: string]: any;
}
export type Bar = number;
export interface WithBar {
  bar?: Bar;
  [k: string]: any;
}
export type Foo = number;
export interface WithFoo {
  foo?: Foo;
  [k: string]: any;
}
export type AllOfHguKC4QU = WithBaz & WithBar & WithFoo;
export type Jobber = (ripper: StringWxzVcTo3, ripslip: AnyOfBWswD897, biperbopper: OneOfDgZSW92J, slippyslopper: AllOfHguKC4QU) => Promise<StringWxzVcTo3>;`); //tslint:disable-line
  });
});
