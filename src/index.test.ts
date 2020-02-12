import MethodTypings, { OpenRPCTypingsSupportedLanguages } from ".";
import { OpenrpcDocument as OpenRPC } from "@open-rpc/meta-schema";

const getTestOpenRPCDocument = () => ({
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
          required: true,
          schema: {
            description: "a really cool niptip",
            title: "niptip",
            type: "number",
          },
        },
      ],
      result: {
        name: "jibberRipslip",
        required: true,
        schema: {
          properties: {
            reepadoop: { type: "number" },
            skeepadeep: { title: "skeepadeep", type: "integer" },
          },
          title: "ripslip",
          type: "object",
        },
      },
    },
  ],
  openrpc: "1.0.0",
} as OpenRPC);

const expectedNipTipTypescript = [
  "/**",
  " *",
  " * a really cool niptip",
  " *",
  " */",
  "export type Niptip = number;",
].join("\n");
const expectedSkeepadeepTypescript = "export type Skeepadeep = number;";
const expectedReepadoopTypescript = "export type NumberHo1ClIqD = number;";
const expectedRipSlipTypescript = [
  "export interface Ripslip {",
  "  reepadoop?: NumberHo1ClIqD;",
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
  "/**",
  " *",
  " * Generated! Represents an alias to any of the provided schemas",
  " *",
  " */",
  "export type AnyOfNiptipRipslip = Niptip | Ripslip;",
  expectedJibberTypescript,
].join("\n");

const expectedNipTipRust = "";
const expectedRipSlipRust = [
  "use serde::{Serialize, Deserialize};",
  "use std::collections::HashMap;",
  "extern crate serde_json;",
  "",
  "/// Niptip",
  "///",
  "/// a really cool niptip",
  "///",
  "pub type Niptip = f64;",
  "pub type NumberHo1ClIqD = f64;",
  "pub type Skeepadeep = i64;",
  "#[derive(Serialize, Deserialize)]",
  "pub struct Ripslip {",
  "    pub(crate) reepadoop: Option<NumberHo1ClIqD>,",
  "    pub(crate) skeepadeep: Option<Skeepadeep>,",
  "}",
].join("\n");

const expectedJibberRust = "pub fn Jibber(&mut self, jibberNiptip: Niptip) -> RpcRequest<Ripslip>;";
const expectedRust = [
  expectedRipSlipRust,
  "#[derive(Serialize, Deserialize)]",
  "pub enum AnyOfNiptipRipslip {",
  "    Niptip,",
  "    Ripslip",
  "}",
  expectedJibberRust,
].join("\n");

const expectedNipTipGo = ["// a really cool niptip", "type Niptip float64"].join("\n");
const expectedSkeepadeepGo = "type Skeepadeep int64";
const expectedReepadoopGo = "type NumberHo1ClIqD float64";
const expectedRipSlipGo = [
  "type Ripslip struct {",
  "\tReepadoop  *NumberHo1ClIqD `json:\"reepadoop,omitempty\"`",
  "\tSkeepadeep *Skeepadeep     `json:\"skeepadeep,omitempty\"`",
  "}",
].join("\n");
const expectedJibberGo = [
  "type Jipperjobber interface {",
  "\tJibber(jibberNiptip Niptip) (Ripslip, error)",
  "}",
].join("\n");
const expectedGo = [
  expectedNipTipGo,
  expectedReepadoopGo,
  expectedSkeepadeepGo,
  expectedRipSlipGo,
  "// Generated! Represents an alias to any of the provided schemas",
  "type AnyOfNiptipRipslip struct {",
  "\tNiptip  *Niptip",
  "\tRipslip *Ripslip",
  "}",
  expectedJibberGo,
].join("\n");

const expectedNipTipPython = ["// a really cool niptip", "type Niptip float64"].join("\n");
const expectedSkeepadeepPython = "type Skeepadeep int64";
const expectedReepadoopPython = "type NumberHo1ClIqD float64";
const expectedRipSlipPython = [
  "type Ripslip struct {",
  "\tReepadoop  *NumberHo1ClIqD `json:\"reepadoop,omitempty\"`",
  "\tSkeepadeep *Skeepadeep     `json:\"skeepadeep,omitempty\"`",
  "}",
].join("\n");
const expectedJibberPython = [
  "type Jipperjobber interface {",
  "\tJibber(jibberNiptip Niptip) (Ripslip, error)",
  "}",
].join("\n");
const expectedPython = [
  expectedReepadoopPython,
  expectedSkeepadeepPython,
  expectedNipTipPython,
  expectedRipSlipPython,
  "// Generated! Represents an alias to any of the provided schemas",
  "type AnyOfNiptipRipslip struct {",
  "\tNiptip  *Niptip",
  "\tRipslip *Ripslip",
  "}",
  expectedJibberPython,
].join("\n");

describe("MethodTypings", () => {

  it("can be constructed", () => {
    expect(new MethodTypings(getTestOpenRPCDocument())).toBeInstanceOf(MethodTypings);
  });

  it("defaults any schemas who is missing a title", () => {
    const copy = getTestOpenRPCDocument();
    copy.methods[0].params.push({
      name: "flooby",
      schema: { type: "string" },
    });
    const typings = new MethodTypings(copy);
    expect(
      typings.getTypingNames("typescript", copy.methods[0]).params[1],
    ).toBe("StringDoaGddGA");
  });

  it("can generate typings map", () => {
    const methodTypings = new MethodTypings(getTestOpenRPCDocument());

    expect(methodTypings).toBeInstanceOf(MethodTypings);
  });

  describe("getTypingNames", () => {
    it("returns method name, param names and result names", () => {
      const methodTypings = new MethodTypings(getTestOpenRPCDocument());
      expect(
        methodTypings.getTypingNames(
          "typescript",
          getTestOpenRPCDocument().methods[0],
        ),
      ).toEqual({
        method: "Jibber",
        params: ["Niptip"],
        result: "Ripslip",
      });
    });

    it("prefixes names with 'any' when they aren't recognized json schemas", () => {
      const copy = getTestOpenRPCDocument();
      copy.methods[0].params.push({
        name: "flooby",
        schema: {
          scooby: "not real",
        },
      });
      const typings = new MethodTypings(copy);
      expect(
        typings.getTypingNames("typescript", copy.methods[0]).params[1],
      ).toBe("AnyM6CMQ11S");
    });

  });

  describe("getMethodTypings", () => {

    it("returns a MethodTypings object for a method", () => {
      const methodTypings = new MethodTypings(getTestOpenRPCDocument());

      expect(methodTypings.getMethodTypings("typescript"))
        .toEqual("export type Jibber = (jibberNiptip: Niptip) => Promise<Ripslip>;");

      expect(methodTypings.getMethodTypings("rust"))
        .toEqual("pub fn Jibber(&mut self, jibberNiptip: Niptip) -> RpcRequest<Ripslip>;");

      expect(methodTypings.getMethodTypings("go"))
        .toEqual([
          "type Jipperjobber interface {",
          "\tJibber(jibberNiptip Niptip) (Ripslip, error)",
          "}",
        ].join("\n"));

      expect(methodTypings.getMethodTypings("python"))
        .toEqual("");
    });

    it("works when there are no params", () => {
      const copytestOpenRPCDocument = getTestOpenRPCDocument();
      copytestOpenRPCDocument.methods[0].params = [];
      const methodTypings = new MethodTypings(copytestOpenRPCDocument);

      expect(methodTypings.getMethodTypings("typescript"))
        .toBe("export type Jibber = () => Promise<Ripslip>;");

      expect(methodTypings.getMethodTypings("rust"))
        .toBe("pub fn Jibber(&mut self) -> RpcRequest<Ripslip>;");

      expect(methodTypings.getMethodTypings("go"))
        .toEqual([
          "type Jipperjobber interface {",
          "\tJibber() (Ripslip, error)",
          "}",
        ].join("\n"));

      expect(methodTypings.getMethodTypings("python"))
        .toEqual("");
    });
  });

  describe("toString", () => {

    it("can optionally receive only method typings", () => {
      const methodTypings = new MethodTypings(getTestOpenRPCDocument());

      expect(methodTypings.toString("typescript", {
        includeMethodAliasTypings: true,
        includeSchemaTypings: false,
      })).toBe(expectedJibberTypescript);
    });

    it("returns a string of typings for all languages", () => {
      const methodTypings = new MethodTypings(getTestOpenRPCDocument());

      expect(methodTypings.toString("typescript")).toBe(expectedTypescript);
      expect(methodTypings.toString("rust")).toBe(expectedRust);
      expect(methodTypings.toString("go")).toBe(expectedGo);
    });
  });

  it("gracefully handles openrpc documents with duplicate names for content descriptors", () => {
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
                  description: "array of strings is all...",
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

    const methodTypings = new MethodTypings(dupesDocument);
    expect(
      methodTypings.toString(
        "rust",
        { includeSchemaTypings: true, includeMethodAliasTypings: false },
      ),
    ).toBe(`use serde::{Serialize, Deserialize};
use std::collections::HashMap;
extern crate serde_json;

pub type StringDoaGddGA = String;
pub type BooleanVyG3AETh = bool;
#[derive(Serialize, Deserialize)]
pub struct ObjectOfBooleanVyG3AETh5PX0GXMY {
    pub(crate) ripslip: Option<BooleanVyG3AETh>,
}
/// UnorderedSetOfStringDoaGddGAmrf5BlCm
///
/// array of strings is all...
///
pub type UnorderedSetOfStringDoaGddGAmrf5BlCm = Vec<StringDoaGddGA>;
pub type IntegerXZTmW7Mv = i64;
pub type UnorderedSetOfIntegerXZTmW7MvjsBS3XxD = (IntegerXZTmW7Mv);
#[derive(Serialize, Deserialize)]
pub enum OneOfUnorderedSetOfIntegerXZTmW7MvjsBS3XxDUnorderedSetOfStringDoaGddGAmrf5BlCm9HEAgL2M {
    UnorderedSetOfStringDoaGddGAmrf5BlCm,
    UnorderedSetOfIntegerXZTmW7MvjsBS3XxD
}
#[derive(Serialize, Deserialize)]
pub enum AnyOfStringDoaGddGAStringDoaGddGAObjectOfBooleanVyG3AETh5PX0GXMYOneOfUnorderedSetOfIntegerXZTmW7MvjsBS3XxDUnorderedSetOfStringDoaGddGAmrf5BlCm9HEAgL2MIntegerXZTmW7Mv {
    StringDoaGddGA,
    ObjectOfBooleanVyG3AETh5PX0GXMY,
    OneOfUnorderedSetOfIntegerXZTmW7MvjsBS3XxDUnorderedSetOfStringDoaGddGAmrf5BlCm9HEAgL2M,
    IntegerXZTmW7Mv
}`);
  });

  it("handles schemas with anyOf, oneOf and allOf", () => {
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
              required: true,
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
              required: true,
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
              required: true,
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
            {
              name: "ripper",
              schema: {
                type: "string",
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
    expect(methodTypings.toString("typescript"))
      .toBe(`/**
 *
 * its a b.
 *
 */
export type Bee = number;
export type A = string;
export type Ceee = boolean;
export type AnyOfABeeCeeePpSBogg4 = Bee | A | Ceee;
export type X = number;
export type Y = string;
export type Z = boolean;
export type OneOfXYZCMfJwVAI = X | Y | Z;
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
export type AllOfWithBarWithBazWithFooVAQmhFhX = WithBaz & WithBar & WithFoo;
export type StringDoaGddGA = string;
/**
 *
 * Generated! Represents an alias to any of the provided schemas
 *
 */
export type AnyOfAnyOfABeeCeeePpSBogg4OneOfXYZCMfJwVAIAllOfWithBarWithBazWithFooVAQmhFhXStringDoaGddGAStringDoaGddGA = AnyOfABeeCeeePpSBogg4 | OneOfXYZCMfJwVAI | AllOfWithBarWithBazWithFooVAQmhFhX | StringDoaGddGA;
export type Jobber = (ripslip: AnyOfABeeCeeePpSBogg4, biperbopper: OneOfXYZCMfJwVAI, slippyslopper: AllOfWithBarWithBazWithFooVAQmhFhX, ripper?: StringDoaGddGA) => Promise<StringDoaGddGA>;`); //tslint:disable-line
  });
});
