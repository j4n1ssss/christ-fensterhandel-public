/**
 * Status configuration -- Single Source of Truth for all status metadata.
 *
 * Pure data module: no client directive, no framework imports.
 * Used by admin components (hex colors), kunden components (Tailwind classes),
 * and server components (dashboard-overview.tsx).
 *
 * 24 statuses covering the full order lifecycle from Anfrage to Abschluss,
 * including branching paths for Rückfrage, Stornierung, Hersteller-Probleme,
 * Zahlungsprobleme, Reklamation, Wiederöffnung, Kundenantwort und Stornierung beantragt.
 */

// --- Types ---

export type StatusKey =
  | "neu"
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
  | "rueckfrage"
  | "abgelehnt"
  | "storniert"
  | "zahlungsproblem"
  | "wieder_geoeffnet"
  | "reklamation"
  | "rueckerstattung_ausstehend"
  | "rueckerstattung_abgeschlossen"
  | "kundenantwort"
  | "stornierung_beantragt";

export type StatusGroup =
  | "offen"
  | "zahlung"
  | "produktion"
  | "lieferung"
  | "abgeschlossen";

export type CustomerPhase =
  | "Anfrage"
  | "Angebot"
  | "Zahlung"
  | "Produktion"
  | "Lieferung";

// --- Hex colors (admin inline styles) ---

export const STATUS_COLORS: Record<StatusKey, string> = {
  neu: "#f59e0b", // Aktionsbedarf amber
  in_bearbeitung: "#3b82f6", // In Bearbeitung blue
  angebot_versendet: "#3b82f6", // In Bearbeitung blue
  bestaetigt: "#22c55e", // Bezahlung green
  zahlungslink_versendet: "#10b981", // Bezahlung emerald
  bezahlt: "#10b981", // Bezahlung emerald
  an_hersteller: "#8b5cf6", // Bei Hersteller violet
  hersteller_bestaetigt: "#8b5cf6", // Bei Hersteller violet
  hersteller_bestaetigt_mit_vorbehalt: "#f59e0b", // Aktionsbedarf amber
  in_produktion: "#8b5cf6", // Bei Hersteller violet
  hersteller_problem: "#ef4444", // Problem red
  versandbereit: "#06b6d4", // Lieferung cyan
  geliefert: "#06b6d4", // Lieferung cyan
  abgeschlossen: "#6b7280", // Abgeschlossen gray
  rueckfrage: "#f97316", // Aktionsbedarf orange
  abgelehnt: "#ef4444", // Problem red
  storniert: "#ef4444", // Problem red
  zahlungsproblem: "#ef4444", // Problem red
  wieder_geoeffnet: "#6b7280", // Abgeschlossen gray
  reklamation: "#ef4444", // Problem red
  rueckerstattung_ausstehend: "#f59e0b", // Rückerstattung amber
  rueckerstattung_abgeschlossen: "#ef4444", // Rückerstattung terminal red
  kundenantwort: "#06b6d4", // Kundenantwort cyan
  stornierung_beantragt: "#f59e0b", // Stornierung beantragt amber
};

// --- German display labels ---

export const STATUS_LABELS: Record<StatusKey, string> = {
  neu: "Neu",
  in_bearbeitung: "In Bearbeitung",
  angebot_versendet: "Angebot versendet",
  bestaetigt: "Bestätigt",
  zahlungslink_versendet: "Zahlungslink versendet",
  bezahlt: "Bezahlt",
  an_hersteller: "An Hersteller",
  hersteller_bestaetigt: "Hersteller bestätigt",
  hersteller_bestaetigt_mit_vorbehalt: "Bestätigt mit Vorbehalt",
  in_produktion: "In Produktion",
  hersteller_problem: "Hersteller-Problem",
  versandbereit: "Versandbereit",
  geliefert: "Geliefert",
  abgeschlossen: "Abgeschlossen",
  rueckfrage: "Rückfrage",
  abgelehnt: "Abgelehnt",
  storniert: "Storniert",
  zahlungsproblem: "Zahlungsproblem",
  wieder_geoeffnet: "Wieder geöffnet",
  reklamation: "Reklamation",
  rueckerstattung_ausstehend: "Rückerstattung ausstehend",
  rueckerstattung_abgeschlossen: "Rückerstattung abgeschlossen",
  kundenantwort: "Kundenantwort",
  stornierung_beantragt: "Stornierung beantragt",
};

// --- Tailwind classes (kunden components) ---

export const STATUS_TAILWIND: Record<
  StatusKey,
  { bg: string; text: string; dot: string }
> = {
  neu: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  in_bearbeitung: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  angebot_versendet: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  bestaetigt: {
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  zahlungslink_versendet: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  bezahlt: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  an_hersteller: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
  hersteller_bestaetigt: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
  hersteller_bestaetigt_mit_vorbehalt: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  in_produktion: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
  hersteller_problem: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  versandbereit: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    dot: "bg-cyan-500",
  },
  geliefert: { bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500" },
  abgeschlossen: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    dot: "bg-gray-500",
  },
  rueckfrage: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  abgelehnt: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  storniert: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  zahlungsproblem: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  wieder_geoeffnet: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    dot: "bg-gray-500",
  },
  reklamation: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  rueckerstattung_ausstehend: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  rueckerstattung_abgeschlossen: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  kundenantwort: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    dot: "bg-cyan-500",
  },
  stornierung_beantragt: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
};

// --- Customer-facing text (warm, Siezen) ---

export const STATUS_CUSTOMER_TEXT: Record<StatusKey, string> = {
  neu: "Wir haben Ihre Anfrage erhalten und prüfen sie sorgfältig.",
  in_bearbeitung: "Ihre Anfrage wird gerade von unserem Team bearbeitet.",
  angebot_versendet: "Ihr Angebot ist bereit — bitte prüfen Sie es in Ruhe.",
  bestaetigt: "Ihr Angebot ist fertig — Sie können es jetzt einsehen.",
  zahlungslink_versendet: "Wir haben Ihnen den Zahlungslink zugesendet.",
  bezahlt: "Danke, Ihre Zahlung ist bei uns eingegangen.",
  an_hersteller: "Ihre Fenster werden jetzt beim Hersteller bestellt.",
  hersteller_bestaetigt: "Der Hersteller hat Ihre Bestellung bestätigt.",
  hersteller_bestaetigt_mit_vorbehalt:
    "Wir melden uns bei Ihnen bezüglich einer Anpassung.",
  in_produktion: "Ihre Fenster werden jetzt hergestellt.",
  hersteller_problem: "Wir melden uns bei Ihnen bezüglich Ihrer Bestellung.",
  versandbereit:
    "Ihre Fenster sind fertig und werden für die Lieferung vorbereitet.",
  geliefert: "Ihre Fenster wurden geliefert.",
  abgeschlossen: "Ihre Bestellung ist erfolgreich abgeschlossen.",
  rueckfrage: "Wir haben eine Rückfrage zu Ihrer Anfrage.",
  abgelehnt: "Ihre Anfrage konnte leider nicht berücksichtigt werden.",
  storniert: "Ihre Bestellung wurde storniert.",
  zahlungsproblem:
    "Es gibt ein Problem mit Ihrer Zahlung — wir melden uns bei Ihnen.",
  wieder_geoeffnet: "Ihre Anfrage wurde erneut geöffnet und wird bearbeitet.",
  reklamation: "Ihre Reklamation wird von unserem Team bearbeitet.",
  rueckerstattung_ausstehend: "Ihre Rückerstattung wird bearbeitet.",
  rueckerstattung_abgeschlossen: "Ihre Zahlung wurde zurückerstattet.",
  kundenantwort:
    "Ihre Antwort wurde übermittelt. Wir bearbeiten Ihre Anfrage.",
  stornierung_beantragt:
    "Ihre Stornierungsanfrage wird von unserem Team geprüft.",
};

// --- Customer phase mapping (5-Phasen-Modell) ---

export const STATUS_CUSTOMER_PHASE: Record<StatusKey, CustomerPhase | null> = {
  neu: "Anfrage",
  in_bearbeitung: "Anfrage",
  angebot_versendet: "Angebot",
  bestaetigt: "Angebot",
  zahlungslink_versendet: "Zahlung",
  bezahlt: "Zahlung",
  an_hersteller: "Produktion",
  hersteller_bestaetigt: "Produktion",
  hersteller_bestaetigt_mit_vorbehalt: "Produktion",
  in_produktion: "Produktion",
  hersteller_problem: "Produktion",
  versandbereit: "Lieferung",
  geliefert: "Lieferung",
  abgeschlossen: "Lieferung",
  rueckfrage: "Anfrage",
  abgelehnt: null,
  storniert: null,
  zahlungsproblem: "Zahlung",
  wieder_geoeffnet: "Anfrage",
  reklamation: "Lieferung",
  rueckerstattung_ausstehend: null,
  rueckerstattung_abgeschlossen: null,
  kundenantwort: "Anfrage",
  stornierung_beantragt: null,
};

// --- Status groups (for filter tabs in Phase 20) ---

export const STATUS_GROUP: Record<StatusKey, StatusGroup> = {
  neu: "offen",
  in_bearbeitung: "offen",
  angebot_versendet: "offen",
  bestaetigt: "zahlung",
  zahlungslink_versendet: "zahlung",
  bezahlt: "zahlung",
  an_hersteller: "produktion",
  hersteller_bestaetigt: "produktion",
  hersteller_bestaetigt_mit_vorbehalt: "produktion",
  in_produktion: "produktion",
  hersteller_problem: "produktion",
  versandbereit: "lieferung",
  geliefert: "lieferung",
  abgeschlossen: "abgeschlossen",
  rueckfrage: "offen",
  abgelehnt: "abgeschlossen",
  storniert: "abgeschlossen",
  zahlungsproblem: "zahlung",
  wieder_geoeffnet: "offen",
  reklamation: "offen",
  rueckerstattung_ausstehend: "abgeschlossen",
  rueckerstattung_abgeschlossen: "abgeschlossen",
  kundenantwort: "offen",
  stornierung_beantragt: "offen",
};

// --- Email triggers (14 customer-facing statuses) ---

export const EMAIL_TRIGGER_STATUSES: StatusKey[] = [
  "neu",
  "rueckfrage",
  "angebot_versendet",
  "bestaetigt",
  "zahlungslink_versendet",
  "bezahlt",
  "hersteller_problem",
  "in_produktion",
  "versandbereit",
  "geliefert",
  "abgeschlossen",
  "storniert",
  "zahlungsproblem",
  "reklamation",
  "rueckerstattung_abgeschlossen",
  "kundenantwort",
  "stornierung_beantragt",
];

// --- Helper functions ---

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status as StatusKey] ?? "#6b7280";
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status as StatusKey] ?? status;
}

export function isCustomerFacing(status: string): boolean {
  return EMAIL_TRIGGER_STATUSES.includes(status as StatusKey);
}

// --- Quick Actions (admin detail view split-button) ---

export const QUICK_ACTIONS: Record<
  StatusKey,
  { label: string; target: StatusKey }[]
> = {
  neu: [{ label: "Anfrage annehmen", target: "in_bearbeitung" }],
  in_bearbeitung: [
    { label: "Angebot erstellen", target: "angebot_versendet" },
    { label: "Rückfrage senden", target: "rueckfrage" },
    { label: "Anfrage ablehnen", target: "abgelehnt" },
  ],
  angebot_versendet: [
    { label: "Kunde hat bestätigt", target: "bestaetigt" },
    { label: "Rückfrage senden", target: "rueckfrage" },
  ],
  bestaetigt: [
    { label: "Zahlungslink senden", target: "zahlungslink_versendet" },
  ],
  zahlungslink_versendet: [{ label: "Zahlung eingegangen", target: "bezahlt" }],
  bezahlt: [
    { label: "An Hersteller weiterleiten", target: "an_hersteller" },
    { label: "Anfrage stornieren", target: "storniert" },
    { label: "Zahlungsproblem melden", target: "zahlungsproblem" },
  ],
  an_hersteller: [
    { label: "Hersteller hat bestätigt", target: "hersteller_bestaetigt" },
    {
      label: "Bestätigt mit Vorbehalt",
      target: "hersteller_bestaetigt_mit_vorbehalt",
    },
    { label: "Hersteller-Problem melden", target: "hersteller_problem" },
  ],
  hersteller_bestaetigt: [
    { label: "Produktion starten", target: "in_produktion" },
  ],
  hersteller_bestaetigt_mit_vorbehalt: [
    { label: "Produktion starten", target: "in_produktion" },
    { label: "Anfrage stornieren", target: "storniert" },
  ],
  in_produktion: [
    { label: "Versandbereit markieren", target: "versandbereit" },
  ],
  versandbereit: [{ label: "Als geliefert markieren", target: "geliefert" }],
  geliefert: [
    { label: "Anfrage abschließen", target: "abgeschlossen" },
    { label: "Reklamation melden", target: "reklamation" },
  ],
  abgeschlossen: [{ label: "Wieder öffnen", target: "wieder_geoeffnet" }],
  rueckfrage: [{ label: "Zurück zur Bearbeitung", target: "in_bearbeitung" }],
  abgelehnt: [{ label: "Erneut eröffnen", target: "neu" }],
  wieder_geoeffnet: [
    { label: "Zurück zur Bearbeitung", target: "in_bearbeitung" },
  ],
  hersteller_problem: [
    { label: "Zurück zur Bearbeitung", target: "in_bearbeitung" },
    { label: "Anfrage stornieren", target: "storniert" },
  ],
  zahlungsproblem: [
    { label: "Zahlung erhalten", target: "bezahlt" },
    { label: "Anfrage stornieren", target: "storniert" },
  ],
  reklamation: [
    { label: "Zurück zur Bearbeitung", target: "in_bearbeitung" },
    { label: "Anfrage abschließen", target: "abgeschlossen" },
  ],
  storniert: [],
  rueckerstattung_ausstehend: [],
  rueckerstattung_abgeschlossen: [],
  kundenantwort: [
    { label: "Zurück zur Bearbeitung", target: "in_bearbeitung" },
    { label: "Erneut Rückfrage senden", target: "rueckfrage" },
  ],
  stornierung_beantragt: [
    { label: "Stornierung bestätigen", target: "storniert" },
    { label: "Ablehnen (zurück zu Bearbeitung)", target: "in_bearbeitung" },
  ],
};

// --- Attention-Score weights (admin list view) ---

export const STATUS_WEIGHT: Record<StatusKey, number> = {
  neu: 3,
  in_bearbeitung: 3,
  rueckfrage: 3,
  hersteller_problem: 3,
  zahlungsproblem: 3,
  wieder_geoeffnet: 3,
  angebot_versendet: 2,
  bestaetigt: 2,
  zahlungslink_versendet: 2,
  hersteller_bestaetigt_mit_vorbehalt: 2,
  bezahlt: 1,
  an_hersteller: 1,
  hersteller_bestaetigt: 1,
  in_produktion: 1,
  versandbereit: 1,
  geliefert: 1,
  reklamation: 1,
  abgeschlossen: 0,
  abgelehnt: 0,
  storniert: 0,
  rueckerstattung_ausstehend: 2,
  rueckerstattung_abgeschlossen: 0,
  kundenantwort: 3,
  stornierung_beantragt: 3,
};

// --- List view tab filters (admin Anfragen-Liste) ---

export const LIST_TAB_FILTERS: Record<string, StatusKey[]> = {
  alle: [],
  offen: [
    "neu",
    "in_bearbeitung",
    "angebot_versendet",
    "bestaetigt",
    "zahlungslink_versendet",
    "bezahlt",
    "wieder_geoeffnet",
    "stornierung_beantragt",
  ],
  rueckfrage: [
    "rueckfrage",
    "hersteller_problem",
    "zahlungsproblem",
    "reklamation",
    "kundenantwort",
  ],
  in_produktion: [
    "an_hersteller",
    "hersteller_bestaetigt",
    "hersteller_bestaetigt_mit_vorbehalt",
    "in_produktion",
    "versandbereit",
    "geliefert",
  ],
  abgeschlossen: [
    "abgeschlossen",
    "abgelehnt",
    "storniert",
    "rueckerstattung_ausstehend",
    "rueckerstattung_abgeschlossen",
  ],
};
