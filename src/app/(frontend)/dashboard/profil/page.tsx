import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default function ProfilPage() {
  return (
    <PagePlaceholder
      title="Profil"
      breadcrumb={["Dashboard", "Profil"]}
      description="Konto-Einstellungen, Adressen und Zahlungsdaten."
      cta={{ label: "Zurück zum Dashboard", href: "/dashboard" }}
    />
  );
}
