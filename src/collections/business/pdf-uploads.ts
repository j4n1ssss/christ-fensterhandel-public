import type { CollectionConfig } from "payload";

export const PDFUploads: CollectionConfig = {
  slug: "pdf_uploads",
  labels: { singular: "PDF-Dokument", plural: "PDF-Dokumente" },
  admin: {
    group: "System",
  },
  access: {
    read: ({ req }) => {
      const rolle = (req.user as { rolle?: string })?.rolle;
      if (["admin", "mitarbeiter"].includes(rolle || "")) return true;
      return false;
    },
    create: () => true, // Server-side creation has no user context
    update: () => false, // Immutable -- PDFs must not be modified
    delete: ({ req }) => (req.user as { rolle?: string })?.rolle === "admin",
  },
  upload: {
    mimeTypes: ["application/pdf"],
    staticDir: "pdf-uploads",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Dateiname",
    },
  ],
};
