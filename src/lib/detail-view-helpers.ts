/**
 * Helper functions for admin detail view.
 *
 * Pure data module: no "use client", no React imports.
 * Provides wartezeit computation, urgency levels, produkt-zusammenfassung,
 * and terminal/completed/details-tab status detection.
 */

// --- Types ---

export type UrgencyLevel = "normal" | "warn" | "urgent" | "critical";

// --- Constants ---

export const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  normal: "",
  warn: "#eab308",
  urgent: "#f97316",
  critical: "#ef4444",
};

// --- Wartezeit ---

export function getWaitingDays(lastStatusChangeAt: string | null): number {
  if (!lastStatusChangeAt) return 0;
  return Math.floor(
    (Date.now() - new Date(lastStatusChangeAt).getTime()) / 86_400_000,
  );
}

export function getUrgencyLevel(days: number): UrgencyLevel {
  if (days < 1) return "normal";
  if (days < 3) return "warn";
  if (days < 7) return "urgent";
  return "critical";
}

// --- Produkt-Zusammenfassung ---

export function getProduktZusammenfassung(
  produkte: Array<{ produkttyp?: string; stueckzahl?: number }>,
): string {
  const grouped: Record<string, number> = {};
  for (const p of produkte) {
    const typ = p.produkttyp || "Produkt";
    grouped[typ] = (grouped[typ] || 0) + (p.stueckzahl || 1);
  }
  return Object.entries(grouped)
    .map(([typ, count]) => `${count}x ${typ}`)
    .join(", ");
}

// --- Status detection ---

export function isTerminalStatus(status: string): boolean {
  return status === "storniert";
}

export function isCompletedStatus(status: string): boolean {
  return status === "abgeschlossen";
}

export const HERSTELLER_STATUSES = [
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

export function shouldShowDetailsTab(status: string): boolean {
  return HERSTELLER_STATUSES.includes(status) || status === "storniert";
}
