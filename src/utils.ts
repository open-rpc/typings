import { Schema, MethodObject, OpenRPC, ContentDescriptorObject } from "@open-rpc/meta-schema";

const flatten = (arr: Schema[]): Schema[] => {
  return arr.reduce((memo: Schema[], val) => {
    if (val instanceof Array) {
      return [...memo, ...val];
    } else {
      memo.push(val);
      return memo;
    }
  }, []);
};

export const getSchemasForOpenRPCDocument = (openrpcDocument: OpenRPC): Schema[] => {
  const { methods } = openrpcDocument;

  const params = flatten(methods.map((method) => method.params as ContentDescriptorObject[]));
  const result = methods.map((method) => method.result as ContentDescriptorObject);

  return flatten(params.concat(result).map(({ schema }) => schema));
};
