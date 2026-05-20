import type * as React from "react";
import { SectionKicker } from "@/components/ui/section-kicker";
import { cn } from "@/lib/utils";

/**
 * EditorialSplit — Wiederverwendbarer Section-Header mit Eyebrow + Headline + Body.
 *
 * Wird in JEDER Section-Headline verwendet, damit der Editorial-Rhythmus
 * konsistent bleibt — gleichzeitig flexibel über `layout`/`alignment`-Props.
 *
 * Unterschied zu MarketingHero:
 *   - MarketingHero  → erste Section einer Page (H1, Breadcrumb, Stats, groß)
 *   - EditorialSplit → Section-Header innerhalb einer Page (H2, kompakter)
 *
 * Layouts:
 *   - "auto"      (Default) → Eyebrow-Spalte schrumpft auf Textbreite, Headline
 *                              nimmt den Rest. Modern, kompakt, kein Leerraum-Loch.
 *   - "editorial" → klassische 4/8-Aufteilung. Ruhiger Marginalia-Look mit
 *                   großem konstantem Eyebrow-Block links.
 *   - "stacked"   → Eyebrow ÜBER Headline. Für schmale Container oder
 *                   zentrierte Section-Header.
 *
 * Alignments (nur für "auto"/"stacked" relevant):
 *   - "left"   (Default) → linksbündig
 *   - "center" → zentriert (eyebrow + headline + body horizontal in der Mitte)
 */

type EditorialSplitLayout = "auto" | "editorial" | "stacked";
type EditorialSplitAlignment = "left" | "center";

interface EditorialSplitProps {
	eyebrow: string;
	headline: React.ReactNode;
	body?: React.ReactNode;
	/** Optionaler Right-Aligned-Element-Slot (Link, Button) neben der Headline. */
	trailing?: React.ReactNode;
	/** id für aria-labelledby auf der umschließenden Section. */
	headingId: string;
	/** Tone des Eyebrows. Default: "brand" auf hell, "onDark" automatisch via prop. */
	onDark?: boolean;
	/** Margin-Bottom-Variante. Default "default" (mb-14/20), "compact" enger. */
	spacing?: "default" | "compact";
	/** Layout-Variante. Default "auto". Siehe Komponenten-Doku oben. */
	layout?: EditorialSplitLayout;
	/** Horizontale Ausrichtung. Default "left". Wirkt nur bei "auto"/"stacked". */
	alignment?: EditorialSplitAlignment;
	className?: string;
}

const SPACING_MAP = {
	default: "mb-14 md:mb-20",
	compact: "mb-10 md:mb-14",
} as const;

export function EditorialSplit({
	eyebrow,
	headline,
	body,
	trailing,
	headingId,
	onDark = false,
	spacing = "default",
	layout = "auto",
	alignment = "left",
	className,
}: EditorialSplitProps) {
	const headlineColor = onDark ? "text-white-100" : "text-black-950";
	const bodyColor = onDark ? "text-white-80" : "text-black-600";

	const headlineEl = (
		<h2
			id={headingId}
			className={cn(
				"font-heading text-4xl font-medium leading-[1.05] tracking-tight md:text-5xl lg:text-6xl",
				headlineColor,
			)}
		>
			{headline}
		</h2>
	);

	const bodyEl = body ? (
		<p
			className={cn(
				"mt-6 max-w-2xl text-lg leading-relaxed",
				bodyColor,
				alignment === "center" && layout !== "editorial" && "mx-auto",
			)}
		>
			{body}
		</p>
	) : null;

	const eyebrowEl = (
		<SectionKicker tone={onDark ? "onDark" : "brand"}>{eyebrow}</SectionKicker>
	);

	/* ── Stacked: Eyebrow oberhalb der Headline, kein Spaltenraster. ── */
	if (layout === "stacked") {
		return (
			<div
				className={cn(
					SPACING_MAP[spacing],
					alignment === "center" && "text-center",
					className,
				)}
			>
				<div className={cn(alignment === "center" && "flex justify-center")}>
					{eyebrowEl}
				</div>
				<div className="mt-6 md:mt-8">
					{headlineEl}
					{bodyEl}
				</div>
				{trailing && (
					<div
						className={cn(
							"mt-8",
							alignment === "center" && "flex justify-center",
						)}
					>
						{trailing}
					</div>
				)}
			</div>
		);
	}

	/* ── Editorial: klassisches 4/8-Grid (Marginalia-Look). ── */
	if (layout === "editorial") {
		return (
			<div
				className={cn(
					SPACING_MAP[spacing],
					"grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12",
					className,
				)}
			>
				<div className="md:col-span-4">{eyebrowEl}</div>
				<div
					className={cn(
						"md:col-span-8",
						trailing && "md:flex md:items-end md:justify-between md:gap-10",
					)}
				>
					<div className={trailing ? "max-w-none" : undefined}>
						{headlineEl}
						{bodyEl}
					</div>
					{trailing && <div className="mt-6 shrink-0 md:mt-0">{trailing}</div>}
				</div>
			</div>
		);
	}

	/* ── Auto (Default): Eyebrow-Spalte = Textbreite, Headline = Rest. ── */
	return (
		<div
			className={cn(
				SPACING_MAP[spacing],
				"grid grid-cols-1 gap-8 md:grid-cols-[auto_1fr] md:items-start md:gap-12",
				alignment === "center" && "md:place-items-center md:text-center",
				className,
			)}
		>
			<div className="md:whitespace-nowrap">{eyebrowEl}</div>
			<div
				className={cn(
					trailing && "md:flex md:items-end md:justify-between md:gap-10",
				)}
			>
				<div className={trailing ? "max-w-none" : undefined}>
					{headlineEl}
					{bodyEl}
				</div>
				{trailing && <div className="mt-6 shrink-0 md:mt-0">{trailing}</div>}
			</div>
		</div>
	);
}
