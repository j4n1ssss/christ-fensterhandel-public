import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { TEMPLATE_SLUGS, renderEmailForEvent } from "@/lib/email/render-email";
import {
  getMockDataForTemplate,
  MOCK_ANFRAGE,
  MOCK_SETTINGS,
} from "@/lib/email/mock-data";
import { getSettings } from "@/lib/settings";
import type { EmailEventPayload, EmailEventType } from "@/lib/email/types";

// Simple in-memory rate limiter: userId -> timestamps[]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(userId) || [];
  // Remove entries outside the window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  rateLimitMap.set(userId, recent);
  if (recent.length >= RATE_LIMIT_MAX) {
    return true;
  }
  recent.push(now);
  return false;
}

// Periodic cleanup every 5 minutes
if (typeof globalThis !== "undefined") {
  const cleanupKey = "__emailPreviewRateLimitCleanup";
  if (!(globalThis as any)[cleanupKey]) {
    (globalThis as any)[cleanupKey] = setInterval(
      () => {
        const now = Date.now();
        for (const [key, timestamps] of rateLimitMap.entries()) {
          const recent = timestamps.filter(
            (t) => now - t < RATE_LIMIT_WINDOW_MS,
          );
          if (recent.length === 0) {
            rateLimitMap.delete(key);
          } else {
            rateLimitMap.set(key, recent);
          }
        }
      },
      5 * 60 * 1000,
    );
  }
}

// Staff role check helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isStaffUser(user: any): boolean {
  return user && ["admin", "mitarbeiter"].includes(user.rolle || "");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * GET /api/email-preview/[template]
 * Renders an email template preview with mock data.
 * Includes test-send form and plain-text toggle.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ template: string }> },
) {
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: request.headers });

    if (!isStaffUser(user)) {
      return NextResponse.json(
        { error: "Zugriff verweigert" },
        { status: 403 },
      );
    }

    const { template } = await params;

    if (!TEMPLATE_SLUGS.includes(template)) {
      const notFoundHtml = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Template nicht gefunden</title>
<style>body{font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px}
a{color:#3b82f6;text-decoration:none}</style></head>
<body>
<h1>Template nicht gefunden</h1>
<p>Das Template "${escapeHtml(template)}" existiert nicht.</p>
<p><a href="/api/email-preview">Zurueck zur Uebersicht</a></p>
</body></html>`;
      return new NextResponse(notFoundHtml, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Get mock data for this template
    const mockData = getMockDataForTemplate(template);
    const eventOverrides =
      (mockData._eventOverrides as Record<string, unknown>) || {};

    // Build EmailEventPayload from mock data
    const mockPayload: EmailEventPayload = {
      eventType: (eventOverrides.eventType as EmailEventType) || "test_preview",
      anfrageId: MOCK_ANFRAGE.anfrageId,
      anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
      status: (eventOverrides.status as string) || MOCK_ANFRAGE.status,
      statusAlt: eventOverrides.statusAlt as string | undefined,
      kunde: MOCK_ANFRAGE.kunde,
      produkte: MOCK_ANFRAGE.produkte.map((p) => ({
        produkttyp: p.name,
        stueckzahl: p.stueckzahl,
        einzelpreis: p.einzelpreis,
      })),
      gesamtbetragCents: MOCK_ANFRAGE.gesamtbetragCents,
    };

    // Determine recipient
    const isStaffTemplate =
      template === "neue-anfrage" || template === "status-benachrichtigung";
    const recipient = isStaffTemplate ? "staff" : "kunde";

    // Get settings (real or mock fallback)
    let settings: Record<string, unknown>;
    try {
      settings = (await getSettings()) as unknown as Record<string, unknown>;
    } catch {
      settings = MOCK_SETTINGS;
    }

    // Render the email
    const {
      html: emailHtml,
      plainText,
      subject,
    } = await renderEmailForEvent(template, mockPayload, recipient, settings);

    const userEmail = (user as any)?.email || "";

    // Build the preview page HTML
    const previewHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vorschau: ${escapeHtml(template)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 32px;
      background: #ffffff;
      color: #1a1a1a;
    }
    h1 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
    .meta { font-size: 14px; color: #666666; margin-bottom: 24px; }
    .meta a { color: #3b82f6; text-decoration: none; }
    .meta a:hover { text-decoration: underline; }
    .subject { font-size: 16px; margin-bottom: 16px; }
    .subject strong { font-weight: 600; }
    .controls {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .controls input[type="email"] {
      padding: 8px 12px;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      font-size: 14px;
      width: 300px;
      font-family: inherit;
    }
    .btn-send {
      background: #1a1a1a;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
    }
    .btn-send:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-send:hover:not(:disabled) { background: #333333; }
    .toggle-link {
      color: #3b82f6;
      cursor: pointer;
      font-size: 14px;
      background: none;
      border: none;
      padding: 0;
      font-family: inherit;
    }
    .toggle-link:hover { text-decoration: underline; }
    .message-success { color: #22c55e; font-size: 14px; margin-top: 8px; }
    .message-error { color: #ef4444; font-size: 14px; margin-top: 8px; }
    .preview-container {
      max-width: 600px;
      border: 1px solid #e5e5e5;
      overflow: hidden;
      margin: 0 auto;
    }
    .plaintext-container {
      max-width: 600px;
      border: 1px solid #e5e5e5;
      padding: 16px;
      margin: 0 auto;
      display: none;
    }
    .plaintext-container pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 13px;
      line-height: 1.5;
      margin: 0;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(template)}</h1>
  <p class="meta"><a href="/api/email-preview">Alle Templates</a></p>
  <p class="subject"><strong>Betreff:</strong> ${escapeHtml(subject)}</p>

  <div class="controls">
    <label style="font-size:14px;font-weight:600">Empfaenger:</label>
    <input type="email" id="test-email" value="${escapeHtml(userEmail)}" placeholder="E-Mail-Adresse">
    <button class="btn-send" id="btn-send" type="button">Test senden</button>
    <button class="toggle-link" id="btn-toggle" type="button">Plain-Text anzeigen</button>
  </div>
  <div id="send-message"></div>

  <div class="preview-container" id="html-view">
    ${emailHtml}
  </div>

  <div class="plaintext-container" id="text-view">
    <pre>${escapeHtml(plainText)}</pre>
  </div>

  <script>
    (function() {
      var showingPlain = false;
      var btnToggle = document.getElementById('btn-toggle');
      var htmlView = document.getElementById('html-view');
      var textView = document.getElementById('text-view');
      var btnSend = document.getElementById('btn-send');
      var emailInput = document.getElementById('test-email');
      var messageDiv = document.getElementById('send-message');

      btnToggle.addEventListener('click', function() {
        showingPlain = !showingPlain;
        htmlView.style.display = showingPlain ? 'none' : 'block';
        textView.style.display = showingPlain ? 'block' : 'none';
        btnToggle.textContent = showingPlain ? 'HTML anzeigen' : 'Plain-Text anzeigen';
      });

      btnSend.addEventListener('click', function() {
        var email = emailInput.value.trim();
        if (!email) {
          messageDiv.textContent = '';
          var errP = document.createElement('p');
          errP.className = 'message-error';
          errP.textContent = 'Bitte E-Mail-Adresse eingeben.';
          messageDiv.appendChild(errP);
          return;
        }
        btnSend.disabled = true;
        btnSend.textContent = 'Wird gesendet...';
        messageDiv.textContent = '';

        fetch(window.location.pathname, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email }),
          credentials: 'include'
        })
        .then(function(res) { return res.json().then(function(data) { return { ok: res.ok, status: res.status, data: data }; }); })
        .then(function(result) {
          messageDiv.textContent = '';
          var p = document.createElement('p');
          if (result.ok && result.data.success) {
            p.className = 'message-success';
            p.textContent = result.data.message;
          } else {
            p.className = 'message-error';
            p.textContent = result.data.error || 'Fehler beim Einreihen. Bitte versuchen Sie es erneut.';
          }
          messageDiv.appendChild(p);
        })
        .catch(function() {
          messageDiv.textContent = '';
          var p = document.createElement('p');
          p.className = 'message-error';
          p.textContent = 'Fehler beim Einreihen. Bitte versuchen Sie es erneut.';
          messageDiv.appendChild(p);
        })
        .finally(function() {
          btnSend.disabled = false;
          btnSend.textContent = 'Test senden';
        });
      });
    })();
  </script>
</body>
</html>`;

    return new NextResponse(previewHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("[email-preview] GET Error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/email-preview/[template]
 * Test-send: creates an email_queue entry with event_type 'test_preview'.
 * Rate limited to 5 sends per minute per user.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ template: string }> },
) {
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: request.headers });

    if (!isStaffUser(user)) {
      return NextResponse.json(
        { error: "Zugriff verweigert" },
        { status: 403 },
      );
    }

    const userId = (user as any).id as string;

    // Rate limit check
    if (isRateLimited(userId)) {
      return NextResponse.json(
        {
          error:
            "Bitte warten Sie einen Moment vor dem naechsten Test-Versand.",
        },
        { status: 429 },
      );
    }

    const body = await request.json();
    const email = body.email as string;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Ungueltige E-Mail-Adresse" },
        { status: 400 },
      );
    }

    const { template } = await params;

    if (!TEMPLATE_SLUGS.includes(template)) {
      return NextResponse.json(
        { error: "Template nicht gefunden" },
        { status: 404 },
      );
    }

    // Build mock payload
    const mockData = getMockDataForTemplate(template);
    const eventOverrides =
      (mockData._eventOverrides as Record<string, unknown>) || {};

    const mockPayload: EmailEventPayload = {
      eventType: "test_preview",
      anfrageId: MOCK_ANFRAGE.anfrageId,
      anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
      status: (eventOverrides.status as string) || MOCK_ANFRAGE.status,
      statusAlt: eventOverrides.statusAlt as string | undefined,
      kunde: MOCK_ANFRAGE.kunde,
      produkte: MOCK_ANFRAGE.produkte.map((p) => ({
        produkttyp: p.name,
        stueckzahl: p.stueckzahl,
        einzelpreis: p.einzelpreis,
      })),
      gesamtbetragCents: MOCK_ANFRAGE.gesamtbetragCents,
    };

    // Determine recipient
    const isStaffTemplate =
      template === "neue-anfrage" || template === "status-benachrichtigung";
    const recipient = isStaffTemplate ? "staff" : "kunde";

    // Get settings
    let settings: Record<string, unknown>;
    try {
      settings = (await getSettings()) as unknown as Record<string, unknown>;
    } catch {
      settings = MOCK_SETTINGS;
    }

    // Render email
    const {
      html: emailHtml,
      plainText,
      subject,
    } = await renderEmailForEvent(template, mockPayload, recipient, settings);

    // Create queue entry
    await payload.create({
      collection: "email_queue" as any,
      data: {
        event_type: "test_preview",
        to: email,
        subject: `[TEST] ${subject}`,
        html: emailHtml,
        plain_text: plainText,
        reply_to: (settings.email_reply_to as string) || "",
        payload_data: { template, test: true },
        status: "pending",
        attempts: 0,
        max_attempts: 5,
        idempotency_key: `test_${template}_${userId}_${Date.now()}`,
      } as any,
    });

    return NextResponse.json({
      success: true,
      message: "Test-E-Mail wurde in die Queue eingereiht",
    });
  } catch (error) {
    console.error("[email-preview] POST Error:", error);
    return NextResponse.json(
      { error: "Fehler beim Einreihen. Bitte versuchen Sie es erneut." },
      { status: 500 },
    );
  }
}
