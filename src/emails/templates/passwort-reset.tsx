import { Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout";
import { EmailButton } from "../components/email-button";

interface PasswortResetProps {
  resetUrl: string;
  settings: BaseLayoutSettings;
  logoUrl?: string;
}

export default function PasswortResetEmail({
  resetUrl = "https://example.com/kunden/passwort-reset/token123",
  settings = {
    firmenname: "Muster Fenster",
    adresse_strasse: "",
    adresse_hausnummer: "",
    adresse_plz: "",
    adresse_ort: "",
    telefon: "",
    email: "info@example.com",
  },
  logoUrl,
}: PasswortResetProps) {
  return (
    <BaseLayout
      preview="Passwort zurücksetzen"
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
        Passwort zurücksetzen
      </Heading>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Sie haben angefordert, Ihr Passwort zurückzusetzen. Klicken Sie auf den
        folgenden Link, um ein neues Passwort zu setzen:
      </Text>

      <Text
        style={{
          fontSize: "14px",
          color: "#1a1a1a",
          lineHeight: "1.5",
          marginTop: "16px",
        }}
      >
        <EmailButton href={resetUrl}>Neues Passwort setzen</EmailButton>
      </Text>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Dieser Link ist 1 Stunde gültig. Falls Sie kein neues Passwort
        angefordert haben, können Sie diese E-Mail ignorieren.
      </Text>

      <Text style={{ fontSize: "14px", color: "#666666", lineHeight: "1.5" }}>
        Sollten Sie weiterhin Probleme haben, kontaktieren Sie uns unter{" "}
        {settings.email || "info@example.com"}.
      </Text>
    </BaseLayout>
  );
}
