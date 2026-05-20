import { PagePlaceholder } from "@/components/layout/page-placeholder";

function humanize(slug: string): string {
	return slug
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

export default async function HaustuerenSeriePage({
	params,
}: {
	params: Promise<{ material: string; serie: string }>;
}) {
	const { material, serie } = await params;
	const title = humanize(serie);
	return (
		<PagePlaceholder
			title={title}
			breadcrumb={["Produkte", "Haustüren", humanize(material), title]}
			description={`Serie ${title} (Material: ${humanize(material)}) — technische Daten und Varianten.`}
		/>
	);
}
