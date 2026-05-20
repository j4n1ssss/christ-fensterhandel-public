/**
 * Shared PDF Footer component.
 *
 * 3-column layout: Bankverbindung | Steuer | Kontakt + Seitenzahl.
 * Fixed position at bottom of every page.
 * Used by all three PDF templates (Angebot, Rechnung, Gutschrift).
 */

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { PDFSettings } from "../types";

interface PDFFooterProps {
  settings: PDFSettings;
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9ca3af",
  },
  column: {
    flexDirection: "column",
  },
  line: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

export default function PDFFooter({ settings }: PDFFooterProps) {
  return (
    <View style={styles.footer} fixed>
      {/* Left column: Bankverbindung */}
      <View style={styles.column}>
        <Text style={styles.line}>IBAN: {settings.bank_iban}</Text>
        <Text style={styles.line}>BIC: {settings.bank_bic}</Text>
        <Text style={styles.line}>{settings.bank_name}</Text>
      </View>

      {/* Center column: Steuer */}
      <View style={styles.column}>
        <Text style={styles.line}>St.-Nr.: {settings.steuernummer}</Text>
        <Text style={styles.line}>USt-IdNr.: {settings.ust_id}</Text>
      </View>

      {/* Right column: Kontakt + Seitenzahl */}
      <View style={styles.column}>
        <Text style={styles.line}>{settings.telefon}</Text>
        <Text style={styles.line}>{settings.email}</Text>
        <Text
          style={styles.line}
          render={({ pageNumber, totalPages }) =>
            `Seite ${pageNumber} von ${totalPages}`
          }
        />
      </View>
    </View>
  );
}
