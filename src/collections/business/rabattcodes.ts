import type { CollectionConfig } from "payload";
import { isAdmin } from "@/access/is-admin";
import { isAdminOrMitarbeiter } from "@/access/is-admin-or-mitarbeiter";

export const Rabattcodes: CollectionConfig = {
  slug: "rabattcodes",
  labels: {
    singular: "Rabattcode",
    plural: "Rabattcodes",
  },
  access: {
    read: isAdminOrMitarbeiter,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    group: "Business",
    useAsTitle: "code",
  },
  fields: [
    {
      name: "code",
      type: "text",
      label: "Code",
      required: true,
      unique: true,
    },
    {
      name: "beschreibung",
      type: "textarea",
      label: "Beschreibung",
    },
    {
      name: "typ",
      type: "select",
      label: "Rabatt-Typ",
      required: true,
      options: [
        { label: "Prozent-Rabatt", value: "prozent" },
        { label: "Festbetrag-Rabatt", value: "festbetrag" },
      ],
    },
    {
      name: "wert",
      type: "number",
      label: "Wert",
      required: true,
    },
    {
      name: "min_bestellwert",
      type: "number",
      label: "Mindest-Bestellwert (EUR)",
    },
    {
      name: "gueltig_von",
      type: "date",
      label: "Gültig von",
    },
    {
      name: "gueltig_bis",
      type: "date",
      label: "Gültig bis",
    },
    {
      name: "max_nutzungen",
      type: "number",
      label: "Max. Nutzungen",
    },
    {
      name: "aktuelle_nutzungen",
      type: "number",
      label: "Aktuelle Nutzungen",
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
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
  ],
};
