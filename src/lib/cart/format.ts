/**
 * EUR formatting and MwSt calculation helpers.
 */

const eurFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

/**
 * Format a number as German EUR currency string.
 * Example: 1234.5 -> "1.234,50 EUR"
 */
export function formatEUR(amount: number): string {
  return eurFormatter.format(amount)
}

/**
 * Calculate MwSt (VAT) from a netto amount.
 * Returns mwst amount and brutto total, rounded to cents.
 */
export function calculateMwSt(
  netto: number,
  rate: number = 0.19,
): { mwst: number; brutto: number } {
  const mwst = Math.round(netto * rate * 100) / 100
  const brutto = Math.round((netto + mwst) * 100) / 100
  return { mwst, brutto }
}
