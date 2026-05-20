import { PasswortVergessenForm } from "@/components/kunden/passwort-vergessen-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passwort vergessen | Muster Fenster",
};

export default function PasswortVergessenPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-center text-2xl font-bold text-foreground">
            Passwort vergessen
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum
            Zuruecksetzen.
          </p>
          <div className="mt-6">
            <PasswortVergessenForm />
          </div>
        </div>
      </div>
    </div>
  );
}
