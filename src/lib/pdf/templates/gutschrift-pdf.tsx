/**
 * Gutschrift-PDF Template.
 *
 * Credit note document referencing the original Rechnung.
 *
 * Differences from Rechnung:
 * - Title: "GUTSCHRIFT" instead of "RECHNUNG"
 * - GS-Nummer (GS-YYYY-NNNN) instead of RE-Nummer
 * - Reference to original Rechnung (number + date) in italic
 * - Amounts displayed as negative (refund)
 * - MwStBlock labels changed to "Erstattung ..."
 * - NO Zahlungsvermerk-Block
 * - NO Widerrufsbelehrung
 */

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { GutschriftPDFProps } from "../types";
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
  referenzLine: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#6b7280",
    marginBottom: 16,
  },
  metaSpacer: {
    marginBottom: 16,
  },
});

export default function GutschriftPDF(props: GutschriftPDFProps) {
  const {
    dokumentNummer,
    datum,
    kunde,
    originalRechnungNummer,
    originalRechnungDatum,
    produkte,
    erstattungNettoCents,
    erstattungMwstCents,
    erstattungBruttoCents,
    mwstSatz,
    settings,
    anfrageNummer,
  } = props;

  return (
    <Document title={`Gutschrift ${dokumentNummer}`} language="de">
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
        <Text style={styles.dokumentTitel}>GUTSCHRIFT {dokumentNummer}</Text>
        <Text style={styles.metaLine}>Datum: {datum}</Text>
        <Text style={styles.metaLine}>Anfrage: {anfrageNummer}</Text>
        <View style={styles.metaSpacer} />

        {/* Referenz zur Original-Rechnung */}
        <Text style={styles.referenzLine}>
          Gutschrift zur Rechnung {originalRechnungNummer} vom{" "}
          {originalRechnungDatum}
        </Text>

        {/* Positions-Tabelle */}
        <ProduktBlock produkte={produkte} />

        {/* MwSt-Block with negative amounts (Erstattung) */}
        <MwStBlock
          nettoCents={-erstattungNettoCents}
          mwstCents={-erstattungMwstCents}
          bruttoCents={-erstattungBruttoCents}
          mwstSatz={mwstSatz}
          labels={{
            netto: "Erstattung Nettobetrag",
            mwst: `Erstattung MwSt (${mwstSatz}%)`,
            brutto: "Erstattungsbetrag",
          }}
        />

        {/* Footer: Bankverbindung + Steuer + Kontakt + Seitenzahl */}
        <PDFFooter settings={settings} />
      </Page>
    </Document>
  );
}
