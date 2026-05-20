/**
 * Discount code validation result types.
 */
export type DiscountResult =
  | { valid: false; error: 'ungueltig' }
  | { valid: false; error: 'abgelaufen' }
  | { valid: false; error: 'aufgebraucht' }
  | { valid: false; error: 'min_bestellwert'; minWert: number }
  | { valid: true; code: string; typ: 'prozent' | 'festbetrag'; wert: number }

/**
 * Rabattcode data shape from Payload CMS.
 */
export interface RabattcodeData {
  id: string
  code: string
  typ: 'prozent' | 'festbetrag'
  wert: number
  aktiv: boolean
  gueltig_von: string | null
  gueltig_bis: string | null
  min_bestellwert: number | null
  max_nutzungen: number | null
  aktuelle_nutzungen: number
}

/**
 * Pure function to validate a discount code against business rules.
 * Validation chain (order matters):
 *   1. Code not found -> ungueltig
 *   2. Past gueltig_bis -> abgelaufen
 *   3. aktuelle_nutzungen >= max_nutzungen -> aufgebraucht
 *   4. subtotal < min_bestellwert -> min_bestellwert
 *   5. All passed -> valid
 */
export function validateDiscountCode(
  rabatt: RabattcodeData | null,
  subtotal: number
): DiscountResult {
  // 1. Not found
  if (!rabatt) {
    return { valid: false, error: 'ungueltig' }
  }

  // 2. Expired
  if (rabatt.gueltig_bis) {
    const expiryDate = new Date(rabatt.gueltig_bis)
    if (expiryDate < new Date()) {
      return { valid: false, error: 'abgelaufen' }
    }
  }

  // 3. Usage limit reached
  if (
    rabatt.max_nutzungen !== null &&
    rabatt.aktuelle_nutzungen >= rabatt.max_nutzungen
  ) {
    return { valid: false, error: 'aufgebraucht' }
  }

  // 4. Minimum order value
  if (
    rabatt.min_bestellwert !== null &&
    subtotal < rabatt.min_bestellwert
  ) {
    return { valid: false, error: 'min_bestellwert', minWert: rabatt.min_bestellwert }
  }

  // 5. Valid
  return {
    valid: true,
    code: rabatt.code,
    typ: rabatt.typ,
    wert: rabatt.wert,
  }
}
