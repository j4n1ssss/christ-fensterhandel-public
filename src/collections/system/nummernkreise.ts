import type { CollectionConfig } from "payload";

export const Nummernkreise: CollectionConfig = {
  slug: "nummernkreise",
  labels: { singular: "Nummernkreis", plural: "Nummernkreise" },
  admin: {
    group: "System",
    useAsTitle: "prefix",
  },
  access: {
    read: ({ req }) => req.user?.rolle === "admin",
    create: ({ req }) => req.user?.rolle === "admin",
    update: ({ req }) => req.user?.rolle === "admin",
    delete: () => false, // Never delete counters
  },
  fields: [
    {
      name: "typ",
      type: "select",
      required: true,
      options: [
        { label: "Angebot", value: "ANG" },
        { label: "Rechnung", value: "RE" },
        { label: "Gutschrift", value: "GS" },
      ],
    },
    { name: "jahr", type: "number", required: true },
    { name: "letzte_nummer", type: "number", required: true, defaultValue: 0 },
    { name: "prefix", type: "text", required: true }, // e.g. "ANG-2026-"
  ],
};
