import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { EditorialSplit } from "@/components/marketing/editorial-split";
import { type Feature, FeatureGrid } from "@/components/marketing/feature-grid";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import {
	type MaterialOption,
	MaterialOptions,
} from "@/components/marketing/material-options";
import { SectionDivider } from "@/components/marketing/section-divider";
import { type SpecItem, SpecList } from "@/components/marketing/spec-list";
import { PillButton } from "@/components/ui/pill-button";

export const metadata: Metadata = {
	title: "Fenster nach Maß · Muster Fenster",
	description:
		"Kunststoff, Aluminium, Holz — DRUTEX-Fenster für Neubau und Sanierung. IGLO-Profile, U-Werte ab 0.7 W/m2K.",
};

/**
 * /produkte/fenster — Kategorie-Hub für Fenster.
 *
 * Struktur:
 *   1. MarketingHero — DRUTEX-Qualität, U-Wert ab 0.7.
 *   2. Materialien (white) — MaterialOptions cols=3 (Kunststoff/Alu/Holz).
 *   3. IGLO-Profile (black-50) — 6 Profilserien als FeatureGrid.
 *   4. Specs (white) — SpecList stacked: U-Wert, Schallschutz, Sicherheit, Maxgröße.
 *   5. Konfigurator-CTA (black-50) — großer PillButton.
 *   6. ContactCtaStripe.
 */

const MATERIAL_OPTIONS: MaterialOption[] = [
	{
		name: "Kunststoff",
		tagline:
			"Mehrkammrige IGLO-Profile. Beste Dämmung, langlebig, pflegeleicht.",
		href: "/produkte/fenster",
		subCategories: ["IGLO 5", "IGLO Energy", "IGLO Edge"],
		imageSrc: "/images/products/fenster.jpg",
		imageAlt: "Kunststoff-Fenster aus der DRUTEX IGLO-Serie",
	},
	{
		name: "Aluminium",
		tagline:
			"Schmale Ansicht, hochfest, für große Glasflächen und moderne Architektur.",
		href: "/produkte/aluminium-fenster",
		subCategories: ["MB-70", "MB-86 N SI"],
		imageSrc: "/images/products/fenster.jpg",
		imageAlt: "Aluminium-Fenster mit schmalem Rahmenprofil",
	},
	{
		name: "Holz",
		tagline:
			"Warme Optik, ehrliches Material — für Altbau, Denkmal und klassische Architektur.",
		href: "/produkte/holz-fenster",
		subCategories: ["Eiche", "Meranti", "Kiefer"],
		imageSrc: "/images/products/fenster.jpg",
		imageAlt: "Holz-Fenster aus Eiche mit klassischem Profil",
	},
];

const IGLO_PROFILES: Feature[] = [
	{
		kicker: "DRUTEX",
		title: "IGLO 5 Classic",
		body: "Bewährtes 5-Kammer-Profil. Der Standard für Neubau — solide Dämmung, vernünftiger Preis.",
	},
	{
		kicker: "DRUTEX",
		title: "IGLO Energy",
		body: "7-Kammer-Profil für KfW-Standard. U-Wert ab 0.8 — wenn Energieeffizienz Pflicht ist.",
	},
	{
		kicker: "DRUTEX",
		title: "IGLO Edge",
		body: "Bündig integrierter Rollladen ohne sichtbaren Kasten. Maximale Glasfläche, glatte Linie.",
	},
	{
		kicker: "DRUTEX",
		title: "IGLO Light",
		body: "Schmales Profil für schlanke Ansicht. Ideal für Bestand mit kleinen Rahmen.",
	},
	{
		kicker: "DRUTEX",
		title: "IGLO EXT",
		body: "Verstärktes Profil für außergewöhnliche Größen und Statik-Anforderungen.",
	},
	{
		kicker: "DRUTEX",
		title: "IGLO Energy Alucover",
		body: "Energy-Profil mit Aluminium-Schale außen. Kratzfest, wartungsarm, für harte Witterung.",
	},
];

const FENSTER_SPECS: SpecItem[] = [
	{
		label: "U-Wert",
		value: "0.7 W/m2K",
		note: "Mit IGLO Energy Alucover und 3-fach-Verglasung.",
	},
	{
		label: "Schallschutz",
		value: "47 dB",
		note: "Mit Spezial-Verglasung — Klasse 5.",
	},
	{
		label: "Sicherheit",
		value: "RC2 / RC3",
		note: "Mehrfachverriegelung, Pilzkopfzapfen, P4A-Verglasung.",
	},
	{
		label: "Maxgröße",
		value: "3.5 × 2.5 m",
		note: "Bei IGLO Edge — für kleinere Profile entsprechend reduziert.",
	},
];

export default function FensterPage() {
	return (
		<>
			<MarketingHero
				breadcrumb={[
					{ label: "Start", href: "/" },
					{ label: "Produkte", href: "/produkte" },
					{ label: "Fenster" },
				]}
				eyebrow="Fenster"
				headline={<>Fenster nach Maß,</>}
				headlineHighlight="DRUTEX-Qualität."
				body="Jedes Fenster wird individuell vermessen und in Polen gefertigt — drei Materialien, sechs IGLO-Profile, alles aus einer Hand. Du sagst was, wir bauen ein."
				stats={[
					{ label: "Materialien", value: "03" },
					{ label: "IGLO-Profile", value: "06" },
					{ label: "U-Wert ab", value: "0.7" },
				]}
			/>

			{/* ═══════ MATERIALIEN ═══════ */}
			<section
				aria-labelledby="materialien-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="materialien-heading"
						eyebrow="Material"
						headline={<>Drei Material-Wege.</>}
						body="Kunststoff für Effizienz, Aluminium für Statik, Holz für Charakter. Du entscheidest — wir beraten."
					/>
					<MaterialOptions options={MATERIAL_OPTIONS} cols={3} />
				</Container>
			</section>

			{/* ═══════ IGLO-PROFILE ═══════ */}
			<section
				aria-labelledby="iglo-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="iglo-heading"
						eyebrow="Profile"
						headline={<>Sechs Profilserien.</>}
						body="DRUTEX baut sechs IGLO-Profile — von Classic bis Energy Alucover. Wir empfehlen passend zum Bauvorhaben, nicht zum Katalog."
					/>
					<FeatureGrid features={IGLO_PROFILES} cardStyle="bordered" />
				</Container>
			</section>

			{/* ═══════ SPECS ═══════ */}
			<section
				aria-labelledby="specs-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="specs-heading"
						eyebrow="Technisch"
						headline={<>Werte, die zählen.</>}
						body="Vier Eckwerte, die in jeder Beratung kommen. Hier die Zahlen — Details immer profilabhängig."
					/>
					<SpecList items={FENSTER_SPECS} layout="stacked" />
				</Container>
			</section>

			{/* ═══════ KONFIGURATOR-CTA ═══════ */}
			<section
				aria-labelledby="fenster-cta-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="fenster-cta-heading"
						eyebrow="Loslegen"
						headline={
							<>
								Konfiguriere dein
								<br />
								Fenster — jetzt.
							</>
						}
						body="Maß, Profil, Glas, Farbe — alles in fünf Minuten zusammengeklickt."
					/>
					<PillButton href="/konfigurator" size="xl">
						Fenster konfigurieren
					</PillButton>
				</Container>
			</section>

			<ContactCtaStripe />
		</>
	);
}
