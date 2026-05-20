import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Container } from "@/components/layout/container";
import { SectionDivider } from "@/components/marketing/section-divider";

type GalleryTile = {
	src: string;
	alt: string;
	category: string;
	/** Tailwind-Klasse für col-span (auf lg:) */
	span: string;
	/** aspect-ratio Klasse */
	aspect: string;
};

const TILES: GalleryTile[] = [
	{
		src: "/images/gallery/01.jpg",
		alt: "Kunststoff-Fenster mit weißen Beschlägen",
		category: "Fenster",
		span: "lg:col-span-8",
		aspect: "aspect-[16/10]",
	},
	{
		src: "/images/gallery/03.jpg",
		alt: "Detail eines dunklen Fensterrahmens mit Beschlag",
		category: "Detail",
		span: "lg:col-span-4",
		aspect: "aspect-[4/5]",
	},
	{
		src: "/images/gallery/02.jpg",
		alt: "Moderne graue Haustür mit schmalem Lichtausschnitt",
		category: "Türen",
		span: "lg:col-span-4",
		aspect: "aspect-[4/5]",
	},
	{
		src: "/images/gallery/05.jpg",
		alt: "Weißes Kunststoff-Fenster",
		category: "Fenster",
		span: "lg:col-span-5",
		aspect: "aspect-[4/3]",
	},
	{
		src: "/images/gallery/06.jpg",
		alt: "Haustür mit großer Glasfläche",
		category: "Türen",
		span: "lg:col-span-3",
		aspect: "aspect-[3/4]",
	},
	{
		src: "/images/gallery/04.jpg",
		alt: "Graue Haustür mit Glaselementen",
		category: "Türen",
		span: "lg:col-span-12",
		aspect: "aspect-[21/9]",
	},
];

export function GallerySection() {
	return (
		<section
			aria-labelledby="gallery-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				{/* Editorial-Header */}
				<div className="mb-14 grid grid-cols-1 gap-8 md:mb-20 md:grid-cols-12 md:gap-12">
					<div className="md:col-span-4">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
							Referenzen
						</p>
					</div>
					<div className="md:col-span-8 md:flex md:items-end md:justify-between md:gap-10">
						<h2
							id="gallery-heading"
							className="font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl"
						>
							Was bei uns
							<br />
							rausgeht.
						</h2>
						<Link
							href="/galerie"
							className="group mt-6 inline-flex shrink-0 items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-black-700 transition-colors hover:text-brand-700 md:mt-0"
						>
							Alle Projekte
							<ArrowRight
								className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
								aria-hidden
							/>
						</Link>
					</div>
				</div>

				{/* Asymmetrisches 12-Column-Grid */}
				<div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-12">
					{TILES.map((tile, i) => (
						<figure
							key={i}
							className={`group relative overflow-hidden rounded-xl bg-black-100 ${tile.span} ${tile.aspect}`}
						>
							<Image
								src={tile.src}
								alt={tile.alt}
								fill
								sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 400px"
								className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
							/>
							{/* Hover-Overlay mit Kategorie-Chip */}
							<div
								aria-hidden
								className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							/>
							<figcaption className="absolute bottom-4 left-4 translate-y-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white-95 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
								{tile.category}
							</figcaption>
						</figure>
					))}
				</div>
			</Container>
		</section>
	);
}
