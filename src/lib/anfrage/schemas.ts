import { z } from "zod";

/**
 * Contact form validation schema.
 * Required: vorname, nachname, email, datenschutz (must be true).
 * Optional: telefon, strasse, plz, ort, nachricht.
 */
export const kontaktSchema = z.object({
  vorname: z.string().min(1, "Vorname ist erforderlich"),
  nachname: z.string().min(1, "Nachname ist erforderlich"),
  email: z.email("Bitte gültige E-Mail-Adresse eingeben"),
  datenschutz: z.literal(true, {
    error: "Datenschutzerklärung muss akzeptiert werden",
  }),
  agb: z.literal(true, {
    error: "AGB muessen akzeptiert werden",
  }),
  telefon: z.string().optional(),
  strasse: z.string().optional(),
  plz: z.string().optional(),
  ort: z.string().optional(),
  nachricht: z.string().optional(),
});

export type KontaktFormData = z.infer<typeof kontaktSchema>;

/**
 * A single product snapshot in the submission.
 * Contains the configurator selections, resolved display names,
 * the authoritative server-calculated price, and quantity.
 */
export const snapshotItemSchema = z.object({
  selections: z.record(z.string(), z.unknown()),
  resolvedNames: z.record(z.string(), z.unknown()),
  serverPrice: z.number(),
  quantity: z.number().int().min(1),
});

export type SnapshotItem = z.infer<typeof snapshotItemSchema>;

/**
 * Full submission schema: contact data + products + optional discount code.
 * At least one product is required.
 */
export const submissionSchema = z.object({
  kontaktdaten: kontaktSchema,
  produkte: z
    .array(snapshotItemSchema)
    .min(1, "Mindestens ein Produkt erforderlich"),
  rabattcode: z.string().optional(),
});

export type SubmissionData = z.infer<typeof submissionSchema>;
