import { Building, DoorClosed, PanelTop, Trees } from "lucide-react";
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
	title: "Schiebetüren · Muster Fenster",
	description:
		"HST, PSK und PS — große Glasflächen, leise gleitend. Bis 2.5 × 2.5 m, U-Wert ab 0.7 W/m2K.",
};

/**
 * /produkte/schiebetueren — Detail-Page Schiebetüren.
 *
 * Struktur:
 *   1. MarketingHero — leise gleitend.
 *   2. Systeme (white) — 3-Col FeatureGrid HST/PSK/PS.
 *   3. Anwendung (black-50) — 4-Col FeatureGrid Lucide-Icons.
 *   4. Specs (white) — SpecList stacked.
 *   5. PillButton + ContactCtaStripe.
 */

const SYSTEME: Feature[] = [
	{
		kicker: "System",
		title: "HST — Hebe-Schiebe",
		body: "Riesige Flügel bis 2.5 × 2.5 m. Aushebeln, gleiten, einrasten — für Wintergärten und Terrassen.",
	},
	{
		kicker: "System",
		title: "PSK — Parallel-Schiebe-Kipp",
		body: "Kompakter als HST. Lüften per Kippstellung, Öffnen per Schiebe — für mittlere Öffnungen.",
	},
	{
		kicker: "System",
		title: "PS — Klassisch Schiebe",
		body: "Innenraum-Trennung, leichte Konstruktion. Ohne Hebe-Mechanik — leiser, einfacher, günstiger.",
	},
];

const ANWENDUNGEN: Feature[] = [
	{
		icon: <Trees className="size-5" aria-hidden />,
		title: "Wintergarten",
		body: "Voll öffnen Richtung Garten — Sommer-Wohnzimmer ohne Grenze.",
	},
	{
		icon: <PanelTop className="size-5" aria-hidden />,
		title: "Terrassen-Front",
		body: "Bodentief, raumhoch, schmale Ansicht — moderne Architektur-Standard.",
	},
	{
		icon: <DoorClosed className="size-5" aria-hidden />,
		title: "Innenraum-Trennung",
		body: "Wohnen und Schlafen oder Büro und Empfang — Schiebetüren brauchen keine Schwenkfläche.",
	},
	{
		icon: <Building className="size-5" aria-hidden />,
		title: "Loft",
		body: "Industrielle Optik, große Glasflächen — Aluminium-Schiebe als Tribut an die Halle.",
	},
];

const SCHIEBE_SPECS: SpecItem[] = [
	{
		label: "Maxgröße",
		value: "2.5 × 2.5 m",
		note: "Bei HST — für PSK und PS reduziert.",
	},
	{
		label: "Glasfläche",
		value: "85 %",
		note: "Anteil an der Gesamtfläche — schmale Profile machen es möglich.",
	},
	{
		label: "U-Wert",
		value: "0.7 W/m2K",
		note: "Mit 3-fach-Verglasung und gedämmter Schwelle.",
	},
	{
		label: "Tragfähigkeit",
		value: "400 kg",
		note: "Pro Flügel bei HST — reicht für 3-fach-Glas auf Maxgröße.",
	},
];

export default function SchiebetuerenPage() {
	return (
		<>
			<MarketingHero
				breadcrumb={[
					{ label: "Start", href: "/" },
					{ label: "Produkte", href: "/produkte" },
					{ label: "Schiebetüren" },
				]}
				eyebrow="Schiebetüren"
				headline={<>Große Glasflächen,</>}
				headlineHighlight="leise gleitend."
				body="HST für riesige Flügel, PSK für den Kompromiss, klassische Schiebetüren für den Innenraum. Wir bauen, was die Architektur verlangt."
				stats={[
					{ label: "Systeme", value: "03" },
					{ label: "Maxgröße", value: "2.5 m" },
					{ label: "U-Wert ab", value: "0.7" },
				]}
			/>

			{/* ═══════ SYSTEME ═══════ */}
			<section
				aria-labelledby="schiebe-sys-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="schiebe-sys-heading"
						eyebrow="Systeme"
						headline={<>Drei Systeme, drei Antworten.</>}
						body="Jedes System hat seine Anwendung — wir empfehlen, nicht verkaufen."
					/>
					<FeatureGrid features={SYSTEME} cardStyle="bordered" />
				</Container>
			</section>

			{/* ═══════ ANWENDUNG ═══════ */}
			<section
				aria-labelledby="schiebe-anw-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="schiebe-anw-heading"
						eyebrow="Anwendung"
						headline={<>Vier typische Einsatzorte.</>}
						body="Wo Schiebetüren ihren Vorteil ausspielen — gegen die klassische Drehflügel-Tür."
					/>
					<FeatureGrid
						features={ANWENDUNGEN}
						size="dense"
						cardStyle="bordered"
					/>
				</Container>
			</section>

			{/* ═══════ SPECS ═══════ */}
			<section
				aria-labelledby="schiebe-specs-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="schiebe-specs-heading"
						eyebrow="Technisch"
						headline={<>Die Eckwerte.</>}
						body="Vier Zahlen, die in jeder Beratung kommen — alles andere ist Detail."
					/>
					<SpecList items={SCHIEBE_SPECS} layout="stacked" />
				</Container>
			</section>

			{/* ═══════ CTA ═══════ */}
			<section
				aria-labelledby="schiebe-cta-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="schiebe-cta-heading"
						eyebrow="Loslegen"
						headline={
							<>
								Schiebetür
								<br />
								konfigurieren.
							</>
						}
						body="System, Maß, Material, Schwelle — alles im Konfigurator zusammenklicken."
					/>
					<PillButton href="/konfigurator" size="xl">
						Schiebetür konfigurieren
					</PillButton>
				</Container>
			</section>

			<ContactCtaStripe />
		</>
	);
}
