/**
 * Rechnungs-PDF Template.
 *
 * Complete Rechnung document compliant with Paragraph 14 UStG (10 Pflichtangaben):
 * 1. Name + Anschrift des Unternehmers -> PDFHeader
 * 2. Name + Anschrift des Leistungsempfaengers -> Empfaenger-Block
 * 3. Steuernummer oder USt-IdNr -> PDFFooter
 * 4. Ausstellungsdatum -> Dokumenten-Meta
 * 5. Fortlaufende Rechnungsnummer -> Dokumenten-Meta (RE-YYYY-NNNN)
 * 6. Menge und Art der Lieferung/Leistung -> ProduktBlock
 * 7. Zeitpunkt der Lieferung/Leistung -> Dokumenten-Meta (Leistungsdatum)
 * 8. Entgelt nach Steuersaetzen aufgeschluesselt -> MwStBlock
 * 9. Anzuwendender Steuersatz -> MwStBlock (mwstSatz %)
 * 10. Entgeltminderungen -> Static note in MwSt area
 *
 * Additional: Zahlungsvermerk-Block (Zahlungsziel, IBAN, Verwendungszweck)
 * NO Widerrufsbelehrung (only in Angebot)
 */

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { RechnungPDFProps } from "../types";
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
  zahlungsvermerk: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  zahlungsvermerkTitel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 4,
  },
  zahlungsvermerkLine: {
    fontSize: 10,
  },
  entgeltminderung: {
    marginTop: 8,
    fontSize: 9,
    color: "#6b7280",
  },
});

export default function RechnungPDF(props: RechnungPDFProps) {
  const {
    dokumentNummer,
    datum,
    kunde,
    produkte,
    nettoSummeCents,
    mwstCents,
    bruttoSummeCents,
    mwstSatz,
    settings,
    anfrageNummer,
    zahlungsziel,
    verwendungszweck,
  } = props;

  return (
    <Document title={`Rechnung ${dokumentNummer}`} language="de">
      <Page size="A4" style={styles.page}>
        {/* 1. Name + Anschrift des Unternehmers */}
        <PDFHeader settings={settings} />

        {/* 2. Name + Anschrift des Leistungsempfaengers */}
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

        {/* 4. Ausstellungsdatum + 5. Fortlaufende Rechnungsnummer */}
        <Text style={styles.dokumentTitel}>RECHNUNG {dokumentNummer}</Text>
        <Text style={styles.metaLine}>Datum: {datum}</Text>
        {/* 7. Zeitpunkt der Lieferung/Leistung */}
        <Text style={styles.metaLine}>Leistungsdatum: {datum}</Text>
        <Text style={styles.metaLine}>Anfrage: {anfrageNummer}</Text>
        <View style={styles.metaSpacer} />

        {/* 6. Menge und Art der Lieferung/Leistung */}
        <ProduktBlock produkte={produkte} />

        {/* 8. Entgelt nach Steuersaetzen + 9. Anzuwendender Steuersatz */}
        <MwStBlock
          nettoCents={nettoSummeCents}
          mwstCents={mwstCents}
          bruttoCents={bruttoSummeCents}
          mwstSatz={mwstSatz}
        />

        {/* 10. Entgeltminderungen */}
        <Text style={styles.entgeltminderung}>
          Skonti und Rabatte sind bereits beruecksichtigt.
        </Text>

        {/* Zahlungsvermerk-Block */}
        <View style={styles.zahlungsvermerk}>
          <Text style={styles.zahlungsvermerkTitel}>Zahlungsinformationen</Text>
          <Text style={styles.zahlungsvermerkLine}>
            Zahlungsziel: {zahlungsziel}
          </Text>
          <Text style={styles.zahlungsvermerkLine}>
            Verwendungszweck: {verwendungszweck}
          </Text>
          <Text style={styles.zahlungsvermerkLine}>
            IBAN: {settings.bank_iban}
          </Text>
          <Text style={styles.zahlungsvermerkLine}>
            BIC: {settings.bank_bic}
          </Text>
          <Text style={styles.zahlungsvermerkLine}>
            Bank: {settings.bank_name}
          </Text>
        </View>

        {/* 3. Steuernummer / USt-IdNr in Footer */}
        <PDFFooter settings={settings} />
      </Page>
    </Document>
  );
}
