import type { CollectionConfig } from "payload";

export const Reklamationen: CollectionConfig = {
  slug: "reklamationen",
  labels: { singular: "Reklamation", plural: "Reklamationen" },
  admin: {
    group: "Business",
    useAsTitle: "id",
    defaultColumns: ["anfrage", "status", "createdAt"],
  },
  access: {
    // API routes handle auth via Local API (bypasses access)
    // Direct Payload admin access: admin + mitarbeiter only
    create: ({ req }) => {
      if (!req.user) return true; // Allow Local API (no user context = server-side)
      return req.user.rolle === "admin" || req.user.rolle === "mitarbeiter";
    },
    read: ({ req }) => {
      if (!req.user) return false;
      return req.user.rolle === "admin" || req.user.rolle === "mitarbeiter";
    },
    update: ({ req }) => {
      if (!req.user) return false;
      return req.user.rolle === "admin" || req.user.rolle === "mitarbeiter";
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      return req.user.rolle === "admin";
    },
  },
  fields: [
    {
      name: "anfrage",
      type: "relationship",
      relationTo: "anfragen",
      required: true,
      label: "Anfrage",
    },
    {
      name: "beschreibung",
      type: "textarea",
      required: true,
      label: "Beschreibung",
      minLength: 20,
    },
    {
      name: "fotos",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: "Fotos",
      admin: {
        description: "Max. 5 Dateien, max. 10 MB pro Datei",
      },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "offen",
      required: true,
      label: "Status",
      options: [
        { label: "Offen", value: "offen" },
        { label: "In Bearbeitung", value: "in_bearbeitung" },
        { label: "Geloest", value: "geloest" },
      ],
    },
    {
      name: "loesung",
      type: "textarea",
      label: "Loesung/Massnahme",
      admin: {
        description: "Nur fuer Admin/Mitarbeiter -- Loesung beschreiben",
      },
    },
    {
      name: "erstellt_von",
      type: "relationship",
      relationTo: "users",
      label: "Erstellt von",
    },
  ],
};
