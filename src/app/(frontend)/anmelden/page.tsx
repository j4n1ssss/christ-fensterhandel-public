import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/layout/container";
import { AuthLoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Anmelden · Muster Fenster",
  description:
    "Zugang zum Kundenbereich mit Bestellhistorie, gespeicherten Konfigurationen und Profil-Einstellungen.",
};

export const dynamic = "force-dynamic";

export default async function AnmeldenPage() {
  const user = await getCurrentUser();
  if (user && user.rolle === "kunde") {
    redirect("/dashboard");
  }

  return (
    <Container size="xl">
      <div className="grid grid-cols-1 gap-16 py-20 md:py-28 lg:grid-cols-12 lg:gap-20 lg:py-32">
        {/* Links: Editorial Intro */}
        <div className="lg:col-span-5">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
            Kundenbereich
          </p>
          <h1 className="mt-4 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl">
            Willkommen
            <br />
            zurück.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-black-600">
            Melde dich an, um deine laufenden Anfragen einzusehen,
            Konfigurationen fortzuführen und den Status deiner Bestellungen zu
            verfolgen.
          </p>

          <dl className="mt-12 grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-4 border-t border-black-200 pt-8 font-mono text-sm">
            <dt className="text-black-500">01</dt>
            <dd className="text-black-800">Bestellungen und Angebote</dd>
            <dt className="text-black-500">02</dt>
            <dd className="text-black-800">Gespeicherte Konfigurationen</dd>
            <dt className="text-black-500">03</dt>
            <dd className="text-black-800">Reklamationen und Rückfragen</dd>
          </dl>
        </div>

        {/* Rechts: Form */}
        <div className="lg:col-span-6 lg:col-start-7">
          <div className="mx-auto max-w-md lg:mx-0">
            <AuthLoginForm />
          </div>
        </div>
      </div>
    </Container>
  );
}
