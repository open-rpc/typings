import { getMethodAliasName } from "./python";

describe("python", () => {
  describe("getMethodAliasName", () => {
    it("works", () => {
      getMethodAliasName({ name: "foo bar baz", params: [], result: { name: "foo", schema: true } });
    });
  });
});
