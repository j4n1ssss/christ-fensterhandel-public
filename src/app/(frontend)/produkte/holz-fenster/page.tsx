import { Columns3, Home, Landmark, Sofa } from "lucide-react";
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
	title: "Holz-Fenster · Muster Fenster",
	description:
		"Eiche, Meranti, Kiefer — Holz-Fenster für Altbau, Denkmal und klassische Architektur. Maßgefertigt mit passender Lasur.",
};

/**
 * /produkte/holz-fenster — Detail-Page Holz.
 *
 * Struktur:
 *   1. MarketingHero — warm, leise, ehrlich.
 *   2. Holzarten (white) — 3-Col FeatureGrid Kiefer/Meranti/Eiche.
 *   3. Wann Holz (black-50) — 4-Col FeatureGrid mit Anwendungs-Icons.
 *   4. Pflege (white) — SpecList inline + Hinweis-Block mit border-l-4.
 *   5. PillButton + ContactCtaStripe.
 */

const HOLZ_ARTEN: Feature[] = [
	{
		kicker: "Holzart",
		title: "Kiefer",
		body: "Preisgünstige Basis, helles Holzbild. Nimmt Lasur sauber an, ideal für farbige Anstriche.",
	},
	{
		kicker: "Holzart",
		title: "Meranti",
		body: "Tropisches Hartholz, sehr stabil und dimensionsfest. Rötlich-brauner Ton, witterungsfest.",
	},
	{
		kicker: "Holzart",
		title: "Eiche",
		body: "Klassisch, hochwertig, langlebig. Markante Maserung — die Wahl für Bestand und Repräsentation.",
	},
];

const HOLZ_USECASES: Feature[] = [
	{
		icon: <Landmark className="size-5" aria-hidden />,
		title: "Denkmalschutz",
		body: "Wenn die Behörde Holz vorschreibt — wir bauen profilgenau zur Bestand-Optik.",
	},
	{
		icon: <Home className="size-5" aria-hidden />,
		title: "Altbau",
		body: "Wo Kunststoff stilfremd wirkt. Holz passt zu Stuck, Mauerwerk, alten Fassaden.",
	},
	{
		icon: <Sofa className="size-5" aria-hidden />,
		title: "Innenraum-Gefühl",
		body: "Warme Haptik innen — Holz dämpft Schall und sieht jedes Jahr besser aus.",
	},
	{
		icon: <Columns3 className="size-5" aria-hidden />,
		title: "Klassische Architektur",
		body: "Sprossen, profilierte Rahmen, traditionelle Beschläge — alles in Holz authentisch.",
	},
];

const HOLZ_PFLEGE: SpecItem[] = [
	{ label: "Streich-Intervall", value: "5 – 8 Jahre" },
	{ label: "Quellschutz", value: "Werkseitig" },
	{ label: "Insektenschutz", value: "Imprägniert" },
];

export default function HolzFensterPage() {
	return (
		<>
			<MarketingHero
				breadcrumb={[
					{ label: "Start", href: "/" },
					{ label: "Produkte", href: "/produkte" },
					{ label: "Fenster", href: "/produkte/fenster" },
					{ label: "Holz" },
				]}
				eyebrow="Holz"
				headline={<>Holz</>}
				headlineHighlight="ist warm, leise, ehrlich."
				body="Holz-Fenster für Altbau, Denkmal und alle, die sich an Kunststoff nicht gewöhnen wollen. Drei Holzarten, jede mit eigenem Charakter — wir liefern sie profilgenau und mit passender Lasur."
				stats={[
					{ label: "Holzarten", value: "03" },
					{ label: "Streich-Intervall", value: "5–8 J" },
					{ label: "Lasur", value: "Inkl." },
				]}
			/>

			{/* ═══════ HOLZARTEN ═══════ */}
			<section
				aria-labelledby="holz-arten-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="holz-arten-heading"
						eyebrow="Holzarten"
						headline={<>Drei Hölzer, drei Charaktere.</>}
						body="Preis, Optik, Stabilität — jede Holzart hat ihre Stärke. Wir beraten zur passenden Wahl."
					/>
					<FeatureGrid features={HOLZ_ARTEN} cardStyle="bordered" />
				</Container>
			</section>

			{/* ═══════ WANN HOLZ ═══════ */}
			<section
				aria-labelledby="holz-wann-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="holz-wann-heading"
						eyebrow="Wann Holz"
						headline={<>Vier Fälle, in denen Holz alternativlos ist.</>}
						body="Holz ist die teurere Wahl — aber in bestimmten Kontexten die einzige richtige."
					/>
					<FeatureGrid
						features={HOLZ_USECASES}
						size="dense"
						cardStyle="bordered"
					/>
				</Container>
			</section>

			{/* ═══════ PFLEGE ═══════ */}
			<section
				aria-labelledby="holz-pflege-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="holz-pflege-heading"
						eyebrow="Pflege"
						headline={<>Pflegen, nicht ignorieren.</>}
						body="Holz lebt — und braucht alle paar Jahre eine Auffrischung. Hier die Eckdaten."
					/>
					<SpecList items={HOLZ_PFLEGE} layout="inline" />

					<div className="mt-12 max-w-3xl border-l-4 border-brand-500 pl-6">
						<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-700">
							Hinweis
						</p>
						<p className="mt-3 text-base leading-relaxed text-black-700 md:text-lg">
							Lasur und Lackierung müssen regelmäßig erneuert werden — wir
							liefern sie passgenau zum Profil mit. Im Wartungsfall melden wir
							uns, wenn der Termin fällig wird.
						</p>
					</div>
				</Container>
			</section>

			{/* ═══════ CTA ═══════ */}
			<section
				aria-labelledby="holz-cta-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="holz-cta-heading"
						eyebrow="Loslegen"
						headline={
							<>
								Holz-Fenster
								<br />
								konfigurieren.
							</>
						}
						body="Holzart, Profil, Lasur, Maß — alles im Konfigurator zusammenstellen."
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
