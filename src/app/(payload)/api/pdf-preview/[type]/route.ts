/**
 * PDF preview route.
 *
 * GET /api/pdf-preview/[type] - Render PDF with mock data, staff-protected.
 * Returns PDF inline (Content-Disposition: inline) for browser preview.
 *
 * Valid types: angebot, rechnung, gutschrift
 */

import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  const rolle = (user as any)?.rolle;
  if (!["admin", "mitarbeiter"].includes(rolle || "")) {
    return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
  }

  const { type } = await params;
  if (!["angebot", "rechnung", "gutschrift"].includes(type)) {
    return NextResponse.json({ error: "Ungueltiger PDF-Typ" }, { status: 400 });
  }

  const { renderPDF } = await import("@/lib/pdf/render-pdf");
  const { MOCK_ANGEBOT_PROPS, MOCK_RECHNUNG_PROPS, MOCK_GUTSCHRIFT_PROPS } =
    await import("@/lib/pdf/mock-data");

  const mockMap = {
    angebot: MOCK_ANGEBOT_PROPS,
    rechnung: MOCK_RECHNUNG_PROPS,
    gutschrift: MOCK_GUTSCHRIFT_PROPS,
  };
  const props = mockMap[type as keyof typeof mockMap];
  const { buffer } = await renderPDF(type as any, props, `preview-${type}.pdf`);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="preview-${type}.pdf"`,
    },
  });
}
