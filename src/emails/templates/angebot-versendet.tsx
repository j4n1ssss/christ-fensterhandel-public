import { Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout";
import { AnfrageCard } from "../components/anfrage-card";
import { EmailButton } from "../components/email-button";

interface AngebotVersendetProps {
  anfrageNummer: string;
  kunde: { vorname: string; nachname: string };
  produkte: Array<{ name: string; stueckzahl: number; einzelpreis: number }>;
  gesamtbetragCents: number;
  gueltigBis: string;
  angebotUrl: string;
  settings: BaseLayoutSettings;
  logoUrl?: string;
}

export default function AngebotVersendet({
  anfrageNummer,
  kunde,
  produkte,
  gesamtbetragCents,
  gueltigBis,
  angebotUrl,
  settings,
  logoUrl,
}: AngebotVersendetProps) {
  return (
    <BaseLayout
      preview={`Ihr Angebot für Anfrage ${anfrageNummer}`}
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
        Ihr Angebot
      </Heading>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Guten Tag {kunde.vorname} {kunde.nachname},
      </Text>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Wir haben ein Angebot für Ihre Anfrage {anfrageNummer} erstellt. Bitte
        prüfen Sie es in Ruhe.
      </Text>

      <AnfrageCard produkte={produkte} gesamtbetragCents={gesamtbetragCents} />

      <Text style={{ fontSize: "14px", color: "#666666", lineHeight: "1.5" }}>
        Das Angebot ist gültig bis {gueltigBis}.
      </Text>

      <Text
        style={{
          fontSize: "14px",
          color: "#1a1a1a",
          lineHeight: "1.5",
          marginTop: "16px",
        }}
      >
        <EmailButton href={angebotUrl}>Angebot ansehen</EmailButton>
      </Text>
    </BaseLayout>
  );
}
