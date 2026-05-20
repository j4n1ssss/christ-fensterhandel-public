import type { CollectionConfig } from "payload";
import { APIError } from "payload";

export const Rechnungen: CollectionConfig = {
  slug: "rechnungen",
  labels: { singular: "Rechnung", plural: "Rechnungen" },
  admin: {
    group: "Business",
    useAsTitle: "nummer",
    defaultColumns: [
      "nummer",
      "typ",
      "anfrage",
      "betrag_brutto_cents",
      "createdAt",
    ],
  },
  access: {
    read: ({ req }) => {
      const rolle = (req.user as { rolle?: string })?.rolle;
      return ["admin", "mitarbeiter"].includes(rolle || "");
    },
    create: ({ req }) =>
      (req.user as { rolle?: string })?.rolle === "admin" || !req.user, // admin or server-side
    update: () => false, // Immutable -- Archivierungspflicht
    delete: () => false, // Immutable -- Archivierungspflicht
  },
  hooks: {
    beforeChange: [
      ({ operation }) => {
        if (operation === "update") {
          throw new APIError(
            "Rechnungen und Gutschriften sind unveraenderbar (Archivierungspflicht).",
            403,
          );
        }
      },
    ],
  },
  fields: [
    {
      name: "typ",
      type: "select",
      required: true,
      options: [
        { label: "Rechnung", value: "rechnung" },
        { label: "Gutschrift", value: "gutschrift" },
      ],
    },
    {
      name: "nummer",
      type: "text",
      required: true,
      unique: true,
      label: "Dokumentnummer",
      admin: { description: "RE-YYYY-NNNN oder GS-YYYY-NNNN" },
    },
    {
      name: "anfrage",
      type: "relationship",
      relationTo: "anfragen",
      required: true,
      label: "Anfrage",
    },
    {
      name: "anfrage_nummer",
      type: "text",
      required: true,
      label: "Anfragenummer",
    },
    {
      name: "pdf",
      type: "relationship",
      relationTo: "pdf_uploads",
      required: true,
      label: "PDF-Datei",
    },
    {
      name: "betrag_netto_cents",
      type: "number",
      required: true,
      label: "Nettobetrag (Cent)",
    },
    {
      name: "betrag_brutto_cents",
      type: "number",
      required: true,
      label: "Bruttobetrag (Cent)",
    },
    {
      name: "mwst_cents",
      type: "number",
      required: true,
      label: "MwSt-Betrag (Cent)",
    },
    {
      name: "mwst_satz",
      type: "number",
      required: true,
      label: "MwSt-Satz (%)",
    },
    // Gutschrift-specific: reference to original invoice
    {
      name: "original_rechnung",
      type: "relationship",
      relationTo: "rechnungen",
      label: "Original-Rechnung (bei Gutschrift)",
      admin: {
        condition: (data) => data?.typ === "gutschrift",
      },
    },
    {
      name: "original_rechnung_nummer",
      type: "text",
      label: "Original-Rechnungsnummer",
      admin: {
        condition: (data) => data?.typ === "gutschrift",
      },
    },
    {
      name: "original_rechnung_datum",
      type: "text",
      label: "Original-Rechnungsdatum",
      admin: {
        condition: (data) => data?.typ === "gutschrift",
      },
    },
  ],
};
