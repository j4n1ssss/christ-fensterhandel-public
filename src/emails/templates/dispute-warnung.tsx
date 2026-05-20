import { Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout";
import { formatCents } from "@/lib/format-currency";

interface DisputeWarnungProps {
  anfrageNummer: string;
  disputeId: string;
  disputeReason: string;
  disputeAmountCents: number;
  settings: BaseLayoutSettings;
  logoUrl?: string;
}

export default function DisputeWarnung({
  anfrageNummer,
  disputeId,
  disputeReason,
  disputeAmountCents,
  settings,
  logoUrl,
}: DisputeWarnungProps) {
  return (
    <BaseLayout
      preview={`DRINGEND: Dispute für Anfrage ${anfrageNummer}`}
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
        DRINGEND: Zahlungs-Dispute
      </Heading>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Für Anfrage <strong>{anfrageNummer}</strong> wurde ein Dispute bei
        Stripe eröffnet. Bitte reagieren Sie schnellstmöglich im Stripe
        Dashboard.
      </Text>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        <strong>Dispute-ID:</strong> {disputeId}
        <br />
        <strong>Grund:</strong> {disputeReason}
        <br />
        <strong>Betrag:</strong> {formatCents(disputeAmountCents)}
      </Text>

      <Text
        style={{
          fontSize: "14px",
          color: "#ef4444",
          lineHeight: "1.5",
          fontWeight: 600,
        }}
      >
        Stripe Disputes haben eine Frist zur Beantwortung. Nicht reagieren
        bedeutet automatischer Verlust des Betrags.
      </Text>

      <Text style={{ fontSize: "14px", color: "#666666", lineHeight: "1.5" }}>
        Stripe Dashboard: https://dashboard.stripe.com/disputes/{disputeId}
      </Text>
    </BaseLayout>
  );
}
