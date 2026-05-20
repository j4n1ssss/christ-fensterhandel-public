import { NextResponse } from "next/server";
import { z } from "zod";
import {
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  MAX_RUECKFRAGE_FILES,
} from "@/lib/upload-constants";

/**
 * POST /api/kunden/antwort
 *
 * Customer-facing endpoint for answering a Rueckfrage.
 * Accepts FormData with message text + optional file attachments.
 * Validates status=rueckfrage, uploads files to Media, creates StatusHistorie,
 * updates anfrage status to kundenantwort, queues staff email.
 *
 * Serves both logged-in users AND guests. No CSRF (public route).
 * Rate limited: 5/min per IP.
 */

const antwortSchema = z.object({
  anfrageId: z.string().min(1),
  nachricht: z.string().min(10, "Mindestens 10 Zeichen erforderlich"),
});

export async function POST(request: Request) {
  try {
    // Parse FormData
    const formData = await request.formData();
    const anfrageId = formData.get("anfrageId") as string | null;
    const nachricht = formData.get("nachricht") as string | null;
    const dateien = formData.getAll("dateien") as File[];

    // Validate text fields with Zod
    const parsed = antwortSchema.safeParse({ anfrageId, nachricht });
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Ungueltige Eingaben",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    // Validate files
    if (dateien.length > MAX_RUECKFRAGE_FILES) {
      return NextResponse.json(
        { error: "Maximal 3 Dateien erlaubt." },
        { status: 400 },
      );
    }

    for (const datei of dateien) {
      if (datei.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Datei zu gross. Maximale Dateigroesse ist 10 MB." },
          { status: 400 },
        );
      }
      if (
        !ALLOWED_FILE_TYPES.includes(
          datei.type as (typeof ALLOWED_FILE_TYPES)[number],
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Nur Bilder (JPEG, PNG, WebP, HEIC) und PDF-Dateien erlaubt.",
          },
          { status: 400 },
        );
      }
    }

    // Rate limiting
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const { allowed } = checkRateLimit(`kunden-antwort:${ip}`, 5, 60_000);
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

    // Validate status is rueckfrage
    if ((anfrage as any).status !== "rueckfrage") {
      return NextResponse.json(
        {
          error: "Antwort kann nur bei Status Rueckfrage gesendet werden.",
        },
        { status: 400 },
      );
    }

    // Extract contact info for email
    const kontaktdaten = (anfrage as any).kontaktdaten || {};
    const kontaktEmail = kontaktdaten.email || "";
    const kontaktName =
      `${kontaktdaten.vorname || ""} ${kontaktdaten.nachname || ""}`.trim();

    // Upload files to Media collection
    const mediaIds: string[] = [];
    for (const datei of dateien) {
      const buffer = Buffer.from(await datei.arrayBuffer());
      const media = await payload.create({
        collection: "media",
        data: {
          alt: `Anhang zu Anfrage ${(anfrage as any).anfrage_nummer || parsed.data.anfrageId}`,
        },
        file: {
          data: buffer,
          mimetype: datei.type,
          name: datei.name,
          size: datei.size,
        },
      });
      mediaIds.push(media.id);
    }

    // Build kommentar with email prefix for traceability
    const kommentar = kontaktEmail
      ? `Kundenantwort von ${kontaktEmail}: ${parsed.data.nachricht}`
      : parsed.data.nachricht;

    // Create StatusHistorie entry
    await payload.create({
      collection: "status_historie" as any,
      data: {
        anfrage: parsed.data.anfrageId,
        von_status: "rueckfrage",
        zu_status: "kundenantwort",
        zeitpunkt: new Date().toISOString(),
        kommentar,
        ...(mediaIds.length > 0 ? { anhaenge: mediaIds } : {}),
      },
    });

    // Update anfrage status to kundenantwort
    await payload.update({
      collection: "anfragen",
      id: parsed.data.anfrageId,
      data: { status: "kundenantwort" } as any,
    });

    // Queue email event for staff notification
    const { queueEmailEvent } = await import("@/lib/email/queue");
    await queueEmailEvent({
      eventType: "kundenantwort",
      anfrageId: parsed.data.anfrageId,
      anfrageNummer: (anfrage as any).anfrage_nummer || "",
      status: "kundenantwort",
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
        nachricht: parsed.data.nachricht,
        anhaenge_anzahl: mediaIds.length,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Kunden Antwort] Error:", error);
    return NextResponse.json(
      {
        error:
          "Uebermittlung fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.",
      },
      { status: 500 },
    );
  }
}
