import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { z } from "zod";
import { isSameOriginOrReferer } from "@/lib/security";

// Rate limiter (10/min per user, in-memory Map)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(userId) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  rateLimitMap.set(userId, recent);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  return false;
}

// Cleanup stale rate limit entries every 5 minutes
if (typeof globalThis !== "undefined") {
  const cleanupKey = "__sendEmailRateLimitCleanup";
  if (!(globalThis as Record<string, unknown>)[cleanupKey]) {
    (globalThis as Record<string, unknown>)[cleanupKey] = setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of rateLimitMap.entries()) {
        const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
        if (recent.length === 0) rateLimitMap.delete(key);
        else rateLimitMap.set(key, recent);
      }
    }, 5 * 60_000);
  }
}

const schema = z.object({
  anfrageId: z.string().min(1),
  templateSlug: z.string().min(1),
  subject: z.string().min(1, "Betreff ist erforderlich"),
  freitext: z.string().optional(),
  to: z.string().email("Ungueltige E-Mail-Adresse"),
  mode: z.enum(["replace", "additional"]),
});

/**
 * POST /api/admin/send-email
 * Renders template, creates email_queue entry with anfrage + sent_by,
 * and creates StatusHistorie entry with [E-Mail gesendet] prefix.
 */
export async function POST(request: NextRequest) {
  if (!isSameOriginOrReferer(request)) {
    return NextResponse.json(
      { error: "CSRF validation failed" },
      { status: 403 },
    );
  }

  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user || !["admin", "mitarbeiter"].includes(user.rolle as string)) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 });
  }

  if (checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: "Zu viele E-Mails in kurzer Zeit. Bitte kurz warten." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungueltige JSON-Daten" },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungueltige Eingabe", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { anfrageId, templateSlug, subject, freitext, to, mode } = parsed.data;

  // Fetch anfrage
  let anfrage: Record<string, unknown> | null = null;
  try {
    anfrage = (await payload.findByID({
      collection: "anfragen",
      id: anfrageId,
      depth: 1,
    })) as unknown as Record<string, unknown>;
  } catch {
    // findByID throws on not-found
  }
  if (!anfrage) {
    return NextResponse.json(
      { error: "Die Anfrage wurde nicht gefunden" },
      { status: 404 },
    );
  }

  // Get settings
  const { getSettings } = await import("@/lib/settings");
  const settings = await getSettings();

  // Build event payload for rendering
  const { renderEmailForEvent } = await import("@/lib/email/render-email");
  const kontakt = (anfrage.kontaktdaten as Record<string, unknown>) || {};
  const produkte = (
    (anfrage.produkte as Array<Record<string, unknown>>) || []
  ).map((p) => ({
    produkttyp: (p.produkttyp as string) || "",
    stueckzahl: (p.stueckzahl as number) || 1,
    einzelpreis: (p.einzelpreis as number) || 0,
  }));

  const eventPayload = {
    eventType: "neue_anfrage" as const,
    anfrageId: anfrage.id as string,
    anfrageNummer: (anfrage.anfrage_nummer as string) || "",
    status: (anfrage.status as string) || "",
    kunde: {
      vorname: (kontakt.vorname as string) || "",
      nachname: (kontakt.nachname as string) || "",
      email: (kontakt.email as string) || "",
    },
    produkte,
    gesamtbetragCents: (anfrage.gesamtpreis as number) || 0,
    zusatzDaten: { freitext: freitext || "", subject: subject || "" },
  };

  // Render template
  let html: string;
  let plainText: string;
  try {
    const result = await renderEmailForEvent(
      templateSlug,
      eventPayload,
      "kunde",
      settings as Record<string, unknown>,
    );
    html = result.html;
    plainText = result.plainText;
  } catch (err) {
    console.error("[send-email] Render error:", err);
    return NextResponse.json(
      { error: "Fehler beim Erstellen der E-Mail" },
      { status: 500 },
    );
  }

  // Determine recipients based on mode
  const kundenEmail = (kontakt.email as string) || "";
  const recipients: string[] = [];
  if (mode === "replace") {
    recipients.push(to);
  } else {
    // mode === "additional"
    if (kundenEmail) recipients.push(kundenEmail);
    if (to !== kundenEmail) recipients.push(to);
  }

  // Handle default case (no alt recipient = send to customer)
  if (recipients.length === 0 && kundenEmail) {
    recipients.push(kundenEmail);
  }

  const eventType = `manuell_${templateSlug}`;
  const replyTo =
    ((settings as Record<string, unknown>).email_reply_to as string) ||
    ((settings as Record<string, unknown>).email as string) ||
    "";

  // Create queue entries for each recipient
  for (const recipientEmail of recipients) {
    await payload.create({
      collection: "email_queue" as never,
      data: {
        event_type: eventType,
        to: recipientEmail,
        subject,
        html,
        plain_text: plainText,
        reply_to: replyTo,
        payload_data: eventPayload as unknown as Record<string, unknown>,
        status: "pending",
        attempts: 0,
        max_attempts: 5,
        idempotency_key: `manual_${anfrageId}_${templateSlug}_${Date.now()}_${recipientEmail}`,
        anfrage: anfrageId,
        sent_by: user.id,
      } as never,
    });
  }

  // Create StatusHistorie entry (email_gesendet logged as kommentar)
  const currentStatus = (anfrage.status as string) || "neu";
  await payload.create({
    collection: "status_historie" as never,
    data: {
      anfrage: anfrageId,
      von_status: currentStatus,
      zu_status: currentStatus,
      geaendert_von: user.id,
      kommentar: `[E-Mail gesendet] Template: ${templateSlug}, Betreff: ${subject}, An: ${recipients.join(", ")}`,
    } as never,
  });

  return NextResponse.json({ success: true });
}
