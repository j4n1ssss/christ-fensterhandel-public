/**
 * Event-Matrix -- Single Source of Truth for all email event configurations.
 *
 * Maps each of the 24 EmailEventType values to:
 * - empfaenger: who receives the email (kunde, staff, or both)
 * - templates: which template slug to use per recipient
 * - betreff: subject line template per recipient (#{variable} placeholders)
 * - enabled_default: whether this event sends emails by default
 *
 * 20 business events correspond to status transitions in the order lifecycle.
 * 2 payment events: 'rueckerstattung' and 'zahlung_dispute'.
 * 1 password reset event: 'passwort_reset'.
 * 1 utility slot: 'test_preview' (preview test-send).
 *
 * Follows the same TypeScript config pattern as status-config.ts.
 */

import type { EmailEventType, EventConfig } from "./types";

export const EVENT_MATRIX: Record<EmailEventType, EventConfig> = {
  // --- Kunden-facing + Staff ---

  neue_anfrage: {
    empfaenger: ["kunde", "staff"],
    templates: { kunde: "anfrage-bestaetigung", staff: "neue-anfrage" },
    betreff: {
      kunde: "Ihre Anfrage #{anfrage_nummer} ist eingegangen",
      staff: "Neue Anfrage #{anfrage_nummer} von #{kunde_name}",
    },
    enabled_default: true,
  },

  in_bearbeitung: {
    empfaenger: ["kunde"],
    templates: { kunde: "status-update" },
    betreff: { kunde: "Anfrage #{anfrage_nummer}: #{status_text}" },
    enabled_default: true,
  },

  angebot_versendet: {
    empfaenger: ["kunde"],
    templates: { kunde: "angebot-versendet" },
    betreff: { kunde: "Ihr Angebot fuer Anfrage #{anfrage_nummer}" },
    enabled_default: true,
  },

  bestaetigt: {
    empfaenger: ["kunde", "staff"],
    templates: { kunde: "status-update", staff: "status-benachrichtigung" },
    betreff: {
      kunde: "Anfrage #{anfrage_nummer}: #{status_text}",
      staff: "Anfrage #{anfrage_nummer}: #{status_text}",
    },
    enabled_default: true,
  },

  zahlungslink_versendet: {
    empfaenger: ["kunde"],
    templates: { kunde: "zahlungslink" },
    betreff: { kunde: "Zahlungslink fuer Anfrage #{anfrage_nummer}" },
    enabled_default: true,
  },

  bezahlt: {
    empfaenger: ["kunde", "staff"],
    templates: {
      kunde: "zahlung-bestaetigung",
      staff: "status-benachrichtigung",
    },
    betreff: {
      kunde: "Zahlung fuer Anfrage #{anfrage_nummer} eingegangen",
      staff: "Anfrage #{anfrage_nummer}: Zahlung eingegangen",
    },
    enabled_default: true,
  },

  // --- Internal-only (Staff) ---

  an_hersteller: {
    empfaenger: ["staff"],
    templates: { staff: "status-benachrichtigung" },
    betreff: {
      staff: "Anfrage #{anfrage_nummer}: An Hersteller weitergeleitet",
    },
    enabled_default: true,
  },

  hersteller_bestaetigt: {
    empfaenger: ["staff"],
    templates: { staff: "status-benachrichtigung" },
    betreff: { staff: "Anfrage #{anfrage_nummer}: Hersteller hat bestaetigt" },
    enabled_default: true,
  },

  hersteller_bestaetigt_mit_vorbehalt: {
    empfaenger: ["staff"],
    templates: { staff: "status-benachrichtigung" },
    betreff: {
      staff: "Anfrage #{anfrage_nummer}: Hersteller bestaetigt mit Vorbehalt",
    },
    enabled_default: true,
  },

  in_produktion: {
    empfaenger: ["staff"],
    templates: { staff: "status-benachrichtigung" },
    betreff: { staff: "Anfrage #{anfrage_nummer}: In Produktion" },
    enabled_default: true,
  },

  hersteller_problem: {
    empfaenger: ["staff"],
    templates: { staff: "status-benachrichtigung" },
    betreff: { staff: "Anfrage #{anfrage_nummer}: Hersteller-Problem" },
    enabled_default: true,
  },

  // --- Kunden-facing + Staff (Lieferung/Abschluss) ---

  versandbereit: {
    empfaenger: ["kunde", "staff"],
    templates: { kunde: "status-update", staff: "status-benachrichtigung" },
    betreff: {
      kunde: "Anfrage #{anfrage_nummer}: #{status_text}",
      staff: "Anfrage #{anfrage_nummer}: Versandbereit",
    },
    enabled_default: true,
  },

  geliefert: {
    empfaenger: ["kunde", "staff"],
    templates: { kunde: "status-update", staff: "status-benachrichtigung" },
    betreff: {
      kunde: "Anfrage #{anfrage_nummer}: #{status_text}",
      staff: "Anfrage #{anfrage_nummer}: Geliefert",
    },
    enabled_default: true,
  },

  abgeschlossen: {
    empfaenger: ["kunde", "staff"],
    templates: { kunde: "status-update", staff: "status-benachrichtigung" },
    betreff: {
      kunde: "Anfrage #{anfrage_nummer}: #{status_text}",
      staff: "Anfrage #{anfrage_nummer}: Abgeschlossen",
    },
    enabled_default: true,
  },

  // --- Sonderfaelle (Kunden-facing) ---

  storniert: {
    empfaenger: ["kunde", "staff"],
    templates: { kunde: "stornierung", staff: "status-benachrichtigung" },
    betreff: {
      kunde: "Anfrage #{anfrage_nummer} wurde storniert",
      staff: "Anfrage #{anfrage_nummer}: Storniert",
    },
    enabled_default: true,
  },

  rueckfrage: {
    empfaenger: ["kunde"],
    templates: { kunde: "rueckfrage" },
    betreff: { kunde: "Rueckfrage zu Anfrage #{anfrage_nummer}" },
    enabled_default: true,
  },

  zahlungsproblem: {
    empfaenger: ["kunde", "staff"],
    templates: { kunde: "status-update", staff: "status-benachrichtigung" },
    betreff: {
      kunde: "Zahlungsproblem bei Anfrage #{anfrage_nummer}",
      staff: "Anfrage #{anfrage_nummer}: Zahlungsproblem",
    },
    enabled_default: true,
  },

  reklamation: {
    empfaenger: ["kunde"],
    templates: { kunde: "reklamation" },
    betreff: { kunde: "Reklamation zu Anfrage #{anfrage_nummer}" },
    enabled_default: true,
  },

  // --- Stripe Payment Events ---

  rueckerstattung: {
    empfaenger: ["kunde"],
    templates: { kunde: "rueckerstattung" },
    betreff: { kunde: "Rueckerstattung fuer Anfrage #{anfrage_nummer}" },
    enabled_default: true,
  },

  zahlung_dispute: {
    empfaenger: ["staff"],
    templates: { staff: "dispute-warnung" },
    betreff: { staff: "DRINGEND: Dispute fuer Anfrage #{anfrage_nummer}" },
    enabled_default: true,
  },

  // --- Customer Self-Service Events (Phase 29) ---

  stornierung_beantragt: {
    empfaenger: ["staff"],
    templates: { staff: "status-benachrichtigung" },
    betreff: { staff: "Stornierungsanfrage zu Anfrage #{anfrage_nummer}" },
    enabled_default: true,
  },

  kundenantwort: {
    empfaenger: ["staff"],
    templates: { staff: "status-benachrichtigung" },
    betreff: { staff: "Kundenantwort zu Anfrage #{anfrage_nummer}" },
    enabled_default: true,
  },

  passwort_reset: {
    empfaenger: ["kunde"],
    templates: { kunde: "passwort-reset" },
    betreff: { kunde: "Passwort zuruecksetzen | Muster Fenster" },
    enabled_default: true,
  },

  test_preview: {
    empfaenger: ["kunde"],
    templates: { kunde: "anfrage-bestaetigung" },
    betreff: { kunde: "[TEST] Vorschau: #{template_name}" },
    enabled_default: true,
  },
};

/**
 * Lookup helper for event configuration.
 * Returns undefined if eventType is not in the matrix.
 */
export function getEventConfig(
  eventType: EmailEventType,
): EventConfig | undefined {
  return EVENT_MATRIX[eventType];
}
