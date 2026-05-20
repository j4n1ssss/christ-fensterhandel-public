import type { CollectionConfig } from "payload";
import { isAdmin } from "@/access/is-admin";

export const Fensterformen: CollectionConfig = {
  slug: "fensterformen",
  labels: {
    singular: "Fensterform",
    plural: "Fensterformen",
  },
  typescript: {
    interface: "Fensterform",
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
      name: "beschreibung",
      type: "textarea",
      label: "Beschreibung",
    },
    {
      name: "bild",
      type: "upload",
      label: "Bild",
      relationTo: "media",
    },
    {
      name: "erlaubte_fluegelanzahl",
      type: "relationship",
      label: "Erlaubte Flügelanzahl",
      relationTo: "fluegelanzahl",
      hasMany: true,
    },
    {
      name: "erlaubte_oeffnungsarten",
      type: "relationship",
      label: "Erlaubte Öffnungsarten",
      relationTo: "oeffnungsarten",
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
