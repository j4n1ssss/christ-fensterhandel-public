import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { isSameOriginOrReferer } from '@/lib/security'

/**
 * POST /api/admin/anonymize-customer
 * Admin-only endpoint to anonymize customer data (DSGVO right to deletion).
 * Accepts either a user `customerId` (UUID) or an `anfrageId` (UUID).
 * Replaces kontaktdaten with 'GELÖSCHT' on relevant Anfragen;
 * If a matching user is found, anonymizes the user as well.
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF: enforce same-origin for cookie-authenticated POST
    if (!isSameOriginOrReferer(request)) {
      return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
    }
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })

    // Auth check: admin only
    if (!user || user.rolle !== 'admin') {
      return NextResponse.json(
        { error: 'Nur Admins können Kundendaten anonymisieren' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const schema = z
      .object({
        customerId: z.string().uuid().optional(),
        anfrageId: z.string().uuid().optional(),
        // Backwards compatibility with older client sending snake_case
        anfrage_id: z.string().uuid().optional(),
      })
      .refine((d) => d.customerId || d.anfrageId || d.anfrage_id, {
        message: 'customerId oder anfrageId erforderlich',
      })
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 })
    }
    const customerId = parsed.data.customerId
    const anfrageId = parsed.data.anfrageId || parsed.data.anfrage_id

    let originalEmail: string | null = null
    let anonymizedAnfragen = 0
    let anonymizedUser = false

    if (customerId) {
      // Primary path: anonymize by customer ID
      const originalUser = await payload.findByID({ collection: 'users', id: customerId })
      if (!originalUser) {
        return NextResponse.json(
          { error: 'Benutzer nicht gefunden' },
          { status: 404 },
        )
      }
      originalEmail = originalUser.email || null

      // Anonymize Users record
      await payload.update({
        collection: 'users',
        id: customerId,
        data: {
          email: `geloescht-${customerId}@anonymisiert.local`,
          vorname: 'GELÖSCHT',
          nachname: 'GELÖSCHT',
        } as any,
      })
      anonymizedUser = true
    }

    if (!originalEmail && anfrageId) {
      // Fallback path: find Anfrage and infer email
      const anfrage = await payload.findByID({ collection: 'anfragen', id: anfrageId })
      if (!anfrage) {
        return NextResponse.json(
          { error: 'Anfrage nicht gefunden' },
          { status: 404 },
        )
      }
      originalEmail = anfrage.kontaktdaten?.email || null

      // Anonymize this Anfrage immediately
      await payload.update({
        collection: 'anfragen',
        id: anfrage.id,
        data: {
          kontaktdaten: {
            vorname: 'GELÖSCHT',
            nachname: 'GELÖSCHT',
            email: 'GELÖSCHT',
            telefon: 'GELÖSCHT',
            strasse: 'GELÖSCHT',
            plz: 'GELÖSCHT',
            ort: 'GELÖSCHT',
            nachricht: 'GELÖSCHT',
          },
        } as any,
      })
      anonymizedAnfragen++
    }

    // If we have an originalEmail, anonymize all Anfragen with that email
    if (originalEmail) {
      const anfragen = await payload.find({
        collection: 'anfragen',
        where: { 'kontaktdaten.email': { equals: originalEmail } },
        limit: 1000,
      })
      for (const anfrage of anfragen.docs) {
        await payload.update({
          collection: 'anfragen',
          id: anfrage.id,
          data: {
            kontaktdaten: {
              vorname: 'GELÖSCHT',
              nachname: 'GELÖSCHT',
              email: 'GELÖSCHT',
              telefon: 'GELÖSCHT',
              strasse: 'GELÖSCHT',
              plz: 'GELÖSCHT',
              ort: 'GELÖSCHT',
              nachricht: 'GELÖSCHT',
            },
          } as any,
        })
        anonymizedAnfragen++
      }

      // If no customerId was provided, try to anonymize user by email
      if (!customerId) {
        const users = await payload.find({
          collection: 'users',
          where: { email: { equals: originalEmail } },
          limit: 1,
        })
        if (users.docs.length > 0) {
          const usr = users.docs[0]
          await payload.update({
            collection: 'users',
            id: usr.id,
            data: {
              email: `geloescht-${usr.id}@anonymisiert.local`,
              vorname: 'GELÖSCHT',
              nachname: 'GELÖSCHT',
            } as any,
          })
          anonymizedUser = true
        }
      }
    }

    return NextResponse.json({ success: true, anonymized_anfragen: anonymizedAnfragen, anonymized_user: anonymizedUser })
  } catch (error) {
    console.error('[anonymize-customer] Error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler bei der Anonymisierung' },
      { status: 500 },
    )
  }
}
