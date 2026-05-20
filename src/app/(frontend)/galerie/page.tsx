import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { EditorialSplit } from "@/components/marketing/editorial-split";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { SectionDivider } from "@/components/marketing/section-divider";

export const metadata: Metadata = {
	title: "Galerie · Muster Fenster",
	description:
		"Referenzprojekte aus Musterstadt, Beispielstadt und Umland — Fenster, Türen und ganze Häuser aus dreißig Jahren Familienbetrieb.",
};

/**
 * /galerie — Hub-Page der Referenz-Galerie.
 *
 * Struktur:
 *   1. MarketingHero      — Editorial-Hero mit Stats (Projekte, Kategorien, Jahr)
 *   2. Kategorien         — 5-Col Card-Grid mit Mono-Index + ArrowBadge auf Bild
 *   3. Highlights         — Asymmetrisches 12-Col-Tile-Grid (6 Tiles aus /images/gallery/01-06)
 *   4. Stories            — 3-Col bordered FeatureGrid mit Project-Stories
 *   5. ContactCtaStripe   — Anfrage-CTA als Closer
 */

type GalleryCategory = {
	slug: string;
	index: string;
	count: string;
	name: string;
	imageSrc: string;
	imageAlt: string;
};

const CATEGORIES: GalleryCategory[] = [
	{
		slug: "alle-projekte",
		index: "01",
		count: "ca. 500 Projekte",
		name: "Alle Projekte",
		imageSrc: "/images/gallery/01.jpg",
		imageAlt:
			"Querschnitt aus allen Referenzprojekten — Fenster, Türen und Komplettausstattungen",
	},
	{
		slug: "fenster",
		index: "02",
		count: "ca. 340 Projekte",
		name: "Fensterprojekte",
		imageSrc: "/images/gallery/05.jpg",
		imageAlt: "Weißes Kunststoff-Fenster aus einem Referenzprojekt",
	},
	{
		slug: "tueren",
		index: "03",
		count: "ca. 120 Projekte",
		name: "Türenprojekte",
		imageSrc: "/images/gallery/02.jpg",
		imageAlt: "Moderne graue Haustür mit schmalem Lichtausschnitt",
	},
	{
		slug: "objekte",
		index: "04",
		count: "ca. 60 Projekte",
		name: "Referenzobjekte",
		imageSrc: "/images/gallery/04.jpg",
		imageAlt: "Gewerbliches Referenzobjekt mit großflächigen Glaselementen",
	},
	{
		slug: "werk",
		index: "05",
		count: "DRUTEX & Hof",
		name: "Werk & Produktion",
		imageSrc: "/images/gallery/03.jpg",
		imageAlt: "Detailaufnahme aus der DRUTEX-Produktion",
	},
];

type HighlightTile = {
	src: string;
	alt: string;
	category: string;
	span: string;
	aspect: string;
};

const HIGHLIGHTS: HighlightTile[] = [
	{
		src: "/images/gallery/04.jpg",
		alt: "Graue Haustür mit Glaselementen, Referenzobjekt aus Werder",
		category: "Türen · Werder 2024",
		span: "lg:col-span-7",
		aspect: "aspect-[16/10]",
	},
	{
		src: "/images/gallery/03.jpg",
		alt: "Detail eines dunklen Fensterrahmens mit Beschlag",
		category: "Detail · Beschlag",
		span: "lg:col-span-5",
		aspect: "aspect-[4/5]",
	},
	{
		src: "/images/gallery/05.jpg",
		alt: "Weißes Kunststoff-Fenster in einem Einfamilienhaus",
		category: "Fenster · Musterstadt 2023",
		span: "lg:col-span-4",
		aspect: "aspect-[4/5]",
	},
	{
		src: "/images/gallery/01.jpg",
		alt: "Kunststoff-Fenster mit weißen Beschlägen, Reihenhaus Potsdam",
		category: "Fenster · Potsdam 2025",
		span: "lg:col-span-8",
		aspect: "aspect-[16/10]",
	},
	{
		src: "/images/gallery/06.jpg",
		alt: "Haustür mit großer Glasfläche, Beispielstadt-Süd",
		category: "Türen · Beispielstadt-Süd",
		span: "lg:col-span-5",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/02.jpg",
		alt: "Moderne graue Haustür mit schmalem Lichtausschnitt",
		category: "Türen · Caputh 2024",
		span: "lg:col-span-7",
		aspect: "aspect-[16/9]",
	},
];

type Story = {
	kicker: string;
	title: string;
	body: string;
};

const STORIES: Story[] = [
	{
		kicker: "Werder · 2024",
		title: "Einfamilienhaus mit 18 Fenstern",
		body: "Achtzehn Fenster der Serie IGLO Edge mit integriertem Rollladen, im Erdgeschoss weiße Holzfenster zum Garten. Vermessung an einem Freitag, Lieferung sechs Wochen später, Montage in drei Tagen.",
	},
	{
		kicker: "Beispielstadt-Süd · 2023",
		title: "Sanierung Altbau-Villa",
		body: "Vierundzwanzig denkmalgerechte Holzfenster mit Sprossen, anthrazit lackiert. Jedes Maß individuell, jedes Profil abgestimmt — und doch in zehn Wochen vom ersten Aufmaß bis zur Endmontage.",
	},
	{
		kicker: "Beelitz · 2025",
		title: "Gewerbeobjekt mit Aluminium-Front",
		body: "Aluprof MB-86 N SI als Pfosten-Riegel-Fassade, sechs Meter hoch, dreifach verglast. Ergänzt durch sechzehn Büroflächen-Fenster und zwei automatische Schiebetüren am Eingang.",
	},
];

export default function GaleriePage() {
	return (
		<>
			<MarketingHero
				breadcrumb={[{ label: "Start", href: "/" }, { label: "Galerie" }]}
				eyebrow="Referenzen"
				headline={<>Was bei uns</>}
				headlineHighlight="rausgeht."
				body={
					<>
						Seit 1985 bauen wir Fenster, Türen und ganze Häuser in Musterstadt,
						Beispielstadt und im Umland ein. Hier siehst du einen Querschnitt — vom
						Einfamilienhaus in Werder bis zur Gewerbe-Fassade in Beelitz. Alle
						Projekte handgemessen, mit DRUTEX gefertigt, von uns montiert.
					</>
				}
				stats={[
					{ label: "Projekte", value: "500+" },
					{ label: "Kategorien", value: "05" },
					{ label: "Seit", value: "1985" },
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
						eyebrow="Filter"
						headline={
							<>
								Nach Material
								<br />
								und Typ.
							</>
						}
						body="Fünf Wege durch die Galerie. Klick dich rein — jede Kategorie hat eigene Bilder, Specs und ein paar Geschichten dazu."
						headingId="kategorien-heading"
					/>

					<ul className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-5">
						{CATEGORIES.map((cat) => (
							<li key={cat.slug}>
								<Link
									href={`/galerie/${cat.slug}`}
									className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-2xl border border-black-200 bg-black-100 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_24px_48px_-16px_rgba(226,157,73,0.25)]"
								>
									<Image
										src={cat.imageSrc}
										alt={cat.imageAlt}
										fill
										sizes="(max-width: 1024px) 50vw, 320px"
										className="absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-[1.05]"
									/>
									{/* Gradient-Overlay für Lesbarkeit */}
									<div
										aria-hidden
										className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/35"
									/>

									{/* Top: Mono-Index + ArrowBadge */}
									<div className="relative flex items-start justify-between p-5">
										<span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white-95 drop-shadow-sm">
											{cat.index}
										</span>
										<span className="flex size-10 items-center justify-center rounded-full bg-white-95 backdrop-blur-sm transition-all duration-300 group-hover:bg-brand-500">
											<ArrowUpRight
												className="size-4 text-black-900 transition-colors duration-300 group-hover:text-white-100"
												aria-hidden
											/>
										</span>
									</div>

									{/* Bottom: Mono-Mini-Label + H3 */}
									<div className="relative mt-auto p-5">
										<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white-80">
											{cat.count}
										</p>
										<h3 className="mt-2 font-heading text-xl font-medium leading-tight tracking-tight text-white-100 md:text-2xl">
											{cat.name}
										</h3>
									</div>
								</Link>
							</li>
						))}
					</ul>
				</Container>
			</section>

			{/* ═══════ HIGHLIGHTS ═══════ */}
			<section
				aria-labelledby="highlights-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						eyebrow="Auszug"
						headline={
							<>
								Sechs ausgewählte
								<br />
								Arbeiten.
							</>
						}
						body="Sechs Bilder, sechs Geschichten — von Werder bis Beispielstadt-Süd. Mehr im jeweiligen Kategorie-Archiv."
						headingId="highlights-heading"
					/>

					<div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-12">
						{HIGHLIGHTS.map((tile) => (
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
									className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								/>
								<figcaption className="absolute bottom-4 left-4 translate-y-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white-95 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
									{tile.category}
								</figcaption>
							</figure>
						))}
					</div>
				</Container>
			</section>

			{/* ═══════ STORIES ═══════ */}
			<section
				aria-labelledby="stories-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<EditorialSplit
						eyebrow="Hinter den Projekten"
						headline={
							<>
								Drei
								<br />
								Geschichten.
							</>
						}
						body="Jedes Projekt hat sein eigenes Tempo. Drei Beispiele aus den letzten zwei Jahren — Maß, Material, Montage."
						headingId="stories-heading"
					/>

					<FeatureGrid
						cardStyle="bordered"
						features={STORIES.map((story) => ({
							kicker: story.kicker,
							title: story.title,
							body: story.body,
						}))}
					/>
				</Container>
			</section>

			<ContactCtaStripe
				variant="anfrage"
				headline="Eigenes Projekt?"
				subline="Wir hören zu."
				body="Ob Einfamilienhaus, Sanierung oder gewerbliche Anlage — schick uns ein Foto, einen Grundriss oder einfach eine kurze Skizze. Wir melden uns am selben Werktag zurück."
			/>
		</>
	);
}
