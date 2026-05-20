import { Text, Heading, Section } from "@react-email/components";
import * as React from "react";
import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout";
import { EmailButton } from "../components/email-button";

export interface FreitextEmailProps {
  settings: BaseLayoutSettings;
  logoUrl?: string;
  anfrageNummer: string;
  kunde: { vorname: string; nachname: string };
  freitext: string;
  subject: string;
  anfrageUrl: string;
}

export default function FreitextEmail({
  settings,
  logoUrl,
  anfrageNummer,
  kunde,
  freitext,
  subject,
  anfrageUrl,
}: FreitextEmailProps) {
  return (
    <BaseLayout
      preview={subject || `Nachricht zu Ihrer Anfrage ${anfrageNummer}`}
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
        Nachricht zu Ihrer Anfrage
      </Heading>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Guten Tag {kunde.vorname} {kunde.nachname},
      </Text>

      {freitext ? (
        <Text
          style={{
            fontSize: "14px",
            color: "#1a1a1a",
            lineHeight: "1.6",
            whiteSpace: "pre-wrap",
          }}
        >
          {freitext}
        </Text>
      ) : null}

      <Section style={{ marginTop: "16px" }}>
        <Text
          style={{
            fontSize: "14px",
            color: "#666666",
            lineHeight: "1.5",
          }}
        >
          Bezüglich Ihrer Anfrage #{anfrageNummer}
        </Text>
      </Section>

      <Section style={{ marginTop: "16px" }}>
        <EmailButton href={anfrageUrl}>Anfrage ansehen</EmailButton>
      </Section>

      <Text
        style={{
          fontSize: "14px",
          color: "#666666",
          lineHeight: "1.5",
          marginTop: "24px",
        }}
      >
        Bei Fragen können Sie jederzeit auf diese E-Mail antworten.
      </Text>
    </BaseLayout>
  );
}
