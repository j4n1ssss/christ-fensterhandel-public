import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { TEMPLATE_SLUGS } from "@/lib/email/render-email";

/**
 * GET /api/email-preview
 * Staff-protected template index page listing all email templates.
 * Only accessible to users with rolle 'admin' or 'mitarbeiter'.
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: request.headers });

    if (
      !user ||
      !["admin", "mitarbeiter"].includes((user as any).rolle || "")
    ) {
      return NextResponse.json(
        { error: "Zugriff verweigert" },
        { status: 403 },
      );
    }

    const templateLinks = TEMPLATE_SLUGS.map(
      (slug) => `<li><a href="/api/email-preview/${slug}">${slug}</a></li>`,
    ).join("");

    const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Mail Templates</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 32px;
      background: #ffffff;
      color: #1a1a1a;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 24px;
      font-weight: 600;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    li {
      margin-bottom: 8px;
    }
    a {
      color: #3b82f6;
      text-decoration: none;
      font-size: 16px;
    }
    a:hover {
      text-decoration: underline;
    }
    .count {
      font-size: 14px;
      color: #666666;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <h1>E-Mail Templates</h1>
  <p class="count">${TEMPLATE_SLUGS.length} Templates verfuegbar</p>
  <ul>${templateLinks}</ul>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("[email-preview] Error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 },
    );
  }
}
