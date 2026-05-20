import { PagePlaceholder } from "@/components/layout/page-placeholder";

function humanize(slug: string): string {
	return slug
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

export default async function AluFensterProfilPage({
	params,
}: {
	params: Promise<{ profil: string }>;
}) {
	const { profil } = await params;
	const title = humanize(profil);
	return (
		<PagePlaceholder
			title={title}
			breadcrumb={["Produkte", "Aluminium-Fenster", title]}
			description={`Aluminium-Profil ${title} — U-Wert, Bautiefe und Varianten.`}
		/>
	);
}
