import { PagePlaceholder } from "@/components/layout/page-placeholder";

function humanize(slug: string): string {
	return slug
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

export default async function FensterProfilPage({
	params,
}: {
	params: Promise<{ profil: string }>;
}) {
	const { profil } = await params;
	const title = humanize(profil);
	return (
		<PagePlaceholder
			title={title}
			breadcrumb={["Produkte", "Kunststoff-Fenster", title]}
			description={`Profil ${title} — technische Daten, Varianten, Farben, Bilder und Zubehör.`}
		/>
	);
}
