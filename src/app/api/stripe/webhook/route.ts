import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 401 },
      );
    }

    let event: Stripe.Event;
    try {
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!secret) {
        console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
        return NextResponse.json(
          { error: "Server misconfiguration" },
          { status: 500 },
        );
      }
      event = getStripe().webhooks.constructEvent(body, signature, secret);
    } catch {
      console.error("[Stripe Webhook] Signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = await getPayload({ config: configPromise });

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
          payload,
        );
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(
          event.data.object as Stripe.Checkout.Session,
          payload,
        );
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge, payload);
        break;
      case "charge.dispute.created":
        await handleDisputeCreated(
          event.data.object as Stripe.Dispute,
          payload,
        );
        break;
      default:
        console.info("[Stripe Webhook] Unhandled event type", {
          type: event.type,
        });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  payload: any,
) {
  const anfrageId = session.metadata?.anfrage_id;
  if (!anfrageId) {
    console.info(
      "[Stripe Webhook] checkout.session.completed: no anfrage_id in metadata",
    );
    return;
  }

  const anfrage = await payload.findByID({
    collection: "anfragen",
    id: anfrageId,
  });

  // STRP-07: Idempotency -- skip if already bezahlt
  if (anfrage.stripe_payment_status === "bezahlt") {
    console.info(
      "[Stripe Webhook] Skipping duplicate checkout.session.completed",
      { anfrageId },
    );
    return;
  }

  // Only process if payment actually paid
  if (session.payment_status !== "paid") {
    console.info("[Stripe Webhook] checkout.session.completed but not paid", {
      anfrageId,
      paymentStatus: session.payment_status,
    });
    return;
  }

  // Single update: status + all Stripe fields (triggers afterChange for Rechnung + emails)
  await payload.update({
    collection: "anfragen",
    id: anfrageId,
    data: {
      status: "bezahlt",
      stripe_payment_status: "bezahlt",
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null,
    },
  });

  console.info("[Stripe Webhook] checkout.session.completed processed", {
    anfrageId,
    paymentIntent: session.payment_intent,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCheckoutExpired(
  session: Stripe.Checkout.Session,
  payload: any,
) {
  const anfrageId = session.metadata?.anfrage_id;
  if (!anfrageId) return;

  const anfrage = await payload.findByID({
    collection: "anfragen",
    id: anfrageId,
  });

  // Idempotency
  if (anfrage.stripe_payment_status === "abgelaufen") {
    console.info(
      "[Stripe Webhook] Skipping duplicate checkout.session.expired",
      { anfrageId },
    );
    return;
  }

  // Determine if this was an Angebots-Annahme flow
  const isAngebotsAnnahme = session.metadata?.flow === "angebots_annahme";

  // Build update data
  const updateData: Record<string, any> = {
    stripe_payment_status: "abgelaufen",
  };

  // If Checkout Session expired from Angebots-Annahme flow,
  // reset status back to angebot_versendet so customer can re-accept
  if (isAngebotsAnnahme && anfrage.status === "zahlungslink_versendet") {
    updateData.status = "angebot_versendet";
    console.info(
      "[Stripe Webhook] Resetting status to angebot_versendet (Angebots-Annahme flow expired)",
      { anfrageId },
    );
  }

  await payload.update({
    collection: "anfragen",
    id: anfrageId,
    data: updateData,
  });

  console.info("[Stripe Webhook] checkout.session.expired processed", {
    anfrageId,
    flowReset: isAngebotsAnnahme,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleChargeRefunded(charge: Stripe.Charge, payload: any) {
  // Find Anfrage by payment_intent_id
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) {
    console.info("[Stripe Webhook] charge.refunded: no payment_intent");
    return;
  }

  const results = await payload.find({
    collection: "anfragen",
    where: { stripe_payment_intent_id: { equals: paymentIntentId } },
    limit: 1,
  });

  if (results.docs.length === 0) {
    console.info("[Stripe Webhook] charge.refunded: no matching Anfrage", {
      paymentIntentId,
    });
    return;
  }

  const anfrage = results.docs[0];

  // Calculate refunded amount from Stripe (authoritative)
  const totalRefundedCents = charge.amount_refunded || 0;
  const totalAmountCents = charge.amount || 0;
  const isFullRefund = totalRefundedCents >= totalAmountCents;

  // Determine new status
  const newPaymentStatus = isFullRefund
    ? "rueckerstattet"
    : "teilweise_erstattet";

  // Build update data
  const updateData: Record<string, any> = {
    stripe_payment_status: newPaymentStatus,
    stripe_refunded_amount_cents: totalRefundedCents,
  };

  // Only change Anfrage status for full refund (per CONTEXT: partial refunds don't change status)
  if (isFullRefund && anfrage.status === "rueckerstattung_ausstehend") {
    updateData.status = "rueckerstattung_abgeschlossen";
  }

  await payload.update({
    collection: "anfragen",
    id: anfrage.id,
    data: updateData,
  });

  // Generate Gutschrift PDF for EACH refund event
  try {
    const { generateAndStorePDF } =
      await import("@/lib/pdf/generate-and-store");
    // Find the original Rechnung for this Anfrage
    const rechnungen = await payload.find({
      collection: "rechnungen",
      where: {
        anfrage: { equals: anfrage.id },
        typ: { equals: "rechnung" },
      },
      limit: 1,
    });
    const originalRechnungId = rechnungen.docs[0]?.id || undefined;

    await generateAndStorePDF("gutschrift", anfrage.id, {
      originalRechnungId,
    });
    console.info("[Stripe Webhook] Gutschrift PDF generated", {
      anfrageId: anfrage.id,
    });
  } catch (pdfErr) {
    console.error(
      "[Stripe Webhook] Gutschrift PDF failed (non-blocking):",
      pdfErr,
    );
  }

  // Queue refund email to customer (rueckerstattung event)
  try {
    const { queueEmailEvent } = await import("@/lib/email/queue");
    await queueEmailEvent({
      eventType: "rueckerstattung",
      anfrageId: anfrage.id,
      anfrageNummer: anfrage.anfrage_nummer || anfrage.id,
      status: anfrage.status,
      kunde: {
        vorname: anfrage.kontaktdaten?.vorname || "",
        nachname: anfrage.kontaktdaten?.nachname || "",
        email: anfrage.kontaktdaten?.email || "",
      },
      produkte: anfrage.produkte || [],
      gesamtbetragCents: anfrage.gesamtpreis || 0,
    });
  } catch (emailErr) {
    console.error(
      "[Stripe Webhook] Refund email queue failed (non-blocking):",
      emailErr,
    );
  }

  console.info("[Stripe Webhook] charge.refunded processed", {
    anfrageId: anfrage.id,
    totalRefundedCents,
    isFullRefund,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleDisputeCreated(dispute: Stripe.Dispute, payload: any) {
  const paymentIntentId =
    typeof dispute.payment_intent === "string"
      ? dispute.payment_intent
      : dispute.payment_intent?.id;

  if (!paymentIntentId) {
    console.info("[Stripe Webhook] charge.dispute.created: no payment_intent");
    return;
  }

  const results = await payload.find({
    collection: "anfragen",
    where: { stripe_payment_intent_id: { equals: paymentIntentId } },
    limit: 1,
  });

  if (results.docs.length === 0) {
    console.info(
      "[Stripe Webhook] charge.dispute.created: no matching Anfrage",
      { paymentIntentId },
    );
    return;
  }

  const anfrage = results.docs[0];

  // Set payment status to dispute (per CONTEXT: no own Anfrage status needed)
  await payload.update({
    collection: "anfragen",
    id: anfrage.id,
    data: { stripe_payment_status: "dispute" },
  });

  // CRITICAL: Send immediate Staff email (disputes have response deadlines)
  try {
    const { queueEmailEvent } = await import("@/lib/email/queue");
    await queueEmailEvent({
      eventType: "zahlung_dispute",
      anfrageId: anfrage.id,
      anfrageNummer: anfrage.anfrage_nummer || anfrage.id,
      status: anfrage.status,
      kunde: {
        vorname: anfrage.kontaktdaten?.vorname || "",
        nachname: anfrage.kontaktdaten?.nachname || "",
        email: anfrage.kontaktdaten?.email || "",
      },
      produkte: anfrage.produkte || [],
      gesamtbetragCents: anfrage.gesamtpreis || 0,
      zusatzDaten: {
        dispute_id: dispute.id,
        dispute_reason: dispute.reason || "unbekannt",
        dispute_amount: dispute.amount,
      },
    });
  } catch (emailErr) {
    console.error("[Stripe Webhook] Dispute staff email failed:", emailErr);
  }

  console.info("[Stripe Webhook] charge.dispute.created processed", {
    anfrageId: anfrage.id,
    disputeId: dispute.id,
    reason: dispute.reason,
  });
}
