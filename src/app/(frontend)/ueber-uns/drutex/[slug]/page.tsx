import {
	Atom,
	Award,
	Clock,
	Hammer,
	Heart,
	Layers,
	ShieldCheck,
	Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type * as React from "react";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { EditorialSplit } from "@/components/marketing/editorial-split";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { FuhrparkSections } from "@/components/marketing/fuhrpark-sections";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { SectionDivider } from "@/components/marketing/section-divider";
import { SpecList } from "@/components/marketing/spec-list";
import { PillButton } from "@/components/ui/pill-button";

/**
 * /ueber-uns/drutex/[slug] — Detail-Vertiefungen zum DRUTEX-Hub.
 *
 * Vier statisch generierte Slugs (Lookup-Pattern analog galerie/[kategorie]):
 *   - profil      → Geschichte, Familie, Leitbild
 *   - werk        → Werk Bytów, Hallen, Logistik
 *   - iglo        → Alle 6 IGLO-Profilserien im Detail
 *   - produktion  → Wertkette Granulat → Fenster (5 Schritte)
 *
 * Architektur:
 *   1. CONFIG-Lookup (DRUTEX_SUBS) mit allen Detail-Daten pro Slug
 *   2. generateStaticParams für alle vier Slugs
 *   3. generateMetadata pro Slug (Title + Description)
 *   4. notFound() bei unbekanntem Slug
 *   5. Section-Renderer wechselt anhand des Slugs den Content
 *
 * Page-Rhythmus pro Slug:
 *   MarketingHero → 4–5 Content-Sections (white ↔ black-50, Atmospheric in black-950)
 *   → ContactCtaStripe als Closer.
 */

/* ──────────────────────────────────────────────────────────────────
   TYPEN
   ────────────────────────────────────────────────────────────────── */

type DrutexSubConfig = {
	slug: string;
	eyebrow: string;
	pageTitle: string;
	metaDescription: string;
	breadcrumbLabel: string;
	headline: React.ReactNode;
	headlineHighlight?: string;
	body: React.ReactNode;
	stats: { label: string; value: string }[];
};

/* ──────────────────────────────────────────────────────────────────
   CONFIG-LOOKUP
   ────────────────────────────────────────────────────────────────── */

const DRUTEX_SUBS: Record<string, DrutexSubConfig> = {
	profil: {
		slug: "profil",
		eyebrow: "Detail · Profil",
		pageTitle: "Profil",
		metaDescription:
			"DRUTEX im Profil — gegründet 1985 in Bytów, in dritter Generation Familienunternehmen, 3.000+ Mitarbeiter, vertikal integriert. Die Geschichte hinter unserem Hauptpartner.",
		breadcrumbLabel: "Profil",
		headline: <>Pommerns</>,
		headlineHighlight: "größtes Familienwerk.",
		body: (
			<>
				DRUTEX wurde 1985 in Bytów gegründet — mitten in Pommern, weit ab von
				den großen Industriezentren. Was als Zwei-Mann-Betrieb begann, ist heute
				eines der größten Fensterwerke Europas, geführt in dritter Generation
				derselben Familie. Ohne Investorenrunde, ohne Standortwechsel, mit
				demselben Anspruch wie am ersten Tag.
			</>
		),
		stats: [
			{ label: "Gegründet", value: "1985" },
			{ label: "Mitarbeiter", value: "3.000+" },
			{ label: "Familienführung", value: "3. Generation" },
			{ label: "Standort", value: "Bytów, PL" },
		],
	},

	werk: {
		slug: "werk",
		eyebrow: "Detail · Werk Bytów",
		pageTitle: "Werk Bytów",
		metaDescription:
			"Das DRUTEX-Werk in Bytów — 60.000 m² Werksfläche, sechs Hallen, über 800 Mitarbeiter pro Schicht, 12.000 Fenster pro Tag. Wie das Werk arbeitet und wie Musterstadt beliefert wird.",
		breadcrumbLabel: "Werk",
		headline: <>60.000 m²</>,
		headlineHighlight: "unter einem Dach.",
		body: (
			<>
				Das DRUTEX-Stammwerk liegt in Bytów, einer Hafenstadt im polnischen
				Pommern. Sechs Hallen, jede für einen Produktionsschritt, alle auf
				demselben Gelände — vom PVC-Granulat bis zum verpackten Fenster läuft
				alles unter einem Dach. Wir kennen jede Halle, jeden Vorarbeiter und
				jeden Liefertermin nach Musterstadt.
			</>
		),
		stats: [
			{ label: "Werksfläche", value: "60.000 m²" },
			{ label: "Hallen", value: "6" },
			{ label: "Mitarbeiter pro Schicht", value: "800+" },
			{ label: "Output pro Tag", value: "12.000+" },
		],
	},

	iglo: {
		slug: "iglo",
		eyebrow: "Detail · IGLO-Familie",
		pageTitle: "IGLO-Profilserien",
		metaDescription:
			"Alle sechs IGLO-Profilserien im Detail — Classic, Energy, Edge, Light, EXT, Energy Alucover. U-Werte, Bautiefen, Anwendungsbereiche und welches Profil zu welchem Bauvorhaben passt.",
		breadcrumbLabel: "IGLO",
		headline: <>Sechs Profile —</>,
		headlineHighlight: "ein Standard.",
		body: (
			<>
				IGLO ist die Hauptlinie aus Bytów — sechs PVC-Profilserien für jede
				Bauaufgabe, vom Sanierungsklassiker bis zum Profil für extreme
				Klimazonen. Alle teilen denselben Mehrkammer-Aufbau, alle laufen auf
				denselben Beschlägen, alle werden in derselben Halle endmontiert.
				Welches du brauchst, hängt am Bau, nicht am Marketing.
			</>
		),
		stats: [
			{ label: "Profilserien", value: "6" },
			{ label: "Gemeinsamer Standard", value: "Mehrkammer-PVC" },
			{ label: "U-Werte ab", value: "0,7 W/m²K" },
			{ label: "Anteil Output", value: "80 %+" },
		],
	},

	produktion: {
		slug: "produktion",
		eyebrow: "Detail · Produktion",
		pageTitle: "Produktion",
		metaDescription:
			"Wie aus PVC-Granulat ein fertiges Fenster wird — fünf Schritte, alle im DRUTEX-Werk Bytów. Eigene Extrusion, eigene Glasverarbeitung, eigene Beschlag-Montage, eigene Qualitätssicherung.",
		breadcrumbLabel: "Produktion",
		headline: <>Vom Granulat</>,
		headlineHighlight: "zum Fenster.",
		body: (
			<>
				Vertikal integriert heißt: niemand zwischen Profil und Lieferschein.
				DRUTEX produziert Profile, Glas und Beschlag-Komponenten selbst und
				montiert das fertige Fenster auf demselben Gelände. Fünf Schritte, alle
				dokumentiert, alle geprüft — und am Ende eine zweite Prüfung bei uns auf
				dem Hof in Musterstadt.
			</>
		),
		stats: [
			{ label: "Produktionsschritte", value: "5" },
			{ label: "Eigene Extrusion", value: "Ja" },
			{ label: "Eigene Glasverarbeitung", value: "Ja" },
			{ label: "Eigene Beschlag-Montage", value: "Ja" },
		],
	},

	fuhrpark: {
		slug: "fuhrpark",
		eyebrow: "Eigene Logistik",
		pageTitle: "Fuhrpark",
		metaDescription:
			"Eigene Logistik aus Musterstadt — vier Fahrzeuge, 100 km Radius, Direktlieferung in Beispielstadt und Musterstadt. Mit Hebebühne, Etagentransport und Verpackungs-Entsorgung.",
		breadcrumbLabel: "Fuhrpark",
		headline: <>Direkt geliefert,</>,
		headlineHighlight: "ohne Spedition.",
		body: (
			<>
				Im 100-km-Radius rund um Musterstadt liefern wir mit eigenem Fuhrpark.
				Vier Fahrzeuge, Hebebühne für Treppenhaus, Etagentransport bis 4. OG. Du
				redest mit dem, der ausladet — nicht mit einem Spediteur.
			</>
		),
		stats: [
			{ label: "Fahrzeuge", value: "4" },
			{ label: "Liefer-Radius", value: "100 km" },
			{ label: "Region", value: "BB · BE" },
			{ label: "Hebebühne", value: "an Bord" },
		],
	},
};

/* ──────────────────────────────────────────────────────────────────
   IGLO-PROFIL-DATEN (für Slug "iglo")
   ────────────────────────────────────────────────────────────────── */

type IgloProfile = {
	id: string;
	number: string;
	name: string;
	uValue: string;
	depth: string;
	chambers: string;
	tagline: string;
	when: string;
	body: string[];
	specs: { label: string; value: string }[];
	imageSrc: string;
	imageAlt: string;
};

const IGLO_PROFILES: IgloProfile[] = [
	{
		id: "iglo-5-classic",
		number: "01 · IGLO 5 Classic",
		name: "IGLO 5 Classic",
		uValue: "1,0 W/m²K",
		depth: "70 mm",
		chambers: "5 Kammern",
		tagline: "Klassiker für Sanierung",
		when: "Wann nehmen?",
		body: [
			"Der Allrounder für Sanierungen und Standard-Neubauten. Fünf Kammern, 70 mm Bautiefe, solide Werte zum vernünftigen Preis. Das meistverbaute Profil im Musterstädter Bestand seit zwanzig Jahren.",
			"Technisch: hochfester PVC-Hohlprofil-Aufbau, zwei umlaufende Dichtungen, kompatibel zu allen IGLO-Beschlägen. Maximale Flügelgröße 1,80 × 2,40 m — passt für 90 % aller Wohnbau-Öffnungen.",
		],
		specs: [
			{ label: "U-Wert", value: "1,0 W/m²K" },
			{ label: "Bautiefe", value: "70 mm" },
			{ label: "Kammern", value: "5" },
			{ label: "Schallschutz", value: "bis 42 dB" },
			{ label: "Max. Flügel", value: "1,80 × 2,40 m" },
		],
		imageSrc: "/images/drutex/iglo-5-classic.jpg",
		imageAlt: "Profilschnitt IGLO 5 Classic mit fünf Kammern",
	},
	{
		id: "iglo-energy",
		number: "02 · IGLO Energy",
		name: "IGLO Energy",
		uValue: "0,85 W/m²K",
		depth: "82 mm",
		chambers: "6 Kammern",
		tagline: "Energieeffiziente Neubau-Wahl",
		when: "Wann nehmen?",
		body: [
			"Für KfW-Effizienzhaus 55 und 40, für Niedrigenergiehäuser, für jeden Bau, bei dem die Gebäudehülle wirklich rechnet. Sechs Kammern, 82 mm Bautiefe, dreifach verglast — U-Werte unter 0,9 W/m²K im Standard.",
			"Technisch: thermisch optimierter Profilkern, drei umlaufende Dichtungen, hoher Stahlanteil in der Aussteifung. Standard für Neubau in Musterstadt seit der EnEV-Verschärfung 2016.",
		],
		specs: [
			{ label: "U-Wert", value: "0,85 W/m²K" },
			{ label: "Bautiefe", value: "82 mm" },
			{ label: "Kammern", value: "6" },
			{ label: "Schallschutz", value: "bis 46 dB" },
			{ label: "Max. Flügel", value: "1,80 × 2,40 m" },
		],
		imageSrc: "/images/drutex/iglo-energy.jpg",
		imageAlt: "Profilschnitt IGLO Energy mit sechs Kammern",
	},
	{
		id: "iglo-edge",
		number: "03 · IGLO Edge",
		name: "IGLO Edge",
		uValue: "0,85 W/m²K",
		depth: "82 mm + Rollladen",
		chambers: "6 Kammern",
		tagline: "Bündig ohne Rollladenkasten",
		when: "Wann nehmen?",
		body: [
			"Wenn der Rollladen rein soll, aber kein Kasten in der Fassade sichtbar sein darf. Edge integriert den Rollladen bündig in den Profilrahmen — von außen ist nur der Beschlag zu sehen, keine Aufsatzbox.",
			"Technisch: Energy-Profilkern plus integrierter Rollladenführung im selben Rahmen. Funktioniert mit elektrischen und manuellen Rollläden, Motoren werden ab Werk verkabelt.",
		],
		specs: [
			{ label: "U-Wert", value: "0,85 W/m²K" },
			{ label: "Bautiefe", value: "82 mm" },
			{ label: "Kammern", value: "6" },
			{ label: "Rollladen", value: "Integriert" },
			{ label: "Max. Flügel", value: "1,60 × 2,20 m" },
		],
		imageSrc: "/images/drutex/iglo-edge.jpg",
		imageAlt: "Profilschnitt IGLO Edge mit integriertem Rollladen",
	},
	{
		id: "iglo-light",
		number: "04 · IGLO Light",
		name: "IGLO Light",
		uValue: "1,1 W/m²K",
		depth: "70 mm",
		chambers: "5 Kammern",
		tagline: "Schmale Ansicht für lichtreiche Räume",
		when: "Wann nehmen?",
		body: [
			"Wenn das Profil verschwinden soll und das Licht das Wort hat. Light reduziert die sichtbare Rahmenbreite auf das Minimum — bis zu 25 % schmaler als Standard. Mehr Glas, weniger PVC.",
			"Technisch: optimierte Profilgeometrie mit reduzierten Außenmaßen, derselbe Mehrkammer-Aufbau wie 5 Classic. Ideal für Architekten, die klare Linien wollen, und für nordseitige Räume, die jedes Quäntchen Licht brauchen.",
		],
		specs: [
			{ label: "U-Wert", value: "1,1 W/m²K" },
			{ label: "Bautiefe", value: "70 mm" },
			{ label: "Kammern", value: "5" },
			{ label: "Ansichtsbreite", value: "−25 %" },
			{ label: "Max. Flügel", value: "1,60 × 2,20 m" },
		],
		imageSrc: "/images/drutex/iglo-light.jpg",
		imageAlt: "Profilschnitt IGLO Light mit reduzierter Ansichtsbreite",
	},
	{
		id: "iglo-ext",
		number: "05 · IGLO EXT",
		name: "IGLO EXT",
		uValue: "0,78 W/m²K",
		depth: "90 mm",
		chambers: "7 Kammern",
		tagline: "Für extreme Klimazonen",
		when: "Wann nehmen?",
		body: [
			"Wenn der Bau in der Höhe steht, an der Küste oder im Passivhaus. EXT ist das Top-Profil mit 90 mm Bautiefe, sieben Kammern und U-Werten unter 0,8 W/m²K — entwickelt für skandinavische und Alpen-Bauvorgaben.",
			"Technisch: maximaler Profilkern mit zusätzlicher Mitteldichtung, optionale Schaumkern-Füllung, höchste statische Reserven für Großformate. Wird in Musterstadt selten gebraucht — aber wenn, dann ist nichts darunter eine Option.",
		],
		specs: [
			{ label: "U-Wert", value: "0,78 W/m²K" },
			{ label: "Bautiefe", value: "90 mm" },
			{ label: "Kammern", value: "7" },
			{ label: "Schallschutz", value: "bis 48 dB" },
			{ label: "Max. Flügel", value: "2,00 × 2,60 m" },
		],
		imageSrc: "/images/drutex/iglo-ext.jpg",
		imageAlt: "Profilschnitt IGLO EXT mit sieben Kammern",
	},
	{
		id: "iglo-energy-alucover",
		number: "06 · IGLO Energy Alucover",
		name: "IGLO Energy Alucover",
		uValue: "0,85 W/m²K",
		depth: "82 mm + Alu-Schale",
		chambers: "6 Kammern",
		tagline: "PVC innen, Aluminium außen",
		when: "Wann nehmen?",
		body: [
			"Die Premium-Wahl, wenn der PVC-Anspruch innen bleiben soll, außen aber Aluminium-Optik gefragt ist. Alucover legt eine pulverbeschichtete Alu-Schale auf den Energy-Profilkern — anthrazit, schwarz, jede RAL-Farbe.",
			"Technisch: Energy-Profil plus 1,5 mm Alu-Cover, hinterlüftet, witterungsbeständig auf Jahrzehnte. UV-stabil, kein Vergilben, keine Wartung. Standard-Wahl für sichtbare Architektur-Fassaden in Musterstadt.",
		],
		specs: [
			{ label: "U-Wert", value: "0,85 W/m²K" },
			{ label: "Bautiefe", value: "82 mm" },
			{ label: "Außenschale", value: "Alu 1,5 mm" },
			{ label: "Farben", value: "Alle RAL" },
			{ label: "Max. Flügel", value: "1,80 × 2,40 m" },
		],
		imageSrc: "/images/drutex/iglo-energy-alucover.jpg",
		imageAlt: "Profilschnitt IGLO Energy Alucover mit Aluminium-Außenschale",
	},
];

/* ──────────────────────────────────────────────────────────────────
   PRODUKTION-SCHRITTE (für Slug "produktion")
   ────────────────────────────────────────────────────────────────── */

type ProductionStep = {
	number: string;
	title: string;
	body: string;
	duration: string;
};

const PRODUCTION_STEPS: ProductionStep[] = [
	{
		number: "01",
		title: "Extrusion",
		body: "PVC-Granulat wird unter Hitze und Druck zu Mehrkammer-Hohlprofilen geformt. Eigene Extrusionslinien, eigene Rezepturen, eigener Stahl-Aussteifungs-Einzug. Alles in Halle 1.",
		duration: "4 Std/Profil",
	},
	{
		number: "02",
		title: "Zuschnitt & Schweißung",
		body: "Profile auf Maß sägen, Eckverbindungen unter Hitze verschweißen, Schweißnähte nachbearbeiten. Hier entsteht der Rahmen — Maßgenauigkeit ±0,5 mm.",
		duration: "30 Min",
	},
	{
		number: "03",
		title: "Glasverarbeitung",
		body: "Eigene ISO-Glas-Linie in Halle 2. Zwei- oder dreifach verglast, Argon-Füllung, Warm-Edge-Abstandhalter. Läuft parallel zur Profilfertigung — kein Glas wartet, kein Profil wartet.",
		duration: "parallel",
	},
	{
		number: "04",
		title: "Beschlag & Endmontage",
		body: "Mehrfachverriegelungs-Beschlag einbauen, Glas einlegen, Dichtungen einsetzen, Flügel justieren. Halle 5 — hier wird aus Rahmen und Glas das fertige Fenster.",
		duration: "1 Std",
	},
	{
		number: "05",
		title: "Prüfung & Versand",
		body: "Funktionsprüfung jedes Flügels, optische Endkontrolle, Schutzfolie, Verpackung. Dann Kommissionierung in Halle 6 für die Spedition nach Musterstadt.",
		duration: "30 Min",
	},
];

/* ──────────────────────────────────────────────────────────────────
   NEXT.JS API
   ────────────────────────────────────────────────────────────────── */

export async function generateStaticParams() {
	return Object.keys(DRUTEX_SUBS).map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const config = DRUTEX_SUBS[slug];

	if (!config) {
		return {
			title: "DRUTEX · Muster Fenster",
		};
	}

	return {
		title: `${config.pageTitle} · DRUTEX · Muster Fenster`,
		description: config.metaDescription,
	};
}

/* ──────────────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────────────── */

export default async function DrutexSubPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const config = DRUTEX_SUBS[slug];

	if (!config) {
		notFound();
	}

	return (
		<>
			<MarketingHero
				breadcrumb={[
					{ label: "Start", href: "/" },
					{ label: "Über uns", href: "/ueber-uns" },
					{ label: "DRUTEX", href: "/ueber-uns/drutex" },
					{ label: config.breadcrumbLabel },
				]}
				eyebrow={config.eyebrow}
				headline={config.headline}
				headlineHighlight={config.headlineHighlight}
				body={config.body}
				stats={config.stats}
			/>

			{slug === "profil" && <ProfilSections />}
			{slug === "werk" && <WerkSections />}
			{slug === "iglo" && <IgloSections />}
			{slug === "produktion" && <ProduktionSections />}
			{slug === "fuhrpark" && <FuhrparkSections />}

			<ContactCtaStripe />
		</>
	);
}

/* ══════════════════════════════════════════════════════════════════
   SLUG: profil
   ══════════════════════════════════════════════════════════════════ */

function ProfilSections() {
	const timeline = [
		{ year: "1985", text: "Gründung in Bytów als Familienbetrieb" },
		{ year: "1995", text: "Erste eigene PVC-Extrusionsanlage" },
		{ year: "2005", text: "Erste internationale Exportverträge" },
		{ year: "2015", text: "Eröffnung des heutigen 60.000 m²-Werks" },
		{ year: "2026", text: "60+ Exportmärkte, 3 Mio Fenster pro Jahr" },
	];

	return (
		<>
			{/* GESCHICHTE — bg-white */}
			<section
				aria-labelledby="profil-geschichte-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />

				<Container size="xl">
					<EditorialSplit
						headingId="profil-geschichte-heading"
						eyebrow="Geschichte"
						headline={
							<>
								Vom Zwei-Mann-Betrieb
								<br />
								zum Marktführer.
							</>
						}
					/>

					<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
						<div className="md:col-span-8">
							<div className="max-w-2xl space-y-6 text-lg leading-relaxed text-black-700">
								<p>
									1985 gründete die Familie Drózd in Bytów einen kleinen
									Drahtwarenbetrieb — daher der Name DRUTEX, vom polnischen
									„drut" für Draht. Pommern war damals strukturschwach, ein
									Standort fern der Wirtschaftszentren. Genau deshalb wurde aus
									DRUTEX ein lokales Schwergewicht: weil Wachstum hier auf
									verfügbare Hände, günstige Flächen und eine ganze Region traf,
									die einen verlässlichen Arbeitgeber suchte.
								</p>
								<p>
									1995 stellte DRUTEX auf die Fenster-Produktion um und
									installierte die erste eigene Extrusionsanlage. Zehn Jahre
									später folgten erste internationale Exportverträge — nach
									Skandinavien, in die Niederlande, später nach Deutschland.
									Heute liefert das Werk in über 60 Länder und gehört zu den
									größten Fensterherstellern Europas.
								</p>
								<p>
									2015 wurde das heutige Hauptwerk auf 60.000 m² eröffnet —
									sechs Hallen, alle vertikal integriert. Trotz Größe ist der
									Betrieb in Familienhand geblieben: dritte Generation Drózd,
									keine Investorenrunde, derselbe Standort wie 1985. Das macht
									DRUTEX zum seltenen Fall — Marktführer mit
									Familienunternehmen-DNA.
								</p>
							</div>
						</div>

						<div className="md:col-span-4">
							<aside aria-label="Zeitstrahl DRUTEX-Geschichte">
								<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
									Zeitstrahl
								</p>
								<ol className="mt-6 space-y-5 border-l border-black-200 pl-6">
									{timeline.map((item) => (
										<li key={item.year} className="relative">
											<span
												aria-hidden
												className="absolute -left-[27px] top-2 size-2 rounded-full bg-brand-500"
											/>
											<p className="font-mono text-sm font-medium tabular-nums text-black-950">
												{item.year}
											</p>
											<p className="mt-1 text-sm leading-relaxed text-black-600">
												{item.text}
											</p>
										</li>
									))}
								</ol>
							</aside>
						</div>
					</div>
				</Container>
			</section>

			{/* FAMILIE & LEITBILD — bg-black-50 */}
			<section
				aria-labelledby="profil-familie-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />

				<Container size="xl">
					<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
						<div className="md:col-span-5">
							<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
								Familie & Leitbild
							</p>
							<h2
								id="profil-familie-heading"
								className="mt-6 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl"
							>
								Familie führt.
							</h2>
							<div className="mt-8 max-w-md space-y-5 text-base leading-relaxed text-black-700">
								<p>
									DRUTEX ist seit der Gründung in Familienbesitz. Heute führt
									die dritte Generation Drózd das Unternehmen — derselbe
									Nachname, derselbe Standort, dieselben Werte wie 1985.
								</p>
								<p>
									Familie heißt hier nicht Marketing-Floskel, sondern
									Geschäftsmodell: keine Quartals-Calls, keine
									Investoren-Renditeziele, keine Standortverlagerungen.
									Stattdessen langfristige Investitionen, regionale
									Verantwortung für Bytów und ein einziger Anspruch — Fenster,
									die 30 Jahre halten.
								</p>
								<p>
									Wir kennen die Geschäftsführung persönlich. Sonderwünsche
									klären wir am Telefon, nicht über drei Vertriebsstufen.
								</p>
							</div>
						</div>

						<div className="md:col-span-7">
							<SpecList
								layout="stacked"
								items={[
									{
										label: "Mitarbeiter",
										value: "3.000+",
										note: "Eigene Belegschaft, kein Zeitarbeit-Modell",
									},
									{
										label: "Familienanteil",
										value: "100 %",
										note: "Keine externen Investoren",
									},
									{
										label: "Generation",
										value: "3.",
										note: "Familie Drózd seit 1985",
									},
									{
										label: "Geschäftsführer",
										value: "Familie Drózd",
										note: "Gründerfamilie in 3. Generation",
									},
								]}
							/>
						</div>
					</div>
				</Container>
			</section>

			{/* VIER PRINZIPIEN — bg-white */}
			<section
				aria-labelledby="profil-werte-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />

				<Container size="xl">
					<EditorialSplit
						headingId="profil-werte-heading"
						eyebrow="Werte"
						headline={<>Vier Prinzipien.</>}
						body="Worauf DRUTEX gebaut ist — und warum genau das uns als Händler interessiert."
					/>

					<FeatureGrid
						size="dense"
						cardStyle="bordered"
						features={[
							{
								icon: <Hammer className="size-5" aria-hidden />,
								title: "Vertikal integriert",
								body: "Eigene Extrusion, eigene Glasverarbeitung, eigene Beschlag-Montage. Niemand zwischen Profil und Lieferschein.",
							},
							{
								icon: <Heart className="size-5" aria-hidden />,
								title: "Familie statt Konzern",
								body: "Drei Generationen, derselbe Standort, dieselben Werte. Kein Quartalsdruck, keine Investorenrunde.",
							},
							{
								icon: <Award className="size-5" aria-hidden />,
								title: "Qualität als Pflicht",
								body: "ISO 9001 ist Mindestmaß. Jedes Fenster wird zweimal geprüft — im Werk und bei Anlieferung.",
							},
							{
								icon: <Clock className="size-5" aria-hidden />,
								title: "Generationen-Fenster",
								body: "Wenn ein Fenster 30 Jahre hält, muss auch der Hersteller 30 Jahre da sein. Daran arbeiten wir.",
							},
						]}
					/>
				</Container>
			</section>

			{/* ATMOSPHERIC — bg-black-950 */}
			<AtmosphericBridge
				headingId="profil-atmospheric-heading"
				eyebrow="Persönlich"
				headline={
					<>
						Wir kennen die Familie
						<br />
						<span className="text-brand-400">persönlich.</span>
					</>
				}
				body="Werksbesuche zwei Mal im Jahr. Direkter Draht zur Geschäftsführung. Sonderwünsche klären wir nicht per Mail — wir greifen zum Hörer."
				ctaHref="/ueber-uns/drutex/werk"
				ctaLabel="Werk besuchen"
			/>
		</>
	);
}

/* ══════════════════════════════════════════════════════════════════
   SLUG: werk
   ══════════════════════════════════════════════════════════════════ */

function WerkSections() {
	const hallen = [
		{
			kicker: "Halle 1 · Extrusion",
			title: "PVC zu Profil",
			body: "Extrusionsanlagen für Mehrkammer-Hohlprofile aus PVC-Granulat. Eigene Rezepturen, eigene Stahl-Aussteifung, eigene Profilformen — Basis für alle IGLO-Serien.",
		},
		{
			kicker: "Halle 2 · Glas",
			title: "Verbund zu Scheibe",
			body: "ISO-Glas-Fertigung im Werk. Zwei- und dreifach verglast, Argon-Füllung, Warm-Edge-Abstandhalter. Kein externes Glas-Werk in der Lieferkette.",
		},
		{
			kicker: "Halle 3 · Konfektion",
			title: "Profil zu Fenster",
			body: "Zuschnitt auf Maß, Eckschweißung, Bohrung, Beschlag-Vorbereitung. Hier wird aus dem Strang-Profil der Rahmen, der zum Flügel passt.",
		},
		{
			kicker: "Halle 4 · Aluminium",
			title: "Mit Aluprof",
			body: "Aluminium-Profile MB-45, MB-70 und MB-86 N SI auf eigener Linie. Schweißen, Eloxieren, Pulverbeschichten — alles vor Ort.",
		},
		{
			kicker: "Halle 5 · Endmontage",
			title: "Beschlag & Glas",
			body: "Mehrfachverriegelungs-Beschlag einbauen, Glas einlegen, Dichtungen setzen, Flügel justieren. Funktionsprüfung Stück für Stück.",
		},
		{
			kicker: "Halle 6 · Versand",
			title: "Logistik",
			body: "Verpackung, Kommissionierung, Spedition. Pro Tag verlassen über 12.000 Fenster die Halle — auch nach Musterstadt.",
		},
	];

	return (
		<>
			{/* STANDORT — bg-white */}
			<section
				aria-labelledby="werk-standort-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />

				<Container size="xl">
					<EditorialSplit
						headingId="werk-standort-heading"
						eyebrow="Standort"
						headline={
							<>
								Bytów —
								<br />
								Hafen, Bahn, Werk.
							</>
						}
					/>

					<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
						<div className="md:col-span-5">
							<figure>
								<div
									aria-hidden
									className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black-100"
								>
									<div className="absolute inset-x-6 bottom-6">
										<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
											Bytów · Pommern · Polen
										</p>
										<p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-black-400">
											DRUTEX-Hauptwerk
										</p>
									</div>
								</div>
								<figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
									Werksgelände · 60.000 m²
								</figcaption>
							</figure>
						</div>

						<div className="md:col-span-7">
							<div className="max-w-2xl space-y-6 text-lg leading-relaxed text-black-700">
								<p>
									Bytów liegt in Pommern, eine Hafen-nahe Kleinstadt mit
									Bahnanschluss und Autobahn-Zugang in vierzig Minuten. Für ein
									Fensterwerk ein idealer Standort: Material kommt per Bahn ins
									Werk, fertige Fenster gehen per Lkw raus, Mitarbeiter wohnen
									im Umkreis von dreißig Kilometern.
								</p>
								<p>
									Der regionale Arbeitsmarkt ist einer der Gründe, warum DRUTEX
									in Bytów geblieben ist: stabile Belegschaft, niedrige
									Fluktuation, viele Mitarbeiter seit zwanzig Jahren im Betrieb.
									Vorarbeiter, die ein Profil im Schlaf erkennen.
								</p>
								<p>
									Von Bytów nach Musterstadt sind es 700 Kilometer
									— acht Stunden Lkw, ein fester Tag in der Woche.
								</p>
							</div>

							<div className="mt-10">
								<SpecList
									layout="inline"
									items={[
										{ label: "Stadt", value: "Bytów" },
										{ label: "Region", value: "Pommern" },
										{ label: "Einwohner", value: "~17.000" },
										{
											label: "Entfernung Musterstadt",
											value: "~700 km · 8 h Lkw",
										},
									]}
								/>
							</div>
						</div>
					</div>
				</Container>
			</section>

			{/* HALLEN & MASCHINEN — bg-black-50 */}
			<section
				aria-labelledby="werk-hallen-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />

				<Container size="xl">
					<EditorialSplit
						headingId="werk-hallen-heading"
						eyebrow="Hallen & Maschinen"
						headline={
							<>
								Sechs Hallen,
								<br />
								<span className="text-brand-500">ein Fluss.</span>
							</>
						}
						body="Vom PVC-Granulat in Halle 1 bis zur verpackten Lieferung in Halle 6 — alles auf demselben Gelände, alles unter einem Dach."
					/>

					<FeatureGrid
						cardStyle="bordered"
						features={hallen.map((h) => ({
							kicker: h.kicker,
							title: h.title,
							body: h.body,
						}))}
					/>
				</Container>
			</section>

			{/* SKALA IN ZAHLEN — bg-white */}
			<section
				aria-labelledby="werk-skala-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />

				<Container size="xl">
					<EditorialSplit
						headingId="werk-skala-heading"
						eyebrow="Skala"
						headline={
							<>
								Was 60.000 m²
								<br />
								bedeuten.
							</>
						}
						body="Industrie-Maßstab in Zahlen — und trotzdem mit Hand-Endabnahme bei jedem Fenster."
					/>

					<SpecList
						layout="stacked"
						items={[
							{ label: "Werksfläche", value: "60.000 m²", note: "Bytów, PL" },
							{
								label: "Hallen",
								value: "6",
								note: "Vertikal integriert",
							},
							{
								label: "Mitarbeiter Gesamt",
								value: "3.000+",
								note: "Eigene Belegschaft",
							},
							{
								label: "Schichtbetrieb",
								value: "3 Schichten",
								note: "Mo–Fr durchgehend",
							},
							{
								label: "Output Tag",
								value: "12.000+",
								note: "Fenster pro Tag",
							},
							{
								label: "Output Jahr",
								value: "3 Mio+",
								note: "Fenster und Türen",
							},
						]}
					/>
				</Container>
			</section>

			{/* LOGISTIK NACH MUSTERSTADT — bg-black-50 */}
			<section
				aria-labelledby="werk-logistik-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />

				<Container size="xl">
					<EditorialSplit
						headingId="werk-logistik-heading"
						eyebrow="Anlieferung"
						headline={
							<>
								8 Stunden Lkw,
								<br />
								ein fester Tag.
							</>
						}
						body="Wir haben feste Slot-Termine im DRUTEX-Versand — pro Woche ein Liefertag nach Musterstadt. Du weißt vier Wochen vorher, wann dein Fenster auf dem Hof steht."
					/>

					<FeatureGrid
						size="dense"
						cardStyle="bordered"
						features={[
							{
								kicker: "Direktlieferung",
								title: "Werk → Hof",
								body: "Keine Zwischenlager, kein Umschlag. Lkw fährt in Bytów beladen los und endet bei uns in der Musterstraße.",
							},
							{
								kicker: "Termin",
								title: "Feste Wochentage",
								body: "Pro Woche ein fester Liefertag. Du bekommst den Termin vier Wochen vorher — verlässlich, planbar.",
							},
							{
								kicker: "Tracking",
								title: "GPS-getrackt",
								body: "Jede Tour mit Live-GPS. Wir wissen, wann der Lkw über die Grenze fährt — und sagen es dir auf Anfrage.",
							},
							{
								kicker: "Dauer",
								title: "8 h Fahrzeit",
								body: "Bytów → Musterstadt in acht Stunden. Morgens beladen, abends entladen — kein Übernachtungs-Stop, kein Wartetag.",
							},
						]}
					/>
				</Container>
			</section>

			{/* ATMOSPHERIC — bg-black-950 */}
			<AtmosphericBridge
				headingId="werk-atmospheric-heading"
				eyebrow="Nächstes Detail"
				headline={
					<>
						Wie wird ein Fenster
						<br />
						<span className="text-brand-400">eigentlich gebaut?</span>
					</>
				}
				body="Vom PVC-Granulat zum verpackten Fenster — fünf Schritte, alle in Bytów. Wir nehmen dich mit durch die Wertkette."
				ctaHref="/ueber-uns/drutex/produktion"
				ctaLabel="Produktion ansehen"
			/>
		</>
	);
}

/* ══════════════════════════════════════════════════════════════════
   SLUG: iglo
   ══════════════════════════════════════════════════════════════════ */

function IgloSections() {
	return (
		<>
			{/* ÜBERSICHT — bg-white */}
			<section
				aria-labelledby="iglo-uebersicht-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />

				<Container size="xl">
					<EditorialSplit
						headingId="iglo-uebersicht-heading"
						eyebrow="Wann welches Profil?"
						headline={
							<>
								Für jedes Bauvorhaben
								<br />
								ein Profil.
							</>
						}
						body="Sechs IGLO-Serien, jede für einen klaren Bauauftrag. Klick auf die Karte und spring direkt ins Detail darunter."
					/>

					<ul className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
						{IGLO_PROFILES.map((profile) => (
							<li key={profile.id}>
								<Link
									href={`#${profile.id}`}
									className="group flex h-full flex-col rounded-2xl border border-black-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_24px_48px_-16px_rgba(226,157,73,0.18)]"
								>
									<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-700">
										{profile.number}
									</p>
									<h3 className="mt-4 font-heading text-2xl font-medium tracking-tight text-black-950 md:text-3xl">
										{profile.name}
									</h3>
									<p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
										U {profile.uValue} · {profile.depth} · {profile.chambers}
									</p>
									<p className="mt-5 text-base leading-relaxed text-black-600">
										{profile.tagline}.
									</p>
									<span className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black-700 transition-colors group-hover:text-brand-700">
										Detail anzeigen →
									</span>
								</Link>
							</li>
						))}
					</ul>
				</Container>
			</section>

			{/* DETAIL-BLOECKE — bg-black-50 */}
			<section
				aria-labelledby="iglo-details-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />

				<Container size="xl">
					<EditorialSplit
						headingId="iglo-details-heading"
						eyebrow="Im Detail"
						headline={
							<>
								Sechs Profile,
								<br />
								sechs Bauanwendungen.
							</>
						}
						body="Pro Serie: technische Werte, Anwendungsbereich, Stärken — und wann du genau dieses Profil bauen lassen solltest."
					/>

					<div className="space-y-24 md:space-y-32">
						{IGLO_PROFILES.map((profile) => (
							<article
								key={profile.id}
								id={profile.id}
								className="grid scroll-mt-24 grid-cols-1 gap-12 md:grid-cols-12 md:gap-16"
							>
								<div className="md:col-span-5">
									<figure>
										<div
											aria-hidden
											className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black-100"
										>
											<div className="absolute inset-x-6 bottom-6">
												<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
													IGLO {profile.name.replace("IGLO ", "")}
												</p>
												<p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-black-400">
													{profile.depth} · {profile.chambers}
												</p>
											</div>
										</div>
										<figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
											Profilschnitt · {profile.name}
										</figcaption>
									</figure>
								</div>

								<div className="md:col-span-7">
									<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-600">
										{profile.number}
									</p>
									<h3 className="mt-4 font-heading text-3xl font-medium tracking-tight text-black-950 md:text-4xl">
										{profile.name}
									</h3>
									<p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-black-500">
										{profile.when}
									</p>
									<div className="mt-6 max-w-xl space-y-5 text-base leading-relaxed text-black-700">
										{profile.body.map((p) => (
											<p key={p.slice(0, 32)}>{p}</p>
										))}
									</div>

									<div className="mt-8">
										<SpecList layout="inline" items={profile.specs} />
									</div>
								</div>
							</article>
						))}
					</div>
				</Container>
			</section>

			{/* VERGLEICHSTABELLE — bg-white */}
			<section
				aria-labelledby="iglo-tabelle-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />

				<Container size="xl">
					<EditorialSplit
						headingId="iglo-tabelle-heading"
						eyebrow="Im direkten Vergleich"
						headline={
							<>
								U-Wert, Bautiefe,
								<br />
								Anwendung.
							</>
						}
						body="Alle sechs Serien nebeneinander — damit du im Beratungsgespräch die richtige Frage stellst."
					/>

					<div className="overflow-x-auto rounded-2xl border border-black-200">
						<table className="w-full border-collapse text-left">
							<thead>
								<tr className="border-b border-black-200 bg-black-50">
									<th className="p-5 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500 md:p-6">
										Profil
									</th>
									<th className="p-5 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500 md:p-6">
										U-Wert
									</th>
									<th className="p-5 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500 md:p-6">
										Bautiefe
									</th>
									<th className="p-5 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500 md:p-6">
										Kammern
									</th>
									<th className="p-5 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500 md:p-6">
										Anwendung
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-black-100">
								{IGLO_PROFILES.map((profile) => (
									<tr key={profile.id}>
										<td className="p-5 font-heading text-base font-medium text-black-950 md:p-6 md:text-lg">
											{profile.name}
										</td>
										<td className="p-5 font-heading text-base tabular-nums text-black-700 md:p-6">
											{profile.uValue}
										</td>
										<td className="p-5 font-heading text-base tabular-nums text-black-700 md:p-6">
											{profile.depth}
										</td>
										<td className="p-5 font-heading text-base tabular-nums text-black-700 md:p-6">
											{profile.chambers}
										</td>
										<td className="p-5 text-base text-black-600 md:p-6">
											{profile.tagline}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Container>
			</section>

			{/* KONFIGURATOR-CTA — bg-black-50 */}
			<section
				aria-labelledby="iglo-cta-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />

				<Container size="xl">
					<div className="grid grid-cols-1 items-end gap-12 md:grid-cols-12 md:gap-16">
						<div className="md:col-span-8">
							<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
								Nächster Schritt
							</p>
							<h2
								id="iglo-cta-heading"
								className="mt-6 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl"
							>
								Welches passt
								<br />
								<span className="text-brand-500">zu deinem Bau?</span>
							</h2>
							<p className="mt-6 max-w-xl text-base leading-relaxed text-black-600 md:text-lg">
								Im Konfigurator führen wir dich durch alle Entscheidungen —
								Profilserie, Verglasung, Beschlag, Farbe. In fünf Minuten hast
								du einen Vorschlag, über den wir sprechen können.
							</p>
						</div>
						<div className="md:col-span-4 md:flex md:justify-end">
							<PillButton href="/konfigurator" size="lg">
								Konfigurator starten
							</PillButton>
						</div>
					</div>
				</Container>
			</section>
		</>
	);
}

/* ══════════════════════════════════════════════════════════════════
   SLUG: produktion
   ══════════════════════════════════════════════════════════════════ */

function ProduktionSections() {
	return (
		<>
			{/* FÜNF SCHRITTE — bg-white */}
			<section
				aria-labelledby="produktion-schritte-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />

				<Container size="xl">
					<EditorialSplit
						headingId="produktion-schritte-heading"
						eyebrow="Wertkette"
						headline={
							<>
								So entsteht
								<br />
								ein Fenster.
							</>
						}
						body="Fünf Schritte vom PVC-Granulat zum verpackten Fenster. Alles in Bytów, alles unter einem Dach, alles dokumentiert."
					/>

					<ol className="space-y-12 md:space-y-16">
						{PRODUCTION_STEPS.map((step) => (
							<li
								key={step.number}
								className="grid grid-cols-1 gap-6 border-t border-black-100 pt-12 md:grid-cols-12 md:gap-12"
							>
								<div className="md:col-span-3">
									<div
										aria-hidden
										className="inline-flex size-11 items-center justify-center rounded-full border border-black-200 bg-white"
									>
										<span className="font-mono text-xs tabular-nums text-brand-600">
											{step.number}
										</span>
									</div>
								</div>
								<div className="md:col-span-9">
									<h3 className="font-heading text-2xl font-medium tracking-tight text-black-950 md:text-3xl">
										{step.title}
									</h3>
									<p className="mt-4 max-w-2xl text-base leading-relaxed text-black-600 md:text-lg">
										{step.body}
									</p>
									<div className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
										<span
											aria-hidden
											className="inline-block h-1 w-3 rounded-full bg-brand-500"
										/>
										Dauer · {step.duration}
									</div>
								</div>
							</li>
						))}
					</ol>
				</Container>
			</section>

			{/* VERTIKALE INTEGRATION — bg-black-50 */}
			<section
				aria-labelledby="produktion-integration-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />

				<Container size="xl">
					<EditorialSplit
						headingId="produktion-integration-heading"
						eyebrow="Vertikale Integration"
						headline={
							<>
								Niemand zwischen
								<br />
								<span className="text-brand-500">Profil und Tür.</span>
							</>
						}
						body="Vier Schritte, vier Hallen, ein Hersteller. Jeder andere Anbieter hat hier mindestens einen externen Lieferanten in der Kette."
					/>

					<FeatureGrid
						size="dense"
						cardStyle="bordered"
						features={[
							{
								icon: <Atom className="size-5" aria-hidden />,
								title: "Eigene Extrusion",
								body: "DRUTEX produziert PVC-Profile selbst. Andere kaufen ein.",
							},
							{
								icon: <Layers className="size-5" aria-hidden />,
								title: "Eigene Glasverarbeitung",
								body: "ISO-Glas-Linie im Werk. Kein externes Glas-Werk in der Lieferkette.",
							},
							{
								icon: <Wrench className="size-5" aria-hidden />,
								title: "Eigene Beschlag-Montage",
								body: "Beschlag wird im Werk montiert, nicht beim Händler. Funktionsprüfung vor Versand.",
							},
							{
								icon: <ShieldCheck className="size-5" aria-hidden />,
								title: "Eigene Qualitätssicherung",
								body: "Pro Fenster zwei Stempel. Werksprüfer und Auslieferungskontrolle.",
							},
						]}
					/>
				</Container>
			</section>

			{/* QUALITÄTSSICHERUNG — bg-white */}
			<section
				aria-labelledby="produktion-qs-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />

				<Container size="xl">
					<EditorialSplit
						headingId="produktion-qs-heading"
						eyebrow="Qualitätssicherung"
						headline={
							<>
								Zwei Mal
								<br />
								kontrolliert.
							</>
						}
						body="Einmal im Werk Bytów, einmal bei uns auf dem Hof in Musterstadt. Erst dann geht ein Fenster in den Einbau."
					/>

					<FeatureGrid
						cardStyle="bordered"
						features={[
							{
								kicker: "Werks-Endprüfung",
								title: "In Bytów, vor Versand",
								body: "Jeder Flügel wird auf Schließverhalten, Dichtungen, Glasprofile und Beschlag-Justage geprüft. Stempel auf den Lieferschein, dann ab in die Verpackung. Kein Fenster verlässt das Werk ohne Prüfprotokoll.",
							},
							{
								kicker: "Anlieferungs-Prüfung",
								title: "Nach Anlieferung",
								body: "Auf unserem Hof prüfen wir Maße, Beschlag-Funktion, Glas-Optik und gleichen mit dem Lieferschein ab. Erst wenn alles sitzt, geht das Fenster in den Einbau-Termin.",
							},
						]}
					/>

					<aside
						aria-label="Hinweis zur Anlieferungsprüfung"
						className="mt-12 max-w-3xl border-l-4 border-brand-500 pl-6"
					>
						<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-600">
							Unsere Regel
						</p>
						<p className="mt-3 text-base leading-relaxed text-black-700 md:text-lg">
							Wenn ein Fenster bei der Anlieferungs-Prüfung Mängel zeigt, geht
							es zurück. Wir bauen kein beschädigtes Fenster ein — egal, was im
							Lieferschein steht.
						</p>
					</aside>
				</Container>
			</section>

			{/* ATMOSPHERIC — bg-black-950 */}
			<AtmosphericBridge
				headingId="produktion-atmospheric-heading"
				eyebrow="Nächstes Detail"
				headline={
					<>
						Welches Profil
						<br />
						<span className="text-brand-400">passt zu deinem Bau?</span>
					</>
				}
				body="Sechs IGLO-Serien, jede für einen Bauauftrag. U-Werte, Bautiefen, Anwendungen — alles im Detail."
				ctaHref="/ueber-uns/drutex/iglo"
				ctaLabel="Profile im Detail"
			/>
		</>
	);
}

/* ══════════════════════════════════════════════════════════════════
   SHARED — Atmospheric Black-950 Bridge zur nächsten Sub-Page
   ══════════════════════════════════════════════════════════════════ */

function AtmosphericBridge({
	headingId,
	eyebrow,
	headline,
	body,
	ctaHref,
	ctaLabel,
}: {
	headingId: string;
	eyebrow: string;
	headline: React.ReactNode;
	body: React.ReactNode;
	ctaHref: string;
	ctaLabel: string;
}) {
	return (
		<section
			aria-labelledby={headingId}
			className="relative overflow-hidden bg-black-950 py-24 text-white-80 md:py-32"
		>
			<SectionDivider invert />

			{/* Brand-Glow */}
			<div
				aria-hidden
				className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl"
				style={{
					background:
						"radial-gradient(circle, var(--color-brand-600) 0%, transparent 70%)",
					opacity: 0.35,
				}}
			/>

			<Container size="xl">
				<div className="relative grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
					<div className="lg:col-span-8">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-400">
							{eyebrow}
						</p>
						<h2
							id={headingId}
							className="mt-4 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-white-100 md:text-5xl lg:text-6xl"
						>
							{headline}
						</h2>
						<p className="mt-8 max-w-xl text-base leading-relaxed text-white-80 md:text-lg">
							{body}
						</p>
					</div>

					<div className="lg:col-span-4 lg:flex lg:justify-end">
						<PillButton href={ctaHref} size="lg">
							{ctaLabel}
						</PillButton>
					</div>
				</div>
			</Container>
		</section>
	);
}
