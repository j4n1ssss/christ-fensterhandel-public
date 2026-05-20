import { Cpu, Hand, Radio } from "lucide-react";
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
import { PillButton } from "@/components/ui/pill-button";
import { SectionKicker } from "@/components/ui/section-kicker";

export const metadata: Metadata = {
	title: "Rollladen · Muster Fenster",
	description:
		"Aufsatz, Vorsatz, Unterputz — und IGLO Edge mit integriertem Rollladen im Rahmen. Manuell, Funk oder Smart-Home.",
};

/**
 * /produkte/rolllaeden — Detail-Page Rollladen.
 *
 * Struktur:
 *   1. MarketingHero — Sonne aus, Sicht zu, Dämmung an.
 *   2. Bauformen (white) — MaterialOptions cols=3 (Aufsatz/Vorsatz/Unterputz).
 *   3. IGLO Edge (black-50) — 5/7-Editorial-Split mit FeatureGrid 1-Col rechts.
 *   4. Steuerung (white) — 3-Col FeatureGrid Lucide-Icons.
 *   5. PillButton + ContactCtaStripe.
 */

const BAUFORMEN: MaterialOption[] = [
	{
		name: "Aufsatz",
		tagline:
			"Auf das Fenster geschraubt, Kasten sichtbar. Schnellste Nachrüstung — auch bei Bestand.",
		href: "/produkte/rolllaeden",
		subCategories: ["Sichtbar", "Nachrüstbar", "Kompakt"],
		imageSrc: "/images/products/rolllaeden.jpg",
		imageAlt: "Aufsatzrollladen oberhalb eines Fensters",
	},
	{
		name: "Vorsatz",
		tagline:
			"Vor dem Fenster, mit Putzkasten in die Fassade integriert. Halb-versteckt.",
		href: "/produkte/rolllaeden",
		subCategories: ["Halb-verdeckt", "Putzkasten", "Sanierung"],
		imageSrc: "/images/products/rolllaeden.jpg",
		imageAlt: "Vorsatzrollladen mit Putzkasten",
	},
	{
		name: "Unterputz",
		tagline:
			"Komplett verputzt, fast unsichtbar. Architekten-Standard für Neubau.",
		href: "/produkte/rolllaeden",
		subCategories: ["Versteckt", "Neubau", "Premium"],
		imageSrc: "/images/products/rolllaeden.jpg",
		imageAlt: "Unterputzrollladen-Kasten in der Fassade",
	},
];

const IGLO_EDGE_DETAILS: Feature[] = [
	{
		kicker: "Vorteil",
		title: "Im Rahmen, nicht im Kasten",
		body: "Der Rollladen sitzt bündig im Fensterrahmen — kein Kasten über oder vor dem Fenster.",
	},
	{
		kicker: "Vorteil",
		title: "Maximale Glasfläche",
		body: "Kein Kasten, der Licht klaut — die volle Öffnung bleibt erhalten.",
	},
	{
		kicker: "Vorteil",
		title: "Glatte Fassade",
		body: "Keine Vorbau-Elemente. Die Fassade bleibt eine Linie — Architektur-Detail ohne Kompromiss.",
	},
];

const STEUERUNG: Feature[] = [
	{
		icon: <Hand className="size-5" aria-hidden />,
		title: "Gurtzug",
		body: "Mechanisch, manuell, wartungsfrei. Der Klassiker für den Bestand.",
	},
	{
		icon: <Radio className="size-5" aria-hidden />,
		title: "Funkmotor",
		body: "Knopfdruck, Fernbedienung, Zeitschaltuhr — der Standard im Neubau.",
	},
	{
		icon: <Cpu className="size-5" aria-hidden />,
		title: "Smart-Home",
		body: "KNX, Loxone, HomeAssistant — alles ansteuerbar. Wir liefern mit Gateway.",
	},
];

export default function RolllaedenPage() {
	return (
		<>
			<MarketingHero
				breadcrumb={[
					{ label: "Start", href: "/" },
					{ label: "Produkte", href: "/produkte" },
					{ label: "Rollladen" },
				]}
				eyebrow="Rollladen"
				headline={<>Sonne aus,</>}
				headlineHighlight="Sicht zu, Dämmung an."
				body="Drei Bauformen — Aufsatz, Vorsatz, Unterputz — plus die IGLO-Edge-Sonderlösung mit integriertem Rollladen im Rahmen. Manuell, Funk oder Smart-Home."
				stats={[
					{ label: "Bauformen", value: "03" },
					{ label: "Steuerung", value: "3 Wege" },
					{ label: "Sonderlösung", value: "Edge" },
				]}
			/>

			{/* ═══════ BAUFORMEN ═══════ */}
			<section
				aria-labelledby="rollo-bauformen-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="rollo-bauformen-heading"
						eyebrow="Bauformen"
						headline={<>Drei Wege, einen Rollladen einzubauen.</>}
						body="Sichtbar, halb-verdeckt oder ganz versteckt — je nach Bauphase und Budget."
					/>
					<MaterialOptions options={BAUFORMEN} cols={3} />
				</Container>
			</section>

			{/* ═══════ IGLO EDGE ═══════ */}
			<section
				aria-labelledby="rollo-edge-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
						<div className="md:col-span-5">
							<SectionKicker tone="brand">Sonderfall</SectionKicker>
							<h2
								id="rollo-edge-heading"
								className="mt-6 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl"
							>
								IGLO Edge —
								<br />
								Rollladen im Rahmen.
							</h2>
							<p className="mt-8 max-w-xl text-lg leading-relaxed text-black-600">
								DRUTEX hat ein Profil entwickelt, das den Rollladen direkt im
								Fensterrahmen führt. Kein Kasten, kein Aufsatz, keine sichtbare
								Box. Die Fassade bleibt eine glatte Linie, das Fenster behält
								seine volle Öffnung. Architektur-Detail ohne Kompromiss — und
								gleichzeitig die einfachste Lösung im Neubau.
							</p>
						</div>
						<div className="md:col-span-7">
							<FeatureGrid
								features={IGLO_EDGE_DETAILS}
								size="default"
								cardStyle="bordered"
								className="grid-cols-1 md:grid-cols-1 lg:grid-cols-1"
							/>
						</div>
					</div>
				</Container>
			</section>

			{/* ═══════ STEUERUNG ═══════ */}
			<section
				aria-labelledby="rollo-steuerung-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="rollo-steuerung-heading"
						eyebrow="Steuerung"
						headline={<>Gurtzug, Funk oder Smart-Home.</>}
						body="Drei Wege — vom mechanischen Klassiker bis zur KNX-Anbindung."
					/>
					<FeatureGrid features={STEUERUNG} cardStyle="bordered" />
				</Container>
			</section>

			{/* ═══════ CTA ═══════ */}
			<section
				aria-labelledby="rollo-cta-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="rollo-cta-heading"
						eyebrow="Loslegen"
						headline={
							<>
								Rollladen
								<br />
								konfigurieren.
							</>
						}
						body="Bauform, Steuerung, Farbe — alles im Konfigurator. Wir vermessen vor Ort."
					/>
					<PillButton href="/konfigurator" size="xl">
						Rollladen konfigurieren
					</PillButton>
				</Container>
			</section>

			<ContactCtaStripe />
		</>
	);
}
