import { Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout";
import { formatCents } from "@/lib/format-currency";

interface RueckerstattungProps {
  anfrageNummer: string;
  kunde: { vorname: string; nachname: string };
  betragCents: number;
  methode: string;
  settings: BaseLayoutSettings;
  logoUrl?: string;
}

export default function Rueckerstattung({
  anfrageNummer,
  kunde,
  betragCents,
  methode,
  settings,
  logoUrl,
}: RueckerstattungProps) {
  return (
    <BaseLayout
      preview={`Rückerstattung für Anfrage ${anfrageNummer}`}
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
        Rückerstattung
      </Heading>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Guten Tag {kunde.vorname} {kunde.nachname},
      </Text>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Für Ihre Anfrage {anfrageNummer} wurde eine Rückerstattung über{" "}
        <strong>{formatCents(betragCents)}</strong> veranlasst.
      </Text>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Die Rückerstattung erfolgt per {methode}. Bitte rechnen Sie mit einer
        Bearbeitungszeit von 5-10 Werktagen.
      </Text>

      <Text style={{ fontSize: "14px", color: "#666666", lineHeight: "1.5" }}>
        Bei Fragen kontaktieren Sie uns gerne unter {settings.telefon} oder{" "}
        {settings.email}.
      </Text>
    </BaseLayout>
  );
}
