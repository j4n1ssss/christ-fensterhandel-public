import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { REFUND_ALLOWED_STATUSES } from "@/lib/stripe-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { withCsrf } from "@/lib/security";

const refundSchema = z.object({
  anfrage_id: z.string().uuid(),
  amount_cents: z.number().int().positive().optional(), // omit for full refund
  reason: z.string().min(1).max(500),
  version: z.number().int(),
});

/**
 * POST /api/stripe/refund
 *
 * Admin-only endpoint. Creates a Stripe refund.
 * Sets intermediate status rueckerstattung_ausstehend for full refunds.
 * Partial refunds only update stripe_refunded_amount_cents + StatusHistorie.
 */
async function _POST(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise });

    // Admin-only auth
    const { user } = await payload.auth({ headers: request.headers });
    if (!user || (user as any).rolle !== "admin") {
      return NextResponse.json(
        {
          error: "Nur Administratoren duerfen Rueckerstattungen ausloesen.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = refundSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Anfragedaten", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { anfrage_id, amount_cents, reason, version } = parsed.data;

    const anfrage = await payload.findByID({
      collection: "anfragen",
      id: anfrage_id,
      depth: 0,
    });

    // Optimistic lock check
    if ((anfrage as any).version !== version) {
      return NextResponse.json(
        {
          error:
            "Anfrage wurde zwischenzeitlich geaendert. Bitte Seite neu laden.",
        },
        { status: 409 },
      );
    }

    // Validate status allows refund
    if (!REFUND_ALLOWED_STATUSES.includes((anfrage as any).status)) {
      return NextResponse.json(
        {
          error: `Rueckerstattung nicht moeglich bei Status "${(anfrage as any).status}"`,
        },
        { status: 400 },
      );
    }

    // Validate has payment_intent
    const paymentIntentId = (anfrage as any).stripe_payment_intent_id;
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Keine Stripe Payment-Intent-ID vorhanden" },
        { status: 400 },
      );
    }

    // Calculate remaining refundable amount
    const totalPaidCents = (anfrage as any).gesamtpreis || 0;
    const alreadyRefundedCents =
      (anfrage as any).stripe_refunded_amount_cents || 0;
    const remainingCents = totalPaidCents - alreadyRefundedCents;

    const refundAmountCents = amount_cents || remainingCents; // full refund if no amount
    const isFullRefund = refundAmountCents >= remainingCents;

    if (refundAmountCents <= 0) {
      return NextResponse.json(
        { error: "Erstattungsbetrag muss groesser als 0 sein" },
        { status: 400 },
      );
    }
    if (refundAmountCents > remainingCents) {
      return NextResponse.json(
        {
          error: `Erstattungsbetrag (${refundAmountCents}) uebersteigt verbleibenden Betrag (${remainingCents})`,
        },
        { status: 400 },
      );
    }

    // Create Stripe refund
    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: refundAmountCents,
      reason: "requested_by_customer",
      metadata: {
        anfrage_id,
        anfrage_nummer: (anfrage as any).anfrage_nummer || "",
        admin_reason: reason,
        admin_user: user.email || "",
      },
    });

    // Update Anfrage: set intermediate status for full refund only
    const updateData: Record<string, any> = {
      stripe_refunded_amount_cents: alreadyRefundedCents + refundAmountCents,
    };

    if (isFullRefund) {
      updateData.status = "rueckerstattung_ausstehend";
      updateData.stripe_payment_status = "rueckerstattet";
    } else {
      updateData.stripe_payment_status = "teilweise_erstattet";
    }

    await payload.update({
      collection: "anfragen",
      id: anfrage_id,
      data: updateData,
    });

    // Add StatusHistorie entry
    try {
      await payload.create({
        collection: "status_historie" as any,
        data: {
          anfrage: anfrage_id,
          von_status: (anfrage as any).status,
          nach_status: isFullRefund
            ? "rueckerstattung_ausstehend"
            : (anfrage as any).status,
          geaendert_von: user.id,
          kommentar: `Rueckerstattung: ${refundAmountCents / 100} EUR - ${reason}`,
        },
      });
    } catch (histErr) {
      console.error(
        "[Stripe Refund] StatusHistorie entry failed (non-blocking):",
        histErr,
      );
    }

    console.info("[Stripe Refund] Refund created", {
      anfrageId: anfrage_id,
      refundId: refund.id,
      amountCents: refundAmountCents,
      isFullRefund,
    });

    return NextResponse.json({
      success: true,
      refund_id: refund.id,
      amount_cents: refundAmountCents,
      is_full_refund: isFullRefund,
    });
  } catch (error: any) {
    console.error("[Stripe Refund] Error:", error);

    // Handle Stripe-specific errors
    if (error?.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: `Stripe Fehler: ${error.message}` },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Rueckerstattung fehlgeschlagen" },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(withCsrf(_POST), {
  limit: 5,
  windowMs: 60_000,
  keyPrefix: "stripe-refund",
});
