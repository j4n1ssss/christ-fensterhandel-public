import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { z } from "zod";
import { isSameOriginOrReferer } from "@/lib/security";

const schema = z.object({
  anfrageId: z.string().min(1),
  templateSlug: z.string().min(1),
  freitext: z.string().optional(),
  subject: z.string().optional(),
});

/**
 * POST /api/admin/email-preview
 * Renders an email template with real anfrage data and optional freitext.
 * Returns the rendered HTML string for iframe preview in the send-email modal.
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

  const { anfrageId, templateSlug, freitext, subject } = parsed.data;

  // Fetch anfrage with depth=1
  let anfrage: Record<string, unknown>;
  try {
    anfrage = (await payload.findByID({
      collection: "anfragen",
      id: anfrageId,
      depth: 1,
    })) as unknown as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Anfrage nicht gefunden" },
      { status: 404 },
    );
  }

  if (!anfrage) {
    return NextResponse.json(
      { error: "Anfrage nicht gefunden" },
      { status: 404 },
    );
  }

  // Get settings
  const { getSettings } = await import("@/lib/settings");
  const settings = await getSettings();

  // Build EmailEventPayload shape for renderEmailForEvent
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

  try {
    const { html } = await renderEmailForEvent(
      templateSlug,
      eventPayload,
      "kunde",
      settings as Record<string, unknown>,
    );
    return NextResponse.json({ html });
  } catch (err) {
    console.error("[email-preview] Render error:", err);
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Vorschau" },
      { status: 500 },
    );
  }
}
