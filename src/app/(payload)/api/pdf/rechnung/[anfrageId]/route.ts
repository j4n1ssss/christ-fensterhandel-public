/**
 * API route for Rechnung PDFs.
 *
 * POST /api/pdf/rechnung/[anfrageId] - Generate Rechnung PDF (admin only)
 * GET  /api/pdf/rechnung/[anfrageId] - Download Rechnung PDF (staff + owner-kunden)
 *       Optional: ?id=dokumentId for specific rechnung
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
      { error: "Nur Admin kann Rechnungen erstellen" },
      { status: 403 },
    );
  }
  const { anfrageId } = await params;
  try {
    const { generateAndStorePDF } =
      await import("@/lib/pdf/generate-and-store");
    const result = await generateAndStorePDF("rechnung", anfrageId);
    return NextResponse.json({
      dokumentId: result.dokumentId,
      nummer: result.dokumentNummer,
      filename: result.filename,
    });
  } catch (err) {
    console.error("[PDF API] Rechnung generation failed:", err);
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
    // Find latest rechnung for this anfrage
    const result = await payload.find({
      collection: "rechnungen" as any,
      where: {
        anfrage: { equals: anfrageId },
        typ: { equals: "rechnung" },
      },
      sort: "-createdAt",
      limit: 1,
      depth: 1,
    });
    if (result.docs.length === 0) {
      return NextResponse.json(
        { error: "Keine Rechnung gefunden" },
        { status: 404 },
      );
    }
    const rechnung = result.docs[0] as any;
    const pdfUpload = rechnung.pdf;
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
    const filename = `Rechnung_${rechnung.anfrage_nummer}.pdf`;
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // Download specific rechnung by ID
  const rechnung = await payload.findByID({
    collection: "rechnungen" as any,
    id: dokumentId,
    depth: 1,
  });
  const pdfUpload = (rechnung as any).pdf;
  const filePath = path.join(process.cwd(), "pdf-uploads", pdfUpload.filename);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "PDF-Datei nicht gefunden" },
      { status: 404 },
    );
  }
  const fileBuffer = fs.readFileSync(filePath);
  const filename = `Rechnung_${(rechnung as any).anfrage_nummer}.pdf`;
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
