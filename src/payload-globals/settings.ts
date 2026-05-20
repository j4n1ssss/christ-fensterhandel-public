import type { GlobalConfig } from "payload";

export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Einstellungen",
  admin: {
    group: "System",
    hidden: true,
  },
  access: {
    read: ({ req }) =>
      ["admin", "mitarbeiter", "viewer"].includes(req.user?.rolle || ""),
    update: ({ req }) => req.user?.rolle === "admin",
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        data.zuletzt_aktualisiert_am = new Date().toISOString();
        data.zuletzt_aktualisiert_von = req.user?.id;
        return data;
      },
    ],
  },
  fields: [
    // --- Firmendaten ---
    {
      name: "firmenname",
      type: "text",
      label: "Firmenname",
    },
    {
      name: "adresse_strasse",
      type: "text",
      label: "Strasse",
    },
    {
      name: "adresse_hausnummer",
      type: "text",
      label: "Hausnummer",
    },
    {
      name: "adresse_plz",
      type: "text",
      label: "PLZ",
    },
    {
      name: "adresse_ort",
      type: "text",
      label: "Ort",
    },
    {
      name: "telefon",
      type: "text",
      label: "Telefon",
    },
    {
      name: "email",
      type: "email",
      label: "E-Mail",
    },
    {
      name: "steuernummer",
      type: "text",
      label: "Steuernummer",
    },
    {
      name: "ust_id",
      type: "text",
      label: "USt-IdNr.",
    },
    {
      name: "bank_iban",
      type: "text",
      label: "IBAN",
    },
    {
      name: "bank_bic",
      type: "text",
      label: "BIC",
    },
    {
      name: "bank_name",
      type: "text",
      label: "Bank-Name",
    },

    // --- Steuer ---
    {
      name: "mwst_satz",
      type: "number",
      label: "MwSt-Satz (%)",
      defaultValue: 19,
      required: true,
    },
    {
      name: "preisanzeige",
      type: "select",
      label: "Preisanzeige",
      defaultValue: "brutto",
      options: [
        { label: "Brutto (inkl. MwSt)", value: "brutto" },
        { label: "Netto (zzgl. MwSt)", value: "netto" },
      ],
    },

    // --- Stripe ---
    {
      name: "stripe_zahlungslink_ablauf_stunden",
      type: "number",
      label: "Zahlungslink-Ablaufzeit (Stunden)",
      defaultValue: 24,
    },
    {
      name: "stripe_waehrung",
      type: "select",
      label: "Waehrung",
      defaultValue: "eur",
      options: [
        { label: "EUR", value: "eur" },
        { label: "USD", value: "usd" },
        { label: "PYG", value: "pyg" },
      ],
    },

    // --- Dokumente ---
    {
      name: "angebots_gueltigkeit_tage",
      type: "number",
      label: "Angebots-Gueltigkeit (Tage)",
      defaultValue: 30,
    },
    {
      name: "widerrufsbelehrung",
      type: "textarea",
      label: "Widerrufsbelehrung",
    },
    {
      name: "agb_link",
      type: "text",
      label: "AGB-Link",
    },
    {
      name: "agb_pdf",
      type: "upload",
      relationTo: "media",
      label: "AGB als PDF",
    },
    {
      name: "pdf_logo",
      type: "upload",
      relationTo: "media",
      label: "Logo fuer PDFs",
    },

    // --- E-Mail (vorbereitet fuer Phase 25) ---
    {
      name: "email_absender_name",
      type: "text",
      label: "E-Mail Absender-Name",
    },
    {
      name: "email_reply_to",
      type: "email",
      label: "Reply-To Adresse",
    },
    {
      name: "email_signatur",
      type: "textarea",
      label: "E-Mail-Signatur",
    },
    {
      name: "benachrichtigungs_emails",
      type: "textarea",
      label: "Benachrichtigungs-E-Mails (Mitarbeiter)",
      admin: {
        description:
          "Komma-getrennte E-Mail-Adressen fuer Mitarbeiter-Benachrichtigungen",
      },
    },
    {
      name: "email_event_toggles",
      type: "json",
      label: "E-Mail Event-Toggles",
      admin: {
        description: "Pro Event+Empfaenger aktivieren/deaktivieren (JSON)",
      },
    },

    // --- Meta ---
    {
      name: "zuletzt_aktualisiert_am",
      type: "date",
      label: "Zuletzt aktualisiert am",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "zuletzt_aktualisiert_von",
      type: "relationship",
      relationTo: "users",
      label: "Zuletzt aktualisiert von",
      admin: {
        readOnly: true,
      },
    },
  ],
};
