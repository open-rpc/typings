import { OpenrpcDocument as OpenRPC } from "@open-rpc/meta-schema";

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
      },
    },
  ],
  openrpc: "1.0.0",
} as OpenRPC;

export default testOpenRPCDocument;
