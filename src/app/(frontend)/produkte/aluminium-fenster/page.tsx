import { Building2, Factory, Layers, Maximize2 } from "lucide-react";
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
	title: "Aluminium-Fenster · Muster Fenster",
	description:
		"Aluprof MB-45, MB-70, MB-86 N SI — schmal, hochfest, für große Glasflächen. Bis hin zur Passivhaus-Eignung.",
};

/**
 * /produkte/aluminium-fenster — Detail-Page Aluminium.
 *
 * Struktur:
 *   1. MarketingHero — schmal, hochfest, für große Flächen.
 *   2. Profile (white) — 3-Col FeatureGrid: MB-45, MB-70, MB-86 N SI.
 *   3. Wann Alu (black-50) — 4-Col FeatureGrid mit Anwendungs-Icons.
 *   4. Specs (white) — SpecList stacked.
 *   5. PillButton + ContactCtaStripe.
 */

const ALU_PROFILES: Feature[] = [
	{
		kicker: "Aluprof",
		title: "MB-45",
		body: "Schlankes Innen-Profil ohne thermische Trennung. Für Innenfenster, Büros, Trennwände — wo es nicht auf Dämmung ankommt.",
	},
	{
		kicker: "Aluprof",
		title: "MB-70",
		body: "Thermisch getrennt, das Universalprofil. Für Außenfenster im Standard — guter Kompromiss aus Dämmung, Statik und Preis.",
	},
	{
		kicker: "Aluprof",
		title: "MB-86 N SI",
		body: "Super-isoliert, Passivhaus-tauglich. U-Werte bis 0.8 — wenn die Energiebilanz wichtig ist und Aluminium gewünscht.",
	},
];

const ALU_USECASES: Feature[] = [
	{
		icon: <Maximize2 className="size-5" aria-hidden />,
		title: "Große Glasflächen",
		body: "Wenn Kunststoff statisch an die Grenze kommt — Alu trägt mehr.",
	},
	{
		icon: <Layers className="size-5" aria-hidden />,
		title: "Schwere Elemente",
		body: "Hebe-Schiebe-Türen, raumhohe Fronten, statisch fragile Geometrien.",
	},
	{
		icon: <Building2 className="size-5" aria-hidden />,
		title: "Moderne Architektur",
		body: "Schmale Ansicht, scharfe Kanten, klares Linienspiel — Architekten-Standard.",
	},
	{
		icon: <Factory className="size-5" aria-hidden />,
		title: "Industrieller Bestand",
		body: "Lofts, Gewerbe, Hallen — Aluminium passt zur Bestand-Ästhetik.",
	},
];

const ALU_SPECS: SpecItem[] = [
	{
		label: "U-Wert",
		value: "0.8 W/m2K",
		note: "Mit MB-86 N SI und 3-fach-Verglasung.",
	},
	{
		label: "Profiltiefe",
		value: "45 / 70 / 86 mm",
		note: "Je nach Profilreihe — bestimmt Dämmung und Statik.",
	},
	{
		label: "Maxgröße",
		value: "4.0 × 3.0 m",
		note: "Profilreihe und Glas entscheiden — wir rechnen statisch nach.",
	},
	{
		label: "Oberflächen",
		value: "Pulver / Eloxal",
		note: "RAL nach Wunsch, Eloxal für Industrieoptik.",
	},
];

export default function AluminiumFensterPage() {
	return (
		<>
			<MarketingHero
				breadcrumb={[
					{ label: "Start", href: "/" },
					{ label: "Produkte", href: "/produkte" },
					{ label: "Fenster", href: "/produkte/fenster" },
					{ label: "Aluminium" },
				]}
				eyebrow="Aluminium"
				headline={<>Schmal,</>}
				headlineHighlight="hochfest, für große Flächen."
				body="Aluminium-Fenster aus Aluprof-Profilen — wenn Kunststoff statisch nicht mehr reicht oder die Architektur eine schmalere Ansicht verlangt. Drei Profilreihen, drei Antworten."
				stats={[
					{ label: "Profilreihen", value: "03" },
					{ label: "U-Wert ab", value: "0.8" },
					{ label: "Hersteller", value: "Aluprof" },
				]}
			/>

			{/* ═══════ PROFILE ═══════ */}
			<section
				aria-labelledby="alu-profile-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="alu-profile-heading"
						eyebrow="Profile"
						headline={<>Drei Profilreihen, drei Antworten.</>}
						body="MB-45, MB-70, MB-86 N SI — wir empfehlen passend zur Anwendung. Keine Pauschalen, keine Aufpreis-Falle."
					/>
					<FeatureGrid features={ALU_PROFILES} cardStyle="bordered" />
				</Container>
			</section>

			{/* ═══════ WANN ALU ═══════ */}
			<section
				aria-labelledby="alu-wann-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="alu-wann-heading"
						eyebrow="Wann Aluminium"
						headline={<>Vier Fälle, in denen Alu die richtige Wahl ist.</>}
						body="Aluminium ist nicht immer die Antwort — aber wenn, dann oft alternativlos."
					/>
					<FeatureGrid
						features={ALU_USECASES}
						size="dense"
						cardStyle="bordered"
					/>
				</Container>
			</section>

			{/* ═══════ SPECS ═══════ */}
			<section
				aria-labelledby="alu-specs-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="alu-specs-heading"
						eyebrow="Technisch"
						headline={<>Die Eckwerte.</>}
						body="Vier Zahlen, die in jeder Aluminium-Beratung kommen."
					/>
					<SpecList items={ALU_SPECS} layout="stacked" />
				</Container>
			</section>

			{/* ═══════ CTA ═══════ */}
			<section
				aria-labelledby="alu-cta-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						headingId="alu-cta-heading"
						eyebrow="Loslegen"
						headline={
							<>
								Aluminium-Fenster
								<br />
								konfigurieren.
							</>
						}
						body="Profil, Maß, Verglasung — der Konfigurator fragt alles ab. Wir rechnen die Statik."
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
