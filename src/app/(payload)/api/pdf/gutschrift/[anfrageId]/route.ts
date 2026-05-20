/**
 * API route for Gutschrift PDFs.
 *
 * POST /api/pdf/gutschrift/[anfrageId] - Generate Gutschrift PDF (admin only)
 *       Body: { originalRechnungId?: string }
 * GET  /api/pdf/gutschrift/[anfrageId] - Download Gutschrift PDF (staff + owner-kunden)
 *       Optional: ?id=dokumentId for specific gutschrift
 */

import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import fs from "fs";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ anfrageId: string }> },
) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if ((user as any)?.rolle !== "admin") {
    return NextResponse.json(
      { error: "Nur Admin kann Gutschriften erstellen" },
      { status: 403 },
    );
  }
  const { anfrageId } = await params;
  try {
    const body = await request.json().catch(() => ({}));
    const { generateAndStorePDF } =
      await import("@/lib/pdf/generate-and-store");
    const result = await generateAndStorePDF("gutschrift", anfrageId, {
      originalRechnungId: body.originalRechnungId,
    });
    return NextResponse.json({
      dokumentId: result.dokumentId,
      nummer: result.dokumentNummer,
      filename: result.filename,
    });
  } catch (err) {
    console.error("[PDF API] Gutschrift generation failed:", err);
    return NextResponse.json(
      { error: "PDF konnte nicht erstellt werden" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ anfrageId: string }> },
) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  const rolle = (user as any)?.rolle;
  const { anfrageId } = await params;

  // Staff can download any, Kunden only own
  if (!["admin", "mitarbeiter"].includes(rolle || "")) {
    if (rolle === "kunde") {
      const anfrage = await payload.findByID({
        collection: "anfragen",
        id: anfrageId,
      });
      if ((anfrage as any).kontaktdaten?.email !== (user as any)?.email) {
        return NextResponse.json(
          { error: "Zugriff verweigert" },
          { status: 403 },
        );
      }
    } else {
      return NextResponse.json(
        { error: "Zugriff verweigert" },
        { status: 403 },
      );
    }
  }

  const dokumentId = request.nextUrl.searchParams.get("id");

  if (!dokumentId) {
    // Find latest gutschrift for this anfrage
    const result = await payload.find({
      collection: "rechnungen" as any,
      where: {
        anfrage: { equals: anfrageId },
        typ: { equals: "gutschrift" },
      },
      sort: "-createdAt",
      limit: 1,
      depth: 1,
    });
    if (result.docs.length === 0) {
      return NextResponse.json(
        { error: "Keine Gutschrift gefunden" },
        { status: 404 },
      );
    }
    const gutschrift = result.docs[0] as any;
    const pdfUpload = gutschrift.pdf;
    const filePath = path.join(
      process.cwd(),
      "pdf-uploads",
      pdfUpload.filename,
    );
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "PDF-Datei nicht gefunden" },
        { status: 404 },
      );
    }
    const fileBuffer = fs.readFileSync(filePath);
    const filename = `Gutschrift_${gutschrift.anfrage_nummer}.pdf`;
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // Download specific gutschrift by ID
  const gutschrift = await payload.findByID({
    collection: "rechnungen" as any,
    id: dokumentId,
    depth: 1,
  });
  const pdfUpload = (gutschrift as any).pdf;
  const filePath = path.join(process.cwd(), "pdf-uploads", pdfUpload.filename);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "PDF-Datei nicht gefunden" },
      { status: 404 },
    );
  }
  const fileBuffer = fs.readFileSync(filePath);
  const filename = `Gutschrift_${(gutschrift as any).anfrage_nummer}.pdf`;
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
