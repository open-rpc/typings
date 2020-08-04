import { deepClone, flatten, getSchemasForOpenRPCDocument } from "./utils";

describe("utils", () => {
  describe("deepClone", () => {
    it("basic", () => {
      expect(deepClone(true)).toBe(true);
      expect(deepClone(false)).toBe(false);
      const t1 = {};
      expect(deepClone(t1)).toEqual({});
      expect(deepClone(t1)).not.toBe(t1);
    });

    it("nested obj", () => {
      const b = {};
      const a = { b };
      const t2 = { a };
      expect(deepClone(t2)).not.toBe(t2);
      expect(deepClone(t2).a).not.toBe(a);
      expect(deepClone(t2).a.b).not.toBe(b);
      expect(deepClone(t2)).toEqual(t2);
    });

    it("cycles", () => {
      const t2 = { a: {} };
      t2.a = t2;
      expect(deepClone(t2)).not.toBe(t2);
      expect(deepClone(t2).a).not.toBe(t2);
      expect(deepClone(t2).a).not.toBe(t2.a);
    });

    it("dates and regex sets maps", () => {
      const a = new Set();
      const b = new Map();
      const c = new Date();
      const d = new RegExp("");
      class Foobar {
        public foo: number;
        constructor(abc: number) {
          this.foo = abc;
        }
      }
      const e = new Foobar(123);

      const t3 = { a, b, c, d, e };

      expect(deepClone(t3)).toEqual(t3);

      expect(deepClone(t3).a).toEqual(a);
      expect(deepClone(t3).a).not.toBe(a);

      expect(deepClone(t3).b).toEqual(b);
      expect(deepClone(t3).b).not.toBe(b);

      expect(deepClone(t3).c).toEqual(c);
      expect(deepClone(t3).c).not.toBe(c);

      expect(deepClone(t3).d).toEqual(d);
      expect(deepClone(t3).d).not.toBe(d);

      expect(deepClone(t3).e).toEqual(e);
      expect(deepClone(t3).e).not.toBe(e);
    });

    it("works with undef and nulls", () => {
      const t4 = { g: undefined, f: null };
      expect(deepClone(t4)).toEqual(t4);
    });

    it("works with array", () => {
      class CustomThing { }
      const a = [
        { a: 123 },
        "foo",
        new Set(),
        new Map(),
        [{ b: 123 }, new CustomThing()]
      ] as any;
      const b = deepClone(a);
      expect(b).not.toBe(a);
      expect(b).toEqual(a);
      expect(b[0]).not.toBe(a[0]);
      expect(b[0]).toEqual(a[0]);
      expect(b[4][1]).toEqual(a[4][1]);
    });
  });

  describe("flatten", () => {
    it("works", () => {
      expect(flatten([1, [2], [3]])).toEqual([1, 2, 3]);
    });
  });
});
