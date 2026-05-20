/**
 * Shared currency formatting utility.
 *
 * Formats amounts in German locale with EUR currency.
 * Extracted from anfrage-detail-view.tsx for reuse across admin and kunden components.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "\u2014";
  return formatCurrency(price);
}

/**
 * Format integer cents to localized currency string.
 * Example: formatCents(12345) -> "123,45 \u20ac"
 * Example: formatCents(12345, 'USD') -> "$123.45" or "123,45 $"
 */
export function formatCents(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/**
 * Format Netto + Brutto from cents with MwSt.
 * Returns: "915,00 € netto (1.088,85 € brutto)"
 */
export function formatNettoBrutto(nettoCents: number, mwstRate = 19): string {
  const bruttoCents = Math.round(nettoCents * (1 + mwstRate / 100));
  return `${formatCents(nettoCents)} netto (${formatCents(bruttoCents)} brutto)`;
}
