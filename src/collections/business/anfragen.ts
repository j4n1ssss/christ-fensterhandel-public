import type { CollectionConfig } from "payload";
import { APIError } from "payload";
import { isAdmin } from "@/access/is-admin";
import { isAdminOrMitarbeiter } from "@/access/is-admin-or-mitarbeiter";
import { isOwnAnfrage } from "@/access/is-own-anfrage";
import { hasRole, isStaff } from "@/access/role-checks";
import { isValidTransition, COMMENT_REQUIRED } from "@/lib/status-transitions";
import { queueEmailEvent } from "@/lib/email/queue";
import type { EmailEventType, EmailEventPayload } from "@/lib/email/types";
import {
  checkOptimisticLock,
  VersionConflictError,
} from "@/lib/anfrage/optimistic-lock";

/** Validate required fields when transitioning to storniert. */
function validateStornierung(
  data: Record<string, unknown>,
  originalStatus: string,
): void {
  if (!data.stornierung_grund) {
    throw new APIError("Stornierungsgrund ist erforderlich.", 400);
  }
  const paidStatuses = [
    "bezahlt",
    "an_hersteller",
    "hersteller_bestaetigt",
    "hersteller_bestaetigt_mit_vorbehalt",
    "in_produktion",
    "hersteller_problem",
    "versandbereit",
    "geliefert",
  ];
  if (paidStatuses.includes(originalStatus)) {
    if (
      data.rueckerstattung_betrag === undefined ||
      data.rueckerstattung_betrag === null
    ) {
      throw new APIError(
        "Rückerstattungsbetrag ist erforderlich bei stornierter bezahlter Anfrage.",
        400,
      );
    }
    if (!data.rueckerstattung_status) {
      throw new APIError(
        "Rückerstattungsstatus ist erforderlich bei stornierter bezahlter Anfrage.",
        400,
      );
    }
  }
}

export const Anfragen: CollectionConfig = {
  slug: "anfragen",
  labels: {
    singular: "Anfrage",
    plural: "Anfragen",
  },
  admin: {
    group: "Business",
    useAsTitle: "anfrage_nummer",
    defaultColumns: [
      "anfrage_nummer",
      "status",
      "kontaktdaten.nachname",
      "gesamtpreis",
      "createdAt",
    ],
    listSearchableFields: [
      "anfrage_nummer",
      "kontaktdaten.nachname",
      "kontaktdaten.email",
    ],
    components: {
      views: {
        edit: {
          default: {
            Component: "@/components/admin/anfrage-detail-view#default",
          },
        },
        list: {
          Component: "@/components/admin/anfragen-list-view#default",
        },
      },
    },
  },
  access: {
    create: () => true,
    read: isOwnAnfrage,
    update: isAdminOrMitarbeiter,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req, operation }) => {
        if (!data) return data;

        // Optimistic Locking: compare versions, increment on success
        try {
          const locked = checkOptimisticLock(
            data as Record<string, unknown>,
            originalDoc as Record<string, unknown> | undefined,
            operation,
          );
          data.version = locked.version;
        } catch (err) {
          if (err instanceof VersionConflictError) {
            throw new APIError(err.message, 409);
          }
          throw err;
        }

        if (operation !== "update" || !originalDoc) return data;

        // Status transition validation (skip if status field not sent in update)
        if (data.status !== undefined && originalDoc.status !== data.status) {
          if (!isValidTransition(originalDoc.status, data.status)) {
            throw new APIError(
              `Ungültiger Statusübergang: ${originalDoc.status} -> ${data.status}`,
              400,
            );
          }

          if (
            COMMENT_REQUIRED.includes(data.status) &&
            !data._status_kommentar
          ) {
            throw new APIError(
              `Kommentar ist erforderlich für Status "${data.status}"`,
              400,
            );
          }

          // Special case: rejecting a stornierung_beantragt requires a comment (Ablehnungsgrund)
          if (
            originalDoc.status === "stornierung_beantragt" &&
            data.status === "in_bearbeitung" &&
            !data._status_kommentar
          ) {
            throw new APIError("Ablehnungsgrund ist erforderlich.", 400);
          }

          // Stornierung: stornierung_grund IS the comment (per CONTEXT.md decision)
          if (data.status === "storniert") {
            validateStornierung(data, originalDoc.status);
          }

          // Auto-update last_status_change_at
          data.last_status_change_at = new Date().toISOString();

          // Status-Historie tracken
          await req.payload.create({
            collection: "status_historie",
            data: {
              anfrage: originalDoc.id,
              von_status: originalDoc.status,
              zu_status: data.status,
              geaendert_von: req.user?.id || undefined,
              zeitpunkt: new Date().toISOString(),
              kommentar:
                data.status === "storniert"
                  ? data.stornierung_grund || undefined
                  : data._status_kommentar || undefined,
            },
          });

          // Strip transient field before save
          delete data._status_kommentar;
        }

        // Strip _skip_auto_pdf transient field before save, carry via req.context for afterChange
        if ((data as any)?._skip_auto_pdf !== undefined) {
          if (req.context) {
            (req.context as any)._skip_auto_pdf = true;
          }
          delete (data as any)._skip_auto_pdf;
        }

        // Manuelle Änderungen an geschützten Feldern protokollieren
        const aenderungen: string[] = [];
        const kontaktChanged =
          JSON.stringify(originalDoc.kontaktdaten) !==
          JSON.stringify(data.kontaktdaten);
        const preisChanged = originalDoc.gesamtpreis !== data.gesamtpreis;

        if (kontaktChanged) aenderungen.push("Kontaktdaten");
        if (preisChanged)
          aenderungen.push(
            `Gesamtpreis: ${originalDoc.gesamtpreis} -> ${data.gesamtpreis}`,
          );

        if (aenderungen.length > 0) {
          const timestamp = new Date()
            .toISOString()
            .slice(0, 16)
            .replace("T", " ");
          const username = req.user?.email || "Unbekannt";
          const eintrag = `[${timestamp}] Manuelle Änderung durch ${username}: ${aenderungen.join(", ")}`;
          const bisherige = data.interne_notizen || "";
          data.interne_notizen = bisherige
            ? `${eintrag}\n${bisherige}`
            : eintrag;
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        try {
          const kundenVorname = doc.kontaktdaten?.vorname || "";
          const kundenNachname = doc.kontaktdaten?.nachname || "";
          const kundenEmail = doc.kontaktdaten?.email || "";
          const produkte = (doc.produkte || []).map(
            (p: {
              produkttyp_label?: string;
              produkttyp?: string;
              stueckzahl?: number;
              einzelpreis?: number;
            }) => ({
              produkttyp: p.produkttyp_label || p.produkttyp || "Produkt",
              stueckzahl: p.stueckzahl || 1,
              einzelpreis: p.einzelpreis || 0,
            }),
          );
          const gesamtbetragCents = doc.gesamtpreis || 0;

          // Case A: New Anfrage
          if (operation === "create") {
            const emailPayload: EmailEventPayload = {
              eventType: "neue_anfrage",
              anfrageId: doc.id,
              anfrageNummer: doc.anfrage_nummer,
              status: doc.status || "neu",
              kunde: {
                vorname: kundenVorname,
                nachname: kundenNachname,
                email: kundenEmail,
              },
              produkte,
              gesamtbetragCents,
            };
            await queueEmailEvent(emailPayload);
            return;
          }

          // Case B: Status changed
          if (previousDoc && previousDoc.status !== doc.status) {
            const eventType = doc.status as EmailEventType;
            const emailPayload: EmailEventPayload = {
              eventType,
              anfrageId: doc.id,
              anfrageNummer: doc.anfrage_nummer,
              status: doc.status,
              statusAlt: previousDoc.status,
              kunde: {
                vorname: kundenVorname,
                nachname: kundenNachname,
                email: kundenEmail,
              },
              produkte,
              gesamtbetragCents,
            };

            // STRP-01: Create Stripe Checkout Session AFTER transaction commits
            // Fire-and-forget: don't block the PATCH response with Stripe API calls
            if (
              doc.status === "zahlungslink_versendet" &&
              previousDoc.status !== "zahlungslink_versendet"
            ) {
              const anfrageId = doc.id;
              const anfrageNummer = doc.anfrage_nummer || doc.id;
              const gesamtpreis = doc.gesamtpreis || 0;
              const produktAnzahl = doc.produkte?.length || 0;
              const stripeUserId =
                typeof doc.kontaktdaten?.user === "string"
                  ? doc.kontaktdaten.user
                  : doc.kontaktdaten?.user?.id;
              const existingSessionId = doc.stripe_session_id;

              setImmediate(async () => {
                try {
                  const { createCheckoutSession, expireExistingSession } =
                    await import("@/lib/stripe");
                  const { getPayload } = await import("payload");
                  const payloadConfig = (await import("@payload-config"))
                    .default;
                  const pl = await getPayload({ config: payloadConfig });

                  // STRP-06: Expire old session if exists
                  if (existingSessionId) {
                    await expireExistingSession(existingSessionId);
                  }

                  const session = await createCheckoutSession({
                    anfrageId,
                    anfrageNummer,
                    gesamtpreis,
                    produktAnzahl,
                    kundenEmail,
                    kundenName: `${kundenVorname} ${kundenNachname}`.trim(),
                    userId: stripeUserId,
                  });

                  // Store Stripe fields (own transaction, after parent committed)
                  await pl.update({
                    collection: "anfragen",
                    id: anfrageId,
                    data: {
                      stripe_checkout_url: session.url,
                      stripe_session_id: session.id,
                      stripe_payment_status: "offen",
                      stripe_expires_at: new Date(
                        session.expires_at! * 1000,
                      ).toISOString(),
                    } as any,
                  });

                  console.info("[Anfragen] Stripe Checkout Session created", {
                    anfrageId,
                    sessionId: session.id,
                  });
                } catch (stripeErr) {
                  console.error(
                    "[Anfragen] Stripe Checkout failed:",
                    stripeErr,
                  );
                }
              });

              // Pass redirect URL to email template (works even before session is ready)
              const baseUrl =
                process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
              emailPayload.zusatzDaten = {
                ...emailPayload.zusatzDaten,
                zahlungsUrl: `${baseUrl}/api/stripe/redirect/${doc.id}`,
              };
            }

            // PDF auto-generation on specific status transitions (before email queuing for attachment)
            let pdfAttachment: {
              filename: string;
              content_base64: string;
              mimetype: string;
            } | null = null;

            if (doc.status === "bezahlt" && previousDoc.status !== "bezahlt") {
              try {
                const { generateAndStorePDF } =
                  await import("@/lib/pdf/generate-and-store");
                const result = await generateAndStorePDF("rechnung", doc.id);
                pdfAttachment = {
                  filename: result.filename,
                  content_base64: result.buffer.toString("base64"),
                  mimetype: "application/pdf",
                };
              } catch (err) {
                console.error(
                  "[Anfragen afterChange] Rechnung PDF generation failed (non-blocking):",
                  err,
                );
              }
            }

            if (
              doc.status === "angebot_versendet" &&
              previousDoc.status !== "angebot_versendet" &&
              !(req.context as any)?._skip_auto_pdf
            ) {
              try {
                const { generateAndStorePDF } =
                  await import("@/lib/pdf/generate-and-store");
                const result = await generateAndStorePDF("angebot", doc.id);
                pdfAttachment = {
                  filename: result.filename,
                  content_base64: result.buffer.toString("base64"),
                  mimetype: "application/pdf",
                };
              } catch (err) {
                console.error(
                  "[Anfragen afterChange] Angebot PDF generation failed (non-blocking):",
                  err,
                );
              }
            }

            if (
              doc.status === "rueckerstattung_abgeschlossen" &&
              previousDoc.status !== "rueckerstattung_abgeschlossen"
            ) {
              try {
                const { generateAndStorePDF } =
                  await import("@/lib/pdf/generate-and-store");
                const result = await generateAndStorePDF("gutschrift", doc.id);
                pdfAttachment = {
                  filename: result.filename,
                  content_base64: result.buffer.toString("base64"),
                  mimetype: "application/pdf",
                };
              } catch (err) {
                console.error(
                  "[Anfragen afterChange] Gutschrift PDF generation failed (non-blocking):",
                  err,
                );
              }
            }

            // Attach PDF to email payload if generated
            if (pdfAttachment) {
              emailPayload.zusatzDaten = {
                ...emailPayload.zusatzDaten,
                attachments: [pdfAttachment],
              };
            }

            await queueEmailEvent(emailPayload);
          }
        } catch (err) {
          console.error(
            "[Anfragen afterChange] Email queue error (non-blocking):",
            err,
          );
        }
      },
    ],
  },
  fields: [
    {
      name: "anfrage_nummer",
      type: "text",
      label: "Anfrage-Nr.",
      required: true,
      unique: true,
      admin: { readOnly: true },
    },
    {
      name: "status",
      type: "select",
      label: "Status",
      defaultValue: "neu",
      options: [
        { label: "Neu", value: "neu" },
        { label: "In Bearbeitung", value: "in_bearbeitung" },
        { label: "Angebot versendet", value: "angebot_versendet" },
        { label: "Bestätigt", value: "bestaetigt" },
        { label: "Zahlungslink versendet", value: "zahlungslink_versendet" },
        { label: "Bezahlt", value: "bezahlt" },
        { label: "An Hersteller", value: "an_hersteller" },
        { label: "Hersteller bestätigt", value: "hersteller_bestaetigt" },
        {
          label: "Bestätigt mit Vorbehalt",
          value: "hersteller_bestaetigt_mit_vorbehalt",
        },
        { label: "In Produktion", value: "in_produktion" },
        { label: "Hersteller-Problem", value: "hersteller_problem" },
        { label: "Versandbereit", value: "versandbereit" },
        { label: "Geliefert", value: "geliefert" },
        { label: "Abgeschlossen", value: "abgeschlossen" },
        { label: "Rückfrage", value: "rueckfrage" },
        { label: "Abgelehnt", value: "abgelehnt" },
        { label: "Storniert", value: "storniert" },
        { label: "Zahlungsproblem", value: "zahlungsproblem" },
        { label: "Wieder geöffnet", value: "wieder_geoeffnet" },
        { label: "Reklamation", value: "reklamation" },
        {
          label: "Rueckerstattung ausstehend",
          value: "rueckerstattung_ausstehend",
        },
        {
          label: "Rueckerstattung abgeschlossen",
          value: "rueckerstattung_abgeschlossen",
        },
        { label: "Kundenantwort", value: "kundenantwort" },
        { label: "Stornierung beantragt", value: "stornierung_beantragt" },
      ],
    },
    {
      name: "last_status_change_at",
      type: "date",
      label: "Letzte Statusänderung",
      admin: {
        readOnly: true,
        date: {
          displayFormat: "dd.MM.yyyy HH:mm",
        },
        description: "Wird automatisch bei jedem Statuswechsel aktualisiert.",
      },
      access: {
        read: () => true,
      },
    },
    {
      name: "produkte",
      type: "array",
      label: "Konfigurierte Produkte",
      admin: { readOnly: true, initCollapsed: true },
      fields: [
        { name: "produkttyp", type: "text", label: "Produkttyp" },
        { name: "material", type: "text", label: "Material" },
        { name: "profil", type: "text", label: "Profil" },
        {
          type: "row",
          fields: [
            { name: "masse_breite", type: "number", label: "Breite (mm)" },
            { name: "masse_hoehe", type: "number", label: "Höhe (mm)" },
          ],
        },
        { name: "fluegelanzahl", type: "text", label: "Flügelanzahl" },
        {
          type: "row",
          fields: [
            { name: "farbe_aussen", type: "text", label: "Farbe Außen" },
            { name: "farbe_innen", type: "text", label: "Farbe Innen" },
          ],
        },
        { name: "verglasung", type: "text", label: "Verglasung" },
        {
          name: "weitere_optionen",
          type: "textarea",
          label: "Weitere Optionen",
        },
        {
          type: "row",
          fields: [
            {
              name: "stueckzahl",
              type: "number",
              label: "Stückzahl",
              defaultValue: 1,
            },
            {
              name: "einzelpreis",
              type: "number",
              label: "Einzelpreis (Cent)",
            },
          ],
        },
        {
          type: "collapsible",
          label: "Technische Konfiguration (JSON)",
          admin: { initCollapsed: true },
          fields: [
            {
              name: "konfiguration_snapshot",
              type: "json",
              label: "Konfigurations-Snapshot",
            },
          ],
        },
      ],
    },
    {
      name: "kontaktdaten",
      type: "group",
      label: "Kontaktdaten",
      admin: { readOnly: true },
      access: {
        update: ({ req }) => req.user?.rolle === "admin" || false,
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "vorname", type: "text", label: "Vorname" },
            { name: "nachname", type: "text", label: "Nachname" },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "email", type: "email", label: "E-Mail" },
            { name: "telefon", type: "text", label: "Telefon" },
          ],
        },
        { name: "strasse", type: "text", label: "Straße + Nr." },
        {
          type: "row",
          fields: [
            { name: "plz", type: "text", label: "PLZ" },
            { name: "ort", type: "text", label: "Ort" },
          ],
        },
        { name: "nachricht", type: "textarea", label: "Nachricht" },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "gesamtpreis",
          type: "number",
          label: "Gesamtpreis (Cent)",
          admin: { readOnly: true },
          access: {
            update: ({ req }) => req.user?.rolle === "admin" || false,
          },
        },
        {
          name: "rabattcode",
          type: "relationship",
          label: "Rabattcode",
          relationTo: "rabattcodes",
          admin: { readOnly: true },
        },
      ],
    },
    // Edit-Button (Custom Component) — öffnet Modal mit Warnung
    {
      name: "edit_button",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/admin/anfrage-edit-button#AnfrageEditButton",
        },
      },
    },
    // Hersteller-Informationen — sichtbar ab Status bezahlt
    {
      type: "collapsible",
      label: "Hersteller-Informationen",
      admin: {
        initCollapsed: true,
        condition: (data) => {
          const herstellerStatuses = [
            "bezahlt",
            "an_hersteller",
            "hersteller_bestaetigt",
            "hersteller_bestaetigt_mit_vorbehalt",
            "in_produktion",
            "hersteller_problem",
            "versandbereit",
            "geliefert",
            "abgeschlossen",
          ];
          return herstellerStatuses.includes(data?.status);
        },
      },
      fields: [
        {
          name: "hersteller_bestellnummer",
          type: "text",
          label: "Hersteller-Bestellnummer",
          access: {
            read: ({ req }) => isStaff(req.user),
            update: ({ req }) => hasRole(req.user, ["admin", "mitarbeiter"]),
          },
        },
        {
          name: "lieferdatum_erwartet",
          type: "date",
          label: "Erwartetes Lieferdatum",
          admin: {
            date: {
              displayFormat: "dd.MM.yyyy",
            },
          },
          access: {
            read: ({ req }) => isStaff(req.user),
            update: ({ req }) => hasRole(req.user, ["admin", "mitarbeiter"]),
          },
        },
        {
          name: "hersteller_notizen",
          type: "textarea",
          label: "Hersteller-Notizen",
          access: {
            read: ({ req }) => isStaff(req.user),
            update: ({ req }) => hasRole(req.user, ["admin", "mitarbeiter"]),
          },
        },
        {
          name: "hersteller_antwort",
          type: "textarea",
          label: "Hersteller-Antwort",
          access: {
            read: ({ req }) => isStaff(req.user),
            update: ({ req }) => hasRole(req.user, ["admin", "mitarbeiter"]),
          },
        },
      ],
    },
    // Stornierung — sichtbar nur bei Status storniert
    {
      type: "collapsible",
      label: "Stornierung",
      admin: {
        initCollapsed: false,
        condition: (data) => data?.status === "storniert",
      },
      fields: [
        {
          name: "stornierung_grund",
          type: "textarea",
          label: "Stornierungsgrund",
          access: {
            read: ({ req }) => isStaff(req.user),
            update: ({ req }) => hasRole(req.user, ["admin", "mitarbeiter"]),
          },
        },
        {
          name: "rueckerstattung_betrag",
          type: "number",
          label: "Rückerstattungsbetrag (EUR)",
          access: {
            read: ({ req }) => isStaff(req.user),
            update: ({ req }) => hasRole(req.user, ["admin", "mitarbeiter"]),
          },
        },
        {
          name: "rueckerstattung_status",
          type: "select",
          label: "Rückerstattungsstatus",
          options: [
            { label: "Ausstehend", value: "ausstehend" },
            { label: "Durchgeführt", value: "durchgefuehrt" },
            { label: "Abgelehnt", value: "abgelehnt" },
          ],
          access: {
            read: ({ req }) => isStaff(req.user),
            update: ({ req }) => hasRole(req.user, ["admin", "mitarbeiter"]),
          },
        },
      ],
    },
    {
      name: "_status_kommentar",
      type: "textarea",
      label: "Status-Kommentar",
      admin: {
        condition: () => false,
        description: "Wird bei Statusänderung als Kommentar gespeichert",
      },
    },
    {
      name: "interne_notizen",
      type: "textarea",
      label: "Interne Notizen",
      access: {
        read: ({ req }) => isStaff(req.user),
        update: ({ req }) => hasRole(req.user, ["admin", "mitarbeiter"]),
      },
      admin: {
        description:
          "Manuelle Änderungen werden hier automatisch protokolliert.",
      },
    },
    {
      name: "version",
      type: "number",
      label: "Version",
      defaultValue: 1,
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Wird automatisch bei jeder Aenderung erhoeht.",
      },
    },
    // Stripe-Daten tab (read-only, set by webhooks and checkout flow)
    {
      type: "tabs",
      tabs: [
        {
          label: "Stripe-Daten",
          fields: [
            {
              name: "stripe_checkout_url",
              type: "text",
              label: "Checkout URL",
              admin: {
                readOnly: true,
                description: "Aktuelle Stripe Checkout Session URL",
              },
            },
            {
              name: "stripe_session_id",
              type: "text",
              label: "Session ID",
              admin: {
                readOnly: true,
                description: "Stripe Checkout Session ID",
              },
            },
            {
              name: "stripe_payment_intent_id",
              type: "text",
              label: "Payment Intent ID",
              admin: {
                readOnly: true,
                description: "Stripe Payment Intent ID (nach Zahlung)",
              },
            },
            {
              name: "stripe_payment_status",
              type: "select",
              label: "Zahlungsstatus",
              admin: { readOnly: true },
              options: [
                { label: "Offen", value: "offen" },
                { label: "Bezahlt", value: "bezahlt" },
                { label: "Abgelaufen", value: "abgelaufen" },
                { label: "Dispute", value: "dispute" },
                { label: "Rueckerstattet", value: "rueckerstattet" },
                {
                  label: "Teilweise erstattet",
                  value: "teilweise_erstattet",
                },
              ],
            },
            {
              name: "stripe_expires_at",
              type: "date",
              label: "Session Ablaufdatum",
              admin: {
                readOnly: true,
                date: { displayFormat: "dd.MM.yyyy HH:mm" },
              },
            },
            {
              name: "stripe_refunded_amount_cents",
              type: "number",
              label: "Erstattungsbetrag (Cent)",
              defaultValue: 0,
              admin: {
                readOnly: true,
                description: "Kumulierter Erstattungsbetrag in Cent",
              },
            },
          ],
        },
      ],
    },
    {
      name: "agb_akzeptiert_am",
      type: "date",
      label: "AGB akzeptiert am",
      admin: {
        readOnly: true,
        description: "Zeitstempel der AGB-Akzeptanz bei Anfrage-Formular",
        position: "sidebar",
      },
    },
    {
      name: "agb_akzeptiert_bei_annahme_am",
      type: "date",
      label: "AGB akzeptiert bei Annahme am",
      admin: {
        readOnly: true,
        description: "Zeitstempel der AGB-Akzeptanz bei Angebots-Annahme",
        position: "sidebar",
      },
    },
  ],
};
