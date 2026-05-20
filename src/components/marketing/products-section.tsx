import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Container } from "@/components/layout/container";
import { SectionDivider } from "@/components/marketing/section-divider";

type ProductCategory = {
	name: string;
	tagline: string;
	href: string;
	subCategories: string[];
	imageSrc: string;
	imageAlt: string;
};

const PRODUCT_CATEGORIES: ProductCategory[] = [
	{
		name: "Fenster",
		tagline:
			"Kunststoff, Aluminium, Holz — für jedes Bauvorhaben die richtige Wahl.",
		href: "/produkte/fenster",
		subCategories: ["Kunststoff", "Aluminium", "Holz"],
		imageSrc: "/images/products/fenster.jpg",
		imageAlt: "Zweiflügeliges Holzfenster",
	},
	{
		name: "Türen",
		tagline:
			"Haus-, Balkon- und Schiebetüren in Kunststoff, Holz, Aluminium oder Vollglas.",
		href: "/produkte/haustueren",
		subCategories: ["Haustüren", "Balkontüren", "Schiebetüren"],
		imageSrc: "/images/products/tueren.jpg",
		imageAlt: "Haustür der iGLO-Edge-Serie mit beleuchteter Umrandung",
	},
	{
		name: "Rollläden",
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

export function ProductsSection() {
	return (
		<section
			aria-labelledby="products-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				{/* Editorial-Header mit Kicker und Claim */}
				<div className="mb-14 grid grid-cols-1 gap-8 md:mb-20 md:grid-cols-12 md:gap-12">
					<div className="md:col-span-4">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
							Sortiment
						</p>
					</div>
					<div className="md:col-span-8">
						<h2
							id="products-heading"
							className="font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl"
						>
							Vier Kategorien, komplett maßwerk.
						</h2>
						<p className="mt-6 max-w-2xl text-lg leading-relaxed text-black-600">
							Ob ein einzelnes Fenster oder die komplette Ausstattung für ein
							Haus — alles wird individuell vermessen, konfiguriert und mit
							DRUTEX-Qualität gefertigt.
						</p>
					</div>
				</div>

				{/* 2×2 Grid */}
				<div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
					{PRODUCT_CATEGORIES.map((cat, i) => (
						<ProductCard key={cat.name} category={cat} index={i} />
					))}
				</div>
			</Container>
		</section>
	);
}

function ProductCard({
	category,
	index,
}: {
	category: ProductCategory;
	index: number;
}) {
	return (
		<Link
			href={category.href}
			className="group relative flex flex-col overflow-hidden rounded-2xl border border-black-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_24px_48px_-16px_rgba(226,157,73,0.25)]"
		>
			{/* Bild-Bereich — nimmt oberen Teil der Card ein */}
			<div className="relative aspect-[4/3] overflow-hidden bg-black-50">
				<Image
					src={category.imageSrc}
					alt={category.imageAlt}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
					className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
				/>
				{/* Subtle vignette oben → unten, damit Nummerierung/Arrow lesbar bleiben */}
				<div
					aria-hidden
					className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/5"
				/>

				{/* Nummerierung + ArrowUpRight über dem Bild */}
				<div className="absolute inset-x-6 top-6 flex items-start justify-between">
					<span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white-95 drop-shadow-sm">
						0{index + 1}
					</span>
					<div className="flex size-10 items-center justify-center rounded-full bg-white-95 backdrop-blur-sm transition-all duration-300 group-hover:bg-brand-500">
						<ArrowUpRight
							className="size-4 text-black-900 transition-colors duration-300 group-hover:text-white-100"
							aria-hidden
						/>
					</div>
				</div>
			</div>

			{/* Text-Bereich */}
			<div className="flex flex-1 flex-col p-8 md:p-10">
				<h3 className="font-heading text-3xl font-medium tracking-tight text-black-950 md:text-4xl">
					{category.name}
				</h3>
				<p className="mt-3 max-w-md text-sm leading-relaxed text-black-600">
					{category.tagline}
				</p>

				{/* Sub-Kategorien als Chip-Liste */}
				<ul className="mt-auto flex flex-wrap gap-2 border-t border-black-100 pt-6">
					{category.subCategories.map((sub) => (
						<li
							key={sub}
							className="rounded-full bg-black-50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-black-600 transition-colors duration-300 group-hover:bg-brand-50 group-hover:text-brand-800"
						>
							{sub}
						</li>
					))}
				</ul>
			</div>
		</Link>
	);
}
