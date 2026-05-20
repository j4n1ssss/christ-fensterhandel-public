import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextResponse, type NextRequest } from "next/server";
import { createCheckoutSession, expireExistingSession } from "@/lib/stripe";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ anfrageId: string }> },
) {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user || !["admin", "mitarbeiter"].includes((user as any)?.rolle)) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 });
  }

  const { anfrageId } = await params;
  const anfrage = await payload.findByID({
    collection: "anfragen",
    id: anfrageId,
    depth: 0,
  });
  if ((anfrage as any).status !== "zahlungslink_versendet") {
    return NextResponse.json(
      { error: "Status erlaubt keine Zahlungslink-Erstellung" },
      { status: 400 },
    );
  }

  // Expire old session
  if ((anfrage as any).stripe_session_id) {
    await expireExistingSession((anfrage as any).stripe_session_id);
  }

  const session = await createCheckoutSession({
    anfrageId: anfrage.id,
    anfrageNummer: (anfrage as any).anfrage_nummer || anfrage.id,
    gesamtpreis: (anfrage as any).gesamtpreis || 0,
    produktAnzahl: (anfrage as any).produkte?.length || 0,
    kundenEmail: (anfrage as any).kontaktdaten?.email || "",
    kundenName:
      `${(anfrage as any).kontaktdaten?.vorname || ""} ${(anfrage as any).kontaktdaten?.nachname || ""}`.trim(),
  });

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

  // Queue new zahlungslink email
  try {
    const { queueEmailEvent } = await import("@/lib/email/queue");
    const baseUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    await queueEmailEvent({
      eventType: "zahlungslink_versendet",
      anfrageId: anfrage.id,
      anfrageNummer: (anfrage as any).anfrage_nummer || String(anfrage.id),
      status: (anfrage as any).status || "zahlungslink_versendet",
      kunde: {
        vorname: (anfrage as any).kontaktdaten?.vorname || "",
        nachname: (anfrage as any).kontaktdaten?.nachname || "",
        email: (anfrage as any).kontaktdaten?.email || "",
      },
      produkte: (anfrage as any).produkte || [],
      gesamtbetragCents: (anfrage as any).gesamtpreis || 0,
      zusatzDaten: {
        stripe_checkout_url: `${baseUrl}/api/stripe/redirect/${anfrage.id}`,
      },
    });
  } catch (emailErr) {
    console.error(
      "[Stripe Regenerate] Email queue failed (non-blocking):",
      emailErr,
    );
  }

  return NextResponse.json({
    success: true,
    checkout_url: session.url,
    session_id: session.id,
  });
}
