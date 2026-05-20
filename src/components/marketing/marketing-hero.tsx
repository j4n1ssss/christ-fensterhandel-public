import Link from "next/link";
import * as React from "react";
import { Container } from "@/components/layout/container";
import { SectionDivider } from "@/components/marketing/section-divider";
import { SectionKicker } from "@/components/ui/section-kicker";
import { cn } from "@/lib/utils";

/**
 * MarketingHero — Editorial 4/8-Split mit Breadcrumb + Marginalia-Stats.
 *
 * DNA dieser Site (extrahiert aus FAQ-Page-Hero). Auf JEDER Marketing-Page
 * der erste Section-Block. NICHT zu verwechseln mit `FlowHeader` (Flow-Pages
 * wie Warenkorb/Anfrage) oder `HeroVideo` (Homepage-only).
 *
 * Layout (justify-between → Inhalt links, Marginalia rechts):
 *   ┌──────────────────────────────────────────┐
 *   │ Breadcrumb (mono small)                  │
 *   │                                          │
 *   │ ┌─── primary ───┐         ┌─ marginalia ┐│
 *   │ │ H1 Display    │         │ Eyebrow     ││
 *   │ │               │         │             ││
 *   │ │ Body Lead     │         │ Stats       ││
 *   │ └───────────────┘         └─────────────┘│
 *   └──────────────────────────────────────────┘
 *
 * Highlight-Span im Headline: `headlineHighlight` wird mit
 * `text-brand-500` an die Headline angehängt.
 */

export type MarketingHeroStat = {
	label: string;
	value: string;
};

export type MarketingHeroBreadcrumbItem = {
	/** Sichtbarer Label-Text. */
	label: string;
	/** Wenn gesetzt → klickbarer Link. Letztes Item bleibt ohne href. */
	href?: string;
};

interface MarketingHeroProps {
	/** Breadcrumb-Pfad. Erstes Element = "Start" (Link auf "/"), letztes = aktuelle Page. */
	breadcrumb: MarketingHeroBreadcrumbItem[];
	/** Mono-Eyebrow über der Headline (z. B. "Wissensbibliothek", "Sortiment"). */
	eyebrow: string;
	/** Hauptüberschrift. Zeilenbrüche per <br/> möglich. */
	headline: React.ReactNode;
	/** Optional: Brand-Highlight-Wort am Ende der Headline. */
	headlineHighlight?: string;
	/** Body-Lead-Text unter der Headline. */
	body: React.ReactNode;
	/** Optional: 2-4 Stats für die Marginalspalte. */
	stats?: MarketingHeroStat[];
	/** Optional: Section-Padding-Variante. Default: "default" (py-24/32, pt-40 lg). */
	size?: "default" | "compact";
	/** Optional: Section-id für aria-labelledby (default: "page-heading"). */
	headingId?: string;
}

const PADDING_VARIANTS = {
	default: "pb-16 pt-24 md:pb-24 md:pt-32 lg:pt-40",
	compact: "pb-12 pt-20 md:pb-16 md:pt-28 lg:pt-32",
} as const;

export function MarketingHero({
	breadcrumb,
	eyebrow,
	headline,
	headlineHighlight,
	body,
	stats,
	size = "default",
	headingId = "page-heading",
}: MarketingHeroProps) {
	return (
		<section
			aria-labelledby={headingId}
			className={cn("relative bg-white", PADDING_VARIANTS[size])}
		>
			<SectionDivider />

			<Container size="xl">
				<Breadcrumb items={breadcrumb} />

				<div className="grid grid-cols-1 gap-12 md:grid-cols-[1.25fr_0.75fr] md:items-start md:gap-16 lg:gap-24">
					{/* Headline + Body — primary, links */}
					<div>
						<h1
							id={headingId}
							className="font-heading text-5xl font-medium leading-[1.02] tracking-tight text-black-950 md:text-6xl lg:text-7xl xl:text-[88px]"
						>
							{headline}
							{headlineHighlight && (
								<>
									<br />
									<span className="text-brand-500">{headlineHighlight}</span>
								</>
							)}
						</h1>

						<p className="mt-8 text-lg leading-relaxed text-black-600 md:mt-10 md:text-xl">
							{body}
						</p>
					</div>

					{/* Marginalia: Eyebrow + optionale Stats — rechts */}
					<div>
						<SectionKicker tone="brand">{eyebrow}</SectionKicker>

						{stats && stats.length > 0 && (
							<dl className="mt-10 space-y-6 md:mt-14">
								{stats.map((stat) => (
									<StatRow
										key={stat.label}
										label={stat.label}
										value={stat.value}
									/>
								))}
							</dl>
						)}
					</div>
				</div>
			</Container>
		</section>
	);
}

/* ──────────── Internal Pieces ──────────── */

function Breadcrumb({ items }: { items: MarketingHeroBreadcrumbItem[] }) {
	return (
		<nav
			aria-label="Breadcrumb"
			className="mb-10 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500 md:mb-14 md:text-xs"
		>
			{items.map((item, i) => {
				const isLast = i === items.length - 1;
				const key = `${i}-${item.label}`;
				const separator = !isLast ? (
					<span aria-hidden className="mx-2 text-black-300">
						·
					</span>
				) : null;

				if (isLast) {
					return (
						<React.Fragment key={key}>
							<span className="text-black-950">{item.label}</span>
							{separator}
						</React.Fragment>
					);
				}

				if (item.href) {
					return (
						<React.Fragment key={key}>
							<Link
								href={item.href}
								className="transition-colors hover:text-brand-700"
							>
								{item.label}
							</Link>
							{separator}
						</React.Fragment>
					);
				}

				return (
					<React.Fragment key={key}>
						<span className="text-black-400">{item.label}</span>
						{separator}
					</React.Fragment>
				);
			})}
		</nav>
	);
}

function StatRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-4 border-t border-black-200 pt-4">
			<dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
				{label}
			</dt>
			<dd className="font-mono text-sm tabular-nums text-black-950 md:text-base">
				{value}
			</dd>
		</div>
	);
}
