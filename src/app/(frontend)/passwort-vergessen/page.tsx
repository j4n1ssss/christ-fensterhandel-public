import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default function PasswortVergessenPage() {
  return (
    <PagePlaceholder
      title="Passwort vergessen"
      breadcrumb={["Anmelden", "Passwort vergessen"]}
      description="Setze dein Passwort über einen Reset-Link per E-Mail zurück."
      cta={{ label: "Zurück zum Login", href: "/anmelden" }}
    />
  );
}
