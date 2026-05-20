import type { BasePayload, CollectionSlug } from 'payload'

export async function findBySlug(
  payload: BasePayload,
  collection: CollectionSlug,
  slug: string,
): Promise<string> {
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (result.docs.length === 0) {
    throw new Error(`No document found in ${collection} with slug "${slug}"`)
  }
  return result.docs[0].id as string
}

export async function findMultipleBySlugs(
  payload: BasePayload,
  collection: CollectionSlug,
  slugs: string[],
): Promise<string[]> {
  const ids: string[] = []
  for (const slug of slugs) {
    const id = await findBySlug(payload, collection, slug)
    ids.push(id)
  }
  return ids
}

export async function clearCollection(
  payload: BasePayload,
  collection: CollectionSlug,
): Promise<void> {
  const result = await payload.find({
    collection,
    limit: 1000,
    pagination: false,
  })
  for (const doc of result.docs) {
    try {
      await payload.delete({
        collection,
        id: doc.id,
      })
    } catch {
      // Some collections may have delete access control (e.g. status_historie)
      console.log(`  Skipped deletion in ${collection} (access control)`)
    }
  }
}

export async function clearAllCollections(payload: BasePayload): Promise<void> {
  // Clear in reverse dependency order
  const collectionsInOrder: CollectionSlug[] = [
    'status_historie',
    'anfragen',
    'preisregeln',
    'rabattcodes',
    'fensterformen',
    'zusatzlichter',
    'extras',
    'sprossen',
    'glasdekore',
    'sicherheitsglas',
    'schallschutz',
    'verglasungen',
    'farben',
    'dichtungsfarben',
    'fluegelanzahl',
    'oeffnungsarten',
    'profile',
    'materialien',
    'produkttypen',
  ]

  for (const collection of collectionsInOrder) {
    console.log(`Clearing ${collection}...`)
    await clearCollection(payload, collection)
  }
}
