import { JSONSchema, OpenrpcDocument, ContentDescriptorObject } from "@open-rpc/meta-schema";

export const flatten = (arr: any[]): any[] => {
  return arr.reduce((memo: JSONSchema[], val) => {
    if (val instanceof Array) {
      return [...memo, ...val];
    } else {
      memo.push(val);
      return memo;
    }
  }, []);
};

export const getSchemasForOpenRPCDocument = (openrpcDocument: OpenrpcDocument): JSONSchema[] => {
  const { methods } = openrpcDocument;

  const params = flatten(methods.map((method) => method.params));
  const result = methods.map((method) => method.result);

  return params
    .concat(result)
    .map(({ schema }) => schema);
};

export const deepClone = (obj: any, hash = new WeakMap()): any => {
  if (Object(obj) !== obj) return obj;
  if (hash.has(obj)) return hash.get(obj);

  let result = Object(null);

  if (obj instanceof Array) { result = obj.map((o) => deepClone(o, hash)); }
  else if (obj instanceof Set) { result = new Set(obj); }
  else if (obj instanceof Map) { result = new Map(Array.from(obj, ([key, val]) => [key, deepClone(val, hash)])); }
  else if (obj instanceof Date) { result = new Date(obj); }
  else if (obj instanceof RegExp) { result = new RegExp(obj.source, obj.flags); }
  else if (obj.constructor) { result = new obj.constructor(); }

  hash.set(obj, result);
  return Object.assign(result, ...Object.keys(obj).map(key => ({ [key]: deepClone(obj[key], hash) })));
}
