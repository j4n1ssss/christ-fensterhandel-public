import {
	Bug,
	Grid2x2,
	Layers,
	PanelBottom,
	Square,
	SunDim,
	Wind,
	Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { EditorialSplit } from "@/components/marketing/editorial-split";
import { type Feature, FeatureGrid } from "@/components/marketing/feature-grid";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { SectionDivider } from "@/components/marketing/section-divider";
import { type SpecItem, SpecList } from "@/components/marketing/spec-list";
import { PillButton } from "@/components/ui/pill-button";

export const metadata: Metadata = {
	title: "Zubehör · Muster Fenster",
	description:
		"Beschläge, Fensterbänke, Sprossen, Lüftungen, Insektenschutz, Gläser, Dichtungen — alles für den Ausbau, alles aus einer Hand.",
};

/**
 * /produkte/zubehoer — Detail-Page Zubehör.
 *
 * Struktur:
 *   1. MarketingHero — Beschlag, Bank, Sprosse, Rahmen.
 *   2. Kategorien (white) — 4-Col dense FeatureGrid mit 8 Kategorien.
 *   3. Glas-Optionen (black-50) — SpecList stacked.
 *   4. PillButton + ContactCtaStripe.
 */

const ZUBEHOER_KATEGORIEN: Feature[] = [
	{
		icon: <Wrench className="size-5" aria-hidden />,
		title: "Beschläge",
		body: "Maco und Roto — Pilzkopfzapfen, Mehrfachverriegelung, RC2/RC3-Sets.",
	},
	{
		icon: <PanelBottom className="size-5" aria-hidden />,
		title: "Fensterbänke",
		body: "Innen in Kunststein, Holz oder Aluminium — außen wetterfest in Alu oder Stahl.",
	},
	{
		icon: <Grid2x2 className="size-5" aria-hidden />,
		title: "Sprossen & Kämpfer",
		body: "Glasteilende, aufgesetzte oder Wiener Sprossen — für Altbau und Stilbauten.",
	},
	{
		icon: <Wind className="size-5" aria-hidden />,
		title: "Lüftungen",
		body: "Falzlüftung, Rahmenlüftung — KfW-konform, ohne Energieverlust.",
	},
	{
		icon: <Bug className="size-5" aria-hidden />,
		title: "Insektenschutz",
		body: "Spannrahmen, Plissee, Drehtür — feinmaschig, von außen unsichtbar.",
	},
	{
		icon: <SunDim className="size-5" aria-hidden />,
		title: "Verschattung",
		body: "Innenliegende Plissees, außenliegende Raffstores, Markisen.",
	},
	{
		icon: <Square className="size-5" aria-hidden />,
		title: "Gläser",
		body: "2-fach Standard bis 3-fach Energie, Schallschutz, Sicherheit, Ornament, Sonnenschutz.",
	},
	{
		icon: <Layers className="size-5" aria-hidden />,
		title: "Dichtungen",
		body: "EPDM-Profile für Erstausstattung und Ersatzteil — mit Werkzeug nachrüstbar.",
	},
];

const GLAS_OPTIONEN: SpecItem[] = [
	{
		label: "2-fach Standard",
		value: "Ug 1.1",
		note: "Der Mindeststandard — für Bestand und Innenraum.",
	},
	{
		label: "3-fach Energie",
		value: "Ug 0.5",
		note: "KfW-konform, Pflicht im Neubau.",
	},
	{
		label: "Schallschutz",
		value: "47 dB",
		note: "Klasse 5 — für Straßen- und Gleislage.",
	},
	{
		label: "Sicherheit",
		value: "P4A",
		note: "Verbundsicherheitsglas, einbruchhemmend bis RC3.",
	},
	{
		label: "Sonnenschutz",
		value: "g 0.27",
		note: "Beschichtete Gläser für Südlage und Wintergarten.",
	},
	{
		label: "Ornament",
		value: "10+ Motive",
		note: "Sichtschutz mit Lichtdurchlass — Bad, WC, Treppenhaus.",
	},
];

export default function ZubehoerPage() {
	return (
		<>
			<MarketingHero
				breadcrumb={[
					{ label: "Start", href: "/" },
					{ label: "Produkte", href: "/produkte" },
					{ label: "Zubehör" },
				]}
				eyebrow="Zubehör"
				headline={<>Beschlag, Bank,</>}
				headlineHighlight="Sprosse, Rahmen."
				body="Alles, was um das Fenster herum liegt — Beschläge, Fensterbänke, Sprossen, Lüftungen, Insektenschutz, Gläser, Dichtungen. Aus einer Hand, abgestimmt auf das Profil."
				stats={[
					{ label: "Kategorien", value: "08" },
					{ label: "Glas-Optionen", value: "06" },
					{ label: "Hersteller", value: "Maco/Roto" },
				]}
			/>

			{/* ═══════ KATEGORIEN ═══════ */}
			<section
				aria-labelledby="zubehoer-kategorien-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="zubehoer-kategorien-heading"
						eyebrow="Kategorien"
						headline={<>Acht Familien Zubehör.</>}
						body="Vom Beschlag bis zur Dichtung — alles, was zum kompletten Fenster gehört."
					/>
					<FeatureGrid
						features={ZUBEHOER_KATEGORIEN}
						size="dense"
						cardStyle="bordered"
					/>
				</Container>
			</section>

			{/* ═══════ GLAS-OPTIONEN ═══════ */}
			<section
				aria-labelledby="zubehoer-glas-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="zubehoer-glas-heading"
						eyebrow="Glas-Optionen"
						headline={<>Glas ist nicht gleich Glas.</>}
						body="Sechs Eigenschaften, die du am Glas einstellen kannst — Dämmung, Schall, Sicherheit, Sonne, Sicht, Ornament."
					/>
					<SpecList items={GLAS_OPTIONEN} layout="stacked" />
				</Container>
			</section>

			{/* ═══════ CTA ═══════ */}
			<section
				aria-labelledby="zubehoer-cta-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="zubehoer-cta-heading"
						eyebrow="Loslegen"
						headline={
							<>
								Zubehör
								<br />
								mitbestellen.
							</>
						}
						body="Im Konfigurator passt sich das Zubehör dem Profil an — keine falschen Kombinationen."
					/>
					<PillButton href="/konfigurator" size="xl">
						Konfigurator starten
					</PillButton>
				</Container>
			</section>

			<ContactCtaStripe />
		</>
	);
}
