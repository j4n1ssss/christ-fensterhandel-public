import {
	ArrowLeftRight,
	DoorOpen,
	MoveHorizontal,
	PanelLeftOpen,
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
	title: "Balkontüren · Muster Fenster",
	description:
		"Dreh-Kipp, Hebe-Schiebe, Parallel-Schiebe-Kipp — Balkontüren mit Standard-, Niedrig- oder bodengleicher Schwelle.",
};

/**
 * /produkte/balkontueren — Detail-Page Balkon- und Terrassentüren.
 *
 * Struktur:
 *   1. MarketingHero — bodentief offen.
 *   2. Öffnungsarten (white) — 4-Col FeatureGrid Lucide-Icons.
 *   3. Schwellen (black-50) — SpecList stacked.
 *   4. Material-Wahl (white) — 3-Col FeatureGrid mit Empfehlung.
 *   5. PillButton + ContactCtaStripe.
 */

const OEFFNUNGEN: Feature[] = [
	{
		icon: <DoorOpen className="size-5" aria-hidden />,
		title: "Dreh-Kipp einflüglig",
		body: "Standard für schmale Öffnungen. Voll öffnen oder lüften — der Klassiker.",
	},
	{
		icon: <PanelLeftOpen className="size-5" aria-hidden />,
		title: "Dreh-Kipp zweiflügelig",
		body: "Stulp-Profil ohne Mittelpfosten — voller Durchgang, freie Sicht.",
	},
	{
		icon: <ArrowLeftRight className="size-5" aria-hidden />,
		title: "Hebe-Schiebe (HST)",
		body: "Große Flügel bis 2.5 × 2.5 m. Aushebeln, gleiten, einrasten — leise.",
	},
	{
		icon: <MoveHorizontal className="size-5" aria-hidden />,
		title: "Parallel-Schiebe-Kipp (PSK)",
		body: "Kompaktere Variante zur HST. Lüften per Kippstellung, Öffnen per Schiebe.",
	},
];

const SCHWELLEN: SpecItem[] = [
	{
		label: "Standard",
		value: "20 mm",
		note: "Wetterfest, Pflicht im EFH-Standard.",
	},
	{
		label: "Niedrige Barriere",
		value: "5 mm",
		note: "Altersgerechtes Wohnen, fast stolperfrei.",
	},
	{
		label: "Bodengleich",
		value: "0 mm",
		note: "Mit Drainage-Rinne — voll barrierefrei, Architektur-Standard.",
	},
];

const MATERIAL_EMPFEHLUNG: Feature[] = [
	{
		kicker: "Empfehlung",
		title: "Kunststoff",
		body: "Beste Dämmung im Preis-Leistung-Vergleich. Standard für Wohnungsbau und Sanierung.",
	},
	{
		kicker: "Empfehlung",
		title: "Aluminium",
		body: "Für raumhohe HST-Türen und große Glasflächen. Schmale Ansicht, hochfest.",
	},
	{
		kicker: "Empfehlung",
		title: "Holz",
		body: "Für Altbau und Denkmal — wenn die Optik wichtiger ist als die Wartungsfreiheit.",
	},
];

export default function BalkontuerenPage() {
	return (
		<>
			<MarketingHero
				breadcrumb={[
					{ label: "Start", href: "/" },
					{ label: "Produkte", href: "/produkte" },
					{ label: "Balkontüren" },
				]}
				eyebrow="Balkontüren"
				headline={<>Balkon, Terrasse,</>}
				headlineHighlight="bodentief offen."
				body="Dreh-Kipp für den Standard, Hebe-Schiebe für große Flügel, PSK für den kompakten Kompromiss. Schwelle nach Wahl — bodengleich bis Standard."
				stats={[
					{ label: "Öffnungsarten", value: "04" },
					{ label: "Schwellen", value: "03" },
					{ label: "Maxgröße HST", value: "2.5 m" },
				]}
			/>

			{/* ═══════ OEFFNUNGSARTEN ═══════ */}
			<section
				aria-labelledby="balkon-oeffnungen-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="balkon-oeffnungen-heading"
						eyebrow="Öffnungsarten"
						headline={<>Vier Wege, eine Tür zu öffnen.</>}
						body="Vom klassischen Dreh-Kipp bis zur Hebe-Schiebe-Tür — wir bauen, was zur Öffnung passt."
					/>
					<FeatureGrid
						features={OEFFNUNGEN}
						size="dense"
						cardStyle="bordered"
					/>
				</Container>
			</section>

			{/* ═══════ SCHWELLEN ═══════ */}
			<section
				aria-labelledby="balkon-schwellen-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="balkon-schwellen-heading"
						eyebrow="Schwellen"
						headline={<>Stolperkante oder bodengleich.</>}
						body="Standard, niedrig für altersgerechtes Wohnen, oder ganz weg mit Drainage. Drei Antworten."
					/>
					<SpecList items={SCHWELLEN} layout="stacked" />
				</Container>
			</section>

			{/* ═══════ MATERIAL-WAHL ═══════ */}
			<section
				aria-labelledby="balkon-mat-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="balkon-mat-heading"
						eyebrow="Material-Wahl"
						headline={<>Welches Material wann.</>}
						body="Drei Materialien, drei Empfehlungen — passend zur Anwendung statt zum Trend."
					/>
					<FeatureGrid features={MATERIAL_EMPFEHLUNG} cardStyle="bordered" />
				</Container>
			</section>

			{/* ═══════ CTA ═══════ */}
			<section
				aria-labelledby="balkon-cta-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="balkon-cta-heading"
						eyebrow="Loslegen"
						headline={
							<>
								Balkontür
								<br />
								konfigurieren.
							</>
						}
						body="Öffnungsart, Maß, Schwelle, Glas — der Konfigurator fragt alles ab."
					/>
					<PillButton href="/konfigurator" size="xl">
						Balkontür konfigurieren
					</PillButton>
				</Container>
			</section>

			<ContactCtaStripe />
		</>
	);
}
