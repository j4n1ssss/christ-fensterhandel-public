import type { BasePayload } from 'payload'

/**
 * Generate a sequential Anfrage number in the format ANF-YYYY-NNN.
 *
 * Queries the anfragen collection for the latest number in the current year,
 * then increments by 1. First anfrage of the year starts at 001.
 *
 * @param payload - Payload instance for database queries
 * @returns Generated anfrage number string (e.g. "ANF-2026-001")
 */
export async function generateAnfrageNummer(
  payload: BasePayload
): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `ANF-${year}-`

  // Query for the latest anfrage in the current year
  const result = await payload.find({
    collection: 'anfragen' as any,
    where: {
      anfrage_nummer: {
        like: `${prefix}%`,
      },
    },
    sort: '-anfrage_nummer',
    limit: 1,
  })

  let nextNumber = 1

  if (result.docs.length > 0) {
    const lastNummer = (result.docs[0] as any).anfrage_nummer as string
    const lastNumberStr = lastNummer.replace(prefix, '')
    const lastNumber = parseInt(lastNumberStr, 10)
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1
    }
  }

  // Pad to at least 3 digits
  const padded = String(nextNumber).padStart(3, '0')
  return `${prefix}${padded}`
}
