import { Key, KeyRound, Lock, Shield } from "lucide-react";
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
	title: "Haustüren · Muster Fenster",
	description:
		"DRUTEX D-Gate Aluminium, IGLO Energy Alucover, klassische Holztüren — Eingang nach Maß, RC2/RC3 verfügbar.",
};

/**
 * /produkte/haustueren — Detail-Page Haustüren.
 *
 * Struktur:
 *   1. MarketingHero — Eingang ist Statement.
 *   2. Materialien (white) — MaterialOptions cols=3.
 *   3. Sicherheit (black-50) — 4-Col FeatureGrid mit Lucide-Icons.
 *   4. Specs (white) — SpecList stacked.
 *   5. PillButton + ContactCtaStripe.
 */

const HAUSTUER_MATERIALS: MaterialOption[] = [
	{
		name: "Aluminium D-Gate",
		tagline:
			"DRUTEX-Premium-Linie. Schmale Ansicht, beleuchtbare Designs, Smart-Lock-ready.",
		href: "/produkte/haustueren",
		subCategories: ["Modern", "RC3", "Beleuchtet"],
		imageSrc: "/images/products/tueren.jpg",
		imageAlt: "Aluminium-Haustür der DRUTEX D-Gate-Serie",
	},
	{
		name: "Kunststoff IGLO Energy Alucover",
		tagline:
			"Kunststoff innen, Aluminium außen. Beste Dämmung, kratzfest, wartungsarm.",
		href: "/produkte/haustueren",
		subCategories: ["IGLO", "Dämmung", "RC2"],
		imageSrc: "/images/products/tueren.jpg",
		imageAlt: "Haustür mit IGLO Energy Alucover und Aluminium-Außenschale",
	},
	{
		name: "Holz Massiv",
		tagline: "Eiche, Meranti — für Altbau, Denkmal und klassische Architektur.",
		href: "/produkte/haustueren",
		subCategories: ["Eiche", "Meranti", "Klassisch"],
		imageSrc: "/images/products/tueren.jpg",
		imageAlt: "Klassische Holz-Haustür aus Eiche",
	},
];

const SICHERHEIT: Feature[] = [
	{
		icon: <Lock className="size-5" aria-hidden />,
		title: "Mehrfachverriegelung",
		body: "Pilzkopfzapfen rundum, automatische Bolzen — bis zu 9 Verriegelungspunkte.",
	},
	{
		icon: <Shield className="size-5" aria-hidden />,
		title: "Sicherheitsglas",
		body: "P4A-Verbundsicherheitsglas widersteht Angriffen mit Hammer und Beil.",
	},
	{
		icon: <Key className="size-5" aria-hidden />,
		title: "Aufhebelschutz",
		body: "Massive Bandseite, Stählerne Hintergreifhaken — kein Hebeln möglich.",
	},
	{
		icon: <KeyRound className="size-5" aria-hidden />,
		title: "Smart-Lock-ready",
		body: "Vorbereitet für Nuki, Burg-Wächter & Co. — Kabel liegen wo sie sollen.",
	},
];

const HAUSTUER_SPECS: SpecItem[] = [
	{
		label: "U-Wert",
		value: "0.7 W/m2K",
		note: "Mit IGLO Energy Alucover und 3-fach-Verglasung.",
	},
	{
		label: "Standmaße",
		value: "98 × 208 cm",
		note: "Standard — alles dazwischen, darüber, darunter machbar.",
	},
	{
		label: "Verglasung",
		value: "Klar / Ornament / P4A",
		note: "Klar für Licht, Ornament für Sichtschutz, P4A für Sicherheit.",
	},
	{
		label: "Schließung",
		value: "Mech. / Smart",
		note: "Klassischer Schlüssel oder digitales Schloss — beides nachrüstbar.",
	},
];

export default function HaustuerenPage() {
	return (
		<>
			<MarketingHero
				breadcrumb={[
					{ label: "Start", href: "/" },
					{ label: "Produkte", href: "/produkte" },
					{ label: "Haustüren" },
				]}
				eyebrow="Haustüren"
				headline={<>Eingang</>}
				headlineHighlight="ist Statement."
				body="DRUTEX D-Gate Aluminium für moderne Architektur, IGLO Energy Alucover für Dämmung, klassische Holztüren für Altbau — RC2 oder RC3, Smart-Lock-ready."
				stats={[
					{ label: "Designs", value: "200+" },
					{ label: "Sicherheit", value: "RC2/3" },
					{ label: "Smart-Lock", value: "Ready" },
				]}
			/>

			{/* ═══════ MATERIALIEN ═══════ */}
			<section
				aria-labelledby="haustuer-mat-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="haustuer-mat-heading"
						eyebrow="Material"
						headline={<>Drei Material-Welten.</>}
						body="Aluminium für Architektur, Kunststoff-Alu für Dämmung, Holz für Charakter — jede Tür ein Statement."
					/>
					<MaterialOptions options={HAUSTUER_MATERIALS} cols={3} />
				</Container>
			</section>

			{/* ═══════ SICHERHEIT ═══════ */}
			<section
				aria-labelledby="haustuer-sicher-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="haustuer-sicher-heading"
						eyebrow="Einbruchhemmung"
						headline={<>RC2 oder RC3 — du entscheidest.</>}
						body="Vier Bausteine machen aus einer Tür eine Sicherheitstür. Wir bauen sie zusammen, du wählst das Niveau."
					/>
					<FeatureGrid
						features={SICHERHEIT}
						size="dense"
						cardStyle="bordered"
					/>
				</Container>
			</section>

			{/* ═══════ SPECS ═══════ */}
			<section
				aria-labelledby="haustuer-specs-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="haustuer-specs-heading"
						eyebrow="Technisch"
						headline={<>Die wichtigsten Werte.</>}
						body="U-Wert, Maß, Verglasung, Schließung — die Basis jeder Beratung."
					/>
					<SpecList items={HAUSTUER_SPECS} layout="stacked" />
				</Container>
			</section>

			{/* ═══════ CTA ═══════ */}
			<section
				aria-labelledby="haustuer-cta-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="haustuer-cta-heading"
						eyebrow="Loslegen"
						headline={
							<>
								Haustür
								<br />
								konfigurieren.
							</>
						}
						body="Material, Design, Sicherheitsstufe, Schloss — alles im Konfigurator zusammenklicken."
					/>
					<PillButton href="/konfigurator" size="xl">
						Haustür konfigurieren
					</PillButton>
				</Container>
			</section>

			<ContactCtaStripe />
		</>
	);
}
