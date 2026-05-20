/**
 * PDF generation type definitions -- Single Source of Truth for the PDF pipeline.
 *
 * Three document types: Angebot, Rechnung, Gutschrift.
 * Used by render-pdf.ts, PDF templates, and API routes.
 */

// --- Core Types ---

export type PDFDocumentType = "angebot" | "rechnung" | "gutschrift";

export interface ProduktLineItem {
  produkttyp: string;
  material: string;
  profil: string;
  masse_breite: number;
  masse_hoehe: number;
  fluegelanzahl: string;
  farbe_aussen: string;
  farbe_innen: string;
  dichtungsfarbe: string;
  verglasung: string;
  schallschutz: string;
  griff: string;
  weitere_optionen: string;
  stueckzahl: number;
  einzelpreis: number; // in cents
}

// --- Settings (from Settings Global) ---

export interface PDFSettings {
  firmenname: string;
  adresse_strasse: string;
  adresse_hausnummer: string;
  adresse_plz: string;
  adresse_ort: string;
  telefon: string;
  email: string;
  steuernummer: string;
  ust_id: string;
  bank_iban: string;
  bank_bic: string;
  bank_name: string;
  widerrufsbelehrung: string;
  angebots_gueltigkeit_tage: number;
  pdf_logo_path: string | null; // Absolute file path or null
}

// --- Kunden-Daten ---

export interface KundenDaten {
  vorname: string;
  nachname: string;
  email: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  telefon: string;
}

// --- Template Props (one per document type) ---

export interface AngebotPDFProps {
  dokumentNummer: string;
  datum: string;
  gueltigBis: string;
  kunde: KundenDaten;
  produkte: ProduktLineItem[];
  nettoSummeCents: number;
  mwstCents: number;
  bruttoSummeCents: number;
  mwstSatz: number;
  settings: PDFSettings;
  anfrageNummer: string;
  version?: number;
}

export interface RechnungPDFProps {
  dokumentNummer: string;
  datum: string;
  kunde: KundenDaten;
  produkte: ProduktLineItem[];
  nettoSummeCents: number;
  mwstCents: number;
  bruttoSummeCents: number;
  mwstSatz: number;
  settings: PDFSettings;
  anfrageNummer: string;
  zahlungsziel: string;
  verwendungszweck: string;
}

export interface GutschriftPDFProps {
  dokumentNummer: string;
  datum: string;
  kunde: KundenDaten;
  originalRechnungNummer: string;
  originalRechnungDatum: string;
  produkte: ProduktLineItem[];
  erstattungNettoCents: number;
  erstattungMwstCents: number;
  erstattungBruttoCents: number;
  mwstSatz: number;
  settings: PDFSettings;
  anfrageNummer: string;
}

export type PDFTemplateProps =
  | AngebotPDFProps
  | RechnungPDFProps
  | GutschriftPDFProps;

// --- Render Result ---

export interface PDFRenderResult {
  buffer: Buffer;
  filename: string;
}
