import { snapshotItemSchema } from '@/lib/anfrage/schemas'

describe('snapshot structure', () => {
  const validSnapshot = {
    selections: {
      produkttyp: 'pt-fenster',
      material: 'mat-kunststoff',
      profil: 'prof-iglo5',
      fluegelanzahl: 'fl-1',
      zusatzlichter: [],
      oeffnungsarten: [{ wingIndex: 0, oeffnungsart: 'dreh-kipp', griffSeite: 'links' }],
      fensterform: 'ff-rechteck',
      masse: { breite: 1000, hoehe: 1200 },
      farbeAussen: 'farbe-weiss',
      farbeInnen: 'farbe-weiss',
      dichtungsfarbe: 'df-schwarz',
      gleichWieAussen: true,
      verglasung: 'vg-2fach',
      schallschutz: null,
      sicherheitsglas: null,
      glasdekor: null,
      sprossen: null,
      extras: ['ex-griff-edelstahl'],
    },
    resolvedNames: {
      produkttyp: 'Fenster',
      material: 'Kunststoff',
      profil: 'Iglo 5',
      fluegelanzahl: '1-flügelig',
      fensterform: 'Rechteck',
      masse: '1000 x 1200 mm',
      farbeAussen: 'Weiß',
      farbeInnen: 'Weiß',
      verglasung: '2-fach Verglasung',
    },
    serverPrice: 1234.56,
    quantity: 2,
  }

  it('validates a complete snapshot with all fields', () => {
    const result = snapshotItemSchema.safeParse(validSnapshot)
    expect(result.success).toBe(true)
  })

  it('requires serverPrice to be a number', () => {
    const bad = { ...validSnapshot, serverPrice: 'not-a-number' }
    const result = snapshotItemSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('requires quantity to be at least 1', () => {
    const bad = { ...validSnapshot, quantity: 0 }
    const result = snapshotItemSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('snapshot is JSON-serializable', () => {
    const json = JSON.stringify(validSnapshot)
    const parsed = JSON.parse(json)
    expect(parsed.selections.produkttyp).toBe('pt-fenster')
    expect(parsed.serverPrice).toBe(1234.56)
    expect(parsed.resolvedNames.material).toBe('Kunststoff')
  })

  it('snapshot contains both IDs and display names', () => {
    // Selections contain CMS IDs
    expect(validSnapshot.selections.produkttyp).toBe('pt-fenster')
    // ResolvedNames contain human-readable names
    expect(validSnapshot.resolvedNames.produkttyp).toBe('Fenster')
  })
})
