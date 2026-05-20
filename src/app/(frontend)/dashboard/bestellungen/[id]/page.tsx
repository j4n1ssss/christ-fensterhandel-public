import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default async function BestellungDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PagePlaceholder
      title={`Bestellung #${id}`}
      breadcrumb={["Dashboard", "Bestellungen", `#${id}`]}
      description="Detailansicht einer einzelnen Bestellung — Status, Positionen, PDF-Download."
      cta={{ label: "Zurück zur Übersicht", href: "/dashboard/bestellungen" }}
    />
  );
}
