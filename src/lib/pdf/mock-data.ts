/**
 * Mock data for PDF preview route.
 *
 * Provides complete test props for all three document types:
 * Angebot, Rechnung, Gutschrift.
 *
 * Used by /api/pdf-preview/[type] in Plan 03.
 */

import type {
  AngebotPDFProps,
  RechnungPDFProps,
  GutschriftPDFProps,
  PDFSettings,
  KundenDaten,
  ProduktLineItem,
} from "./types";

const MOCK_SETTINGS: PDFSettings = {
  firmenname: "Muster Fenster GmbH",
  adresse_strasse: "Musterstrasse",
  adresse_hausnummer: "42",
  adresse_plz: "12345",
  adresse_ort: "Musterstadt",
  telefon: "+49 30 000 000 00",
  email: "info@example.com",
  steuernummer: "123/456/78901",
  ust_id: "DE000000000",
  bank_iban: "DE89 3704 0044 0532 0130 00",
  bank_bic: "COBADEFFXXX",
  bank_name: "Commerzbank",
  widerrufsbelehrung:
    "Widerrufsbelehrung: Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gruenden diesen Vertrag zu widerrufen. Die Widerrufsfrist betraegt 14 Tage ab dem Tag des Vertragsabschlusses. Um Ihr Widerrufsrecht auszuueben, muessen Sie uns mittels einer eindeutigen Erklaerung ueber Ihren Entschluss informieren.",
  angebots_gueltigkeit_tage: 30,
  pdf_logo_path: null,
};

const MOCK_KUNDE: KundenDaten = {
  vorname: "Max",
  nachname: "Mustermann",
  email: "max@mustermann.de",
  strasse: "Beispielweg",
  hausnummer: "7a",
  plz: "54321",
  ort: "Beispielstadt",
  telefon: "+49 30 000 000 99",
};

const MOCK_PRODUKTE: ProduktLineItem[] = [
  {
    produkttyp: "Fenster PVC",
    material: "PVC",
    profil: "Drutex Iglo 5",
    masse_breite: 1200,
    masse_hoehe: 1400,
    fluegelanzahl: "2-fluegelig, Dreh-Kipp L+R",
    farbe_aussen: "Anthrazit (RAL 7016)",
    farbe_innen: "Weiss",
    dichtungsfarbe: "Schwarz",
    verglasung: "2-fach Waermeschutz",
    schallschutz: "Klasse 3",
    griff: "Premium",
    weitere_optionen: "Insektenschutz",
    stueckzahl: 2,
    einzelpreis: 49900, // 499,00 EUR
  },
  {
    produkttyp: "Fenster PVC",
    material: "PVC",
    profil: "Drutex Iglo 5",
    masse_breite: 800,
    masse_hoehe: 1000,
    fluegelanzahl: "1-fluegelig, Dreh-Kipp R",
    farbe_aussen: "Weiss",
    farbe_innen: "Weiss",
    dichtungsfarbe: "Grau",
    verglasung: "3-fach Waermeschutz",
    schallschutz: "Klasse 2",
    griff: "Standard",
    weitere_optionen: "",
    stueckzahl: 3,
    einzelpreis: 34900, // 349,00 EUR
  },
];

export const MOCK_ANGEBOT_PROPS: AngebotPDFProps = {
  dokumentNummer: "ANG-2026-0001",
  datum: "31.03.2026",
  gueltigBis: "30.04.2026",
  kunde: MOCK_KUNDE,
  produkte: MOCK_PRODUKTE,
  nettoSummeCents: 204500, // 2x499 + 3x349 = 998 + 1047 = 2045,00
  mwstCents: 38855, // 2045 * 0.19 = 388,55
  bruttoSummeCents: 243355, // 2433,55
  mwstSatz: 19,
  settings: MOCK_SETTINGS,
  anfrageNummer: "ANF-2026-0042",
  version: 1,
};

export const MOCK_RECHNUNG_PROPS: RechnungPDFProps = {
  dokumentNummer: "RE-2026-0001",
  datum: "31.03.2026",
  kunde: MOCK_KUNDE,
  produkte: MOCK_PRODUKTE,
  nettoSummeCents: 204500,
  mwstCents: 38855,
  bruttoSummeCents: 243355,
  mwstSatz: 19,
  settings: MOCK_SETTINGS,
  anfrageNummer: "ANF-2026-0042",
  zahlungsziel: "14 Tage nach Rechnungseingang",
  verwendungszweck: "RE-2026-0001",
};

export const MOCK_GUTSCHRIFT_PROPS: GutschriftPDFProps = {
  dokumentNummer: "GS-2026-0001",
  datum: "31.03.2026",
  kunde: MOCK_KUNDE,
  originalRechnungNummer: "RE-2026-0001",
  originalRechnungDatum: "15.03.2026",
  produkte: MOCK_PRODUKTE,
  erstattungNettoCents: 204500,
  erstattungMwstCents: 38855,
  erstattungBruttoCents: 243355,
  mwstSatz: 19,
  settings: MOCK_SETTINGS,
  anfrageNummer: "ANF-2026-0042",
};
