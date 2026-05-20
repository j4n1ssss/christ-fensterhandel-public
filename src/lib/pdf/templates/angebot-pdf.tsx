/**
 * Angebots-PDF Template.
 *
 * Complete Angebot document with:
 * - Header (Logo + Firmendaten)
 * - Empfaenger-Block (Kundenadresse)
 * - Dokumenten-Meta (ANG-Nummer, Datum, Gueltig bis, Anfrage-Referenz)
 * - ProduktBlock (Positions-Tabelle mit Konfigurations-Details)
 * - MwStBlock (Netto + MwSt + Brutto)
 * - Widerrufsbelehrung (from Settings)
 * - Footer (Bankverbindung + Steuer + Kontakt + Seitenzahl)
 */

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { AngebotPDFProps } from "../types";
import PDFHeader from "../components/pdf-header";
import PDFFooter from "../components/pdf-footer";
import ProduktBlock from "../components/produkt-block";
import MwStBlock from "../components/mwst-block";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
  },
  empfaenger: {
    marginBottom: 24,
  },
  empfaengerLine: {
    fontSize: 11,
  },
  dokumentTitel: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  metaLine: {
    fontSize: 11,
    color: "#6b7280",
  },
  metaSpacer: {
    marginBottom: 16,
  },
  widerrufsContainer: {
    marginTop: 32,
  },
  widerrufsSeparator: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginBottom: 12,
  },
  widerrufsText: {
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.5,
  },
});

export default function AngebotPDF(props: AngebotPDFProps) {
  const {
    dokumentNummer,
    datum,
    gueltigBis,
    kunde,
    produkte,
    nettoSummeCents,
    mwstCents,
    bruttoSummeCents,
    mwstSatz,
    settings,
    anfrageNummer,
  } = props;

  return (
    <Document title={`Angebot ${dokumentNummer}`} language="de">
      <Page size="A4" style={styles.page}>
        {/* Header: Logo + Firmendaten */}
        <PDFHeader settings={settings} />

        {/* Empfaenger-Block */}
        <View style={styles.empfaenger}>
          <Text style={styles.empfaengerLine}>
            {kunde.vorname} {kunde.nachname}
          </Text>
          <Text style={styles.empfaengerLine}>
            {kunde.strasse} {kunde.hausnummer}
          </Text>
          <Text style={styles.empfaengerLine}>
            {kunde.plz} {kunde.ort}
          </Text>
        </View>

        {/* Dokumenten-Meta */}
        <Text style={styles.dokumentTitel}>Angebot {dokumentNummer}</Text>
        <Text style={styles.metaLine}>Datum: {datum}</Text>
        <Text style={styles.metaLine}>Gueltig bis: {gueltigBis}</Text>
        <Text style={styles.metaLine}>Anfrage: {anfrageNummer}</Text>
        <View style={styles.metaSpacer} />

        {/* Positions-Tabelle */}
        <ProduktBlock produkte={produkte} />

        {/* MwSt-Block */}
        <MwStBlock
          nettoCents={nettoSummeCents}
          mwstCents={mwstCents}
          bruttoCents={bruttoSummeCents}
          mwstSatz={mwstSatz}
        />

        {/* Widerrufsbelehrung */}
        {settings.widerrufsbelehrung ? (
          <View style={styles.widerrufsContainer}>
            <View style={styles.widerrufsSeparator} />
            <Text style={styles.widerrufsText}>
              {settings.widerrufsbelehrung}
            </Text>
          </View>
        ) : null}

        {/* Footer: Bankverbindung + Steuer + Kontakt + Seitenzahl */}
        <PDFFooter settings={settings} />
      </Page>
    </Document>
  );
}
