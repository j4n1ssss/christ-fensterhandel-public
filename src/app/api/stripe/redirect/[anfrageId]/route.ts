import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextResponse, type NextRequest } from "next/server";
import { createCheckoutSession, expireExistingSession } from "@/lib/stripe";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * GET /api/stripe/redirect/[anfrageId]
 *
 * Public route (no auth required -- UUID is cryptographically random).
 * Redirects to Stripe Checkout URL. Auto-regenerates expired sessions.
 * Rate limited: 5/min per IP.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ anfrageId: string }> },
) {
  try {
    // Rate limiting (inline because withRateLimit doesn't pass route params)
    const ip = getClientIp(request);
    const rl = checkRateLimit(`stripe-redirect:${ip}`, 5, 60_000);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({
          error: "Zu viele Anfragen. Bitte warten Sie einen Moment.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
          },
        },
      );
    }

    const { anfrageId } = await params;
    const payload = await getPayload({ config: configPromise });
    const baseUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

    // Find Anfrage
    let anfrage: any;
    try {
      anfrage = await payload.findByID({
        collection: "anfragen",
        id: anfrageId,
        depth: 0,
      });
    } catch {
      return NextResponse.redirect(`${baseUrl}/zahlung/fehler`);
    }

    // Only zahlungslink_versendet is payable (per CONTEXT decision)
    if (anfrage.status !== "zahlungslink_versendet") {
      return NextResponse.redirect(`${baseUrl}/zahlung/fehler`);
    }

    // Check if existing session is still valid
    if (
      anfrage.stripe_checkout_url &&
      anfrage.stripe_payment_status === "offen"
    ) {
      // Check expiry
      const expiresAt = anfrage.stripe_expires_at
        ? new Date(anfrage.stripe_expires_at).getTime()
        : 0;
      if (expiresAt > Date.now()) {
        // Session still valid, redirect directly
        return NextResponse.redirect(anfrage.stripe_checkout_url);
      }
    }

    // Session expired or doesn't exist -- regenerate
    // Expire old session first (STRP-06)
    if (anfrage.stripe_session_id) {
      await expireExistingSession(anfrage.stripe_session_id);
    }

    const kundenEmail = anfrage.kontaktdaten?.email || "";
    const kundenVorname = anfrage.kontaktdaten?.vorname || "";
    const kundenNachname = anfrage.kontaktdaten?.nachname || "";

    const session = await createCheckoutSession({
      anfrageId: anfrage.id,
      anfrageNummer: anfrage.anfrage_nummer || anfrage.id,
      gesamtpreis: anfrage.gesamtpreis || 0,
      produktAnzahl: anfrage.produkte?.length || 0,
      kundenEmail,
      kundenName: `${kundenVorname} ${kundenNachname}`.trim(),
      userId:
        typeof anfrage.kontaktdaten?.user === "string"
          ? anfrage.kontaktdaten.user
          : anfrage.kontaktdaten?.user?.id,
    });

    // Update Anfrage with new session data
    await payload.update({
      collection: "anfragen",
      id: anfrage.id,
      data: {
        stripe_checkout_url: session.url,
        stripe_session_id: session.id,
        stripe_payment_status: "offen",
        stripe_expires_at: new Date(session.expires_at! * 1000).toISOString(),
      } as any,
    });

    // Queue a new zahlungslink email (per CONTEXT: regeneration sends new email)
    try {
      const { queueEmailEvent } = await import("@/lib/email/queue");
      await queueEmailEvent({
        eventType: "zahlungslink_versendet",
        anfrageId: anfrage.id,
        anfrageNummer: anfrage.anfrage_nummer || anfrage.id,
        status: anfrage.status,
        kunde: {
          vorname: kundenVorname,
          nachname: kundenNachname,
          email: kundenEmail,
        },
        produkte: anfrage.produkte || [],
        gesamtbetragCents: anfrage.gesamtpreis || 0,
        zusatzDaten: {
          stripe_checkout_url: `${baseUrl}/api/stripe/redirect/${anfrage.id}`,
        },
      });
    } catch (emailErr) {
      console.error(
        "[Stripe Redirect] Email queue failed (non-blocking):",
        emailErr,
      );
    }

    console.info("[Stripe Redirect] Session regenerated", {
      anfrageId: anfrage.id,
      sessionId: session.id,
    });

    return NextResponse.redirect(session.url!);
  } catch (error) {
    console.error("[Stripe Redirect] Error:", error);
    const baseUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/zahlung/fehler`);
  }
}
