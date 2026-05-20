/**
 * PDF MwSt Summary Block component.
 *
 * Right-aligned block showing Netto + MwSt + Brutto totals.
 * Used by all three PDF templates (Angebot, Rechnung, Gutschrift).
 */

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { formatCents } from "@/lib/format-currency";

interface MwStBlockProps {
  nettoCents: number;
  mwstCents: number;
  bruttoCents: number;
  mwstSatz: number;
  /** Optional label overrides for Gutschrift (Erstattung) */
  labels?: {
    netto?: string;
    mwst?: string;
    brutto?: string;
  };
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    marginTop: 16,
  },
  inner: {
    width: 200,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  label: {
    fontSize: 10,
  },
  value: {
    fontSize: 10,
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: "#000000",
  },
  bruttoLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  bruttoValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
});

export default function MwStBlock({
  nettoCents,
  mwstCents,
  bruttoCents,
  mwstSatz,
  labels,
}: MwStBlockProps) {
  const nettoLabel = labels?.netto ?? "Nettobetrag";
  const mwstLabel = labels?.mwst ?? `MwSt (${mwstSatz}%)`;
  const bruttoLabel = labels?.brutto ?? "Bruttobetrag";

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* Netto row */}
        <View style={styles.row}>
          <Text style={styles.label}>{nettoLabel}</Text>
          <Text style={styles.value}>{formatCents(nettoCents)}</Text>
        </View>

        {/* MwSt row */}
        <View style={styles.row}>
          <Text style={styles.label}>{mwstLabel}</Text>
          <Text style={styles.value}>{formatCents(mwstCents)}</Text>
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Brutto row */}
        <View style={styles.row}>
          <Text style={styles.bruttoLabel}>{bruttoLabel}</Text>
          <Text style={styles.bruttoValue}>{formatCents(bruttoCents)}</Text>
        </View>
      </View>
    </View>
  );
}
