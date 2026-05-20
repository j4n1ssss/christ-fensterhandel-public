/**
 * Email system type definitions -- Single Source of Truth for the email pipeline.
 *
 * 24 EmailEventType values: 20 business events (status transitions) + 2 payment events + 1 password reset + 1 utility slot.
 * Used by event-matrix.ts, queue.ts, render-email.ts, and afterChange hooks.
 */

// --- Core Types ---

export type EmailEventType =
  | "neue_anfrage"
  | "in_bearbeitung"
  | "angebot_versendet"
  | "bestaetigt"
  | "zahlungslink_versendet"
  | "bezahlt"
  | "an_hersteller"
  | "hersteller_bestaetigt"
  | "hersteller_bestaetigt_mit_vorbehalt"
  | "in_produktion"
  | "hersteller_problem"
  | "versandbereit"
  | "geliefert"
  | "abgeschlossen"
  | "storniert"
  | "rueckfrage"
  | "zahlungsproblem"
  | "reklamation"
  | "kundenantwort"
  | "stornierung_beantragt"
  | "rueckerstattung"
  | "zahlung_dispute"
  | "passwort_reset"
  | "test_preview";

export type Recipient = "kunde" | "staff";

export type QueueStatus =
  | "pending"
  | "processing"
  | "sent"
  | "failed"
  | "dead"
  | "skipped";

// --- Event Configuration ---

export interface EventConfig {
  empfaenger: Recipient[];
  templates: { kunde?: string; staff?: string };
  betreff: { kunde?: string; staff?: string };
  enabled_default: boolean;
}

// --- Event Payload (passed to template rendering) ---

export interface EmailEventPayload {
  eventType: EmailEventType;
  anfrageId: string;
  anfrageNummer: string;
  status: string;
  statusAlt?: string;
  kunde: { vorname: string; nachname: string; email: string };
  produkte: Array<{
    produkttyp: string;
    stueckzahl: number;
    einzelpreis: number;
  }>;
  gesamtbetragCents: number;
  zusatzDaten?: Record<string, unknown>;
  resetUrl?: string; // For password reset emails
}

// --- Queue Entry (matches email_queue Collection fields) ---

export interface QueueEntry {
  event_type: string;
  to: string;
  subject: string;
  html: string;
  plain_text: string;
  reply_to: string;
  payload_data: Record<string, unknown>;
  status: QueueStatus;
  attempts: number;
  max_attempts: number;
  idempotency_key: string;
  next_retry_at?: string;
  error_log?: string;
}
