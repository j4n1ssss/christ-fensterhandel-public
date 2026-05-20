import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default function BestellungenPage() {
  return (
    <PagePlaceholder
      title="Bestellungen"
      breadcrumb={["Dashboard", "Bestellungen"]}
      description="Deine Bestellhistorie. Status, PDF-Download und Nachbestellungen."
      cta={{ label: "Zurück zum Dashboard", href: "/dashboard" }}
    />
  );
}
