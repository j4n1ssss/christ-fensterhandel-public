/**
 * Central helper for generating PDFs, uploading to pdf_uploads, and creating
 * business document entries (angebote / rechnungen collection).
 *
 * Called by:
 * - API routes (POST /api/pdf/[type]/[anfrageId])
 * - afterChange hooks (auto-trigger on status transitions)
 *
 * Uses dynamic imports to avoid Payload initialization issues in hooks.
 */

import { renderPDF } from "./render-pdf";
import type {
  PDFDocumentType,
  AngebotPDFProps,
  RechnungPDFProps,
  GutschriftPDFProps,
  PDFSettings,
  KundenDaten,
  ProduktLineItem,
} from "./types";
import { calcTax } from "@/lib/tax";

// --- Result ---

export interface GenerateResult {
  buffer: Buffer;
  filename: string;
  dokumentId: string;
  dokumentNummer: string;
}

// --- Builder helpers ---

/**
 * Build PDFSettings from raw Settings Global data.
 */
function buildPDFSettings(settings: Record<string, any>): PDFSettings {
  const logoFilename = settings.pdf_logo?.filename;
  let pdfLogoPath: string | null = null;
  if (logoFilename) {
    const path = require("path");
    const fs = require("fs");
    pdfLogoPath = path.join(process.cwd(), "media", logoFilename);
    if (!fs.existsSync(pdfLogoPath)) pdfLogoPath = null;
  }

  return {
    firmenname: settings.firmenname || "",
    adresse_strasse: settings.adresse_strasse || "",
    adresse_hausnummer: settings.adresse_hausnummer || "",
    adresse_plz: settings.adresse_plz || "",
    adresse_ort: settings.adresse_ort || "",
    telefon: settings.telefon || "",
    email: settings.email || "",
    steuernummer: settings.steuernummer || "",
    ust_id: settings.ust_id || "",
    bank_iban: settings.bank_iban || "",
    bank_bic: settings.bank_bic || "",
    bank_name: settings.bank_name || "",
    widerrufsbelehrung: settings.widerrufsbelehrung || "",
    angebots_gueltigkeit_tage: settings.angebots_gueltigkeit_tage || 30,
    pdf_logo_path: pdfLogoPath,
  };
}

/**
 * Build KundenDaten from Anfrage kontaktdaten.
 */
function buildKundenDaten(kontaktdaten: Record<string, any>): KundenDaten {
  return {
    vorname: kontaktdaten.vorname || "",
    nachname: kontaktdaten.nachname || "",
    email: kontaktdaten.email || "",
    strasse: kontaktdaten.strasse || "",
    hausnummer: kontaktdaten.hausnummer || "",
    plz: kontaktdaten.plz || "",
    ort: kontaktdaten.ort || "",
    telefon: kontaktdaten.telefon || "",
  };
}

/**
 * Build ProduktLineItem[] from Anfrage produkte array.
 */
function buildProdukte(produkte: any[]): ProduktLineItem[] {
  return (produkte || []).map((p: any) => ({
    produkttyp: p.produkttyp_label || p.produkttyp || "Produkt",
    material: p.material_label || p.material || "",
    profil: p.profil_label || p.profil || "",
    masse_breite: p.masse_breite || 0,
    masse_hoehe: p.masse_hoehe || 0,
    fluegelanzahl: p.fluegelanzahl_label || p.fluegelanzahl || "",
    farbe_aussen: p.farbe_aussen_label || p.farbe_aussen || "",
    farbe_innen: p.farbe_innen_label || p.farbe_innen || "",
    dichtungsfarbe: p.dichtungsfarbe_label || p.dichtungsfarbe || "",
    verglasung: p.verglasung_label || p.verglasung || "",
    schallschutz: p.schallschutz_label || p.schallschutz || "",
    griff: p.griff_label || p.griff || "",
    weitere_optionen: [
      p.insektenschutz ? "Insektenschutz" : "",
      p.rolladen ? "Rolladen" : "",
    ]
      .filter(Boolean)
      .join(", "),
    stueckzahl: p.stueckzahl || 1,
    einzelpreis: p.einzelpreis || 0,
  }));
}

/**
 * Compute totals from produkte using tax.ts calcTax.
 */
function computeTotals(
  produkte: ProduktLineItem[],
  mwstSatz: number,
): { nettoSummeCents: number; mwstCents: number; bruttoSummeCents: number } {
  let nettoSummeCents = 0;
  for (const p of produkte) {
    nettoSummeCents += p.einzelpreis * p.stueckzahl;
  }
  const mwstCents = calcTax(nettoSummeCents, mwstSatz);
  const bruttoSummeCents = nettoSummeCents + mwstCents;
  return { nettoSummeCents, mwstCents, bruttoSummeCents };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// --- Main function ---

export async function generateAndStorePDF(
  type: PDFDocumentType,
  anfrageId: string,
  options?: {
    version?: number;
    originalRechnungId?: string;
    // Custom pricing for Angebots-Modal
    customPricing?: {
      bruttoSummeCents: number;
      nettoSummeCents: number;
      mwstCents: number;
      mwstSatz: number;
      gueltigkeitTage?: number;
      freitext?: string;
      preisanpassungBegruendung?: string;
      rabattCents?: number;
      positionen?: Array<{ positionsIndex: number; bruttoCents: number }>;
    };
  },
): Promise<GenerateResult> {
  // Dynamic imports to avoid Payload initialization issues in hooks
  const { getPayload } = await import("payload");
  const payloadConfig = (await import("@payload-config")).default;
  const payload = await getPayload({ config: payloadConfig });
  const { getSettings } = await import("@/lib/settings");
  const { getNextNumber } = await import("@/lib/nummernkreise");

  // Load Anfrage
  const anfrage = await payload.findByID({
    collection: "anfragen",
    id: anfrageId,
    depth: 1,
  });
  const settings = await getSettings();
  const pdfSettings = buildPDFSettings(settings as Record<string, any>);
  const kunde = buildKundenDaten(
    (anfrage.kontaktdaten as Record<string, any>) || {},
  );
  const produkte = buildProdukte((anfrage.produkte as any[]) || []);
  const mwstSatz = (settings as any).mwst_satz || 19;
  const { nettoSummeCents, mwstCents, bruttoSummeCents } = computeTotals(
    produkte,
    mwstSatz,
  );
  const anfrageNummer = (anfrage as any).anfrage_nummer || "";
  const now = new Date();

  let dokumentNummer: string;
  let filename: string;
  let props: AngebotPDFProps | RechnungPDFProps | GutschriftPDFProps;

  switch (type) {
    case "angebot": {
      dokumentNummer = await getNextNumber("ANG");
      const customP = options?.customPricing;
      const gueltigkeitTage =
        customP?.gueltigkeitTage || pdfSettings.angebots_gueltigkeit_tage || 30;
      const gueltigBis = new Date(now.getTime() + gueltigkeitTage * 86400000);
      const version = options?.version || 1;
      filename = `Angebot_${anfrageNummer}_V${version}.pdf`;

      // Use custom or computed pricing
      const finalNetto = customP ? customP.nettoSummeCents : nettoSummeCents;
      const finalMwst = customP ? customP.mwstCents : mwstCents;
      const finalBrutto = customP ? customP.bruttoSummeCents : bruttoSummeCents;

      const angebotProps: AngebotPDFProps = {
        dokumentNummer,
        datum: formatDate(now),
        gueltigBis: formatDate(gueltigBis),
        kunde,
        produkte,
        nettoSummeCents: finalNetto,
        mwstCents: finalMwst,
        bruttoSummeCents: finalBrutto,
        mwstSatz: customP?.mwstSatz || mwstSatz,
        settings: pdfSettings,
        anfrageNummer,
        version,
      };
      props = angebotProps;
      break;
    }
    case "rechnung": {
      dokumentNummer = await getNextNumber("RE");
      filename = `Rechnung_${anfrageNummer}.pdf`;
      const rechnungProps: RechnungPDFProps = {
        dokumentNummer,
        datum: formatDate(now),
        kunde,
        produkte,
        nettoSummeCents,
        mwstCents,
        bruttoSummeCents,
        mwstSatz,
        settings: pdfSettings,
        anfrageNummer,
        zahlungsziel: "14 Tage nach Rechnungseingang",
        verwendungszweck: dokumentNummer,
      };
      props = rechnungProps;
      break;
    }
    case "gutschrift": {
      dokumentNummer = await getNextNumber("GS");
      filename = `Gutschrift_${anfrageNummer}.pdf`;
      let originalRechnungNummer = "";
      let originalRechnungDatum = "";
      if (options?.originalRechnungId) {
        const origRechnung = await payload.findByID({
          collection: "rechnungen" as any,
          id: options.originalRechnungId,
        });
        originalRechnungNummer = (origRechnung as any).nummer || "";
        originalRechnungDatum = origRechnung.createdAt
          ? formatDate(new Date(origRechnung.createdAt))
          : "";
      } else {
        // Find latest rechnung for this anfrage
        const rechnungen = await payload.find({
          collection: "rechnungen" as any,
          where: {
            anfrage: { equals: anfrageId },
            typ: { equals: "rechnung" },
          },
          sort: "-createdAt",
          limit: 1,
        });
        if (rechnungen.docs.length > 0) {
          const latest = rechnungen.docs[0] as any;
          originalRechnungNummer = latest.nummer || "";
          originalRechnungDatum = latest.createdAt
            ? formatDate(new Date(latest.createdAt))
            : "";
        }
      }
      const gutschriftProps: GutschriftPDFProps = {
        dokumentNummer,
        datum: formatDate(now),
        kunde,
        produkte,
        erstattungNettoCents: nettoSummeCents,
        erstattungMwstCents: mwstCents,
        erstattungBruttoCents: bruttoSummeCents,
        mwstSatz,
        settings: pdfSettings,
        anfrageNummer,
        originalRechnungNummer,
        originalRechnungDatum,
      };
      props = gutschriftProps;
      break;
    }
  }

  // Render PDF
  const { buffer } = await renderPDF(type, props, filename);

  // Upload to pdf_uploads collection
  const uploadedFile = await payload.create({
    collection: "pdf_uploads" as any,
    data: { alt: filename } as any,
    file: {
      data: buffer,
      name: filename,
      mimetype: "application/pdf",
      size: buffer.length,
    },
  });

  // Create business document entry
  let dokumentId: string;
  if (type === "angebot") {
    // Determine next version
    const existingAngebote = await payload.find({
      collection: "angebote" as any,
      where: { anfrage: { equals: anfrageId } },
      sort: "-version",
      limit: 1,
    });
    const nextVersion =
      existingAngebote.docs.length > 0
        ? ((existingAngebote.docs[0] as any).version || 0) + 1
        : 1;
    const customP = options?.customPricing;
    const gueltigkeitTage =
      customP?.gueltigkeitTage || pdfSettings.angebots_gueltigkeit_tage || 30;
    const gueltigBis = new Date(
      now.getTime() + gueltigkeitTage * 86400000,
    ).toISOString();
    const finalNetto = customP ? customP.nettoSummeCents : nettoSummeCents;
    const finalMwst = customP ? customP.mwstCents : mwstCents;
    const finalBrutto = customP ? customP.bruttoSummeCents : bruttoSummeCents;

    const angebotDoc = await payload.create({
      collection: "angebote" as any,
      data: {
        nummer: dokumentNummer,
        version: nextVersion,
        anfrage: anfrageId,
        anfrage_nummer: anfrageNummer,
        status: "versendet",
        gueltig_bis: gueltigBis,
        freitext: customP?.freitext || undefined,
        pdf: uploadedFile.id,
        betrag_netto_cents: finalNetto,
        betrag_brutto_cents: finalBrutto,
        mwst_cents: finalMwst,
        mwst_satz: customP?.mwstSatz || mwstSatz,
        preisanpassung_begruendung:
          customP?.preisanpassungBegruendung || undefined,
        preisanpassung_positionen: customP?.positionen || undefined,
        rabatt_cents: customP?.rabattCents || undefined,
      } as any,
    });
    dokumentId = angebotDoc.id;
  } else {
    // rechnung or gutschrift -> rechnungen collection
    const docData: Record<string, any> = {
      typ: type,
      nummer: dokumentNummer,
      anfrage: anfrageId,
      anfrage_nummer: anfrageNummer,
      pdf: uploadedFile.id,
      betrag_netto_cents: nettoSummeCents,
      betrag_brutto_cents: bruttoSummeCents,
      mwst_cents: mwstCents,
      mwst_satz: mwstSatz,
    };
    if (type === "gutschrift" && options?.originalRechnungId) {
      docData.original_rechnung = options.originalRechnungId;
      const origRechnung = await payload.findByID({
        collection: "rechnungen" as any,
        id: options.originalRechnungId,
      });
      docData.original_rechnung_nummer = (origRechnung as any).nummer || "";
      docData.original_rechnung_datum = origRechnung.createdAt
        ? formatDate(new Date(origRechnung.createdAt))
        : "";
    }
    const rechnungDoc = await payload.create({
      collection: "rechnungen" as any,
      data: docData as any,
    });
    dokumentId = rechnungDoc.id;
  }

  return { buffer, filename, dokumentId, dokumentNummer };
}
