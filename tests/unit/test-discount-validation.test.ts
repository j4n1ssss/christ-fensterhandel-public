import { validateDiscountCode, type DiscountResult } from '@/lib/anfrage/discount-validator'

describe('validateDiscountCode', () => {
  it('returns ungueltig if rabatt is null', () => {
    const result = validateDiscountCode(null, 500)
    expect(result).toEqual({ valid: false, error: 'ungueltig' })
  })

  it('returns abgelaufen if past gueltig_bis', () => {
    const rabatt = {
      id: 'r-1',
      code: 'EXPIRED',
      typ: 'prozent' as const,
      wert: 10,
      aktiv: true,
      gueltig_bis: '2020-01-01',
      gueltig_von: null,
      min_bestellwert: null,
      max_nutzungen: null,
      aktuelle_nutzungen: 0,
    }
    const result = validateDiscountCode(rabatt, 500)
    expect(result).toEqual({ valid: false, error: 'abgelaufen' })
  })

  it('returns aufgebraucht if max_nutzungen reached', () => {
    const rabatt = {
      id: 'r-2',
      code: 'USED',
      typ: 'prozent' as const,
      wert: 10,
      aktiv: true,
      gueltig_bis: '2030-12-31',
      gueltig_von: null,
      min_bestellwert: null,
      max_nutzungen: 5,
      aktuelle_nutzungen: 5,
    }
    const result = validateDiscountCode(rabatt, 500)
    expect(result).toEqual({ valid: false, error: 'aufgebraucht' })
  })

  it('returns min_bestellwert if subtotal below minimum', () => {
    const rabatt = {
      id: 'r-3',
      code: 'MINORDER',
      typ: 'prozent' as const,
      wert: 10,
      aktiv: true,
      gueltig_bis: '2030-12-31',
      gueltig_von: null,
      min_bestellwert: 1000,
      max_nutzungen: null,
      aktuelle_nutzungen: 0,
    }
    const result = validateDiscountCode(rabatt, 500)
    expect(result).toEqual({ valid: false, error: 'min_bestellwert', minWert: 1000 })
  })

  it('returns valid for a prozent discount', () => {
    const rabatt = {
      id: 'r-4',
      code: 'SOMMER2026',
      typ: 'prozent' as const,
      wert: 10,
      aktiv: true,
      gueltig_bis: '2030-12-31',
      gueltig_von: null,
      min_bestellwert: null,
      max_nutzungen: 100,
      aktuelle_nutzungen: 5,
    }
    const result = validateDiscountCode(rabatt, 500)
    expect(result).toEqual({ valid: true, code: 'SOMMER2026', typ: 'prozent', wert: 10 })
  })

  it('returns valid for a festbetrag discount', () => {
    const rabatt = {
      id: 'r-5',
      code: 'FLAT50',
      typ: 'festbetrag' as const,
      wert: 50,
      aktiv: true,
      gueltig_bis: null,
      gueltig_von: null,
      min_bestellwert: null,
      max_nutzungen: null,
      aktuelle_nutzungen: 0,
    }
    const result = validateDiscountCode(rabatt, 500)
    expect(result).toEqual({ valid: true, code: 'FLAT50', typ: 'festbetrag', wert: 50 })
  })

  it('accepts discount with no gueltig_bis set', () => {
    const rabatt = {
      id: 'r-6',
      code: 'FOREVER',
      typ: 'prozent' as const,
      wert: 5,
      aktiv: true,
      gueltig_bis: null,
      gueltig_von: null,
      min_bestellwert: null,
      max_nutzungen: null,
      aktuelle_nutzungen: 0,
    }
    const result = validateDiscountCode(rabatt, 100)
    expect(result).toEqual({ valid: true, code: 'FOREVER', typ: 'prozent', wert: 5 })
  })
})
