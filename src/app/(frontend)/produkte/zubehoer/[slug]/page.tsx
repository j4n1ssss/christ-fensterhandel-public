import { PagePlaceholder } from "@/components/layout/page-placeholder";

function humanize(slug: string): string {
	return slug
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

export default async function ZubehoerDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const title = humanize(slug);
	return (
		<PagePlaceholder
			title={title}
			breadcrumb={["Produkte", "Zubehör", title]}
			description={`${title} — Varianten, Materialien und Kompatibilität.`}
		/>
	);
}
