/**
 * Pirsch Analytics — Custom Event Tracking.
 *
 * Pirsch lädt sein globales `pirsch()` via <Script> im Frontend-Layout.
 * Wir wrappen den Aufruf SSR-safe und fangen alle Fehler ab — Tracking
 * darf die App niemals blockieren oder werfen.
 *
 * Pirsch-Doku zur Custom-Event-API: https://docs.pirsch.io/api/events
 */

type EventMeta = Record<string, string | number>;

type PirschOptions = {
  meta?: EventMeta;
  duration?: number;
};

declare global {
  interface Window {
    pirsch?: (name: string, options?: PirschOptions) => void;
  }
}

/**
 * Liste aller getrackter Events.
 * Zentral typisiert, damit Tippfehler im Code (nicht im Pirsch-Dashboard)
 * gefunden werden.
 */
export type TrackEventName =
  // Tier 1 — Conversion-Funnel
  | "Konfigurator gestartet"
  | "Konfigurator Schritt abgeschlossen"
  | "Konfigurator abgeschlossen"
  | "Anfrage abgeschickt"
  | "Anfrage Fehler"
  // Tier 2 — Auth & Bestand
  | "Registrierung abgeschlossen"
  | "Login erfolgreich"
  | "Passwort zurückgesetzt"
  | "Bestellung verfolgt"
  // Tier 3 — Zahlung & Angebot
  | "Angebot angenommen"
  | "Zahlung gestartet"
  | "Zahlung erfolgreich"
  | "Zahlung abgebrochen"
  // Tier 4 — Engagement
  | "Telefon geklickt"
  | "E-Mail geklickt"
  | "Reklamation abgeschickt"
  | "Rückfrage abgeschickt"
  | "Partnerschaft Anfrage";

/**
 * Custom Event an Pirsch senden.
 *
 * Wichtig:
 * — Niemals PII in `meta` (kein Name, E-Mail, Telefon, Adresse).
 * — Beträge runden (z.B. auf 100er-Schritte), keine exakten Werte.
 * — Bei Conversion-Events mit Wert: `revenue` + `currency` setzen.
 */
export function trackEvent(name: TrackEventName, meta?: EventMeta): void {
  if (typeof window === "undefined") return;
  if (typeof window.pirsch !== "function") return;
  try {
    window.pirsch(name, meta ? { meta } : undefined);
  } catch {
    // Tracking darf NIE die App brechen.
  }
}

/**
 * Conversion-Event mit Revenue an Pirsch senden.
 * Pirsch summiert `revenue` pro Event-Name und zeigt es als Conversion-Wert.
 *
 * @param valueCents Betrag in Cents (wird intern zu EUR-Werten gerundet auf 100er-Schritte)
 */
export function trackRevenue(
  name: TrackEventName,
  valueCents: number,
  meta?: EventMeta,
): void {
  const euros = Math.max(0, Math.round(valueCents / 100));
  // Auf 100er-EUR-Schritte runden — keine Re-Identifizierung möglich.
  const rounded = Math.round(euros / 100) * 100;
  trackEvent(name, {
    ...(meta ?? {}),
    revenue: rounded,
    currency: "EUR",
  });
}
