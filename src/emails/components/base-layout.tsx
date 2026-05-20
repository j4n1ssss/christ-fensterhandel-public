import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
  Hr,
  Preview,
} from "@react-email/components";
import * as React from "react";

export interface BaseLayoutSettings {
  firmenname: string;
  adresse_strasse: string;
  adresse_hausnummer: string;
  adresse_plz: string;
  adresse_ort: string;
  telefon: string;
  email: string;
}

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
  settings: BaseLayoutSettings;
  logoUrl?: string;
}

export function BaseLayout({
  preview,
  children,
  settings,
  logoUrl,
}: BaseLayoutProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "";

  return (
    <Html lang="de">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: "#f6f6f6",
          fontFamily: "Arial, Helvetica, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Header */}
          <Section
            style={{ padding: "24px 32px", textAlign: "center" as const }}
          >
            {logoUrl ? (
              <Img
                src={logoUrl}
                alt={settings.firmenname}
                width={180}
                style={{ margin: "0 auto" }}
              />
            ) : (
              <Text
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  margin: 0,
                }}
              >
                {settings.firmenname}
              </Text>
            )}
          </Section>

          <Hr style={{ borderColor: "#e5e5e5", margin: 0 }} />

          {/* Content */}
          <Section style={{ padding: "24px 32px" }}>{children}</Section>

          <Hr style={{ borderColor: "#e5e5e5", margin: 0 }} />

          {/* Footer */}
          <Section style={{ padding: "16px 32px" }}>
            <Text
              style={{
                fontSize: "12px",
                color: "#666666",
                lineHeight: "1.5",
                margin: "0 0 4px",
              }}
            >
              {settings.firmenname}
            </Text>
            <Text
              style={{
                fontSize: "12px",
                color: "#666666",
                lineHeight: "1.5",
                margin: "0 0 4px",
              }}
            >
              {settings.adresse_strasse} {settings.adresse_hausnummer},{" "}
              {settings.adresse_plz} {settings.adresse_ort}
            </Text>
            <Text
              style={{
                fontSize: "12px",
                color: "#666666",
                lineHeight: "1.5",
                margin: "0 0 4px",
              }}
            >
              Tel: {settings.telefon} | E-Mail: {settings.email}
            </Text>
            <Text
              style={{
                fontSize: "12px",
                color: "#666666",
                lineHeight: "1.5",
                margin: 0,
              }}
            >
              <Link
                href={`${baseUrl}/impressum`}
                style={{ color: "#666666", textDecoration: "underline" }}
              >
                Impressum
              </Link>
              {" | "}
              <Link
                href={`${baseUrl}/datenschutz`}
                style={{ color: "#666666", textDecoration: "underline" }}
              >
                Datenschutz
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
