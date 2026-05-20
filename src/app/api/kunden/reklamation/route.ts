import { NextResponse } from "next/server";
import { z } from "zod";
import {
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  MAX_REKLAMATION_FILES,
} from "@/lib/upload-constants";

/**
 * POST /api/kunden/reklamation
 *
 * Customer-facing endpoint for submitting a Reklamation (complaint).
 * Accepts FormData with beschreibung text + optional photo attachments.
 * Validates status is geliefert/abgeschlossen, uploads photos to Media,
 * creates Reklamation entry, updates anfrage status to reklamation, queues email.
 *
 * Serves both logged-in users AND guests. No CSRF (public route).
 * Rate limited: 5/min per IP.
 */

const reklamationSchema = z.object({
  anfrageId: z.string().min(1),
  beschreibung: z.string().min(20, "Mindestens 20 Zeichen erforderlich"),
});

export async function POST(request: Request) {
  try {
    // Parse FormData
    const formData = await request.formData();
    const anfrageId = formData.get("anfrageId") as string | null;
    const beschreibung = formData.get("beschreibung") as string | null;
    const fotos = formData.getAll("fotos") as File[];

    // Validate text fields with Zod
    const parsed = reklamationSchema.safeParse({ anfrageId, beschreibung });
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
    if (fotos.length > MAX_REKLAMATION_FILES) {
      return NextResponse.json(
        { error: "Maximal 5 Dateien erlaubt." },
        { status: 400 },
      );
    }

    for (const foto of fotos) {
      if (foto.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Datei zu gross. Maximale Dateigroesse ist 10 MB." },
          { status: 400 },
        );
      }
      if (
        !ALLOWED_FILE_TYPES.includes(
          foto.type as (typeof ALLOWED_FILE_TYPES)[number],
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
    const { allowed } = checkRateLimit(`kunden-reklamation:${ip}`, 5, 60_000);
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

    // Validate status: must be geliefert or abgeschlossen
    if (
      (anfrage as any).status !== "geliefert" &&
      (anfrage as any).status !== "abgeschlossen"
    ) {
      return NextResponse.json(
        {
          error:
            "Reklamation kann nur bei Status Geliefert oder Abgeschlossen eingereicht werden.",
        },
        { status: 400 },
      );
    }

    // Extract contact info for email
    const kontaktdaten = (anfrage as any).kontaktdaten || {};
    const kontaktEmail = kontaktdaten.email || "";
    const kontaktName =
      `${kontaktdaten.vorname || ""} ${kontaktdaten.nachname || ""}`.trim();

    // Upload photos to Media collection
    const mediaIds: string[] = [];
    for (const foto of fotos) {
      const buffer = Buffer.from(await foto.arrayBuffer());
      const media = await payload.create({
        collection: "media",
        data: {
          alt: `Reklamation Foto - Anfrage ${(anfrage as any).anfrage_nummer || parsed.data.anfrageId}`,
        },
        file: {
          data: buffer,
          mimetype: foto.type,
          name: foto.name,
          size: foto.size,
        },
      });
      mediaIds.push(media.id);
    }

    // Create Reklamation entry
    await payload.create({
      collection: "reklamationen" as any,
      data: {
        anfrage: parsed.data.anfrageId,
        beschreibung: parsed.data.beschreibung,
        fotos: mediaIds.length > 0 ? mediaIds : undefined,
        status: "offen",
      },
    });

    // Update Anfrage status to reklamation
    await payload.update({
      collection: "anfragen",
      id: parsed.data.anfrageId,
      data: { status: "reklamation" } as any,
    });

    // Queue email event for reklamation
    const { queueEmailEvent } = await import("@/lib/email/queue");
    await queueEmailEvent({
      eventType: "reklamation",
      anfrageId: parsed.data.anfrageId,
      anfrageNummer: (anfrage as any).anfrage_nummer || "",
      status: "reklamation",
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
        beschreibung: parsed.data.beschreibung,
        fotos_anzahl: mediaIds.length,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Kunden Reklamation] Error:", error);
    return NextResponse.json(
      {
        error:
          "Uebermittlung fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.",
      },
      { status: 500 },
    );
  }
}
