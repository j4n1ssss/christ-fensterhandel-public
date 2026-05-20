import type { CollectionConfig } from "payload";
import { isAdmin } from "@/access/is-admin";
import { isAdminOrMitarbeiter } from "@/access/is-admin-or-mitarbeiter";

export const EditHistory: CollectionConfig = {
  slug: "edit_history",
  labels: {
    singular: "History-Eintrag",
    plural: "Edit-History",
  },
  admin: {
    group: "System",
    useAsTitle: "event",
    defaultColumns: ["collection", "doc_id", "event", "editor", "timestamp"],
  },
  access: {
    create: () => false,
    read: isAdminOrMitarbeiter,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: "collection",
      type: "text",
      required: true,
      label: "Collection",
    },
    {
      name: "doc_id",
      type: "text",
      required: true,
      label: "Dokument-ID",
    },
    {
      name: "event",
      type: "text",
      required: true,
      label: "Event",
    },
    {
      name: "diff",
      type: "json",
      label: "Änderungen",
    },
    {
      name: "editor",
      type: "relationship",
      relationTo: "users",
      label: "Bearbeiter",
    },
    {
      name: "timestamp",
      type: "date",
      required: true,
      label: "Zeitpunkt",
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
  ],
};
