import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextResponse } from "next/server";
import { calculateServerPrice } from "@/lib/anfrage/price-server";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/anfrage/calculate-price
 *
 * Accepts a list of products with their configurator selections,
 * calculates the authoritative server-side price for each,
 * and returns the prices + subtotal.
 *
 * Request body:
 * { produkte: [{ selections, resolvedNames, quantity }] }
 *
 * Response:
 * { produkte: [{ serverPrice, quantity }], subtotal }
 * All prices are in integer cents (e.g. 24999 = 249.99 EUR).
 */
async function _POST(request: Request) {
  try {
    const body = await request.json();

    const calcSchema = z.object({
      produkte: z
        .array(
          z.object({
            selections: z.record(z.string(), z.unknown()),
            quantity: z.number().int().min(1),
          }),
        )
        .min(1, "Mindestens ein Produkt erforderlich"),
    });

    const parsed = calcSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ungültige Produktdaten" },
        { status: 400 },
      );
    }

    const payload = await getPayload({ config: configPromise });

    const produkte = [] as Array<{ serverPrice: number; quantity: number }>;
    let subtotal = 0;
    // Per-request cache to avoid repeated collection loads
    const cache = new Map<string, Array<Record<string, unknown>>>();

    for (const item of parsed.data.produkte) {
      const serverPrice = await calculateServerPrice(
        item.selections as any,
        payload,
        { cache },
      );
      const lineTotal = serverPrice * item.quantity;

      produkte.push({
        serverPrice,
        quantity: item.quantity,
      });

      subtotal += lineTotal;
    }

    // serverPrice and subtotal are already in integer cents -- no rounding needed
    return NextResponse.json({ produkte, subtotal });
  } catch (error) {
    console.error("Price calculation error:", error);
    return NextResponse.json(
      { error: "Preisberechnung fehlgeschlagen" },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(_POST, {
  limit: 10,
  windowMs: 60_000,
  keyPrefix: "calc-price",
});
