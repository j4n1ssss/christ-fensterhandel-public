import { Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout";

interface ReklamationProps {
  anfrageNummer: string;
  kunde: { vorname: string; nachname: string };
  anfrageUrl: string;
  settings: BaseLayoutSettings;
  logoUrl?: string;
}

export default function Reklamation({
  anfrageNummer,
  kunde,
  anfrageUrl,
  settings,
  logoUrl,
}: ReklamationProps) {
  return (
    <BaseLayout
      preview={`Reklamation zu Anfrage ${anfrageNummer}`}
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
        Reklamation eingegangen
      </Heading>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Guten Tag {kunde.vorname} {kunde.nachname},
      </Text>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Wir haben Ihre Reklamation zu Anfrage {anfrageNummer} erhalten und
        werden sie schnellstmöglich bearbeiten.
      </Text>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Unser Team wird sich in Kürze bei Ihnen melden, um die nächsten
        Schritte zu besprechen.
      </Text>

      <Text style={{ fontSize: "14px", color: "#666666", lineHeight: "1.5" }}>
        Bei dringenden Fragen erreichen Sie uns unter {settings.telefon} oder{" "}
        {settings.email}.
      </Text>
    </BaseLayout>
  );
}
