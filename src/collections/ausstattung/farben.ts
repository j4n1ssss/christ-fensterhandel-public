import type { CollectionConfig } from "payload";
import { isAdmin } from "@/access/is-admin";

export const Farben: CollectionConfig = {
  slug: "farben",
  labels: {
    singular: "Farbe",
    plural: "Farben",
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
      name: "kategorie",
      type: "select",
      label: "Kategorie",
      required: true,
      options: [
        { label: "Standard", value: "standard" },
        { label: "Dekor", value: "dekor" },
        { label: "Uni-Farben", value: "uni" },
        { label: "RAL-Sonderfarbe", value: "ral_sonderfarbe" },
      ],
    },
    {
      name: "ral_code",
      type: "text",
      label: "RAL-Code",
    },
    {
      name: "farb_code",
      type: "text",
      label: "Farbcode (HEX)",
    },
    {
      name: "bild",
      type: "upload",
      label: "Vorschaubild",
      relationTo: "media",
    },
    {
      name: "fuer_aussen",
      type: "checkbox",
      label: "Für Außen",
      defaultValue: true,
    },
    {
      name: "fuer_innen",
      type: "checkbox",
      label: "Für Innen",
      defaultValue: true,
    },
    {
      name: "erlaubte_materialien",
      type: "relationship",
      label: "Erlaubte Materialien",
      relationTo: "materialien",
      hasMany: true,
    },
    {
      name: "aufpreis",
      type: "number",
      label: "Standard-Aufpreis (EUR)",
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
