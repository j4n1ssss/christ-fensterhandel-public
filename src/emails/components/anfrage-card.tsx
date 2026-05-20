import { Section, Text, Hr } from "@react-email/components";
import * as React from "react";
import { formatCents } from "@/lib/format-currency";
import { calcTax, calcGrossFromNet } from "@/lib/tax";

interface AnfrageCardProps {
  produkte: Array<{
    name: string;
    stueckzahl: number;
    einzelpreis: number;
  }>;
  gesamtbetragCents: number;
  mwstRate?: number;
}

export function AnfrageCard({
  produkte,
  gesamtbetragCents,
  mwstRate = 19,
}: AnfrageCardProps) {
  const mwstCents = calcTax(gesamtbetragCents, mwstRate);
  const bruttoCents = calcGrossFromNet(gesamtbetragCents, mwstRate);

  return (
    <Section
      style={{
        backgroundColor: "#f9f9f9",
        padding: "16px",
        borderRadius: "4px",
      }}
    >
      {produkte.map((produkt, index) => (
        <Text
          key={index}
          style={{
            fontSize: "14px",
            color: "#1a1a1a",
            margin: "0 0 4px",
            lineHeight: "1.5",
          }}
        >
          {produkt.name} x{produkt.stueckzahl} &ndash;{" "}
          {formatCents(produkt.einzelpreis)}
        </Text>
      ))}
      <Hr style={{ borderColor: "#e5e5e5", margin: "8px 0" }} />
      <Text
        style={{
          fontSize: "14px",
          color: "#1a1a1a",
          margin: "0 0 2px",
          lineHeight: "1.5",
        }}
      >
        Netto: {formatCents(gesamtbetragCents)}
      </Text>
      <Text
        style={{
          fontSize: "14px",
          color: "#666666",
          margin: "0 0 2px",
          lineHeight: "1.5",
        }}
      >
        zzgl. {mwstRate}% MwSt: {formatCents(mwstCents)}
      </Text>
      <Text
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "#1a1a1a",
          margin: 0,
          lineHeight: "1.5",
        }}
      >
        Gesamt (brutto): {formatCents(bruttoCents)}
      </Text>
    </Section>
  );
}
