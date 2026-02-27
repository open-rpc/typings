import MethodTypings from ".";
import { MethodObject, OpenrpcDocument as OpenRPC } from "./types";
import examples from "@open-rpc/examples";
import { dereferenceDocument } from "@open-rpc/schema-utils-js";
import defaultReferenceResolver from "@json-schema-tools/reference-resolver"

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
            aboolT: true,
            aboolF: false,
          },
          title: "ripslip",
          type: "object",
        },
      },
    },
    {
      name: "notificationTest",
      params: [
        {
          name: "notificationParamName",
          required: true,
          schema: {
            description: "a really cool notificationTest",
            title: "notificationTestParam",
            type: "number",
          },
        },
      ],
    }
  ],
  openrpc: "1.3.2",
} as OpenRPC);

const expectedNipTipTypescript = [
  "/**",
  " *",
  " * a really cool niptip",
  " *",
  " */",
  "export type Niptip = number;",
  "/**",
  " *",
  " * a really cool notificationTest",
  " *",
  " */",
].join("\n");
const expectedSkeepadeepTypescript = "export type Skeepadeep = number;";
const expectedReepadoopTypescript = "export type NumberHo1ClIqD = number;";
const expectedRipSlipTypescript = [
  "export type NotificationTestParam = number;",
  "export interface Ripslip {",
  "  reepadoop?: NumberHo1ClIqD;",
  "  skeepadeep?: Skeepadeep;",
  "  aboolT?: AlwaysTrue;",
  "  aboolF?: AlwaysFalse;",
  "  [k: string]: any;",
  "}",
].join("\n");
const expectedJibberTypescript = "export type Jibber = (jibberNiptip: Niptip) => Promise<Ripslip>;";
const expectedNotificationTestTypescript = "export type NotificationTest = (notificationParamName: NotificationTestParam) => Promise<void>;";
const expectedTypescript = [
  expectedReepadoopTypescript,
  expectedSkeepadeepTypescript,
  "type AlwaysTrue = any;",
  "type AlwaysFalse = any;",
  expectedNipTipTypescript,
  expectedRipSlipTypescript,
  "/**",
  " *",
  " * Generated! Represents an alias to any of the provided schemas",
  " *",
  " */",
  "export type AnyOfNiptipNotificationTestParamRipslip = Niptip | NotificationTestParam | Ripslip;",
  expectedJibberTypescript,
  expectedNotificationTestTypescript,
].join("\n");

const expectedRipSlipRust = [
  "extern crate serde;",
  "extern crate serde_json;",
  "extern crate derive_builder;",
  "",
  "use serde::{Serialize, Deserialize};",
  "use derive_builder::Builder;",
  "pub type NumberHo1ClIqD = f64;",
  "pub type Skeepadeep = i64;",
  "type AlwaysTrue = serde_json::Value;",
  "type AlwaysFalse = serde_json::Value;",
  "/// Niptip",
  "///",
  "/// a really cool niptip",
  "///",
  "pub type Niptip = f64;",
  "/// NotificationTestParam",
  "///",
  "/// a really cool notificationTest",
  "///",
  "pub type NotificationTestParam = f64;",
  "#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Builder, Default)]",
  "#[builder(setter(strip_option), default)]",
  "#[serde(default)]",
  "pub struct Ripslip {",
  `    #[serde(skip_serializing_if = "Option::is_none")]`,
  "    pub reepadoop: Option<NumberHo1ClIqD>,",
  `    #[serde(skip_serializing_if = "Option::is_none")]`,
  "    pub skeepadeep: Option<Skeepadeep>,",
  `    #[serde(rename = "aboolT", skip_serializing_if = "Option::is_none")]`,
  "    pub abool_t: Option<AlwaysTrue>,",
  `    #[serde(rename = "aboolF", skip_serializing_if = "Option::is_none")]`,
  "    pub abool_f: Option<AlwaysFalse>,",
  "}"
].join("\n");

const expectedJibberRust = "pub fn Jibber(&mut self, jibberNiptip: Niptip) -> RpcRequest<Ripslip>;";
const expectedNotificationTestRust = "pub fn NotificationTest(&mut self, notificationParamName: NotificationTestParam) -> RpcRequest<void>;";
const expectedRust = [
  expectedRipSlipRust,
  "#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]",
  "#[serde(untagged)]",
  "pub enum AnyOfNiptipNotificationTestParamRipslip {",
  "    Niptip(Niptip),",
  "    NotificationTestParam(NotificationTestParam),",
  "    Ripslip(Ripslip),",
  "}",
  expectedJibberRust,
  expectedNotificationTestRust,
].join("\n");

const expectedNipTipGo = ["// a really cool niptip", "type Niptip float64", "// a really cool notificationTest", "type NotificationTestParam float64"].join("\n");
const expectedSkeepadeepGo = "type Skeepadeep int64";
const expectedReepadoopGo = "type NumberHo1ClIqD float64";
const expectedRipSlipGo = [
  "type Ripslip struct {",
  "\tReepadoop  *NumberHo1ClIqD `json:\"reepadoop,omitempty\"`",
  "\tSkeepadeep *Skeepadeep     `json:\"skeepadeep,omitempty\"`",
  "\tAboolT     *AlwaysTrue     `json:\"aboolT,omitempty\"`",
  "\tAboolF     *AlwaysFalse    `json:\"aboolF,omitempty\"`",
  "}",
].join("\n");
const expectedJibberGo = [
  "type Jipperjobber interface {",
  "\tJibber(jibberNiptip Niptip) (Ripslip, error)",
  "\tNotificationTest(notificationParamName NotificationTestParam) error",
  "}",
].join("\n");

const expectedExtraGo = [
  "func (a *AnyOfNiptipNotificationTestParamRipslip) UnmarshalJSON(bytes []byte) error {",
  "\tvar ok bool",
  "\tvar myNiptip Niptip",
  "\tif err := json.Unmarshal(bytes, &myNiptip); err == nil {",
  "\t\tok = true",
  "\t\ta.Niptip = &myNiptip",
  "\t}",
  "\tvar myNotificationTestParam NotificationTestParam",
  "\tif err := json.Unmarshal(bytes, &myNotificationTestParam); err == nil {",
  "\t\tok = true",
  "\t\ta.NotificationTestParam = &myNotificationTestParam",
  "\t}",
  "\tvar myRipslip Ripslip",
  "\tif err := json.Unmarshal(bytes, &myRipslip); err == nil {",
  "\t\tok = true",
  "\t\ta.Ripslip = &myRipslip",
  "\t}",
  "\tif ok {",
  "\t\treturn nil",
  "\t}",
  "\treturn errors.New(\"failed to unmarshal any of the object properties\")",
  "}",
  "func (o AnyOfNiptipNotificationTestParamRipslip) MarshalJSON() ([]byte, error) {",
  "\tout := []interface{}{}",
  "\tif o.Niptip != nil {",
  "\t\tout = append(out, o.Niptip)",
  "\t}",
  "\tif o.NotificationTestParam != nil {",
  "\t\tout = append(out, o.NotificationTestParam)",
  "\t}",
  "\tif o.Ripslip != nil {",
  "\t\tout = append(out, o.Ripslip)",
  "\t}",
  "\treturn json.Marshal(out)",
  "}"
].join("\n");
const expectedGo = [
  "import \"encoding/json\"",
  "import \"errors\"",
  expectedReepadoopGo,
  expectedSkeepadeepGo,
  "type AlwaysTrue interface{}",
  "type AlwaysFalse interface{}",
  expectedNipTipGo,
  expectedRipSlipGo,
  "// Generated! Represents an alias to any of the provided schemas",
  "type AnyOfNiptipNotificationTestParamRipslip struct {",
  "\tNiptip                *Niptip",
  "\tNotificationTestParam *NotificationTestParam",
  "\tRipslip               *Ripslip",
  "}",
  expectedExtraGo,
  expectedJibberGo
].join("\n");

describe("MethodTypings", () => {

  it("can be constructed", () => {
    expect(new MethodTypings(getTestOpenRPCDocument())).toBeInstanceOf(MethodTypings);
  });

  it("defaults any schemas who is missing a title", () => {
    const copy = getTestOpenRPCDocument();
    const methods = (copy.methods as MethodObject[])
    methods[0].params.push({
      name: "flooby",
      schema: { type: "string" },
    });
    const typings = new MethodTypings(copy);
    expect(
      typings.getTypingNames("typescript", methods[0]).params[1],
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
          (getTestOpenRPCDocument().methods as MethodObject[])[0],
        ),
      ).toEqual({
        method: "Jibber",
        params: ["Niptip"],
        result: "Ripslip",
      });

      expect(
        methodTypings.getTypingNames(
          "typescript",
          (getTestOpenRPCDocument().methods as MethodObject[])[1],
        ),
      ).toEqual({
        method: "NotificationTest",
        params: ["NotificationTestParam"],
        result: "Promise<void>",
      });

      expect(
        methodTypings.getTypingNames(
          "rust",
          (getTestOpenRPCDocument().methods as MethodObject[])[1],
        ),
      ).toEqual({
        method: "NotificationTest",
        params: ["NotificationTestParam"],
        result: "RpcRequest<void>",
      });


      expect(
        methodTypings.getTypingNames(
          "go",
          (getTestOpenRPCDocument().methods as MethodObject[])[1],
        ),
      ).toEqual({
        method: "NotificationTest",
        params: ["NotificationTestParam"],
        result: "void",
      });

      expect(
        methodTypings.getTypingNames(
          "python",
          (getTestOpenRPCDocument().methods as MethodObject[])[1],
        ),
      ).toEqual({
        method: "NotificationTest",
        params: ["NotificationTestParam"],
        result: "None",
      });
    });

    it("prefixes names with 'any' when they aren't recognized json schemas", () => {
      const copy = getTestOpenRPCDocument();
      const methods = (copy.methods as MethodObject[])
      methods[0].params.push({
        name: "flooby",
        schema: {
          scooby: "not real",
        },
      });
      const typings = new MethodTypings(copy);
      expect(
        typings.getTypingNames("typescript", methods[0]).params[1],
      ).toBe("AnyM6CMQ11S");
    });

  });

  describe("getParamsTypings", () => {

    it("returns a ParamTypings for a method", () => {
      const methodTypings = new MethodTypings(getTestOpenRPCDocument());
      

      expect(methodTypings.getParamsTypings("typescript"))
        .toEqual("jibberNiptip: Niptip\nnotificationParamName: NotificationTestParam");

      expect(methodTypings.getParamsTypings("rust"))
        .toEqual("jibberNiptip: Niptip\nnotificationParamName: NotificationTestParam");

      expect(methodTypings.getParamsTypings("go"))
        .toEqual("jibberNiptip Niptip\nnotificationParamName NotificationTestParam");

      expect(methodTypings.getParamsTypings("python"))
        .toEqual("");
    });

    it("returns a ParamTyping for a methodObject", () => {
      const methodTypings = new MethodTypings(getTestOpenRPCDocument());
      const methodObject = getTestOpenRPCDocument().methods[0] as MethodObject;
      expect(methodTypings.getParamsTyping("typescript", methodObject," "))
        .toEqual("jibberNiptip: Niptip");

      expect(methodTypings.getParamsTyping("typescript", methodObject," "))
        .toEqual("jibberNiptip: Niptip");

      expect(methodTypings.getParamsTyping("typescript", methodObject," "))
        .toEqual("jibberNiptip: Niptip");

      expect(methodTypings.getParamsTyping("rust", methodObject, " "))
        .toEqual("jibberNiptip: Niptip");

      expect(methodTypings.getParamsTyping("go", methodObject, " "))
        .toEqual("jibberNiptip Niptip");

      expect(methodTypings.getParamsTyping("python", methodObject, " "))
        .toEqual("");
    });
  });



  describe("getMethodTypings", () => {

    it("returns a MethodTypings object for a method", () => {
      const methodTypings = new MethodTypings(getTestOpenRPCDocument());

      expect(methodTypings.getMethodTypings("typescript"))
        .toEqual([expectedJibberTypescript, expectedNotificationTestTypescript].join("\n"));

      expect(methodTypings.getMethodTypings("rust"))
        .toEqual([expectedJibberRust, expectedNotificationTestRust].join("\n"));

      expect(methodTypings.getMethodTypings("go"))
        .toEqual(expectedJibberGo);

      expect(methodTypings.getMethodTypings("python"))
        .toEqual(""+"\n"+"");
    });

    it("works when there are no params", () => {
      const copytestOpenRPCDocument = getTestOpenRPCDocument();
      (copytestOpenRPCDocument.methods[0] as MethodObject).params = [];
      copytestOpenRPCDocument.methods = [copytestOpenRPCDocument.methods[0]];
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
      })).toBe([expectedJibberTypescript, expectedNotificationTestTypescript].join("\n"));
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
    ).toBe(`extern crate serde;
extern crate serde_json;
extern crate derive_builder;

use serde::{Serialize, Deserialize};
use derive_builder::Builder;
pub type BooleanVyG3AETh = bool;
pub type StringDoaGddGA = String;
/// UnorderedSetOfStringDoaGddGAmrf5BlCm
///
/// array of strings is all...
///
pub type UnorderedSetOfStringDoaGddGAmrf5BlCm = Vec<StringDoaGddGA>;
pub type IntegerXZTmW7Mv = i64;
pub type UnorderedSetOfIntegerXZTmW7MvjsBS3XxD = (IntegerXZTmW7Mv);
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Builder, Default)]
#[builder(setter(strip_option), default)]
#[serde(default)]
pub struct ObjectOfBooleanVyG3AETh5PX0GXMY {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ripslip: Option<BooleanVyG3AETh>,
}
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(untagged)]
pub enum OneOfUnorderedSetOfIntegerXZTmW7MvjsBS3XxDUnorderedSetOfStringDoaGddGAmrf5BlCm9HEAgL2M {
    UnorderedSetOfStringDoaGddGAmrf5BlCm(UnorderedSetOfStringDoaGddGAmrf5BlCm),
    UnorderedSetOfIntegerXZTmW7MvjsBS3XxD(UnorderedSetOfIntegerXZTmW7MvjsBS3XxD),
}
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(untagged)]
pub enum AnyOfStringDoaGddGAStringDoaGddGAObjectOfBooleanVyG3AETh5PX0GXMYOneOfUnorderedSetOfIntegerXZTmW7MvjsBS3XxDUnorderedSetOfStringDoaGddGAmrf5BlCm9HEAgL2MIntegerXZTmW7Mv {
    StringDoaGddGA(StringDoaGddGA),
    ObjectOfBooleanVyG3AETh5PX0GXMY(ObjectOfBooleanVyG3AETh5PX0GXMY),
    OneOfUnorderedSetOfIntegerXZTmW7MvjsBS3XxDUnorderedSetOfStringDoaGddGAmrf5BlCm9HEAgL2M(OneOfUnorderedSetOfIntegerXZTmW7MvjsBS3XxDUnorderedSetOfStringDoaGddGAmrf5BlCm9HEAgL2M),
    IntegerXZTmW7Mv(IntegerXZTmW7Mv),
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
            {
              name: "ripper",
              required: false,
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
export type X = number;
export type Y = string;
export type Z = boolean;
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
export type AnyOfABeeCeeePpSBogg4 = Bee | A | Ceee;
export type OneOfXYZCMfJwVAI = X | Y | Z;
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

  it("works before and after using getTypingNames", () => {
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
              name: "isTrue",
              schema: true,
            }
          ],
          result: {
            name: "isFalse",
            schema: false,
          },
        },
      ],
      openrpc: "1.0.0",
    } as OpenRPC;

    const methodTypings = new MethodTypings(doc);
    const ts = methodTypings.toString("typescript");
    const result = methodTypings.getTypingNames("typescript", doc.methods[0] as MethodObject);
    const rs = methodTypings.toString("rust");
    expect(result.method).toBe("Jobber");
    expect(ts).toBeTruthy();
    expect(rs).toBeTruthy();
  });

  it("boolean schemas", () => {
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
              name: "isTrue",
              schema: true,
            }
          ],
          result: {
            name: "isFalse",
            schema: false,
          },
        },
      ],
      openrpc: "1.0.0",
    } as OpenRPC;

    const methodTypings = new MethodTypings(doc);
    expect(methodTypings.toString("typescript"))
      .toBe([
        "type AlwaysTrue = any;",
        "type AlwaysFalse = any;",
        "/**",
        " *",
        " * Generated! Represents an alias to any of the provided schemas",
        " *",
        " */",
        "export type AnyOfAlwaysTrueAlwaysFalse = AlwaysTrue | AlwaysFalse;",
        "export type Jobber = (isTrue: AlwaysTrue) => Promise<AlwaysFalse>;"
      ].join("\n"));

    expect(methodTypings.toString("rust"))
      .toBe([
        "extern crate serde;",
        "extern crate serde_json;",
        "extern crate derive_builder;",
        "",
        "use serde::{Serialize, Deserialize};",
        "type AlwaysTrue = serde_json::Value;",
        "type AlwaysFalse = serde_json::Value;",
        "#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]",
        "#[serde(untagged)]",
        "pub enum AnyOfAlwaysTrueAlwaysFalse {",
        "    AlwaysTrue(AlwaysTrue),",
        "    AlwaysFalse(AlwaysFalse),",
        "}",
        "pub fn Jobber(&mut self, isTrue: AlwaysTrue) -> RpcRequest<AlwaysFalse>;"
      ].join("\n"));

    expect(methodTypings.toString("python"))
      .toBe([
        "from typing import NewType",
        "from typing import Union",
        "from typing import Any",
        "AlwaysTrue = NewType(\"AlwaysTrue\", Any)",
        "AlwaysFalse = NewType(\"AlwaysFalse\", Any)",
        '"""Generated! Represents an alias to any of the provided schemas',
        '"""',
        "AnyOfAlwaysTrueAlwaysFalse = NewType(\"AnyOfAlwaysTrueAlwaysFalse\", Union[AlwaysTrue, AlwaysFalse])",
        ""
      ].join("\n"));

    expect(methodTypings.toString("go"))
      .toBe([
        "import \"encoding/json\"",
        "import \"errors\"",
        "type AlwaysTrue interface{}",
        "type AlwaysFalse interface{}",
        "// Generated! Represents an alias to any of the provided schemas",
        "type AnyOfAlwaysTrueAlwaysFalse struct {",
        "\tAlwaysTrue  *AlwaysTrue",
        "\tAlwaysFalse *AlwaysFalse",
        "}",
        "func (a *AnyOfAlwaysTrueAlwaysFalse) UnmarshalJSON(bytes []byte) error {",
        "\tvar ok bool",
        "\tvar myAlwaysTrue AlwaysTrue",
        "\tif err := json.Unmarshal(bytes, &myAlwaysTrue); err == nil {",
        "\t\tok = true",
        "\t\ta.AlwaysTrue = &myAlwaysTrue",
        "\t}",
        "\tvar myAlwaysFalse AlwaysFalse",
        "\tif err := json.Unmarshal(bytes, &myAlwaysFalse); err == nil {",
        "\t\tok = true",
        "\t\ta.AlwaysFalse = &myAlwaysFalse",
        "\t}",
        "\tif ok {",
        "\t\treturn nil",
        "\t}",
        "\treturn errors.New(\"failed to unmarshal any of the object properties\")",
        "}",
        "func (o AnyOfAlwaysTrueAlwaysFalse) MarshalJSON() ([]byte, error) {",
        "\tout := []interface{}{}",
        "\tif o.AlwaysTrue != nil {",
        "\t\tout = append(out, o.AlwaysTrue)",
        "\t}",
        "\tif o.AlwaysFalse != nil {",
        "\t\tout = append(out, o.AlwaysFalse)",
        "\t}",
        "\treturn json.Marshal(out)",
        "}",
        "type Abc interface {",
        "\tJobber(isTrue AlwaysTrue) (AlwaysFalse, error)",
        "}",
      ].join("\n"));
  });

  it("works for the links example", async () => {
    const d = await dereferenceDocument(examples.links, defaultReferenceResolver);
    const methodTypings = new MethodTypings(d);
    expect(methodTypings).toBeDefined();
  });
});
