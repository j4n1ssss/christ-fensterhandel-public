import { Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout";
import { AnfrageCard } from "../components/anfrage-card";
import { EmailButton } from "../components/email-button";

interface NeueAnfrageProps {
  anfrageNummer: string;
  kundeName: string;
  produkte: Array<{ name: string; stueckzahl: number; einzelpreis: number }>;
  gesamtbetragCents: number;
  adminUrl: string;
  settings: BaseLayoutSettings;
  logoUrl?: string;
}

export default function NeueAnfrage({
  anfrageNummer,
  kundeName,
  produkte,
  gesamtbetragCents,
  adminUrl,
  settings,
  logoUrl,
}: NeueAnfrageProps) {
  return (
    <BaseLayout
      preview={`Neue Anfrage ${anfrageNummer} von ${kundeName}`}
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
        Neue Benachrichtigung:
      </Heading>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Neue Anfrage <strong>{anfrageNummer}</strong> von{" "}
        <strong>{kundeName}</strong> eingegangen.
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
        <EmailButton href={adminUrl} variant="staff">
          Im Admin öffnen
        </EmailButton>
      </Text>
    </BaseLayout>
  );
}
