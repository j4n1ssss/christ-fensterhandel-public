import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/stripe/payment-status?session_id=cs_...
 *
 * Polling endpoint for Danke-Seite.
 * Returns current stripe_payment_status from DB (not Stripe API).
 * Public -- session_id acts as auth token.
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return NextResponse.json(
        { error: "Invalid session_id" },
        { status: 400 },
      );
    }

    const payload = await getPayload({ config: configPromise });

    const results = await payload.find({
      collection: "anfragen",
      where: { stripe_session_id: { equals: sessionId } },
      limit: 1,
      depth: 0,
    });

    if (results.docs.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const anfrage = results.docs[0] as any;

    return NextResponse.json({
      status: anfrage.stripe_payment_status || "offen",
      anfrage_status: anfrage.status,
      anfrage_id: anfrage.id,
    });
  } catch (error) {
    console.error("[Stripe PaymentStatus] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
