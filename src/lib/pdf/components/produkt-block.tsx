/**
 * PDF Product Table component.
 *
 * Renders a table with header row and data rows for each product.
 * Each product row shows multi-line configuration details.
 * Used by all three PDF templates (Angebot, Rechnung, Gutschrift).
 */

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ProduktLineItem } from "../types";
import { formatCents } from "@/lib/format-currency";

interface ProduktBlockProps {
  produkte: ProduktLineItem[];
}

const styles = StyleSheet.create({
  table: {
    marginTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    textTransform: "uppercase",
  },
  dataRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  colPos: {
    width: "6%",
    fontSize: 10,
  },
  colBezeichnung: {
    width: "44%",
    fontSize: 10,
  },
  colMenge: {
    width: "10%",
    fontSize: 10,
    textAlign: "right",
  },
  colEP: {
    width: "18%",
    fontSize: 10,
    textAlign: "right",
  },
  colGP: {
    width: "22%",
    fontSize: 10,
    textAlign: "right",
  },
  produktName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  configLine: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  headerText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
});

export default function ProduktBlock({ produkte }: ProduktBlockProps) {
  return (
    <View style={styles.table}>
      {/* Table Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { width: "6%" }]}>Pos</Text>
        <Text style={[styles.headerText, { width: "44%" }]}>Bezeichnung</Text>
        <Text style={[styles.headerText, { width: "10%", textAlign: "right" }]}>
          Menge
        </Text>
        <Text style={[styles.headerText, { width: "18%", textAlign: "right" }]}>
          EP
        </Text>
        <Text style={[styles.headerText, { width: "22%", textAlign: "right" }]}>
          GP
        </Text>
      </View>

      {/* Data Rows */}
      {produkte.map((produkt, index) => (
        <View key={index} style={styles.dataRow} wrap={false}>
          {/* Pos */}
          <Text style={styles.colPos}>{index + 1}</Text>

          {/* Bezeichnung (multi-line) */}
          <View style={styles.colBezeichnung}>
            <Text style={styles.produktName}>
              {produkt.produkttyp} {produkt.material} - {produkt.profil}
            </Text>
            <Text style={styles.configLine}>
              {produkt.masse_breite}x{produkt.masse_hoehe}mm |{" "}
              {produkt.fluegelanzahl}
            </Text>
            <Text style={styles.configLine}>
              Aussen: {produkt.farbe_aussen} | Innen: {produkt.farbe_innen} |
              Dichtung: {produkt.dichtungsfarbe}
            </Text>
            <Text style={styles.configLine}>
              {produkt.verglasung} | Schallschutz {produkt.schallschutz} | Griff{" "}
              {produkt.griff}
            </Text>
            {produkt.weitere_optionen ? (
              <Text style={styles.configLine}>{produkt.weitere_optionen}</Text>
            ) : null}
          </View>

          {/* Menge */}
          <Text style={styles.colMenge}>{produkt.stueckzahl}x</Text>

          {/* Einzelpreis */}
          <Text style={styles.colEP}>{formatCents(produkt.einzelpreis)}</Text>

          {/* Gesamtpreis */}
          <Text style={styles.colGP}>
            {formatCents(produkt.einzelpreis * produkt.stueckzahl)}
          </Text>
        </View>
      ))}
    </View>
  );
}
