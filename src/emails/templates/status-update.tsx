import { Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout";
import { StatusBadge } from "../components/status-badge";
import { EmailButton } from "../components/email-button";

interface StatusUpdateProps {
  anfrageNummer: string;
  kunde: { vorname: string; nachname: string };
  statusLabel: string;
  statusColor: string;
  statusText: string;
  anfrageUrl: string;
  settings: BaseLayoutSettings;
  logoUrl?: string;
}

export default function StatusUpdate({
  anfrageNummer,
  kunde,
  statusLabel,
  statusColor,
  statusText,
  anfrageUrl,
  settings,
  logoUrl,
}: StatusUpdateProps) {
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
        Status-Update
      </Heading>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Guten Tag {kunde.vorname} {kunde.nachname},
      </Text>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Der Status Ihrer Anfrage {anfrageNummer} hat sich geändert:
      </Text>

      <Text
        style={{
          fontSize: "14px",
          color: "#1a1a1a",
          lineHeight: "1.5",
          margin: "16px 0",
        }}
      >
        <StatusBadge
          status={statusLabel}
          color={statusColor}
          label={statusLabel}
        />
      </Text>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        {statusText}
      </Text>

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
    </BaseLayout>
  );
}
