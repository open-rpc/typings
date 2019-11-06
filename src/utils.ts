import { Schema, MethodObject, OpenRPC, ContentDescriptorObject } from "@open-rpc/meta-schema";
import _ from "lodash";
import { GetSchemaTypeName } from "./generator-interface";
import { languageSafeName } from "@etclabscore/json-schema-to-types/build/utils";

export const getSchemasForOpenRPCDocument = (openrpcDocument: OpenRPC): Schema[] => {
  const { methods } = openrpcDocument;

  const params = _.flatMap(methods, (method) => method.params as ContentDescriptorObject[]);
  const result = _.map(methods, (method) => method.result as ContentDescriptorObject);

  return _.chain(params.concat(result))
    .map("schema")
    .flatten()
    .value();
};
