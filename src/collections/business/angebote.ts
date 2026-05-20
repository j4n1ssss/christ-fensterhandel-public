import type { CollectionConfig } from "payload";
import { APIError } from "payload";

export const Angebote: CollectionConfig = {
  slug: "angebote",
  labels: { singular: "Angebot", plural: "Angebote" },
  admin: {
    group: "Business",
    useAsTitle: "nummer",
    defaultColumns: [
      "nummer",
      "version",
      "anfrage",
      "betrag_brutto_cents",
      "status",
      "gueltig_bis",
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
    update: ({ req }) =>
      (req.user as { rolle?: string })?.rolle === "admin" || !req.user, // Only entwurf updates allowed (guarded by hook)
    delete: () => false, // Angebote should not be deleted
  },
  hooks: {
    beforeChange: [
      ({ operation, originalDoc }) => {
        if (operation === "update" && originalDoc?.status !== "entwurf") {
          throw new APIError(
            "Versendete Angebote sind unveraenderbar. Erstellen Sie ein neues Angebot mit hoeherer Versionsnummer.",
            403,
          );
        }
      },
    ],
  },
  fields: [
    {
      name: "nummer",
      type: "text",
      required: true,
      unique: true,
      label: "Angebotsnummer",
      admin: { description: "ANG-YYYY-NNNN" },
    },
    {
      name: "version",
      type: "number",
      required: true,
      defaultValue: 1,
      label: "Version",
      admin: { description: "Versionsnummer (1, 2, 3...)" },
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
      name: "status",
      type: "select",
      required: true,
      defaultValue: "entwurf",
      options: [
        { label: "Entwurf", value: "entwurf" },
        { label: "Versendet", value: "versendet" },
      ],
    },
    {
      name: "gueltig_bis",
      type: "date",
      label: "Gueltig bis",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    {
      name: "freitext",
      type: "textarea",
      label: "Freitext / Anmerkungen",
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
    {
      name: "preisanpassung_begruendung",
      type: "textarea",
      label: "Begruendung fuer Preisanpassung",
      admin: {
        description: "Pflicht wenn Preis vom berechneten Wert abweicht",
      },
    },
    {
      name: "preisanpassung_positionen",
      type: "json",
      label: "Angepasste Einzelpreise (JSON)",
      admin: {
        description:
          "Array mit { positionsIndex, bruttoCents } fuer individuell angepasste Positionen",
      },
    },
    {
      name: "rabatt_cents",
      type: "number",
      label: "Pauschaler Rabatt (Cent)",
      admin: {
        description:
          "Differenz wenn Gesamtpreis manuell unter Einzelpreis-Summe gesetzt wurde",
      },
    },
  ],
};
