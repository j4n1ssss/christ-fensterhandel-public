/**
 * Shared PDF Header component.
 *
 * Renders Logo (left) + Firmendaten (right) with separator line.
 * Used by all three PDF templates (Angebot, Rechnung, Gutschrift).
 */

import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { PDFSettings } from "../types";

interface PDFHeaderProps {
  settings: PDFSettings;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logo: {
    maxWidth: 120,
    maxHeight: 60,
  },
  firmennameFallback: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
  },
  firmendaten: {
    textAlign: "right",
    fontSize: 10,
    color: "#6b7280",
  },
  firmendatenLine: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "right",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 20,
  },
});

export default function PDFHeader({ settings }: PDFHeaderProps) {
  return (
    <View>
      <View style={styles.container}>
        {/* Left side: Logo or Firmenname fallback */}
        <View>
          {settings.pdf_logo_path ? (
            <Image src={settings.pdf_logo_path} style={styles.logo} />
          ) : (
            <Text style={styles.firmennameFallback}>{settings.firmenname}</Text>
          )}
        </View>

        {/* Right side: Firmendaten */}
        <View style={styles.firmendaten}>
          <Text style={styles.firmendatenLine}>{settings.firmenname}</Text>
          <Text style={styles.firmendatenLine}>
            {settings.adresse_strasse} {settings.adresse_hausnummer}
          </Text>
          <Text style={styles.firmendatenLine}>
            {settings.adresse_plz} {settings.adresse_ort}
          </Text>
          <Text style={styles.firmendatenLine}>{settings.telefon}</Text>
          <Text style={styles.firmendatenLine}>{settings.email}</Text>
        </View>
      </View>

      {/* Separator line */}
      <View style={styles.separator} />
    </View>
  );
}
