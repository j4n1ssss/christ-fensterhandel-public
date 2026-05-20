/**
 * Mock data for email template preview and testing.
 *
 * Provides realistic test fixtures for all 11 email templates.
 */

import type { BaseLayoutSettings } from "@/emails/components/base-layout";

export const MOCK_SETTINGS: BaseLayoutSettings & Record<string, unknown> = {
  firmenname: "Muster Fenster",
  adresse_strasse: "Musterstrasse",
  adresse_hausnummer: "1",
  adresse_plz: "12345",
  adresse_ort: "Musterstadt",
  telefon: "+49 30 000 000 00",
  email: "info@example.com",
  email_absender_name: "Muster Fenster",
  email_reply_to: "info@example.com",
  email_signatur: "",
  benachrichtigungs_emails: "admin@example.com",
  email_event_toggles: {},
};

export const MOCK_ANFRAGE = {
  anfrageNummer: "ANF-2026-001",
  kunde: {
    vorname: "Max",
    nachname: "Mustermann",
    email: "max@example.com",
  },
  produkte: [
    {
      name: "Fenster PVC 2-fluegelig",
      stueckzahl: 3,
      einzelpreis: 15000,
    },
    {
      name: "Rolladen Aluminium",
      stueckzahl: 1,
      einzelpreis: 12000,
    },
  ],
  gesamtbetragCents: 57000,
  anfrageId: "550e8400-e29b-41d4-a716-446655440000",
  status: "neu",
};

/**
 * Returns template-specific mock props for a given template slug.
 * The _eventOverrides field allows tests to override EmailEventPayload fields.
 */
export function getMockDataForTemplate(
  templateSlug: string,
): Record<string, unknown> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
  const anfrageUrl = `${baseUrl}/dashboard/anfragen/${MOCK_ANFRAGE.anfrageId}`;
  const adminUrl = `${baseUrl}/admin/collections/anfragen/${MOCK_ANFRAGE.anfrageId}`;

  switch (templateSlug) {
    case "anfrage-bestaetigung":
      return {
        anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
        kunde: MOCK_ANFRAGE.kunde,
        produkte: MOCK_ANFRAGE.produkte,
        gesamtbetragCents: MOCK_ANFRAGE.gesamtbetragCents,
        anfrageUrl,
        _eventOverrides: { eventType: "neue_anfrage", status: "neu" },
      };

    case "status-update":
      return {
        anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
        kunde: MOCK_ANFRAGE.kunde,
        statusLabel: "In Bearbeitung",
        statusColor: "#3b82f6",
        statusText: "Ihre Anfrage wird gerade von unserem Team bearbeitet.",
        anfrageUrl,
        _eventOverrides: {
          eventType: "in_bearbeitung",
          status: "in_bearbeitung",
        },
      };

    case "angebot-versendet":
      return {
        anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
        kunde: MOCK_ANFRAGE.kunde,
        produkte: MOCK_ANFRAGE.produkte,
        gesamtbetragCents: MOCK_ANFRAGE.gesamtbetragCents,
        gueltigBis: "15.04.2026",
        angebotUrl: anfrageUrl,
        _eventOverrides: {
          eventType: "angebot_versendet",
          status: "angebot_versendet",
        },
      };

    case "zahlungslink":
      return {
        anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
        kunde: MOCK_ANFRAGE.kunde,
        gesamtbetragCents: MOCK_ANFRAGE.gesamtbetragCents,
        zahlungsUrl: `${baseUrl}/zahlung/test-session-id`,
        ablaufDatum: "05.04.2026",
        _eventOverrides: {
          eventType: "zahlungslink_versendet",
          status: "zahlungslink_versendet",
        },
      };

    case "zahlung-bestaetigung":
      return {
        anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
        kunde: MOCK_ANFRAGE.kunde,
        gesamtbetragCents: MOCK_ANFRAGE.gesamtbetragCents,
        produkte: MOCK_ANFRAGE.produkte,
        anfrageUrl,
        _eventOverrides: { eventType: "bezahlt", status: "bezahlt" },
      };

    case "stornierung":
      return {
        anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
        kunde: MOCK_ANFRAGE.kunde,
        grund: "Kundenwunsch",
        rueckerstattungInfo:
          "Die Rueckerstattung wird innerhalb von 5-10 Werktagen bearbeitet.",
        _eventOverrides: { eventType: "storniert", status: "storniert" },
      };

    case "rueckfrage":
      return {
        anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
        kunde: MOCK_ANFRAGE.kunde,
        frageText:
          "Koennten Sie bitte die gewuenschte Fensterfarbe praezisieren?",
        antwortUrl: anfrageUrl,
        _eventOverrides: {
          eventType: "rueckfrage",
          status: "rueckfrage",
        },
      };

    case "reklamation":
      return {
        anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
        kunde: MOCK_ANFRAGE.kunde,
        anfrageUrl,
        _eventOverrides: {
          eventType: "reklamation",
          status: "reklamation",
        },
      };

    case "rueckerstattung":
      return {
        anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
        kunde: MOCK_ANFRAGE.kunde,
        betragCents: 57000,
        methode: "Kreditkarte",
        _eventOverrides: {
          eventType: "rueckerstattung",
          status: "rueckerstattung_abgeschlossen",
        },
      };

    case "dispute-warnung":
      return {
        anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
        disputeId: "dp_test_123456",
        disputeReason: "fraudulent",
        disputeAmountCents: 57000,
        _eventOverrides: {
          eventType: "zahlung_dispute",
          status: "bezahlt",
        },
      };

    case "neue-anfrage":
      return {
        anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
        kundeName: `${MOCK_ANFRAGE.kunde.vorname} ${MOCK_ANFRAGE.kunde.nachname}`,
        produkte: MOCK_ANFRAGE.produkte,
        gesamtbetragCents: MOCK_ANFRAGE.gesamtbetragCents,
        adminUrl,
        _eventOverrides: { eventType: "neue_anfrage", status: "neu" },
      };

    case "status-benachrichtigung":
      return {
        anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
        statusLabel: "Bestaetigt",
        statusAlt: "Angebot versendet",
        kundeName: `${MOCK_ANFRAGE.kunde.vorname} ${MOCK_ANFRAGE.kunde.nachname}`,
        adminUrl,
        _eventOverrides: {
          eventType: "bestaetigt",
          status: "bestaetigt",
          statusAlt: "angebot_versendet",
        },
      };

    default:
      return {
        anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
        kunde: MOCK_ANFRAGE.kunde,
      };
  }
}
