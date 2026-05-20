import type { CMSData, KonfiguratorSelections } from './types'

/**
 * Extract ID from a Payload relationship field value.
 * Payload can return either a string ID or a populated object.
 */
function matchId(
  fieldValue: string | { id: string } | null | undefined,
  selectionId: string | null
): boolean {
  if (!fieldValue || !selectionId) return false
  const id = typeof fieldValue === 'string' ? fieldValue : fieldValue.id
  return id === selectionId
}

/**
 * Find an item's aufpreis by ID in a CMS collection array.
 */
function findAufpreis(
  collection: Array<{ id: string; aufpreis?: number | null }>,
  selectedId: string | null
): number {
  if (!selectedId) return 0
  const item = collection.find((c) => c.id === selectedId)
  return item?.aufpreis ?? 0
}

/**
 * Calculate a preview price from configurator selections and CMS price rules.
 *
 * Formula: Base (area * grundpreis_pro_m2) + sum of aufpreise from options.
 * Returns 0 if no matching Preisregel or missing data.
 */
export function calculatePreviewPrice(
  selections: KonfiguratorSelections,
  cmsData: CMSData
): number {
  // Need at least produkttyp, material, profil, and masse to calculate
  if (
    !selections.produkttyp ||
    !selections.material ||
    !selections.profil ||
    !selections.masse
  ) {
    return 0
  }

  // Find matching Preisregel
  const regel = cmsData.preisregeln.find(
    (r) =>
      matchId(r.produkttyp, selections.produkttyp) &&
      matchId(r.material, selections.material) &&
      matchId(r.profil, selections.profil)
  )

  if (!regel) return 0

  // Calculate area in m2
  const flaeche =
    (selections.masse.breite * selections.masse.hoehe) / 1_000_000

  // Base price
  let preis = flaeche * regel.grundpreis_pro_m2

  // Add aufpreise from selected options
  preis += findAufpreis(cmsData.verglasungen, selections.verglasung)
  preis += findAufpreis(cmsData.schallschutz, selections.schallschutz)
  preis += findAufpreis(cmsData.sicherheitsglas, selections.sicherheitsglas)
  preis += findAufpreis(cmsData.glasdekore, selections.glasdekor)
  preis += findAufpreis(cmsData.sprossen, selections.sprossen)

  // Add aufpreise from farben
  preis += findAufpreis(cmsData.farben, selections.farbeAussen)
  preis += findAufpreis(cmsData.farben, selections.farbeInnen)

  // Add aufpreise from extras (multiple selection)
  for (const extraId of selections.extras) {
    preis += findAufpreis(cmsData.extras, extraId)
  }

  return Math.round(preis * 100) / 100
}
