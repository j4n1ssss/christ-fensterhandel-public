import { PagePlaceholder } from "@/components/layout/page-placeholder";

function humanize(slug: string): string {
	return slug
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

export default async function RolllaedenTypPage({
	params,
}: {
	params: Promise<{ typ: string }>;
}) {
	const { typ } = await params;
	const title = `Rollladen · ${humanize(typ)}`;
	return (
		<PagePlaceholder
			title={title}
			breadcrumb={["Produkte", "Rollläden", humanize(typ)]}
			description={`${humanize(typ)}-Rollladen — Einbauweise, Maße und Steuerung.`}
		/>
	);
}
