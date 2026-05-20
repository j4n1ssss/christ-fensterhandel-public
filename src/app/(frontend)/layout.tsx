import React from "react";
import { headers } from "next/headers";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { getCurrentUser } from "@/lib/auth";
import { CookieBanner } from "@/components/cookie-banner/cookie-banner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TelMailTracker } from "@/components/tracking/tel-mail-tracker";
import "../globals.css";
import "./styles.css";

// Frontend-Seiten zur Runtime rendern — siehe frühere Notiz.
// Payload-Call wurde hier entfernt (Navigation/Footer sind jetzt hardcoded).
// Navbar liest nur noch den Auth-Status, Footer ist vollständig statisch.
export const dynamic = "force-dynamic";

export const metadata = {
  description: "Muster Fenster — Fenster und Türen Konfigurator",
  title: "Muster Fenster",
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;
  const user = await getCurrentUser();
  const isLoggedIn = !!user;

  // Locale nur für <html lang="..."> — keine UI-Lokalisierung mehr in der Navbar.
  // /[locale]-Route bleibt bestehen, bis i18n-Strategie final entschieden ist.
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";
  const localeMatch = pathname.match(/^\/(de|en)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : "de";

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <NuqsAdapter>
          <Navbar isLoggedIn={isLoggedIn} />
          <main>{children}</main>
          <Footer />
          <CookieBanner />
          <TelMailTracker />
        </NuqsAdapter>
        <Script
          id="pianjs"
          src="https://api.pirsch.io/pa.js"
          data-code="UiIiUvt5csMVZ5YDyIQiapdOZpscPhJZ"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
