import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { EditorialSplit } from "@/components/marketing/editorial-split";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { SectionDivider } from "@/components/marketing/section-divider";
import { SpecList } from "@/components/marketing/spec-list";

/**
 * /galerie/[kategorie] — Dynamische Kategorie-Page der Referenz-Galerie.
 *
 * Fünf statisch generierte Slugs:
 *   - alle-projekte    (mit Pill-Filter zu den anderen vier)
 *   - fenster
 *   - tueren
 *   - referenzen
 *   - werk  (mit Werk-Specs + Schritte-Grid)
 *
 * Struktur (pro Kategorie):
 *   1. MarketingHero        — dynamisch via Lookup
 *   2. Filter-Pills         — NUR alle-projekte
 *   3. Projekt-Grid         — asymmetrisches 12-Col-Tile-Grid mit ~12 Tiles
 *   4. Werk-Specs + Steps   — NUR werk
 *   5. Story-Section        — 2 lange Project-Cards
 *   6. ContactCtaStripe     — Anfrage-CTA mit kategorie-spezifischer Headline
 */

type Tile = {
	src: string;
	alt: string;
	category: string;
	ort: string;
	jahr: string;
	span: string;
	aspect: string;
};

type CategoryStory = {
	kicker: string;
	title: string;
	body: string[];
	imageSrc: string;
	imageAlt: string;
};

type CategoryConfig = {
	slug: string;
	eyebrow: string;
	pageTitle: string;
	metaDescription: string;
	breadcrumbLabel: string;
	headline: React.ReactNode;
	headlineHighlight?: string;
	body: React.ReactNode;
	stats: { label: string; value: string }[];
	gridEyebrow: string;
	gridHeadline: React.ReactNode;
	gridBody?: React.ReactNode;
	tiles: Tile[];
	stories: CategoryStory[];
	storyEyebrow: string;
	storyHeadline: React.ReactNode;
	ctaHeadline: React.ReactNode;
	ctaSubline: React.ReactNode;
	ctaBody: string;
};

/* ───────────────────── TILE-DATEN PRO KATEGORIE ───────────────────── */

const TILES_FENSTER: Tile[] = [
	{
		src: "/images/gallery/projekt-fenster-01.jpg",
		alt: "Weißes Kunststoff-Fenster IGLO Edge in einem Einfamilienhaus",
		category: "Fenster · Kunststoff",
		ort: "Werder",
		jahr: "2024",
		span: "lg:col-span-7",
		aspect: "aspect-[16/10]",
	},
	{
		src: "/images/gallery/projekt-fenster-02.jpg",
		alt: "Anthrazit lackiertes Holzfenster mit Sprossen",
		category: "Fenster · Holz",
		ort: "Beispielstadt-Süd",
		jahr: "2023",
		span: "lg:col-span-5",
		aspect: "aspect-[4/5]",
	},
	{
		src: "/images/gallery/projekt-fenster-03.jpg",
		alt: "Bodentiefes Fenster mit dreifacher Verglasung",
		category: "Fenster · Energy",
		ort: "Potsdam",
		jahr: "2025",
		span: "lg:col-span-4",
		aspect: "aspect-[3/4]",
	},
	{
		src: "/images/gallery/projekt-fenster-04.jpg",
		alt: "Fensterband mit fünf gleichen Elementen, weiß",
		category: "Fenster · Reihe",
		ort: "Musterstadt",
		jahr: "2024",
		span: "lg:col-span-8",
		aspect: "aspect-[16/9]",
	},
	{
		src: "/images/gallery/projekt-fenster-05.jpg",
		alt: "Aluminium-Fenster mit schmalem Rahmen, anthrazit",
		category: "Fenster · Aluminium",
		ort: "Beelitz",
		jahr: "2025",
		span: "lg:col-span-6",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/projekt-fenster-06.jpg",
		alt: "Drehkippfenster mit weißem Kunststoffrahmen, geöffnet",
		category: "Fenster · Detail",
		ort: "Caputh",
		jahr: "2023",
		span: "lg:col-span-6",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/projekt-fenster-07.jpg",
		alt: "Festverglasung mit großer Glasfläche zum Garten",
		category: "Fenster · Fest",
		ort: "Werder",
		jahr: "2022",
		span: "lg:col-span-12",
		aspect: "aspect-[21/9]",
	},
	{
		src: "/images/gallery/projekt-fenster-08.jpg",
		alt: "Sprossenfenster im Altbau, denkmalgerecht",
		category: "Fenster · Denkmalpflege",
		ort: "Rathenow",
		jahr: "2021",
		span: "lg:col-span-5",
		aspect: "aspect-[4/5]",
	},
	{
		src: "/images/gallery/projekt-fenster-09.jpg",
		alt: "Drei nebeneinander liegende Fenster mit Aufsatzrollladen",
		category: "Fenster · Rollladen",
		ort: "Potsdam",
		jahr: "2024",
		span: "lg:col-span-7",
		aspect: "aspect-[16/10]",
	},
	{
		src: "/images/gallery/projekt-fenster-10.jpg",
		alt: "Bodentiefes Schiebefenster aus Aluminium",
		category: "Fenster · Schiebe",
		ort: "Beispielstadt-Süd",
		jahr: "2025",
		span: "lg:col-span-6",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/projekt-fenster-11.jpg",
		alt: "Eckfenster über zwei Etagen, Aluminium",
		category: "Fenster · Eck",
		ort: "Beelitz",
		jahr: "2023",
		span: "lg:col-span-6",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/projekt-fenster-12.jpg",
		alt: "Detail eines Fensterbeschlages mit Pilzkopfzapfen",
		category: "Fenster · Sicherheit",
		ort: "Musterstadt",
		jahr: "2025",
		span: "lg:col-span-12",
		aspect: "aspect-[21/9]",
	},
];

const TILES_TUEREN: Tile[] = [
	{
		src: "/images/gallery/projekt-tueren-01.jpg",
		alt: "Moderne anthrazitfarbene Haustür mit schmalem Lichtausschnitt",
		category: "Haustür · Aluminium",
		ort: "Werder",
		jahr: "2024",
		span: "lg:col-span-8",
		aspect: "aspect-[16/10]",
	},
	{
		src: "/images/gallery/projekt-tueren-02.jpg",
		alt: "Haustür mit großflächiger Glaseinlage und LED-Umrandung",
		category: "Haustür · IGLO Edge",
		ort: "Potsdam",
		jahr: "2025",
		span: "lg:col-span-4",
		aspect: "aspect-[3/4]",
	},
	{
		src: "/images/gallery/projekt-tueren-03.jpg",
		alt: "Holzhaustür mit klassischer Füllung in Eiche",
		category: "Haustür · Holz",
		ort: "Caputh",
		jahr: "2023",
		span: "lg:col-span-5",
		aspect: "aspect-[4/5]",
	},
	{
		src: "/images/gallery/projekt-tueren-04.jpg",
		alt: "Hebeschiebetür aus Aluminium zur Terrasse",
		category: "Schiebetür · HST",
		ort: "Beispielstadt-Süd",
		jahr: "2024",
		span: "lg:col-span-7",
		aspect: "aspect-[16/9]",
	},
	{
		src: "/images/gallery/projekt-tueren-05.jpg",
		alt: "Balkontür mit Drehkippfunktion, weiß",
		category: "Balkontür",
		ort: "Musterstadt",
		jahr: "2022",
		span: "lg:col-span-6",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/projekt-tueren-06.jpg",
		alt: "Detail eines Türgriffs aus gebürstetem Edelstahl",
		category: "Detail · Beschlag",
		ort: "Werder",
		jahr: "2024",
		span: "lg:col-span-6",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/projekt-tueren-07.jpg",
		alt: "Doppelflügelige Eingangstür mit Seitenteilen",
		category: "Haustür · Doppel",
		ort: "Beelitz",
		jahr: "2025",
		span: "lg:col-span-12",
		aspect: "aspect-[21/9]",
	},
	{
		src: "/images/gallery/projekt-tueren-08.jpg",
		alt: "Schiebetür mit Glasfüllung, anthrazit",
		category: "Schiebetür · PSK",
		ort: "Rathenow",
		jahr: "2023",
		span: "lg:col-span-5",
		aspect: "aspect-[4/5]",
	},
	{
		src: "/images/gallery/projekt-tueren-09.jpg",
		alt: "Haustür mit Edelstahl-Stoßgriff in voller Höhe",
		category: "Haustür · Aluminium",
		ort: "Potsdam",
		jahr: "2024",
		span: "lg:col-span-7",
		aspect: "aspect-[16/10]",
	},
	{
		src: "/images/gallery/projekt-tueren-10.jpg",
		alt: "Innenansicht einer Hebeschiebetür mit Blick in den Garten",
		category: "Schiebetür · Innen",
		ort: "Beispielstadt-Süd",
		jahr: "2025",
		span: "lg:col-span-6",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/projekt-tueren-11.jpg",
		alt: "Kunststoffhaustür mit zwei seitlichen Lichtausschnitten",
		category: "Haustür · Kunststoff",
		ort: "Musterstadt",
		jahr: "2022",
		span: "lg:col-span-6",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/projekt-tueren-12.jpg",
		alt: "Vollglas-Schiebetür als Raumteiler im Wohnbereich",
		category: "Schiebetür · Vollglas",
		ort: "Caputh",
		jahr: "2024",
		span: "lg:col-span-12",
		aspect: "aspect-[21/9]",
	},
];

const TILES_REFERENZEN: Tile[] = [
	{
		src: "/images/gallery/projekt-referenzen-01.jpg",
		alt: "Pfosten-Riegel-Fassade aus Aluprof MB-86 N SI an einem Bürogebäude",
		category: "Gewerbe · Fassade",
		ort: "Beelitz",
		jahr: "2025",
		span: "lg:col-span-12",
		aspect: "aspect-[21/9]",
	},
	{
		src: "/images/gallery/projekt-referenzen-02.jpg",
		alt: "Einfamilienhaus mit Komplettausstattung Fenster und Türen",
		category: "Wohnbau · Komplett",
		ort: "Werder",
		jahr: "2024",
		span: "lg:col-span-7",
		aspect: "aspect-[16/10]",
	},
	{
		src: "/images/gallery/projekt-referenzen-03.jpg",
		alt: "Schulgebäude mit großen Fensterbändern, energetische Sanierung",
		category: "Öffentlich · Sanierung",
		ort: "Rathenow-Premnitz",
		jahr: "2023",
		span: "lg:col-span-5",
		aspect: "aspect-[4/5]",
	},
	{
		src: "/images/gallery/projekt-referenzen-04.jpg",
		alt: "Kindergarten mit farbigen Fensterelementen",
		category: "Öffentlich · Neubau",
		ort: "Musterstadt",
		jahr: "2022",
		span: "lg:col-span-6",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/projekt-referenzen-05.jpg",
		alt: "Ärztehaus mit großflächiger Aluminium-Verglasung",
		category: "Gewerbe · Aluminium",
		ort: "Potsdam",
		jahr: "2024",
		span: "lg:col-span-6",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/projekt-referenzen-06.jpg",
		alt: "Denkmalgerecht sanierte Altbau-Villa mit Sprossenfenstern",
		category: "Sanierung · Denkmal",
		ort: "Beispielstadt-Süd",
		jahr: "2023",
		span: "lg:col-span-8",
		aspect: "aspect-[16/9]",
	},
	{
		src: "/images/gallery/projekt-referenzen-07.jpg",
		alt: "Mehrfamilienhaus-Neubau mit einheitlichen weißen Fenstern",
		category: "Wohnbau · MFH",
		ort: "Caputh",
		jahr: "2025",
		span: "lg:col-span-4",
		aspect: "aspect-[3/4]",
	},
	{
		src: "/images/gallery/projekt-referenzen-08.jpg",
		alt: "Gewerbehalle mit Industrie-Fensterelementen",
		category: "Gewerbe · Halle",
		ort: "Beelitz",
		jahr: "2022",
		span: "lg:col-span-12",
		aspect: "aspect-[21/9]",
	},
	{
		src: "/images/gallery/projekt-referenzen-09.jpg",
		alt: "Hotel-Eingangsbereich mit Karusselltür und Aluminium-Fassade",
		category: "Gewerbe · Hotel",
		ort: "Musterstadt",
		jahr: "2024",
		span: "lg:col-span-7",
		aspect: "aspect-[16/10]",
	},
	{
		src: "/images/gallery/projekt-referenzen-10.jpg",
		alt: "Praxisgebäude mit barrierefreier Eingangstür",
		category: "Öffentlich · Praxis",
		ort: "Werder",
		jahr: "2025",
		span: "lg:col-span-5",
		aspect: "aspect-[4/5]",
	},
	{
		src: "/images/gallery/projekt-referenzen-11.jpg",
		alt: "Kirchengemeindehaus mit denkmalgerechten Holzfenstern",
		category: "Sanierung · Gemeinde",
		ort: "Rathenow",
		jahr: "2021",
		span: "lg:col-span-6",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/projekt-referenzen-12.jpg",
		alt: "Pflegeheim-Neubau mit großen Panorama-Fenstern",
		category: "Öffentlich · Pflege",
		ort: "Potsdam",
		jahr: "2023",
		span: "lg:col-span-6",
		aspect: "aspect-[4/3]",
	},
];

const TILES_WERK: Tile[] = [
	{
		src: "/images/gallery/projekt-werk-01.jpg",
		alt: "DRUTEX-Werkshalle mit Profilextrusion für Kunststofffenster",
		category: "DRUTEX · Extrusion",
		ort: "Bytów (PL)",
		jahr: "2024",
		span: "lg:col-span-12",
		aspect: "aspect-[21/9]",
	},
	{
		src: "/images/gallery/projekt-werk-02.jpg",
		alt: "Glasverarbeitung mit Dreifachverglasungs-Aufbau",
		category: "DRUTEX · Glas",
		ort: "Bytów (PL)",
		jahr: "2024",
		span: "lg:col-span-7",
		aspect: "aspect-[16/10]",
	},
	{
		src: "/images/gallery/projekt-werk-03.jpg",
		alt: "Beschlag-Montage am Fenstersystem IGLO Edge",
		category: "DRUTEX · Beschlag",
		ort: "Bytów (PL)",
		jahr: "2024",
		span: "lg:col-span-5",
		aspect: "aspect-[4/5]",
	},
	{
		src: "/images/gallery/projekt-werk-04.jpg",
		alt: "Qualitätsprüfung an einem fertig montierten Fenster",
		category: "DRUTEX · QS",
		ort: "Bytów (PL)",
		jahr: "2024",
		span: "lg:col-span-5",
		aspect: "aspect-[4/5]",
	},
	{
		src: "/images/gallery/projekt-werk-05.jpg",
		alt: "Hof von Muster Fenster in Musterstadt",
		category: "Eigener Hof",
		ort: "Musterstadt",
		jahr: "2025",
		span: "lg:col-span-7",
		aspect: "aspect-[16/9]",
	},
	{
		src: "/images/gallery/projekt-werk-06.jpg",
		alt: "Lager mit gestapelten Fensterelementen, bereit zur Lieferung",
		category: "Lager",
		ort: "Musterstadt",
		jahr: "2025",
		span: "lg:col-span-6",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/projekt-werk-07.jpg",
		alt: "Eigener LKW von Muster Fenster beim Beladen",
		category: "Logistik",
		ort: "Musterstadt",
		jahr: "2024",
		span: "lg:col-span-6",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/projekt-werk-08.jpg",
		alt: "Showroom mit Musterfenstern und Türen",
		category: "Showroom",
		ort: "Musterstadt",
		jahr: "2025",
		span: "lg:col-span-12",
		aspect: "aspect-[21/9]",
	},
];

const TILES_ALLE: Tile[] = [
	TILES_FENSTER[0],
	TILES_TUEREN[0],
	TILES_REFERENZEN[1],
	TILES_FENSTER[3],
	TILES_TUEREN[3],
	TILES_WERK[4],
	TILES_REFERENZEN[5],
	TILES_FENSTER[6],
	TILES_TUEREN[6],
	TILES_REFERENZEN[7],
	TILES_FENSTER[9],
	TILES_TUEREN[11],
];

/* ───────────────────── KATEGORIE-LOOKUP ───────────────────── */

const CATEGORIES: Record<string, CategoryConfig> = {
	"alle-projekte": {
		slug: "alle-projekte",
		eyebrow: "Alle Projekte",
		pageTitle: "Alle Projekte",
		metaDescription:
			"Querschnitt aus dreißig Jahren — Fenster, Türen und ganze Häuser in Musterstadt, Beispielstadt und Umland.",
		breadcrumbLabel: "Alle Projekte",
		headline: <>Dreißig Jahre,</>,
		headlineHighlight: "ein Querschnitt.",
		body: (
			<>
				Über 500 Projekte seit 1985 — vom ersten Holzfenster in Musterstadt bis
				zur Aluminium-Fassade in Beelitz. Hier siehst du eine Auswahl quer durch
				alle Kategorien, oder du filterst direkt nach Material und Typ.
			</>
		),
		stats: [
			{ label: "Projekte", value: "500+" },
			{ label: "Region", value: "BB · BE" },
			{ label: "Seit", value: "1985" },
		],
		gridEyebrow: "Auswahl",
		gridHeadline: (
			<>
				Zwölf Projekte
				<br />
				aus 2021 – 2025.
			</>
		),
		gridBody:
			"Quer durch Material, Typ und Region. Klick rein — oder springe über die Filter direkt zur passenden Kategorie.",
		tiles: TILES_ALLE,
		storyEyebrow: "Im Detail",
		storyHeadline: (
			<>
				Zwei Geschichten,
				<br />
				zwei Tempi.
			</>
		),
		stories: [
			{
				kicker: "Werder · 2024 · 6 Wochen",
				title: "Einfamilienhaus, komplett",
				body: [
					"Achtzehn Fenster der Serie IGLO Edge mit integriertem Rollladen, im Erdgeschoss weiße Holzfenster zum Garten. Eine Haustür aus Aluminium, anthrazit. Eine Hebeschiebetür zur Terrasse.",
					"Aufmaß an einem Freitag im Februar, Lieferung sechs Wochen später, Montage in drei Tagen. Bauherr war zur Endabnahme dabei — die Schlüssel übergeben wir immer persönlich.",
				],
				imageSrc: "/images/gallery/projekt-fenster-01.jpg",
				imageAlt:
					"Weißes Kunststoff-Fenster IGLO Edge in einem Einfamilienhaus",
			},
			{
				kicker: "Beelitz · 2025 · 14 Wochen",
				title: "Gewerbeobjekt mit Fassade",
				body: [
					"Aluprof MB-86 N SI als Pfosten-Riegel-Fassade, sechs Meter hoch, dreifach verglast. Ergänzt durch sechzehn Büroflächen-Fenster und zwei automatische Schiebetüren am Eingang.",
					"Statisch komplexer als Wohnbau — wir haben mit dem Architekten zwei Wochen lang Details abgestimmt, bevor die erste Bestellung rausging. Montage in vier Wochen mit drei Mann.",
				],
				imageSrc: "/images/gallery/projekt-referenzen-01.jpg",
				imageAlt: "Pfosten-Riegel-Fassade aus Aluprof MB-86 N SI",
			},
		],
		ctaHeadline: "Eigenes Projekt?",
		ctaSubline: "Wir hören zu.",
		ctaBody:
			"Schick uns ein Foto, einen Grundriss oder einfach eine kurze Skizze — wir melden uns am selben Werktag zurück.",
	},

	fenster: {
		slug: "fenster",
		eyebrow: "Fensterprojekte",
		pageTitle: "Fensterprojekte",
		metaDescription:
			"Fenster aus Kunststoff, Holz und Aluminium — Referenzen aus Musterstadt, Beispielstadt und Umland.",
		breadcrumbLabel: "Fenster",
		headline: <>Fenster, die</>,
		headlineHighlight: "schon drinstecken.",
		body: (
			<>
				Über 340 Fensterprojekte seit 1985 — Kunststoff, Holz, Aluminium. Vom
				einzelnen Drehkippfenster bis zum kompletten Fensterband über drei
				Etagen. Alles handgemessen, mit DRUTEX gefertigt, von uns montiert.
			</>
		),
		stats: [
			{ label: "Projekte", value: "340+" },
			{ label: "Materialien", value: "03" },
			{ label: "Serien", value: "IGLO" },
		],
		gridEyebrow: "Auswahl",
		gridHeadline: (
			<>
				Zwölf Fenster
				<br />
				aus 2021 – 2025.
			</>
		),
		gridBody:
			"Vom Reihenhaus in Musterstadt bis zur Altbau-Sanierung in Beispielstadt. Material, Profilserie, Region.",
		tiles: TILES_FENSTER,
		storyEyebrow: "Im Detail",
		storyHeadline: (
			<>
				Zwei Fenster,
				<br />
				zwei Welten.
			</>
		),
		stories: [
			{
				kicker: "Werder · 2024 · IGLO Edge",
				title: "Achtzehn Fenster, ein Haus",
				body: [
					"IGLO Edge in Reinweiß, integrierter Rollladen, dreifach verglast. Einheitliche Beschläge, einheitliche Griffe — auch wenn die Maße variieren.",
					"Vorteil: ein Profil, ein Lager, eine Lieferung. Nachteil: jede Änderung trifft alle achtzehn. Wir haben deshalb zwei Wochen lang nur gemessen.",
				],
				imageSrc: "/images/gallery/projekt-fenster-01.jpg",
				imageAlt: "Weißes Kunststoff-Fenster IGLO Edge",
			},
			{
				kicker: "Beispielstadt-Süd · 2023 · Holz",
				title: "Vierundzwanzig denkmalgerechte Holzfenster",
				body: [
					"Sprossenfenster in anthrazit lackierter Eiche, jedes Maß individuell, jedes Profil mit der Denkmalbehörde abgestimmt. Drei Vor-Ort-Termine vor der ersten Bestellung.",
					"Lieferung in drei Tranchen, Montage zwischen Mai und Juli, immer Werktags zwischen 8 und 14 Uhr — die Bewohner sind während der Sanierung im Haus geblieben.",
				],
				imageSrc: "/images/gallery/projekt-fenster-08.jpg",
				imageAlt: "Sprossenfenster im Altbau",
			},
		],
		ctaHeadline: "Fenster geplant?",
		ctaSubline: "Lass uns messen.",
		ctaBody:
			"Schick uns Maße, Foto oder Grundriss — wir machen dir ein Angebot mit allen drei Materialien zum Vergleich.",
	},

	tueren: {
		slug: "tueren",
		eyebrow: "Türenprojekte",
		pageTitle: "Türenprojekte",
		metaDescription:
			"Haus-, Balkon- und Schiebetüren aus Kunststoff, Holz und Aluminium — Referenzen aus Musterstadt und Beispielstadt.",
		breadcrumbLabel: "Türen",
		headline: <>Türen, die</>,
		headlineHighlight: "auf Maß passen.",
		body: (
			<>
				Über 120 Türenprojekte seit 1985 — Haustüren, Balkontüren,
				Hebeschiebetüren. Von der klassischen Holzfüllung bis zur
				Vollglas-Schiebetür als Raumteiler. Beschläge, Schließzylinder und
				LED-Umrandung inklusive.
			</>
		),
		stats: [
			{ label: "Projekte", value: "120+" },
			{ label: "Typen", value: "05" },
			{ label: "Profile", value: "IGLO" },
		],
		gridEyebrow: "Auswahl",
		gridHeadline: (
			<>
				Zwölf Türen
				<br />
				aus 2021 – 2025.
			</>
		),
		gridBody:
			"Haustüren, Balkontüren, Schiebetüren — quer durch Aluminium, Holz und Kunststoff.",
		tiles: TILES_TUEREN,
		storyEyebrow: "Im Detail",
		storyHeadline: (
			<>
				Zwei Türen,
				<br />
				zwei Eingänge.
			</>
		),
		stories: [
			{
				kicker: "Potsdam · 2025 · IGLO Edge",
				title: "Haustür mit LED-Umrandung",
				body: [
					"Aluminium-Haustür mit großflächiger Glaseinlage und integrierter LED-Umrandung. Edelstahl-Stoßgriff in voller Höhe, motorisches Schloss mit Fingerprint.",
					"Konfiguriert in einem Termin, geliefert nach acht Wochen, Montage an einem Tag. Stromanschluss hatte der Elektriker schon vorbereitet — ohne den geht es nicht.",
				],
				imageSrc: "/images/gallery/projekt-tueren-02.jpg",
				imageAlt: "Haustür mit großflächiger Glaseinlage",
			},
			{
				kicker: "Beispielstadt-Süd · 2024 · HST",
				title: "Hebeschiebetür über drei Meter",
				body: [
					"Aluminium-Hebeschiebetür aus Aluprof MB-86, dreiflügelig, dreifach verglast. Drei Meter zwanzig in der Breite, einer der schwersten Beschläge, die wir je verbaut haben.",
					"Anlieferung mit Spezialkran über den Garten — die Straße war zu eng. Montage zu viert, einen ganzen Tag. Läuft seitdem leise und ohne Nachjustierung.",
				],
				imageSrc: "/images/gallery/projekt-tueren-04.jpg",
				imageAlt: "Hebeschiebetür aus Aluminium zur Terrasse",
			},
		],
		ctaHeadline: "Tür im Kopf?",
		ctaSubline: "Wir bauen sie ein.",
		ctaBody:
			"Skizze, Foto oder Maßblatt reicht — wir konfigurieren mit dir Material, Beschlag und Schließzylinder.",
	},

	objekte: {
		slug: "objekte",
		eyebrow: "Referenzobjekte",
		pageTitle: "Referenzobjekte",
		metaDescription:
			"Gewerbliche und öffentliche Bauten — Bürogebäude, Schulen, Ärztehäuser und mehr in Musterstadt und Beispielstadt.",
		breadcrumbLabel: "Referenzen",
		headline: <>Bauten, an denen</>,
		headlineHighlight: "viele vorbeigehen.",
		body: (
			<>
				Sechzig große Referenzobjekte seit 2010 — Bürogebäude, Schulen,
				Ärztehäuser, Hotels, Pflegeheime. Mit Architekten geplant, mit
				Ingenieuren statisch durchgerechnet, mit DRUTEX und Aluprof gefertigt.
				Wir übernehmen auch Generalunternehmer-Verträge.
			</>
		),
		stats: [
			{ label: "Objekte", value: "60+" },
			{ label: "Sektor", value: "Gewerbe" },
			{ label: "Seit", value: "2010" },
		],
		gridEyebrow: "Auswahl",
		gridHeadline: (
			<>
				Zwölf Objekte
				<br />
				aus 2021 – 2025.
			</>
		),
		gridBody:
			"Sektor, Stadt, Jahr — vom Pflegeheim in Potsdam bis zur Aluminium-Fassade in Beelitz.",
		tiles: TILES_REFERENZEN,
		storyEyebrow: "Im Detail",
		storyHeadline: (
			<>
				Zwei Objekte,
				<br />
				zwei Maßstäbe.
			</>
		),
		stories: [
			{
				kicker: "Beelitz · 2025 · Gewerbe",
				title: "Pfosten-Riegel-Fassade Aluprof MB-86",
				body: [
					"Sechs Meter hoch, achtzehn Meter breit, dreifach verglast. Statisch berechnet vom Ingenieurbüro, montiert von uns mit Spezialkran und drei Mann über vier Wochen.",
					"Erster Termin Februar, Endabnahme November. Dazwischen drei Änderungen am Verglasungsaufbau wegen energetischer Anforderungen — alles dokumentiert, alles freigegeben.",
				],
				imageSrc: "/images/gallery/projekt-referenzen-01.jpg",
				imageAlt: "Pfosten-Riegel-Fassade aus Aluprof MB-86 N SI",
			},
			{
				kicker: "Rathenow-Premnitz · 2023 · Öffentlich",
				title: "Schulsanierung mit 84 Fenstern",
				body: [
					"Vierundachtzig identische Kunststoff-Fenster, IGLO Energy, dreifach verglast — energetische Sanierung im laufenden Schulbetrieb. Montage nur in den Sommerferien.",
					"Sechs Wochen Lieferzeit, drei Wochen Montage mit fünf Mann. Schule war zu Schulbeginn fertig — keine Klausur ist ausgefallen.",
				],
				imageSrc: "/images/gallery/projekt-referenzen-03.jpg",
				imageAlt: "Schulgebäude mit großen Fensterbändern",
			},
		],
		ctaHeadline: "Objekt zu planen?",
		ctaSubline: "Wir nehmen das Maß.",
		ctaBody:
			"Ausschreibung, Leistungsverzeichnis oder Vorplanung — wir antworten qualifiziert und meist innerhalb von 48 Stunden.",
	},

	werk: {
		slug: "werk",
		eyebrow: "Werk & Produktion",
		pageTitle: "Werk & Produktion",
		metaDescription:
			"Wie ein DRUTEX-Fenster entsteht — Extrusion, Glas, Beschlag, Prüfung. Plus Hof, Lager und Showroom in Musterstadt.",
		breadcrumbLabel: "Werk & Produktion",
		headline: <>Wo unsere Fenster</>,
		headlineHighlight: "herkommen.",
		body: (
			<>
				Hauptpartner DRUTEX, Stammwerk in Bytów (Polen) — eines der größten
				Fensterwerke Europas. Wir kennen die Halle, die Maschinen und die
				Vorarbeiter persönlich. Plus unser eigener Hof, Lager und Showroom in
				Musterstadt.
			</>
		),
		stats: [
			{ label: "Gegründet", value: "1985" },
			{ label: "Werk", value: "60.000 m2" },
			{ label: "Pro Jahr", value: "3 Mio" },
		],
		gridEyebrow: "Hinter den Kulissen",
		gridHeadline: (
			<>
				Acht Bilder
				<br />
				aus Werk und Hof.
			</>
		),
		gridBody:
			"Vier aus dem DRUTEX-Stammwerk in Bytów, vier aus unserem Hof in Musterstadt.",
		tiles: TILES_WERK,
		storyEyebrow: "Im Detail",
		storyHeadline: (
			<>
				Werk und Hof,
				<br />
				Hand in Hand.
			</>
		),
		stories: [
			{
				kicker: "Bytów (PL) · DRUTEX",
				title: "Eines der größten Fensterwerke Europas",
				body: [
					"DRUTEX produziert auf 60.000 Quadratmetern Hallenfläche, beschäftigt über 3.000 Mitarbeiter und liefert pro Jahr über drei Millionen Fenster und Türen in 60 Länder.",
					"Eigene Profilextrusion, eigene Glasverarbeitung, eigene Beschlag-Montage — alles unter einem Dach. Wir besuchen das Werk regelmäßig und kennen die Vorarbeiter mit Namen.",
				],
				imageSrc: "/images/gallery/projekt-werk-01.jpg",
				imageAlt: "DRUTEX-Werkshalle mit Profilextrusion",
			},
			{
				kicker: "Musterstadt · Muster-Hof",
				title: "Lager, Showroom und LKW",
				body: [
					"Auf unserem Hof in der Musterstraße: überdachtes Lager für 200 Fensterelemente, Showroom mit Mustern aller Profilserien, eigener LKW für Lieferungen im Umkreis von 80 Kilometern.",
					"Geöffnet nur freitags von 10 bis 17 Uhr — und mit Voranmeldung bis 20 Uhr. Wer vorbeikommt, bekommt Kaffee und kann jedes Fenster aufmachen, anfassen, verschließen.",
				],
				imageSrc: "/images/gallery/projekt-werk-08.jpg",
				imageAlt: "Showroom mit Musterfenstern und Türen",
			},
		],
		ctaHeadline: "Lust auf Werkbesuch?",
		ctaSubline: "Komm freitags vorbei.",
		ctaBody:
			"Showroom, Lager, Kaffee — und alle Profilserien zum Anfassen. Termin per Telefon oder E-Mail.",
	},
};

const WERK_SPECS = [
	{ label: "Gegründet", value: "1985" },
	{ label: "Produktionsfläche", value: "60.000 m2" },
	{ label: "Fenster pro Jahr", value: "3 Mio" },
];

const WERK_STEPS = [
	{
		kicker: "01 · Profil",
		title: "Profil-Extrusion",
		body: "PVC-Granulat wird unter Hitze und Druck zu Mehrkammer-Hohlprofilen geformt — Basis für jedes IGLO-Fenster.",
	},
	{
		kicker: "02 · Glas",
		title: "Glasverarbeitung",
		body: "Zweifach- und Dreifachverglasung mit Edelgasfüllung. Eigene Glaserei direkt im Werk, kein Zwischenhandel.",
	},
	{
		kicker: "03 · Beschlag",
		title: "Beschlag-Montage",
		body: "Pilzkopfzapfen, Sicherheitsbeschläge, Drehkipp- oder Hebeschiebe-Mechanik — alles im Werk vormontiert.",
	},
	{
		kicker: "04 · QS",
		title: "Qualitätsprüfung",
		body: "Jedes Fenster wird einzeln auf Dichtigkeit, Maß und Funktion geprüft, bevor es verpackt wird.",
	},
];

/* ───────────────────── NEXT.JS API ───────────────────── */

export async function generateStaticParams() {
	return [
		{ kategorie: "alle-projekte" },
		{ kategorie: "fenster" },
		{ kategorie: "tueren" },
		{ kategorie: "objekte" },
		{ kategorie: "werk" },
	];
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ kategorie: string }>;
}): Promise<Metadata> {
	const { kategorie } = await params;
	const config = CATEGORIES[kategorie];

	if (!config) {
		return {
			title: "Galerie · Muster Fenster",
		};
	}

	return {
		title: `Galerie · ${config.pageTitle} · Muster Fenster`,
		description: config.metaDescription,
	};
}

/* ───────────────────── PAGE ───────────────────── */

export default async function GalerieKategoriePage({
	params,
}: {
	params: Promise<{ kategorie: string }>;
}) {
	const { kategorie } = await params;
	const config = CATEGORIES[kategorie];

	if (!config) {
		notFound();
	}

	const isAlleProjekte = kategorie === "alle-projekte";
	const isWerk = kategorie === "werk";

	return (
		<>
			<MarketingHero
				breadcrumb={[
					{ label: "Start", href: "/" },
					{ label: "Galerie", href: "/galerie" },
					{ label: config.breadcrumbLabel },
				]}
				eyebrow={config.eyebrow}
				headline={config.headline}
				headlineHighlight={config.headlineHighlight}
				body={config.body}
				stats={config.stats}
			/>

			{/* ═══════ FILTER (nur alle-projekte) ═══════ */}
			{isAlleProjekte && (
				<section
					aria-labelledby="filter-heading"
					className="relative bg-white pb-12 pt-12 md:pb-16 md:pt-16"
				>
					<Container size="xl">
						<h2 id="filter-heading" className="sr-only">
							Nach Kategorie filtern
						</h2>
						<div className="flex flex-wrap items-center gap-3">
							<span
								aria-hidden
								className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500"
							>
								Filter →
							</span>
							{Object.values(CATEGORIES)
								.filter((c) => c.slug !== "alle-projekte")
								.map((c) => (
									<Link
										key={c.slug}
										href={`/galerie/${c.slug}`}
										className="rounded-full border border-black-200 bg-black-50 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-black-700 transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-800"
									>
										{c.breadcrumbLabel}
									</Link>
								))}
						</div>
					</Container>
				</section>
			)}

			{/* ═══════ PROJEKT-GRID ═══════ */}
			<section
				aria-labelledby="projekt-grid-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						eyebrow={config.gridEyebrow}
						headline={config.gridHeadline}
						body={config.gridBody}
						headingId="projekt-grid-heading"
					/>

					<div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-12">
						{config.tiles.map((tile) => (
							<figure
								key={tile.src}
								className={`group relative overflow-hidden rounded-xl bg-black-100 ${tile.span} ${tile.aspect}`}
							>
								<Image
									src={tile.src}
									alt={tile.alt}
									fill
									sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 480px"
									className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
								/>
								<div
									aria-hidden
									className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								/>
								<figcaption className="absolute inset-x-4 bottom-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
									<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-400">
										{tile.category}
									</p>
									<p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white-95">
										{tile.ort} · {tile.jahr}
									</p>
								</figcaption>
							</figure>
						))}
					</div>
				</Container>
			</section>

			{/* ═══════ WERK-SPECS + STEPS (nur werk) ═══════ */}
			{isWerk && (
				<section
					aria-labelledby="werk-specs-heading"
					className="relative bg-black-50 py-24 md:py-32"
				>
					<SectionDivider />
					<Container size="xl">
						<EditorialSplit
							eyebrow="Produktion"
							headline={
								<>
									Wie ein DRUTEX-Fenster
									<br />
									entsteht.
								</>
							}
							body="Vom PVC-Granulat zum montierten Beschlag — alles im selben Werk, ohne Zwischenhandel."
							headingId="werk-specs-heading"
						/>

						<SpecList items={WERK_SPECS} layout="stacked" />

						<div className="mt-16 md:mt-20">
							<FeatureGrid
								size="dense"
								cardStyle="bordered"
								features={WERK_STEPS.map((s) => ({
									kicker: s.kicker,
									title: s.title,
									body: s.body,
								}))}
							/>
						</div>
					</Container>
				</section>
			)}

			{/* ═══════ STORY-SECTION ═══════ */}
			<section
				aria-labelledby="story-heading"
				className={`relative py-24 md:py-32 ${isWerk ? "bg-white" : "bg-black-50"}`}
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						eyebrow={config.storyEyebrow}
						headline={config.storyHeadline}
						headingId="story-heading"
					/>

					<ul className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
						{config.stories.map((story) => (
							<li
								key={story.title}
								className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-black-200 bg-white sm:grid-cols-5"
							>
								<div className="flex flex-col p-8 sm:col-span-3 md:p-10">
									<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-700">
										{story.kicker}
									</p>
									<h3 className="mt-3 font-heading text-2xl font-medium tracking-tight text-black-950 md:text-3xl">
										{story.title}
									</h3>
									<div className="mt-5 space-y-4">
										{story.body.map((p) => (
											<p
												key={p.slice(0, 32)}
												className="text-base leading-relaxed text-black-600"
											>
												{p}
											</p>
										))}
									</div>
								</div>
								<div className="relative aspect-[4/3] overflow-hidden bg-black-100 sm:col-span-2 sm:aspect-auto">
									<Image
										src={story.imageSrc}
										alt={story.imageAlt}
										fill
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 320px"
										className="object-cover"
									/>
								</div>
							</li>
						))}
					</ul>
				</Container>
			</section>

			<ContactCtaStripe
				variant="anfrage"
				headline={config.ctaHeadline}
				subline={config.ctaSubline}
				body={config.ctaBody}
			/>
		</>
	);
}
