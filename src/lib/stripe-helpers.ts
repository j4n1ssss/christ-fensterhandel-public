/**
 * Stripe helper utilities for admin UI and shared logic.
 * Pure functions -- no Stripe SDK import, no server-only code.
 */

/** Payment status badge colors for admin panel (inline styles) */
export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  offen: "#f59e0b",
  bezahlt: "#22c55e",
  abgelaufen: "#ef4444",
  dispute: "#ef4444",
  rueckerstattet: "#8b5cf6",
  teilweise_erstattet: "#8b5cf6",
};

/** Payment status German labels */
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  offen: "Offen",
  bezahlt: "Bezahlt",
  abgelaufen: "Abgelaufen",
  dispute: "Dispute",
  rueckerstattet: "Rueckerstattet",
  teilweise_erstattet: "Teilweise erstattet",
};

/**
 * Build Stripe Dashboard URL for a given object.
 * Auto-detects test/live mode from STRIPE_SECRET_KEY prefix.
 */
export function getStripeDashboardUrl(
  objectType: "payments" | "customers",
  objectId: string,
): string {
  const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");
  const base = isTestMode
    ? "https://dashboard.stripe.com/test"
    : "https://dashboard.stripe.com";
  return `${base}/${objectType}/${objectId}`;
}

/** Statuses where the ZahlungsPanel is visible in admin */
export const ZAHLUNGS_PANEL_VISIBLE_STATUSES = [
  "zahlungslink_versendet",
  "bezahlt",
  "an_hersteller",
  "hersteller_bestaetigt",
  "hersteller_bestaetigt_mit_vorbehalt",
  "in_produktion",
  "hersteller_problem",
  "versandbereit",
  "geliefert",
  "abgeschlossen",
  "rueckerstattung_ausstehend",
  "rueckerstattung_abgeschlossen",
] as const;

/** Statuses where refund button is available (post-bezahlt, not already refunding) */
export const REFUND_ALLOWED_STATUSES = [
  "bezahlt",
  "an_hersteller",
  "hersteller_bestaetigt",
  "hersteller_bestaetigt_mit_vorbehalt",
  "in_produktion",
  "versandbereit",
  "geliefert",
  "abgeschlossen",
] as const;
