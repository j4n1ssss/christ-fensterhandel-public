import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * MaterialOptions — Card-Grid für Produkt-Material-Varianten.
 *
 * Pattern aus `products-section.tsx` extrahiert. Jede Card hat:
 *   - Bild 4:3 mit Overlay (Index + ArrowBadge)
 *   - H3 + Tagline
 *   - Sub-Categories als Mono-Chips mit border-top
 *
 * Hover: -translate-y-1 + brand-border + brand-shadow.
 */

export type MaterialOption = {
	name: string;
	tagline: string;
	href: string;
	/** Sub-Tags / Eigenschaften, max. 4. */
	subCategories: string[];
	/** Pfad zum Bild. */
	imageSrc: string;
	imageAlt: string;
};

interface MaterialOptionsProps {
	options: MaterialOption[];
	/** Layout-Variante: 2 Cols (default, bei 2-4 Items) | 3 Cols. */
	cols?: 2 | 3;
	className?: string;
}

const GRID_COLS = {
	2: "md:grid-cols-2",
	3: "md:grid-cols-2 lg:grid-cols-3",
} as const;

export function MaterialOptions({
	options,
	cols = 2,
	className,
}: MaterialOptionsProps) {
	return (
		<ul
			className={cn(
				"grid grid-cols-1 gap-5 md:gap-6",
				GRID_COLS[cols],
				className,
			)}
		>
			{options.map((option, i) => (
				<MaterialCard key={option.name} option={option} index={i} />
			))}
		</ul>
	);
}

function MaterialCard({
	option,
	index,
}: {
	option: MaterialOption;
	index: number;
}) {
	return (
		<li>
			<Link
				href={option.href}
				className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_24px_48px_-16px_rgba(226,157,73,0.25)]"
			>
				{/* Bild-Slot 4:3 */}
				<div className="relative aspect-[4/3] overflow-hidden bg-black-50">
					<Image
						src={option.imageSrc}
						alt={option.imageAlt}
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
						className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
					/>
					{/* Vignette top→bottom für Lesbarkeit */}
					<div
						aria-hidden
						className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/5"
					/>

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

				{/* Text-Slot */}
				<div className="flex flex-1 flex-col p-8 md:p-10">
					<h3 className="font-heading text-3xl font-medium tracking-tight text-black-950 md:text-4xl">
						{option.name}
					</h3>
					<p className="mt-3 max-w-md text-sm leading-relaxed text-black-600">
						{option.tagline}
					</p>

					<ul className="mt-auto flex flex-wrap gap-2 border-t border-black-100 pt-6">
						{option.subCategories.map((sub) => (
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
		</li>
	);
}
