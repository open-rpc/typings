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
const expectedTypescript = [
  expectedNipTipTypescript,
  expectedRipSlipTypescript,
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
const expectedRust = expectedRipSlipRust;

describe("MethodTypings", () => {

  it("can be constructed", () => {
    expect(new MethodTypings(testOpenRPCDocument)).toBeInstanceOf(MethodTypings);
  });

  it("can generate typings map", async () => {
    const methodTypings = new MethodTypings(testOpenRPCDocument);

    await methodTypings.generateTypings();

    expect(methodTypings).toBeInstanceOf(MethodTypings);
  });

  describe("getTypeDefinitionsForMethod", () => {

    it("throws if types not generated yet", () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      expect(() => methodTypings.getTypeDefinitionsForMethod(testOpenRPCDocument.methods[0], "typescript")).toThrow();
    });

    describe("typscript", () => {

      it("returns a string of typings for a method", async () => {
        const methodTypings = new MethodTypings(testOpenRPCDocument);
        await methodTypings.generateTypings();

        expect(methodTypings.getTypeDefinitionsForMethod(testOpenRPCDocument.methods[0], "typescript"))
          .toBe(expectedTypescript);
      });

    });

    describe("rust", () => {

      it("returns a string of typings where the typeNames are unique", async () => {
        const methodTypings = new MethodTypings(testOpenRPCDocument);
        await methodTypings.generateTypings();

        expect(methodTypings.getTypeDefinitionsForMethod(testOpenRPCDocument.methods[0], "rust")).toBe(expectedRust);
      });

    });

  });

  describe("getTypingsForMethod", () => {

    it("throws if types not generated yet", () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      expect(() => methodTypings.getTypingsForMethod(testOpenRPCDocument.methods[0], "typescript")).toThrow();
    });

    describe("typscript", () => {

      it("returns a string of typings for a method", async () => {
        const methodTypings = new MethodTypings(testOpenRPCDocument);
        await methodTypings.generateTypings();

        expect(methodTypings.getTypingsForMethod(testOpenRPCDocument.methods[0], "typescript")).toEqual({
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
      });

    });

    describe("rust", () => {

      it("returns a string of typings where the typeNames are unique", async () => {
        const methodTypings = new MethodTypings(testOpenRPCDocument);
        await methodTypings.generateTypings();

        expect(methodTypings.getTypingsForMethod(testOpenRPCDocument.methods[0], "rust")).toEqual({
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

  });

  describe("getAllUniqueTypings", () => {

    it("throws if types not generated yet", () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      expect(() => methodTypings.getAllUniqueTypings("typescript")).toThrow();
    });

    describe("typscript", () => {

      it("returns a string of typings where the typeNames are unique", async () => {
        const methodTypings = new MethodTypings(testOpenRPCDocument);
        await methodTypings.generateTypings();

        expect(methodTypings.getAllUniqueTypings("typescript")).toBe(expectedTypescript);
      });

    });

    describe("rust", () => {

      it("returns a string of typings where the typeNames are unique", async () => {
        const methodTypings = new MethodTypings(testOpenRPCDocument);
        await methodTypings.generateTypings();

        expect(methodTypings.getAllUniqueTypings("rust")).toBe(expectedRust);
      });

    });
  });

  describe("getFunctionSignature", () => {

    it("throws if types not generated yet", async () => {
      const methodTypings = new MethodTypings(testOpenRPCDocument);
      expect(() => methodTypings.getFunctionSignature(testOpenRPCDocument.methods[0], "typescript")).toThrow();
    });

    describe("typescript", () => {

      it("returns the function signature for a method", async () => {
        const methodTypings = new MethodTypings(testOpenRPCDocument);
        await methodTypings.generateTypings();

        expect(methodTypings.getFunctionSignature(testOpenRPCDocument.methods[0], "typescript"))
          .toBe("public jibber(niptip: TNiptip) : Promise<IRipslip>");
      });

      it("works when there are no params", async () => {
        const copytestOpenRPCDocument = cloneDeep(testOpenRPCDocument);
        copytestOpenRPCDocument.methods[0].params = [];
        const methodTypings = new MethodTypings(copytestOpenRPCDocument);
        await methodTypings.generateTypings();

        expect(methodTypings.getFunctionSignature(copytestOpenRPCDocument.methods[0], "typescript"))
          .toBe("public jibber() : Promise<IRipslip>");
      });

    });

    describe("rust", () => {

      it("returns the function signature for a method", async () => {
        const methodTypings = new MethodTypings(testOpenRPCDocument);
        await methodTypings.generateTypings();

        expect(methodTypings.getFunctionSignature(testOpenRPCDocument.methods[0], "rust"))
          .toBe("pub fn jibber(&mut self, niptip: Niptip) -> RpcRequest<Ripslip>;");
      });

      it("works when there are no params", async () => {
        const copytestOpenRPCDocument = cloneDeep(testOpenRPCDocument);
        copytestOpenRPCDocument.methods[0].params = [];

        const methodTypings = new MethodTypings(copytestOpenRPCDocument);
        await methodTypings.generateTypings();

        expect(methodTypings.getFunctionSignature(copytestOpenRPCDocument.methods[0], "rust"))
          .toBe("pub fn jibber(&mut self) -> RpcRequest<Ripslip>;");
      });

    });
  });
});
