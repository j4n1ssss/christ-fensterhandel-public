import { Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout";
import { EmailButton } from "../components/email-button";

interface RueckfrageProps {
  anfrageNummer: string;
  kunde: { vorname: string; nachname: string };
  frageText: string;
  antwortUrl: string;
  settings: BaseLayoutSettings;
  logoUrl?: string;
}

export default function Rueckfrage({
  anfrageNummer,
  kunde,
  frageText,
  antwortUrl,
  settings,
  logoUrl,
}: RueckfrageProps) {
  return (
    <BaseLayout
      preview={`Rückfrage zu Anfrage ${anfrageNummer}`}
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
        Rückfrage zu Ihrer Anfrage
      </Heading>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Guten Tag {kunde.vorname} {kunde.nachname},
      </Text>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Wir haben eine Rückfrage zu Ihrer Anfrage {anfrageNummer}:
      </Text>

      <Text
        style={{
          fontSize: "14px",
          color: "#1a1a1a",
          lineHeight: "1.5",
          backgroundColor: "#f9f9f9",
          padding: "12px 16px",
          borderRadius: "4px",
          borderLeft: "3px solid #1a1a1a",
        }}
      >
        {frageText}
      </Text>

      <Text
        style={{
          fontSize: "14px",
          color: "#1a1a1a",
          lineHeight: "1.5",
          marginTop: "16px",
        }}
      >
        <EmailButton href={antwortUrl}>Jetzt antworten</EmailButton>
      </Text>

      <Text style={{ fontSize: "14px", color: "#666666", lineHeight: "1.5" }}>
        Bitte antworten Sie möglichst zeitnah, damit wir Ihre Anfrage weiter
        bearbeiten können.
      </Text>
    </BaseLayout>
  );
}
