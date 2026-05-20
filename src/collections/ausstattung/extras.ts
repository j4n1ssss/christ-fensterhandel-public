import type { CollectionConfig } from "payload";
import { isAdmin } from "@/access/is-admin";

export const Extras: CollectionConfig = {
  slug: "extras",
  labels: {
    singular: "Extra",
    plural: "Extras",
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    group: "Ausstattung",
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
      name: "kategorie",
      type: "select",
      label: "Kategorie",
      options: [
        { label: "Griffe", value: "griffe" },
        { label: "Beschläge", value: "beschlaege" },
        { label: "Sonstiges", value: "sonstiges" },
      ],
    },
    {
      name: "aufpreis",
      type: "number",
      label: "Aufpreis (EUR)",
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
