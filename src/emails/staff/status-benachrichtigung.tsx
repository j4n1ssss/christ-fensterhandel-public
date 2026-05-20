import { Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout";
import { EmailButton } from "../components/email-button";

interface StatusBenachrichtigungProps {
  anfrageNummer: string;
  statusLabel: string;
  statusAlt?: string;
  kundeName: string;
  adminUrl: string;
  settings: BaseLayoutSettings;
  logoUrl?: string;
}

export default function StatusBenachrichtigung({
  anfrageNummer,
  statusLabel,
  statusAlt,
  kundeName,
  adminUrl,
  settings,
  logoUrl,
}: StatusBenachrichtigungProps) {
  return (
    <BaseLayout
      preview={`Anfrage ${anfrageNummer}: ${statusLabel}`}
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
        Anfrage <strong>{anfrageNummer}</strong> von{" "}
        <strong>{kundeName}</strong> hat einen neuen Status:
      </Text>

      <Text
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "#1a1a1a",
          lineHeight: "1.4",
        }}
      >
        {statusAlt && (
          <span style={{ color: "#666666", fontWeight: 400 }}>
            {statusAlt} &rarr;{" "}
          </span>
        )}
        {statusLabel}
      </Text>

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
