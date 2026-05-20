import { PagePlaceholder } from "@/components/layout/page-placeholder";

function humanize(slug: string): string {
	return slug
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

export default async function HaustuerenMaterialPage({
	params,
}: {
	params: Promise<{ material: string }>;
}) {
	const { material } = await params;
	const title = `Haustüren · ${humanize(material)}`;
	return (
		<PagePlaceholder
			title={title}
			breadcrumb={["Produkte", "Haustüren", humanize(material)]}
			description={`Haustüren aus ${humanize(material)} — Serien-Übersicht.`}
		/>
	);
}
