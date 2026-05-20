import { Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout";
import { AnfrageCard } from "../components/anfrage-card";
import { EmailButton } from "../components/email-button";

interface AnfrageBestaetigungProps {
  anfrageNummer: string;
  kunde: { vorname: string; nachname: string };
  produkte: Array<{ name: string; stueckzahl: number; einzelpreis: number }>;
  gesamtbetragCents: number;
  anfrageUrl: string;
  settings: BaseLayoutSettings;
  logoUrl?: string;
}

export default function AnfrageBestaetigung({
  anfrageNummer,
  kunde,
  produkte,
  gesamtbetragCents,
  anfrageUrl,
  settings,
  logoUrl,
}: AnfrageBestaetigungProps) {
  return (
    <BaseLayout
      preview={`Ihre Anfrage ${anfrageNummer} ist eingegangen`}
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
        Anfrage eingegangen
      </Heading>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Guten Tag {kunde.vorname} {kunde.nachname},
      </Text>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Vielen Dank für Ihre Anfrage {anfrageNummer}. Wir haben Ihre Anfrage
        erhalten und werden sie schnellstmöglich bearbeiten.
      </Text>

      <Text
        style={{
          fontSize: "14px",
          color: "#1a1a1a",
          lineHeight: "1.5",
          fontWeight: 600,
        }}
      >
        Ihre Produkte:
      </Text>

      <AnfrageCard produkte={produkte} gesamtbetragCents={gesamtbetragCents} />

      <Text
        style={{
          fontSize: "14px",
          color: "#1a1a1a",
          lineHeight: "1.5",
          marginTop: "16px",
        }}
      >
        <EmailButton href={anfrageUrl}>Anfrage ansehen</EmailButton>
      </Text>

      <Text style={{ fontSize: "14px", color: "#666666", lineHeight: "1.5" }}>
        Wir melden uns in Kürze bei Ihnen mit einem Angebot. Bei Fragen können
        Sie jederzeit auf diese E-Mail antworten.
      </Text>
    </BaseLayout>
  );
}
