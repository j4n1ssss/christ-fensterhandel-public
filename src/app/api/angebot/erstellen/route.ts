import { NextResponse } from "next/server";
import { z } from "zod";
import { calcNetFromGross, calcGrossFromNet } from "@/lib/tax";
import { withRateLimit } from "@/lib/rate-limit";
import { withCsrf } from "@/lib/security";

/**
 * POST /api/angebot/erstellen
 *
 * One-Click Angebots-Erstellung: Creates an Angebot, generates PDF with
 * optional custom pricing, updates anfrage status to angebot_versendet
 * (with _skip_auto_pdf guard), and queues email -- all in one atomic flow.
 *
 * Staff-only (admin + mitarbeiter). CSRF + rate limiting.
 */

const erstellenSchema = z.object({
  anfrageId: z.string().min(1),
  bruttoCents: z.number().int().min(1),
  gueltigkeitTage: z.number().int().min(1).max(365).default(30),
  freitext: z.string().optional(),
  begruendung: z.string().optional(),
  einzelpreise: z
    .array(
      z.object({
        positionsIndex: z.number().int().min(0),
        bruttoCents: z.number().int().min(0),
      }),
    )
    .optional(),
});

async function _POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = erstellenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Ungueltige Eingaben",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    // Dynamic Payload import to avoid initialization issues
    const { getPayload } = await import("payload");
    const payloadConfig = (await import("@payload-config")).default;
    const payload = await getPayload({ config: payloadConfig });

    // Auth: admin or mitarbeiter only
    const { user } = await payload.auth({ headers: request.headers });
    if (
      !user ||
      !["admin", "mitarbeiter"].includes((user as any).rolle || "")
    ) {
      return NextResponse.json(
        { error: "Nur Mitarbeiter duerfen Angebote erstellen." },
        { status: 403 },
      );
    }

    // Load anfrage
    const anfrage = await payload.findByID({
      collection: "anfragen",
      id: parsed.data.anfrageId,
      depth: 1,
    });

    // Load settings for MwSt-Satz
    const { getSettings } = await import("@/lib/settings");
    const settings = await getSettings();
    const mwstSatz = (settings as any).mwst_satz || 19;

    // Compute pricing: brutto -> netto + MwSt derivation
    const bruttoCents = parsed.data.bruttoCents;
    const nettoCents = calcNetFromGross(bruttoCents, mwstSatz);
    const mwstCents = bruttoCents - nettoCents;

    // Determine if price was customized
    const produkteSumme = ((anfrage as any).produkte as any[]).reduce(
      (sum: number, p: any) => sum + (p.einzelpreis || 0) * (p.stueckzahl || 1),
      0,
    );
    const standardBrutto = calcGrossFromNet(produkteSumme, mwstSatz);
    const isCustomPrice = bruttoCents !== standardBrutto;

    if (isCustomPrice && !parsed.data.begruendung) {
      return NextResponse.json(
        { error: "Begruendung fuer Preisanpassung ist erforderlich" },
        { status: 400 },
      );
    }

    // Compute rabatt_cents if individual adjustments exist
    let rabattCents = 0;
    if (parsed.data.einzelpreise && parsed.data.einzelpreise.length > 0) {
      const allPositions = (anfrage as any).produkte as any[];
      let adjustedTotal = 0;
      for (let i = 0; i < allPositions.length; i++) {
        const adjusted = parsed.data.einzelpreise.find(
          (e) => e.positionsIndex === i,
        );
        if (adjusted) {
          adjustedTotal +=
            adjusted.bruttoCents * (allPositions[i].stueckzahl || 1);
        } else {
          adjustedTotal += calcGrossFromNet(
            allPositions[i].einzelpreis * (allPositions[i].stueckzahl || 1),
            mwstSatz,
          );
        }
      }
      if (bruttoCents < adjustedTotal) {
        rabattCents = adjustedTotal - bruttoCents;
      }
    }

    // Generate PDF with custom pricing
    const { generateAndStorePDF } =
      await import("@/lib/pdf/generate-and-store");
    const result = await generateAndStorePDF("angebot", anfrage.id, {
      customPricing: {
        bruttoSummeCents: bruttoCents,
        nettoSummeCents: nettoCents,
        mwstCents,
        mwstSatz,
        gueltigkeitTage: parsed.data.gueltigkeitTage,
        freitext: parsed.data.freitext,
        preisanpassungBegruendung: isCustomPrice
          ? parsed.data.begruendung
          : undefined,
        rabattCents: rabattCents > 0 ? rabattCents : undefined,
        positionen: parsed.data.einzelpreise,
      },
    });

    // Update anfrage status to angebot_versendet WITH _skip_auto_pdf guard
    await payload.update({
      collection: "anfragen",
      id: anfrage.id,
      data: {
        status: "angebot_versendet",
        _skip_auto_pdf: true,
      } as any,
    });

    // Queue email notification
    const { queueEmailEvent } = await import("@/lib/email/queue");
    const kontaktdaten = (anfrage as any).kontaktdaten || {};
    const baseUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

    await queueEmailEvent({
      eventType: "angebot_versendet",
      anfrageId: anfrage.id,
      anfrageNummer: (anfrage as any).anfrage_nummer || "",
      status: "angebot_versendet",
      kunde: {
        vorname: kontaktdaten.vorname || "",
        nachname: kontaktdaten.nachname || "",
        email: kontaktdaten.email || "",
      },
      produkte: ((anfrage as any).produkte || []).map(
        (p: {
          produkttyp_label?: string;
          produkttyp?: string;
          stueckzahl?: number;
          einzelpreis?: number;
        }) => ({
          produkttyp: p.produkttyp_label || p.produkttyp || "Produkt",
          stueckzahl: p.stueckzahl || 1,
          einzelpreis: p.einzelpreis || 0,
        }),
      ),
      gesamtbetragCents: bruttoCents,
      zusatzDaten: {
        angebotUrl: `${baseUrl}/angebot/${anfrage.id}`,
        gueltigBis: `${parsed.data.gueltigkeitTage} Tage`,
        attachments: [
          {
            filename: result.filename,
            content_base64: result.buffer.toString("base64"),
            mimetype: "application/pdf",
          },
        ],
      },
    });

    return NextResponse.json(
      {
        success: true,
        dokumentId: result.dokumentId,
        dokumentNummer: result.dokumentNummer,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Angebot Erstellen] Error:", error);
    return NextResponse.json(
      {
        error: "Angebot konnte nicht erstellt werden. Bitte erneut versuchen.",
      },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(withCsrf(_POST), {
  limit: 10,
  windowMs: 60_000,
  keyPrefix: "angebot-erstellen",
});
