import { PagePlaceholder } from "@/components/layout/page-placeholder";

function humanize(slug: string): string {
	return slug
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

export default async function SchiebetuerenProfilPage({
	params,
}: {
	params: Promise<{ profil: string }>;
}) {
	const { profil } = await params;
	const title = humanize(profil);
	return (
		<PagePlaceholder
			title={title}
			breadcrumb={["Produkte", "Schiebetüren", title]}
			description={`Schiebetür-Profil ${title} — Spezifikation und Einsatzbereiche.`}
		/>
	);
}
