import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextResponse } from "next/server";
import { kontaktSchema } from "@/lib/anfrage/schemas";
import { z } from "zod";
import { calculateServerPrice } from "@/lib/anfrage/price-server";
import type { Rabattcode } from "@/payload-types";
import { generateAnfrageNummer } from "@/lib/anfrage/anfrage-nummer";
import { withRateLimit } from "@/lib/rate-limit";
import { withCsrf } from "@/lib/security";

/**
 * POST /api/anfrage/submit
 *
 * Creates an Anfrage in Payload CMS with:
 * - Server-side price recalculation (tamper-proof)
 * - Server-side discount re-validation
 * - Frozen configuration snapshot
 * - Generated ANF-YYYY-NNN number
 *
 * Request body:
 * { kontaktdaten, produkte: [{ selections, resolvedNames, quantity }], rabattcode?: string }
 *
 * Response:
 * { anfrageNummer: string, gesamtpreis: number }
 */
async function _POST(request: Request) {
  try {
    const body = await request.json();

    // Strict request schema for this endpoint
    const submitSchema = z.object({
      kontaktdaten: kontaktSchema,
      produkte: z
        .array(
          z.object({
            selections: z.record(z.string(), z.unknown()),
            resolvedNames: z.record(z.string(), z.unknown()).optional(),
            quantity: z.number().int().min(1),
          }),
        )
        .min(1, "Mindestens ein Produkt erforderlich"),
      rabattcode: z.string().optional(),
    });

    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Ungültige Eingaben",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const payload = await getPayload({ config: configPromise });

    // 3. Calculate server-side prices for each product
    const produkteForCMS: Array<Record<string, unknown>> = [];

    let gesamtpreis = 0;

    // Per-request cache to avoid repeated collection loads during pricing
    const priceCache = new Map<string, Array<Record<string, unknown>>>();

    for (const item of parsed.data.produkte) {
      const serverPrice = await calculateServerPrice(
        item.selections as any,
        payload,
        { cache: priceCache },
      );
      const r: any = item.resolvedNames || {};

      // Build readable fields + full snapshot for technical reference
      const weitereOptionen: string[] = [];
      if (r.schallschutz && r.schallschutz !== "\u2014")
        weitereOptionen.push(`Schallschutz: ${r.schallschutz}`);
      if (r.sicherheitsglas && r.sicherheitsglas !== "\u2014")
        weitereOptionen.push(`Sicherheitsglas: ${r.sicherheitsglas}`);
      if (r.glasdekor && r.glasdekor !== "\u2014")
        weitereOptionen.push(`Glasdekor: ${r.glasdekor}`);
      if (r.sprossen && r.sprossen !== "\u2014")
        weitereOptionen.push(`Sprossen: ${r.sprossen}`);
      if (r.extras?.length > 0)
        weitereOptionen.push(`Extras: ${r.extras.join(", ")}`);

      produkteForCMS.push({
        produkttyp: r.produkttyp || "\u2014",
        material: r.material || "\u2014",
        profil: r.profil || "\u2014",
        masse_breite: r.masse?.breite || 0,
        masse_hoehe: r.masse?.hoehe || 0,
        fluegelanzahl: r.fluegelanzahl || "\u2014",
        farbe_aussen: r.farbeAussen || "\u2014",
        farbe_innen: r.farbeInnen || "\u2014",
        verglasung: r.verglasung || "\u2014",
        weitere_optionen:
          weitereOptionen.length > 0 ? weitereOptionen.join("\n") : undefined,
        stueckzahl: item.quantity,
        einzelpreis: serverPrice,
        konfiguration_snapshot: {
          selections: item.selections,
          resolvedNames: item.resolvedNames,
          serverPrice,
        },
      });

      // serverPrice is already in cents; quantity is integer
      gesamtpreis += serverPrice * item.quantity;
    }

    // 4. Handle discount code (re-validate server-side)
    let rabattId: string | undefined;

    if (parsed.data.rabattcode) {
      const rabattResult = await payload.find({
        collection: "rabattcodes",
        where: {
          code: { equals: parsed.data.rabattcode },
          aktiv: { equals: true },
        },
        limit: 1,
      });

      if (rabattResult.docs.length > 0) {
        const rabatt = rabattResult.docs[0] as Rabattcode;

        // Re-validate expiry
        if (rabatt.gueltig_bis) {
          const expiryDate = new Date(rabatt.gueltig_bis);
          if (expiryDate < new Date()) {
            return NextResponse.json(
              { error: "Rabattcode abgelaufen" },
              { status: 400 },
            );
          }
        }

        // Re-validate usage limit
        if (
          rabatt.max_nutzungen != null &&
          (rabatt.aktuelle_nutzungen ?? 0) >= rabatt.max_nutzungen
        ) {
          return NextResponse.json(
            { error: "Rabattcode aufgebraucht" },
            { status: 400 },
          );
        }

        // Re-validate minimum order value
        if (
          rabatt.min_bestellwert != null &&
          gesamtpreis < rabatt.min_bestellwert
        ) {
          return NextResponse.json(
            { error: "Mindestbestellwert nicht erreicht" },
            { status: 400 },
          );
        }

        // Optimistic increment with retry to mitigate race conditions
        let applied = false;
        for (let attempt = 0; attempt < 3 && !applied; attempt++) {
          // Re-fetch latest state
          const latest = await payload.findByID({
            collection: "rabattcodes",
            id: rabatt.id,
          });

          if (
            latest.max_nutzungen != null &&
            (latest.aktuelle_nutzungen || 0) >= latest.max_nutzungen
          ) {
            return NextResponse.json(
              { error: "Rabattcode aufgebraucht" },
              { status: 400 },
            );
          }

          // Apply discount to price (gesamtpreis is in cents)
          if (latest.typ === "prozent") {
            gesamtpreis = Math.round(gesamtpreis * (1 - latest.wert / 100));
          } else {
            // latest.wert for absolute discounts is still in EUR (rabattcodes not yet migrated)
            // TODO: Migrate rabattcodes wert to cents in a future cleanup
            gesamtpreis = Math.max(
              0,
              gesamtpreis - Math.round(latest.wert * 100),
            );
          }

          try {
            await payload.update({
              collection: "rabattcodes",
              id: latest.id,
              data: {
                aktuelle_nutzungen: (latest.aktuelle_nutzungen || 0) + 1,
              },
            });
            rabattId = latest.id;
            applied = true;
          } catch (e) {
            // Retry on transient errors
            continue;
          }
        }
        if (!applied) {
          return NextResponse.json(
            {
              error:
                "Rabattcode konnte nicht angewendet werden. Bitte erneut versuchen.",
            },
            { status: 409 },
          );
        }
      }
      // If rabattcode not found, we silently ignore it (price stays full)
    }

    // 5. Strip datenschutz and agb from kontaktdaten before saving (now from parsed schema)
    const {
      datenschutz: _datenschutz,
      agb: _agb,
      ...kontaktdatenForCMS
    } = parsed.data.kontaktdaten;

    // 6. Create Anfrage in CMS with retry for unique number collision
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const anfrageNummer = await generateAnfrageNummer(payload);
        await payload.create({
          collection: "anfragen",
          data: {
            anfrage_nummer: anfrageNummer,
            status: "neu",
            produkte: produkteForCMS,
            kontaktdaten: kontaktdatenForCMS,
            gesamtpreis,
            rabattcode: rabattId || undefined,
            agb_akzeptiert_am: new Date().toISOString(),
          } as any,
        });
        return NextResponse.json(
          { anfrageNummer, gesamtpreis },
          { status: 201 },
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message.toLowerCase() : String(e);
        // Heuristik: Duplicate/Unique Constraint -> Retry
        if (
          msg.includes("duplicate key") ||
          msg.includes("unique") ||
          msg.includes("constraint")
        ) {
          lastError = e;
          continue;
        }
        throw e;
      }
    }

    console.error("Anfrage submit unique collision after retries:", lastError);
    return NextResponse.json(
      {
        error:
          "Interner Konflikt bei der Nummernvergabe. Bitte erneut versuchen.",
      },
      { status: 500 },
    );
  } catch (error) {
    console.error("Anfrage submit error:", error);
    return NextResponse.json(
      {
        error:
          "Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
      },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(withCsrf(_POST), {
  limit: 3,
  windowMs: 60_000,
  keyPrefix: "submit",
});
