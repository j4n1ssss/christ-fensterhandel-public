import type { CollectionConfig } from "payload";

export const EmailQueue: CollectionConfig = {
  slug: "email_queue",
  labels: { singular: "E-Mail Queue", plural: "E-Mail Queue" },
  admin: {
    group: "System",
    useAsTitle: "event_type",
    defaultColumns: ["event_type", "to", "status", "attempts", "createdAt"],
  },
  access: {
    read: ({ req }) => req.user?.rolle === "admin",
    create: () => true, // Server-side queuing (no auth context)
    update: ({ req }) => req.user?.rolle === "admin",
    delete: ({ req }) => req.user?.rolle === "admin",
  },
  fields: [
    {
      name: "event_type",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "to",
      type: "text",
      required: true,
    },
    {
      name: "subject",
      type: "text",
      required: true,
    },
    {
      name: "html",
      type: "textarea",
      required: true,
      admin: {
        condition: () => false, // Hide from list -- very large
      },
    },
    {
      name: "plain_text",
      type: "textarea",
      admin: {
        condition: () => false, // Hide from list -- very large
      },
    },
    {
      name: "reply_to",
      type: "text",
    },
    {
      name: "payload_data",
      type: "json",
      label: "Event-Daten (Debug)",
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Ausstehend", value: "pending" },
        { label: "In Verarbeitung", value: "processing" },
        { label: "Gesendet", value: "sent" },
        { label: "Fehlgeschlagen", value: "failed" },
        { label: "Abgebrochen", value: "dead" },
        { label: "Uebersprungen", value: "skipped" },
      ],
      index: true,
    },
    {
      name: "attempts",
      type: "number",
      defaultValue: 0,
    },
    {
      name: "max_attempts",
      type: "number",
      defaultValue: 5,
    },
    {
      name: "next_retry_at",
      type: "date",
    },
    {
      name: "idempotency_key",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "error_log",
      type: "textarea",
    },
    {
      name: "anfrage",
      type: "relationship",
      relationTo: "anfragen",
      index: true,
      admin: {
        description: "Zugehoerige Anfrage (fuer Tab-Filterung)",
      },
    },
    {
      name: "sent_by",
      type: "relationship",
      relationTo: "users",
      admin: {
        description: "Manuell gesendet von (null bei automatischen)",
      },
    },
  ],
};
