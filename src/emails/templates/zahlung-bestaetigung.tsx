import { Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout";
import { AnfrageCard } from "../components/anfrage-card";
import { formatCents } from "@/lib/format-currency";

interface ZahlungBestaetigungProps {
  anfrageNummer: string;
  kunde: { vorname: string; nachname: string };
  gesamtbetragCents: number;
  produkte: Array<{ name: string; stueckzahl: number; einzelpreis: number }>;
  anfrageUrl: string;
  settings: BaseLayoutSettings;
  logoUrl?: string;
}

export default function ZahlungBestaetigung({
  anfrageNummer,
  kunde,
  gesamtbetragCents,
  produkte,
  anfrageUrl,
  settings,
  logoUrl,
}: ZahlungBestaetigungProps) {
  return (
    <BaseLayout
      preview={`Zahlung für Anfrage ${anfrageNummer} eingegangen`}
      settings={settings}
      logoUrl={logoUrl}
    >
      <Heading
        as="h1"
        style={{
          fontSize: "20px",
          fontWeight: 600,
          color: "#1a1a1a",
          lineHeight: "1.3",
        }}
      >
        Zahlung eingegangen
      </Heading>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Guten Tag {kunde.vorname} {kunde.nachname},
      </Text>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Vielen Dank! Ihre Zahlung über{" "}
        <strong>{formatCents(gesamtbetragCents)}</strong> für die Anfrage{" "}
        {anfrageNummer} ist bei uns eingegangen.
      </Text>

      <AnfrageCard produkte={produkte} gesamtbetragCents={gesamtbetragCents} />

      <Text
        style={{
          fontSize: "14px",
          color: "#1a1a1a",
          lineHeight: "1.5",
          fontWeight: 600,
          marginTop: "16px",
        }}
      >
        Nächste Schritte
      </Text>
      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Wir bestellen Ihre Maßanfertigung beim Hersteller und informieren Sie
        über jeden weiteren Schritt. Bei Fragen können Sie jederzeit auf diese
        E-Mail antworten oder sich telefonisch an uns wenden.
      </Text>
    </BaseLayout>
  );
}
