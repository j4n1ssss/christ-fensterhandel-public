import { Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout";

interface StornierungProps {
  anfrageNummer: string;
  kunde: { vorname: string; nachname: string };
  grund?: string;
  rueckerstattungInfo?: string;
  settings: BaseLayoutSettings;
  logoUrl?: string;
}

export default function Stornierung({
  anfrageNummer,
  kunde,
  grund,
  rueckerstattungInfo,
  settings,
  logoUrl,
}: StornierungProps) {
  return (
    <BaseLayout
      preview={`Anfrage ${anfrageNummer} wurde storniert`}
      settings={settings}
      logoUrl={logoUrl}
    >
      <Heading
        as="h1"
        style={{
          fontSize: "20px",
          fontWeight: 600,
          color: "#ef4444",
          lineHeight: "1.3",
        }}
      >
        Anfrage storniert
      </Heading>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Guten Tag {kunde.vorname} {kunde.nachname},
      </Text>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Ihre Anfrage {anfrageNummer} wurde storniert.
      </Text>

      {grund && (
        <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
          Grund: {grund}
        </Text>
      )}

      {rueckerstattungInfo && (
        <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
          {rueckerstattungInfo}
        </Text>
      )}

      <Text style={{ fontSize: "14px", color: "#666666", lineHeight: "1.5" }}>
        Bei Fragen kontaktieren Sie uns gerne unter {settings.telefon} oder{" "}
        {settings.email}.
      </Text>
    </BaseLayout>
  );
}
