import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/kunden/storno
 *
 * Customer-facing endpoint for requesting a Stornierung.
 * Accepts JSON with anfrageId + begruendung.
 * Validates status is not in excluded list, updates anfrage status
 * to stornierung_beantragt, stores begruendung, creates StatusHistorie,
 * queues staff email.
 *
 * Only for logged-in customers (dashboard). No CSRF (public route).
 * Rate limited: 5/min per IP.
 */

const stornoSchema = z.object({
  anfrageId: z.string().min(1),
  begruendung: z.string().min(10, "Mindestens 10 Zeichen erforderlich"),
});

/** Statuses where Stornierung is NOT possible */
const EXCLUDED_STATUSES = [
  "storniert",
  "abgelehnt",
  "abgeschlossen",
  "geliefert",
  "rueckerstattung_ausstehend",
  "rueckerstattung_abgeschlossen",
] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = stornoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Ungueltige Eingaben",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    // Rate limiting
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const { allowed } = checkRateLimit(`kunden-storno:${ip}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json(
        {
          error: "Zu viele Anfragen. Bitte versuchen Sie es spaeter erneut.",
        },
        { status: 429 },
      );
    }

    // Dynamic Payload import
    const { getPayload } = await import("payload");
    const payloadConfig = (await import("@payload-config")).default;
    const payload = await getPayload({ config: payloadConfig });

    // Load anfrage
    const anfrage = await payload.findByID({
      collection: "anfragen",
      id: parsed.data.anfrageId,
      depth: 0,
    });

    const currentStatus = (anfrage as any).status;

    // Validate status is not in excluded list
    if (
      EXCLUDED_STATUSES.includes(
        currentStatus as (typeof EXCLUDED_STATUSES)[number],
      )
    ) {
      return NextResponse.json(
        {
          error: "Stornierung ist fuer diesen Status nicht moeglich.",
        },
        { status: 400 },
      );
    }

    // Extract contact info for email
    const kontaktdaten = (anfrage as any).kontaktdaten || {};
    const kontaktEmail = kontaktdaten.email || "";

    // Update anfrage: set status + stornierung_grund
    await payload.update({
      collection: "anfragen",
      id: parsed.data.anfrageId,
      data: {
        status: "stornierung_beantragt",
        stornierung_grund: parsed.data.begruendung,
      } as any,
    });

    // Create StatusHistorie entry
    await payload.create({
      collection: "status_historie" as any,
      data: {
        anfrage: parsed.data.anfrageId,
        von_status: currentStatus,
        zu_status: "stornierung_beantragt",
        zeitpunkt: new Date().toISOString(),
        kommentar: `Stornierung beantragt: ${parsed.data.begruendung}`,
      },
    });

    // Queue email event for staff notification
    const { queueEmailEvent } = await import("@/lib/email/queue");
    await queueEmailEvent({
      eventType: "stornierung_beantragt",
      anfrageId: parsed.data.anfrageId,
      anfrageNummer: (anfrage as any).anfrage_nummer || "",
      status: "stornierung_beantragt",
      statusAlt: currentStatus,
      kunde: {
        vorname: kontaktdaten.vorname || "",
        nachname: kontaktdaten.nachname || "",
        email: kontaktEmail,
      },
      produkte: ((anfrage as any).produkte || []).map((p: any) => ({
        produkttyp: p.produkttyp || "",
        stueckzahl: p.stueckzahl || 1,
        einzelpreis: p.einzelpreis || 0,
      })),
      gesamtbetragCents: (anfrage as any).gesamtpreis || 0,
      zusatzDaten: {
        begruendung: parsed.data.begruendung,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Kunden Storno] Error:", error);
    return NextResponse.json(
      {
        error:
          "Anfrage fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.",
      },
      { status: 500 },
    );
  }
}
