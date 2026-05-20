import { Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout";
import { EmailButton } from "../components/email-button";
import { formatCents } from "@/lib/format-currency";
import { calcTax, calcGrossFromNet } from "@/lib/tax";

interface ZahlungslinkProps {
  anfrageNummer: string;
  kunde: { vorname: string; nachname: string };
  gesamtbetragCents: number;
  zahlungsUrl: string;
  ablaufDatum: string;
  settings: BaseLayoutSettings;
  logoUrl?: string;
}

export default function Zahlungslink({
  anfrageNummer,
  kunde,
  gesamtbetragCents,
  zahlungsUrl,
  ablaufDatum,
  settings,
  logoUrl,
}: ZahlungslinkProps) {
  return (
    <BaseLayout
      preview={`Zahlungslink für Anfrage ${anfrageNummer}`}
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
        Zahlungslink
      </Heading>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Guten Tag {kunde.vorname} {kunde.nachname},
      </Text>

      <Text style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "1.5" }}>
        Für Ihre Anfrage {anfrageNummer} steht folgender Betrag zur Zahlung
        bereit:
      </Text>
      <Text
        style={{
          fontSize: "14px",
          color: "#1a1a1a",
          lineHeight: "1.8",
          margin: "8px 0",
        }}
      >
        Netto: {formatCents(gesamtbetragCents)}
        <br />
        zzgl. 19% MwSt: {formatCents(calcTax(gesamtbetragCents, 19))}
        <br />
        <strong>
          Gesamt (brutto):{" "}
          {formatCents(calcGrossFromNet(gesamtbetragCents, 19))}
        </strong>
      </Text>

      <Text
        style={{
          fontSize: "14px",
          color: "#1a1a1a",
          lineHeight: "1.5",
          marginTop: "16px",
        }}
      >
        <EmailButton href={zahlungsUrl}>Jetzt bezahlen</EmailButton>
      </Text>

      <Text style={{ fontSize: "14px", color: "#666666", lineHeight: "1.5" }}>
        Der Zahlungslink ist gültig bis {ablaufDatum}. Bei Fragen zur Zahlung
        kontaktieren Sie uns gerne unter {settings.telefon} oder{" "}
        {settings.email}.
      </Text>
    </BaseLayout>
  );
}
