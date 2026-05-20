import { calculatePreviewPrice } from '@/lib/konfigurator/price-calculator'
import type { CMSData, KonfiguratorSelections } from '@/lib/konfigurator/types'
import type { Preisregeln, Verglasungen, Sprossen } from '@/payload-types'

const emptySelections: KonfiguratorSelections = {
  produkttyp: null,
  material: null,
  profil: null,
  fluegelanzahl: null,
  zusatzlichter: [],
  oeffnungsarten: [],
  fensterform: null,
  masse: null,
  farbeAussen: null,
  farbeInnen: null,
  dichtungsfarbe: null,
  gleichWieAussen: false,
  verglasung: null,
  schallschutz: null,
  sicherheitsglas: null,
  glasdekor: null,
  sprossen: null,
  extras: [],
}

function createMinimalCMSData(overrides: Partial<CMSData> = {}): CMSData {
  return {
    produkttypen: [],
    materialien: [],
    profile: [],
    fluegelanzahl: [],
    zusatzlichter: [],
    oeffnungsarten: [],
    fensterformen: [],
    farben: [],
    dichtungsfarben: [],
    verglasungen: [],
    schallschutz: [],
    sicherheitsglas: [],
    glasdekore: [],
    sprossen: [],
    extras: [],
    preisregeln: [],
    ...overrides,
  }
}

describe('calculatePreviewPrice', () => {
  it('calculates base price from area * grundpreis_pro_m2', () => {
    // 1000mm x 1200mm = 1.2 m2, 150 EUR/m2 = 180 EUR
    const preisregel: Preisregeln = {
      id: 'pr-1',
      name: 'Fenster Kunststoff Iglo5',
      produkttyp: 'pt-fenster',
      material: 'mat-kunststoff',
      profil: 'prof-iglo5',
      grundpreis_pro_m2: 150,
      aktiv: true,
      updatedAt: '',
      createdAt: '',
    }

    const cmsData = createMinimalCMSData({ preisregeln: [preisregel] })
    const selections: KonfiguratorSelections = {
      ...emptySelections,
      produkttyp: 'pt-fenster',
      material: 'mat-kunststoff',
      profil: 'prof-iglo5',
      masse: { breite: 1000, hoehe: 1200 },
    }

    const price = calculatePreviewPrice(selections, cmsData)
    expect(price).toBe(180)
  })

  it('adds aufpreis from verglasung', () => {
    const preisregel: Preisregeln = {
      id: 'pr-1',
      name: 'Test',
      produkttyp: 'pt-fenster',
      material: 'mat-kunststoff',
      profil: 'prof-iglo5',
      grundpreis_pro_m2: 150,
      aktiv: true,
      updatedAt: '',
      createdAt: '',
    }

    const verglasung: Verglasungen = {
      id: 'vg-1',
      name: '3-fach',
      slug: '3-fach',
      aufpreis: 50,
      aktiv: true,
      sortOrder: 0,
      updatedAt: '',
      createdAt: '',
    }

    const cmsData = createMinimalCMSData({
      preisregeln: [preisregel],
      verglasungen: [verglasung],
    })

    const selections: KonfiguratorSelections = {
      ...emptySelections,
      produkttyp: 'pt-fenster',
      material: 'mat-kunststoff',
      profil: 'prof-iglo5',
      masse: { breite: 1000, hoehe: 1200 },
      verglasung: 'vg-1',
    }

    const price = calculatePreviewPrice(selections, cmsData)
    expect(price).toBe(230) // 180 base + 50 aufpreis
  })

  it('returns 0 if no matching preisregel', () => {
    const cmsData = createMinimalCMSData()
    const selections: KonfiguratorSelections = {
      ...emptySelections,
      produkttyp: 'pt-fenster',
      material: 'mat-kunststoff',
      profil: 'prof-iglo5',
      masse: { breite: 1000, hoehe: 1200 },
    }

    const price = calculatePreviewPrice(selections, cmsData)
    expect(price).toBe(0)
  })

  it('returns 0 if masse is missing', () => {
    const preisregel: Preisregeln = {
      id: 'pr-1',
      name: 'Test',
      produkttyp: 'pt-fenster',
      material: 'mat-kunststoff',
      profil: 'prof-iglo5',
      grundpreis_pro_m2: 150,
      aktiv: true,
      updatedAt: '',
      createdAt: '',
    }

    const cmsData = createMinimalCMSData({ preisregeln: [preisregel] })
    const selections: KonfiguratorSelections = {
      ...emptySelections,
      produkttyp: 'pt-fenster',
      material: 'mat-kunststoff',
      profil: 'prof-iglo5',
      masse: null,
    }

    const price = calculatePreviewPrice(selections, cmsData)
    expect(price).toBe(0)
  })

  it('adds aufpreis from sprossen', () => {
    const preisregel: Preisregeln = {
      id: 'pr-1',
      name: 'Test',
      produkttyp: 'pt-fenster',
      material: 'mat-kunststoff',
      profil: 'prof-iglo5',
      grundpreis_pro_m2: 100,
      aktiv: true,
      updatedAt: '',
      createdAt: '',
    }

    const sprosse: Sprossen = {
      id: 'sp-1',
      name: 'Wiener Sprossen',
      slug: 'wiener',
      typ: 'wiener',
      aufpreis: 30,
      aktiv: true,
      sortOrder: 0,
      updatedAt: '',
      createdAt: '',
    }

    const cmsData = createMinimalCMSData({
      preisregeln: [preisregel],
      sprossen: [sprosse],
    })

    const selections: KonfiguratorSelections = {
      ...emptySelections,
      produkttyp: 'pt-fenster',
      material: 'mat-kunststoff',
      profil: 'prof-iglo5',
      masse: { breite: 1000, hoehe: 1000 }, // 1 m2 * 100 = 100 base
      sprossen: 'sp-1',
    }

    const price = calculatePreviewPrice(selections, cmsData)
    expect(price).toBe(130) // 100 base + 30 aufpreis
  })
})
