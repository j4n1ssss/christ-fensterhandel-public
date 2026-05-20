import type { CollectionConfig } from "payload";
import { isAdminOrMitarbeiter } from "@/access/is-admin-or-mitarbeiter";

export const StatusHistorie: CollectionConfig = {
  slug: "status_historie",
  labels: {
    singular: "Status-Änderung",
    plural: "Status-Historie",
  },
  admin: {
    group: "Business",
    defaultColumns: ["anfrage", "von_status", "zu_status", "zeitpunkt"],
  },
  access: {
    create: isAdminOrMitarbeiter,
    read: isAdminOrMitarbeiter,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: "anfrage",
      type: "relationship",
      label: "Anfrage",
      relationTo: "anfragen",
      required: true,
    },
    {
      name: "von_status",
      type: "text",
      label: "Von Status",
      required: true,
    },
    {
      name: "zu_status",
      type: "text",
      label: "Zu Status",
      required: true,
    },
    {
      name: "geaendert_von",
      type: "relationship",
      label: "Geändert von",
      relationTo: "users",
    },
    {
      name: "zeitpunkt",
      type: "date",
      label: "Zeitpunkt",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "kommentar",
      type: "textarea",
      label: "Kommentar",
    },
    {
      name: "anhaenge",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: "Anhaenge",
      admin: {
        description: "Optionale Datei-Anhaenge (z.B. Kundenantwort-Dateien)",
      },
    },
  ],
};
