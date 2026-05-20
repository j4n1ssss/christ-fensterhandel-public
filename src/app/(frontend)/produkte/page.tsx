import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { EditorialSplit } from "@/components/marketing/editorial-split";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import {
	type MaterialOption,
	MaterialOptions,
} from "@/components/marketing/material-options";
import { SectionDivider } from "@/components/marketing/section-divider";
import { PillButton } from "@/components/ui/pill-button";

export const metadata: Metadata = {
	title: "Produkte · Muster Fenster",
	description:
		"Vier Kategorien — Fenster, Türen, Rollladen, Zubehör. Komplett maßwerk, gefertigt von DRUTEX in Polen.",
};

/**
 * /produkte — Hub-Page für das gesamte Sortiment.
 *
 * Struktur:
 *   1. MarketingHero — Eyebrow "Sortiment", H1 über 4 Kategorien.
 *   2. Kategorien (white) — MaterialOptions cols=2 mit Fenster, Türen,
 *      Rollladen, Zubehör (Daten analog products-section.tsx).
 *   3. Material-Tiefe (black-50) — 3-Col Cards Kunststoff/Aluminium/Holz
 *      mit Mono-Liste der zugehörigen Detail-Pages.
 *   4. Konfigurator-Cross-Sell (white) — Editorial-Split + großer PillButton.
 *   5. ContactCtaStripe — Black-950 Closer.
 */

const PRODUCT_CATEGORIES: MaterialOption[] = [
	{
		name: "Fenster",
		tagline:
			"Kunststoff, Aluminium, Holz — für jedes Bauvorhaben die richtige Wahl.",
		href: "/produkte/fenster",
		subCategories: ["Kunststoff", "Aluminium", "Holz"],
		imageSrc: "/images/products/fenster.jpg",
		imageAlt: "Zweiflügliges Holzfenster",
	},
	{
		name: "Türen",
		tagline:
			"Haus-, Balkon- und Schiebetüren in Kunststoff, Holz, Aluminium oder Vollglas.",
		href: "/produkte/haustueren",
		subCategories: ["Haustüren", "Balkontüren", "Schiebetüren"],
		imageSrc: "/images/products/tueren.jpg",
		imageAlt: "Haustür der IGLO-Edge-Serie mit beleuchteter Umrandung",
	},
	{
		name: "Rollladen",
		tagline: "Sonnen- und Sichtschutz als Aufsatz, Unterputz oder Vorsatz.",
		href: "/produkte/rolllaeden",
		subCategories: ["Aufsatz", "Unterputz", "Vorsatz"],
		imageSrc: "/images/products/rolllaeden.jpg",
		imageAlt: "Cremefarbener Aufsatzrollladen",
	},
	{
		name: "Zubehör",
		tagline:
			"Beschläge, Fensterbänke, Sprossen, Lüftungen — alles für den Ausbau.",
		href: "/produkte/zubehoer",
		subCategories: ["Beschläge", "Fensterbänke", "Sprossen & Kämpfer"],
		imageSrc: "/images/products/zubehoer.jpg",
		imageAlt: "Detailaufnahme verschiedener Fensterbeschläge",
	},
];

type MaterialFamily = {
	name: string;
	body: string;
	links: { label: string; href: string }[];
};

const MATERIAL_FAMILIES: MaterialFamily[] = [
	{
		name: "Kunststoff",
		body: "Mehrkammrige IGLO-Profile aus Polen. Beste Dämmwerte, langlebig, pflegeleicht — der Standard für Neubau und Sanierung.",
		links: [
			{ label: "Kunststoff-Fenster", href: "/produkte/fenster" },
			{ label: "IGLO-Profile im Detail", href: "/produkte/fenster" },
		],
	},
	{
		name: "Aluminium",
		body: "Schmale Ansicht, hochfest, statisch belastbar. Für große Glasflächen, Hebe-Schiebe-Türen und moderne Architektur.",
		links: [
			{ label: "Aluminium-Fenster", href: "/produkte/aluminium-fenster" },
			{ label: "Schiebetüren HST", href: "/produkte/schiebetueren" },
		],
	},
	{
		name: "Holz",
		body: "Warme Optik, ehrliches Material, klassische Architektur. Eiche, Meranti, Kiefer — zugeschnitten auf Bestand und Denkmal.",
		links: [
			{ label: "Holz-Fenster", href: "/produkte/holz-fenster" },
			{ label: "Balkontüren in Holz", href: "/produkte/balkontueren" },
		],
	},
];

export default function ProdukteHubPage() {
	return (
		<>
			<MarketingHero
				breadcrumb={[{ label: "Start", href: "/" }, { label: "Produkte" }]}
				eyebrow="Sortiment"
				headline={
					<>
						Vier Kategorien,
						<br />
						komplett maßwerk.
					</>
				}
				body={
					<>
						Ob ein einzelnes Fenster oder die komplette Ausstattung für ein Haus
						— alles wird individuell vermessen, konfiguriert und mit
						DRUTEX-Qualität gefertigt. Du suchst, wir liefern und bauen ein.
					</>
				}
				stats={[
					{ label: "Material-Familien", value: "04" },
					{ label: "Designs", value: "200+" },
					{ label: "Fertigung", value: "DRUTEX" },
				]}
			/>

			{/* ═══════ KATEGORIEN ═══════ */}
			<section
				aria-labelledby="kategorien-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="kategorien-heading"
						eyebrow="Was wir machen"
						headline={
							<>
								Fenster, Türen,
								<br />
								Rollladen, Zubehör.
							</>
						}
						body="Vier Produkt-Familien — alles unter einem Dach, alles aus einer Hand. Vermessen, gefertigt, geliefert, eingebaut."
					/>
					<MaterialOptions options={PRODUCT_CATEGORIES} cols={2} />
				</Container>
			</section>

			{/* ═══════ MATERIAL-TIEFE ═══════ */}
			<section
				aria-labelledby="material-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="material-heading"
						eyebrow="Und im Detail"
						headline={<>Material entscheidet alles.</>}
						body="Drei Material-Wege durch das Sortiment — jede Familie hat ihre Stärke. Hier die Wegweiser zu allen Detail-Pages."
					/>

					<ul className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
						{MATERIAL_FAMILIES.map((fam) => (
							<li
								key={fam.name}
								className="flex flex-col rounded-2xl border border-black-200 bg-white p-8 md:p-10"
							>
								<h3 className="font-heading text-2xl font-medium tracking-tight text-black-950 md:text-3xl">
									{fam.name}
								</h3>
								<p className="mt-4 text-base leading-relaxed text-black-600">
									{fam.body}
								</p>
								<ul className="mt-8 space-y-3 border-t border-black-100 pt-6">
									{fam.links.map((link) => (
										<li key={link.href}>
											<Link
												href={link.href}
												className="group inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-black-700 transition-colors hover:text-brand-700"
											>
												{link.label}
												<ArrowRight
													aria-hidden
													className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
												/>
											</Link>
										</li>
									))}
								</ul>
							</li>
						))}
					</ul>
				</Container>
			</section>

			{/* ═══════ KONFIGURATOR-CROSS-SELL ═══════ */}
			<section
				aria-labelledby="konfigurator-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="konfigurator-heading"
						eyebrow="Direkt loslegen"
						headline={
							<>
								Konfiguriere
								<br />
								dein erstes Fenster.
							</>
						}
						body="Fünf Minuten — Maß, Profil, Glas, Farbe. Anschließend prüfen wir alles und melden uns mit Festpreis."
					/>

					<div className="flex flex-wrap items-center gap-6">
						<PillButton href="/konfigurator" size="xl" variant="primary">
							Konfigurator starten
						</PillButton>
						<Link
							href="/anfrage"
							className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-black-600 transition-colors hover:text-brand-700"
						>
							Lieber direkt anfragen
							<ArrowRight
								className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
								aria-hidden
							/>
						</Link>
					</div>
				</Container>
			</section>

			<ContactCtaStripe />
		</>
	);
}
