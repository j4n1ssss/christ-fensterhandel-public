/**
 * Valid status transitions for Anfragen.
 *
 * Linear main flow:
 *   NEU -> IN_BEARBEITUNG -> ANGEBOT_VERSENDET -> BESTAETIGT -> ZAHLUNGSLINK_VERSENDET
 *   -> BEZAHLT -> AN_HERSTELLER -> HERSTELLER_BESTAETIGT -> IN_PRODUKTION
 *   -> VERSANDBEREIT -> GELIEFERT -> ABGESCHLOSSEN
 *
 * Branches:
 *   IN_BEARBEITUNG -> RUECKFRAGE/ABGELEHNT
 *   ANGEBOT_VERSENDET -> RUECKFRAGE
 *   ANGEBOT_VERSENDET -> ZAHLUNGSLINK_VERSENDET (Kunden-Annahme, automatisch)
 *   BEZAHLT -> STORNIERT/ZAHLUNGSPROBLEM
 *   AN_HERSTELLER -> HERSTELLER_PROBLEM/HERSTELLER_BESTAETIGT_MIT_VORBEHALT
 *   GELIEFERT -> REKLAMATION
 *   ABGESCHLOSSEN -> WIEDER_GEOEFFNET
 *
 * Terminal: STORNIERT (no outgoing transitions)
 */
export const VALID_TRANSITIONS: Record<string, string[]> = {
  // Linear main flow
  neu: ["in_bearbeitung", "stornierung_beantragt"],
  in_bearbeitung: [
    "angebot_versendet",
    "rueckfrage",
    "abgelehnt",
    "stornierung_beantragt",
  ],
  angebot_versendet: [
    "bestaetigt",
    "rueckfrage",
    "zahlungslink_versendet",
    "stornierung_beantragt",
  ],
  bestaetigt: ["zahlungslink_versendet", "stornierung_beantragt"],
  zahlungslink_versendet: ["bezahlt", "stornierung_beantragt"],
  bezahlt: [
    "an_hersteller",
    "storniert",
    "zahlungsproblem",
    "rueckerstattung_ausstehend",
    "stornierung_beantragt",
  ],
  an_hersteller: [
    "hersteller_bestaetigt",
    "hersteller_bestaetigt_mit_vorbehalt",
    "hersteller_problem",
    "rueckerstattung_ausstehend",
    "stornierung_beantragt",
  ],
  hersteller_bestaetigt: [
    "in_produktion",
    "rueckerstattung_ausstehend",
    "stornierung_beantragt",
  ],
  hersteller_bestaetigt_mit_vorbehalt: [
    "in_produktion",
    "storniert",
    "stornierung_beantragt",
  ],
  in_produktion: [
    "versandbereit",
    "rueckerstattung_ausstehend",
    "stornierung_beantragt",
  ],
  versandbereit: [
    "geliefert",
    "rueckerstattung_ausstehend",
    "stornierung_beantragt",
  ],
  geliefert: ["abgeschlossen", "reklamation", "rueckerstattung_ausstehend"],
  abgeschlossen: ["wieder_geoeffnet", "rueckerstattung_ausstehend"],

  // Branch returns
  rueckfrage: ["in_bearbeitung", "kundenantwort", "stornierung_beantragt"],
  abgelehnt: ["neu"],
  wieder_geoeffnet: ["in_bearbeitung", "stornierung_beantragt"],
  hersteller_problem: ["in_bearbeitung", "storniert", "stornierung_beantragt"],
  zahlungsproblem: ["bezahlt", "storniert", "stornierung_beantragt"],
  reklamation: ["in_bearbeitung", "abgeschlossen", "stornierung_beantragt"],

  // New customer self-service statuses (Phase 29)
  kundenantwort: ["in_bearbeitung", "rueckfrage", "stornierung_beantragt"],
  stornierung_beantragt: ["storniert", "in_bearbeitung"],

  // Terminal
  storniert: [],

  // Refund flow
  rueckerstattung_ausstehend: ["rueckerstattung_abgeschlossen"],
  rueckerstattung_abgeschlossen: [],
};

/**
 * Statuses that require a comment when transitioning to them.
 * Note: storniert is NOT included -- it uses the dedicated stornierung_grund field instead.
 * Note: stornierung_beantragt -> in_bearbeitung (rejection) requires a comment,
 * handled separately in anfragen.ts beforeChange hook (source-specific rule).
 */
export const COMMENT_REQUIRED: string[] = [
  "rueckfrage",
  "abgelehnt",
  "hersteller_problem",
  "reklamation",
  "wieder_geoeffnet",
];

/**
 * Check if a status transition is valid.
 */
export function isValidTransition(from: string, to: string): boolean {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

/**
 * Get the list of valid next statuses from a given status.
 */
export function getNextStatuses(current: string): string[] {
  return VALID_TRANSITIONS[current] || [];
}
