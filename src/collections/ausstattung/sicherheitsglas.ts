import type { CollectionConfig } from "payload";
import { isAdmin } from "@/access/is-admin";

export const Sicherheitsglas: CollectionConfig = {
  slug: "sicherheitsglas",
  labels: {
    singular: "Sicherheitsglas",
    plural: "Sicherheitsglas",
  },
  typescript: {
    interface: "Sicherheitsglas",
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
      name: "typ",
      type: "select",
      label: "Typ",
      options: [
        { label: "VSG Außen", value: "vsg_aussen" },
        { label: "VSG Innen", value: "vsg_innen" },
        { label: "VSG Beidseitig", value: "vsg_beidseitig" },
      ],
    },
    {
      name: "aufpreis",
      type: "number",
      label: "Aufpreis (EUR/m2)",
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
