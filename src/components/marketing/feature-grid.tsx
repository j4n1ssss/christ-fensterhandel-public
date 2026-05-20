import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * FeatureGrid — 3-Spalten-Card-Grid für Produkt- und Service-Features.
 *
 * Pattern: jede Karte hat optional ein Icon (lucide), eine H3 und einen
 * Body-Text. Cards sind dezent (kein hover-shadow), weil sie inhaltlich
 * sind und nicht zur Aktion führen — Aktion ist der CTA-Stripe am Ende.
 *
 * Layout: 1 Col mobile / 2 Col md / 3 Col lg. Optional 4 Col bei size="dense".
 */

export type Feature = {
	icon?: React.ReactNode;
	title: string;
	body: React.ReactNode;
	/** Optional: 2-3 Wort-Mini-Label oben (Mono). */
	kicker?: string;
};

interface FeatureGridProps {
	features: Feature[];
	/** Layout-Density. default: 3 Cols / dense: 4 Cols. */
	size?: "default" | "dense";
	/** Card-Stil. plain (default, dezent) | bordered (mit border-black-200). */
	cardStyle?: "plain" | "bordered";
	/** Eingebettet in eine dunkle Section? */
	onDark?: boolean;
	className?: string;
}

const COLS = {
	default: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
	dense: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

export function FeatureGrid({
	features,
	size = "default",
	cardStyle = "plain",
	onDark = false,
	className,
}: FeatureGridProps) {
	return (
		<ul className={cn("grid gap-6 md:gap-8", COLS[size], className)}>
			{features.map((feature) => (
				<FeatureCard
					key={feature.title}
					feature={feature}
					cardStyle={cardStyle}
					onDark={onDark}
				/>
			))}
		</ul>
	);
}

function FeatureCard({
	feature,
	cardStyle,
	onDark,
}: {
	feature: Feature;
	cardStyle: "plain" | "bordered";
	onDark: boolean;
}) {
	const cardClasses =
		cardStyle === "bordered"
			? cn(
					"rounded-2xl border p-8 md:p-10",
					onDark ? "border-white-10 bg-white-5" : "border-black-200 bg-white",
				)
			: "py-2";

	const titleColor = onDark ? "text-white-100" : "text-black-950";
	const bodyColor = onDark ? "text-white-80" : "text-black-600";
	const kickerColor = onDark ? "text-white-60" : "text-black-500";
	const iconBg = onDark
		? "bg-white-10 text-brand-400"
		: "bg-brand-50 text-brand-700";

	return (
		<li className={cardClasses}>
			<div className="flex items-start gap-5">
				{feature.icon && (
					<span
						aria-hidden
						className={cn(
							"flex size-12 shrink-0 items-center justify-center rounded-xl",
							iconBg,
						)}
					>
						{feature.icon}
					</span>
				)}
				<div className="flex-1">
					{feature.kicker && (
						<p
							className={cn(
								"mb-3 font-mono text-[11px] uppercase tracking-[0.2em]",
								kickerColor,
							)}
						>
							{feature.kicker}
						</p>
					)}
					<h3
						className={cn(
							"font-heading text-xl font-medium tracking-tight md:text-2xl",
							titleColor,
						)}
					>
						{feature.title}
					</h3>
					<p className={cn("mt-3 text-base leading-relaxed", bodyColor)}>
						{feature.body}
					</p>
				</div>
			</div>
		</li>
	);
}
