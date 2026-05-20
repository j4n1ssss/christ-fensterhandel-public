import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/angebot/annehmen
 *
 * Customer-facing endpoint for Angebots-Annahme. Validates status, Angebots-Gueltigkeit,
 * AGB acceptance, then creates a Stripe Checkout Session with flow metadata for
 * webhook expiry reset logic.
 *
 * Serves both logged-in users AND guests. No CSRF (public route).
 * Rate limited: 5/min per IP.
 */

const annehmenSchema = z.object({
  anfrageId: z.string().min(1),
  agb_akzeptiert: z.literal(true, {
    error: "AGB muessen akzeptiert werden",
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = annehmenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Ungueltige Eingaben",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    // Dynamic Payload import
    const { getPayload } = await import("payload");
    const payloadConfig = (await import("@payload-config")).default;
    const payload = await getPayload({ config: payloadConfig });

    // Rate limiting (inline, same pattern as /api/stripe/redirect/[anfrageId])
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const { allowed } = checkRateLimit(`angebot-annehmen:${ip}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json(
        {
          error: "Zu viele Anfragen. Bitte versuchen Sie es spaeter erneut.",
        },
        { status: 429 },
      );
    }

    // Load anfrage
    const anfrage = await payload.findByID({
      collection: "anfragen",
      id: parsed.data.anfrageId,
      depth: 1,
    });

    // Validate status is angebot_versendet
    if ((anfrage as any).status !== "angebot_versendet") {
      return NextResponse.json(
        {
          error:
            "Angebot kann nur angenommen werden wenn der Status 'Angebot versendet' ist.",
        },
        { status: 400 },
      );
    }

    // Find latest versendet Angebot for this anfrage
    const angeboteResult = await payload.find({
      collection: "angebote" as any,
      where: {
        anfrage: { equals: anfrage.id },
        status: { equals: "versendet" },
      },
      sort: "-version",
      limit: 1,
    });

    if (angeboteResult.docs.length === 0) {
      return NextResponse.json(
        { error: "Kein gültiges Angebot gefunden." },
        { status: 404 },
      );
    }

    const angebot = angeboteResult.docs[0] as any;

    // Validate Angebots-Gueltigkeit (end-of-day comparison)
    if (angebot.gueltig_bis) {
      const gueltigBis = new Date(angebot.gueltig_bis);
      // Set to end of day for fair comparison
      gueltigBis.setHours(23, 59, 59, 999);
      if (new Date() > gueltigBis) {
        return NextResponse.json(
          {
            error:
              "Das Angebot ist leider abgelaufen. Bitte kontaktieren Sie uns fuer ein neues Angebot.",
          },
          { status: 400 },
        );
      }
    }

    // Save AGB acceptance timestamp
    await payload.update({
      collection: "anfragen",
      id: anfrage.id,
      data: {
        agb_akzeptiert_bei_annahme_am: new Date().toISOString(),
      } as any,
    });

    // Create Stripe Checkout Session with flow metadata
    const { createCheckoutSession } = await import("@/lib/stripe");
    const kontaktdaten = (anfrage as any).kontaktdaten || {};

    const session = await createCheckoutSession({
      anfrageId: anfrage.id,
      anfrageNummer: (anfrage as any).anfrage_nummer || "",
      gesamtpreis: angebot.betrag_brutto_cents,
      produktAnzahl: ((anfrage as any).produkte || []).length,
      kundenEmail: kontaktdaten.email || "",
      kundenName:
        `${kontaktdaten.vorname || ""} ${kontaktdaten.nachname || ""}`.trim(),
      metadata: { flow: "angebots_annahme" },
    });

    // Update anfrage status to zahlungslink_versendet and store checkout fields
    await payload.update({
      collection: "anfragen",
      id: anfrage.id,
      data: {
        status: "zahlungslink_versendet",
        stripe_checkout_url: session.url,
        stripe_session_id: session.id,
        stripe_payment_status: "offen",
        stripe_expires_at: session.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : undefined,
      } as any,
    });

    return NextResponse.json({ checkout_url: session.url }, { status: 200 });
  } catch (error) {
    console.error("[Angebot Annehmen] Error:", error);
    return NextResponse.json(
      {
        error:
          "Angebot konnte nicht angenommen werden. Bitte erneut versuchen.",
      },
      { status: 500 },
    );
  }
}
