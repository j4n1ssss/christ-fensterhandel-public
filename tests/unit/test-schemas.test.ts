import { getStepSchema } from '@/lib/konfigurator/schemas'
import type { Profile } from '@/payload-types'

describe('getStepSchema', () => {
  describe('Step 7 - Maße validation', () => {
    const mockProfil: Partial<Profile> = {
      id: 'prof-iglo5',
      masse: {
        min_breite_mm: 500,
        max_breite_mm: 2000,
        min_hoehe_mm: 500,
        max_hoehe_mm: 2500,
      },
    }

    it('accepts valid dimensions within min/max range', () => {
      const schema = getStepSchema(7, { profil: mockProfil as Profile })
      const result = schema.safeParse({ breite: 1000, hoehe: 1200 })
      expect(result.success).toBe(true)
    })

    it('rejects breite below minimum', () => {
      const schema = getStepSchema(7, { profil: mockProfil as Profile })
      const result = schema.safeParse({ breite: 400, hoehe: 1200 })
      expect(result.success).toBe(false)
    })

    it('rejects hoehe above maximum', () => {
      const schema = getStepSchema(7, { profil: mockProfil as Profile })
      const result = schema.safeParse({ breite: 1000, hoehe: 3000 })
      expect(result.success).toBe(false)
    })

    it('rejects non-integer values', () => {
      const schema = getStepSchema(7, { profil: mockProfil as Profile })
      const result = schema.safeParse({ breite: 1000.5, hoehe: 1200 })
      expect(result.success).toBe(false)
    })

    it('accepts boundary values (min and max)', () => {
      const schema = getStepSchema(7, { profil: mockProfil as Profile })
      const resultMin = schema.safeParse({ breite: 500, hoehe: 500 })
      expect(resultMin.success).toBe(true)
      const resultMax = schema.safeParse({ breite: 2000, hoehe: 2500 })
      expect(resultMax.success).toBe(true)
    })
  })

  describe('Step 1 - Simple UUID selection', () => {
    it('accepts a valid UUID string', () => {
      const schema = getStepSchema(1)
      const result = schema.safeParse({ produkttyp: '550e8400-e29b-41d4-a716-446655440000' })
      expect(result.success).toBe(true)
    })

    it('rejects empty string', () => {
      const schema = getStepSchema(1)
      const result = schema.safeParse({ produkttyp: '' })
      expect(result.success).toBe(false)
    })
  })
})
