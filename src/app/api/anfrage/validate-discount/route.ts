import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextResponse } from "next/server";
import {
  validateDiscountCode,
  type RabattcodeData,
} from "@/lib/anfrage/discount-validator";
import type { Rabattcode as RabattcodeDoc } from "@/payload-types";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";
import { withCsrf } from "@/lib/security";

/**
 * POST /api/anfrage/validate-discount
 *
 * Validates a discount code against the CMS rabattcodes collection.
 *
 * Request body:
 * { code: string, subtotal: number }
 *
 * Response (valid):
 * { valid: true, code, typ, wert }
 *
 * Response (invalid):
 * { valid: false, error: 'ungueltig' | 'abgelaufen' | 'aufgebraucht' | 'min_bestellwert', minWert? }
 */
async function _POST(request: Request) {
  try {
    const body = await request.json();
    const schema = z.object({
      code: z.string().min(1, "Code erforderlich"),
      subtotal: z.number().nonnegative("Zwischensumme erforderlich"),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ungültige Eingabe" },
        { status: 400 },
      );
    }

    const payload = await getPayload({ config: configPromise });

    // Look up the discount code
    const result = await payload.find({
      collection: "rabattcodes",
      where: {
        code: { equals: parsed.data.code },
        aktiv: { equals: true },
      },
      limit: 1,
    });

    const rabatt =
      result.docs.length > 0 ? (result.docs[0] as RabattcodeDoc) : null;

    // Map to validator's expected shape with generated Payload types
    const mapped: RabattcodeData | null = rabatt
      ? {
          id: rabatt.id,
          code: rabatt.code,
          typ: rabatt.typ,
          wert: rabatt.wert,
          aktiv: Boolean(rabatt.aktiv),
          gueltig_von: rabatt.gueltig_von ?? null,
          gueltig_bis: rabatt.gueltig_bis ?? null,
          min_bestellwert: rabatt.min_bestellwert ?? null,
          max_nutzungen: rabatt.max_nutzungen ?? null,
          aktuelle_nutzungen: rabatt.aktuelle_nutzungen ?? 0,
        }
      : null;

    // Validate using the pure function
    const validationResult = validateDiscountCode(mapped, parsed.data.subtotal);

    return NextResponse.json(validationResult);
  } catch (error) {
    console.error("Discount validation error:", error);
    return NextResponse.json(
      { error: "Rabattcode-Validierung fehlgeschlagen" },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(withCsrf(_POST), {
  limit: 10,
  windowMs: 60_000,
  keyPrefix: "validate-discount",
});
