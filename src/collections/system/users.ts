import type { CollectionConfig } from "payload";
import { isAdmin } from "@/access/is-admin";
import { isAdminOrMitarbeiter } from "@/access/is-admin-or-mitarbeiter";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "Benutzer",
    plural: "Benutzer",
  },
  admin: {
    group: "System",
    useAsTitle: "email",
    hidden: ({ user }) => user?.rolle === "kunde",
  },
  auth: {
    forgotPassword: {
      generateEmailHTML: async ({ token, user }) => {
        const baseUrl =
          process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
        const resetUrl = `${baseUrl}/kunden/passwort-reset/${token}`;

        // Queue email through project's email system (Phase 25)
        try {
          const { queuePasswordResetEmail } =
            await import("@/lib/email/password-reset");
          await queuePasswordResetEmail(user.email as string, resetUrl);
        } catch (error) {
          console.error("[Password Reset] Email queue failed:", error);
        }

        // Return empty string to suppress Payload's built-in email sending
        return "";
      },
      generateEmailSubject: () => {
        return "Passwort zuruecksetzen | Muster Fenster";
      },
    },
  },
  access: {
    admin: ({ req }) => {
      // Block customers from admin panel, allow all staff roles
      if (!req.user) return false;
      return req.user.rolle !== "kunde";
    },
    read: ({ req }) => {
      if (!req.user) return false;
      // Admins + Mitarbeiter see all users
      if (req.user.rolle === "admin" || req.user.rolle === "mitarbeiter")
        return true;
      // Kunden can only read their own profile
      return { id: { equals: req.user.id } };
    },
    // Allow public registration (unauthenticated) OR admin creation
    create: () => true,
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.rolle === "admin") return true;
      // Kunden can only update their own profile
      return { id: { equals: req.user.id } };
    },
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      // Enforce rolle=kunde for self-registration (unauthenticated users)
      ({ req, data, operation }) => {
        if (operation === "create" && !req.user) {
          // Unauthenticated registration: force rolle to kunde
          return { ...data, rolle: "kunde" };
        }
        // Non-admin users cannot change their own rolle
        if (operation === "update" && req.user?.rolle !== "admin") {
          const { rolle, ...rest } = data;
          return rest;
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "vorname",
      type: "text",
      label: "Vorname",
    },
    {
      name: "nachname",
      type: "text",
      label: "Nachname",
    },
    {
      name: "rolle",
      type: "select",
      label: "Rolle",
      defaultValue: "viewer",
      saveToJWT: true,
      options: [
        { label: "Admin", value: "admin" },
        { label: "Mitarbeiter", value: "mitarbeiter" },
        { label: "Viewer", value: "viewer" },
        { label: "Kunde", value: "kunde" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "stripe_customer_id",
      type: "text",
      label: "Stripe Customer ID",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Automatisch bei Checkout erstellt",
      },
      access: {
        read: ({ req }) => {
          if (!req.user) return false;
          return req.user.rolle === "admin" || req.user.rolle === "mitarbeiter";
        },
      },
    },
  ],
};
