import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";

const requestSchema = z.object({
  anfrage_nummer: z.string().min(1, "Anfrage-Nr. ist erforderlich"),
  email: z.email("Bitte gültige E-Mail-Adresse eingeben"),
});

/**
 * POST /api/status-pruefen
 * Public endpoint for guest status checking.
 * Accepts { anfrage_nummer, email } and returns Anfrage status + timeline.
 * Does NOT return kontaktdaten, interne_notizen, or geaendert_von.
 */
async function _POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          found: false,
          error: parsed.error.issues[0]?.message || "Ungültige Eingabe",
        },
        { status: 400 },
      );
    }

    const { anfrage_nummer, email } = parsed.data;
    const payload = await getPayload({ config });

    // Find matching Anfrage by anfrage_nummer + email
    const { docs } = await payload.find({
      collection: "anfragen",
      where: {
        anfrage_nummer: { equals: anfrage_nummer },
        "kontaktdaten.email": { equals: email },
      },
      limit: 1,
    });

    if (docs.length === 0) {
      return NextResponse.json({ found: false });
    }

    const anfrage = docs[0];

    // Fetch StatusHistorie for the Anfrage
    const { docs: statusHistorie } = await payload.find({
      collection: "status_historie",
      where: {
        anfrage: { equals: anfrage.id },
      },
      sort: "zeitpunkt",
      limit: 100,
    });

    // Return safe data — NO kontaktdaten, NO interne_notizen, NO geaendert_von
    return NextResponse.json({
      found: true,
      status: anfrage.status,
      anfrage_nummer: anfrage.anfrage_nummer,
      produkte_count: anfrage.produkte?.length ?? 0,
      gesamtpreis: anfrage.gesamtpreis,
      zeitpunkt: anfrage.createdAt,
      timeline: statusHistorie.map((entry) => ({
        von_status: entry.von_status,
        zu_status: entry.zu_status,
        zeitpunkt: entry.zeitpunkt,
        kommentar: entry.kommentar || null,
      })),
    });
  } catch {
    return NextResponse.json(
      { found: false, error: "Interner Fehler" },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(_POST, {
  limit: 10,
  windowMs: 60_000,
  keyPrefix: "status-check",
});
