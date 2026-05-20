import type { CollectionConfig } from "payload";
import { isAdmin } from "@/access/is-admin";

export const Fluegelanzahl: CollectionConfig = {
  slug: "fluegelanzahl",
  labels: {
    singular: "Flügelanzahl",
    plural: "Flügelanzahl",
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    group: "Produkte",
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Name",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "anzahl",
      type: "number",
      label: "Anzahl Flügel",
      required: true,
    },
    {
      name: "fuer_produkttypen",
      type: "relationship",
      label: "Für Produkttypen",
      relationTo: "produkttypen",
      hasMany: true,
    },
    {
      name: "aktiv",
      type: "checkbox",
      label: "Aktiv",
      defaultValue: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Sortierung",
      defaultValue: 0,
      admin: {
        position: "sidebar",
      },
    },
  ],
};
