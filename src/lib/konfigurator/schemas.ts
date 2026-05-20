import { z } from 'zod'
import type { Profile } from '@/payload-types'

/**
 * Context for dynamic schema generation.
 * Step 7 (Masse) needs the selected profile's min/max constraints.
 */
interface SchemaContext {
  profil?: Profile
}

/**
 * Get Zod validation schema for a given step.
 *
 * Most steps use simple UUID string validation.
 * Step 7 (Masse) has dynamic min/max from the selected profile.
 */
export function getStepSchema(
  step: number,
  context?: SchemaContext
): z.ZodSchema {
  switch (step) {
    case 1:
      return z.object({
        produkttyp: z.string().min(1, 'Produkttyp ist erforderlich'),
      })

    case 2:
      return z.object({
        material: z.string().min(1, 'Material ist erforderlich'),
      })

    case 3:
      return z.object({
        profil: z.string().min(1, 'Profil ist erforderlich'),
      })

    case 4:
      return z.object({
        fluegelanzahl: z.string().min(1, 'Flügelanzahl ist erforderlich'),
        zusatzlichter: z.array(z.string()).optional(),
      })

    case 5:
      return z.object({
        oeffnungsarten: z.array(
          z.object({
            wingIndex: z.number(),
            oeffnungsart: z.string().min(1, 'Öffnungsart ist erforderlich'),
            griffSeite: z.enum(['links', 'rechts']).nullable(),
          })
        ).min(1, 'Mindestens eine Öffnungsart ist erforderlich'),
      })

    case 6:
      return z.object({
        fensterform: z.string().min(1, 'Fensterform ist erforderlich'),
      })

    case 7: {
      const masse = context?.profil?.masse
      const minBreite = masse?.min_breite_mm ?? 300
      const maxBreite = masse?.max_breite_mm ?? 3000
      const minHoehe = masse?.min_hoehe_mm ?? 300
      const maxHoehe = masse?.max_hoehe_mm ?? 3000

      return z.object({
        breite: z
          .number()
          .int('Breite muss eine ganze Zahl sein')
          .min(minBreite, `Breite muss mindestens ${minBreite} mm sein`)
          .max(maxBreite, `Breite darf maximal ${maxBreite} mm sein`),
        hoehe: z
          .number()
          .int('Höhe muss eine ganze Zahl sein')
          .min(minHoehe, `Höhe muss mindestens ${minHoehe} mm sein`)
          .max(maxHoehe, `Höhe darf maximal ${maxHoehe} mm sein`),
      })
    }

    case 8:
      return z.object({
        farbeAussen: z.string().min(1, 'Außenfarbe ist erforderlich'),
        farbeInnen: z.string().min(1, 'Innenfarbe ist erforderlich'),
        dichtungsfarbe: z.string().min(1, 'Dichtungsfarbe ist erforderlich'),
        gleichWieAussen: z.boolean().optional(),
      })

    case 9:
      return z.object({
        verglasung: z.string().min(1, 'Verglasung ist erforderlich'),
        schallschutz: z.string().nullable().optional(),
        sicherheitsglas: z.string().nullable().optional(),
        glasdekor: z.string().nullable().optional(),
        sprossen: z.string().nullable().optional(),
        extras: z.array(z.string()).optional(),
      })

    case 10:
      // Summary step — no validation needed
      return z.object({})

    default:
      return z.object({})
  }
}
