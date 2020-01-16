import { JSONSchema, MethodObject, OpenrpcDocument as OpenRPC, ContentDescriptorObject } from "@open-rpc/meta-schema";

const flatten = (arr: JSONSchema[]): JSONSchema[] => {
  return arr.reduce((memo: JSONSchema[], val) => {
    if (val instanceof Array) {
      return [...memo, ...val];
    } else {
      memo.push(val);
      return memo;
    }
  }, []);
};

export const getSchemasForOpenRPCDocument = (openrpcDocument: OpenRPC): JSONSchema[] => {
  const { methods } = openrpcDocument;

  const params = flatten(methods.map((method: MethodObject) => method.params as ContentDescriptorObject[]));
  const result = methods.map((method: MethodObject) => method.result as ContentDescriptorObject);

  return flatten(params.concat(result).map(({ schema }) => schema));
};
