import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SpecList — Definition-List für technische Specs.
 *
 * Zwei Layouts:
 *   - inline (default): Label links, Wert rechts, divided rows (z. B. Drutex-Facts)
 *   - stacked:           Label oben (mono small), Wert unten groß
 *
 * Beide Layouts nutzen tabular-nums für numerische Werte.
 */

export type SpecItem = {
	label: string;
	value: React.ReactNode;
	/** Optionaler Fußnoten-Text unter dem Wert. */
	note?: string;
};

interface SpecListProps {
	items: SpecItem[];
	layout?: "inline" | "stacked";
	onDark?: boolean;
	className?: string;
}

export function SpecList({
	items,
	layout = "inline",
	onDark = false,
	className,
}: SpecListProps) {
	if (layout === "stacked") {
		return (
			<dl
				className={cn(
					"grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3",
					className,
				)}
			>
				{items.map((item) => (
					<div key={item.label}>
						<dt
							className={cn(
								"font-mono text-[11px] uppercase tracking-[0.2em]",
								onDark ? "text-white-60" : "text-black-500",
							)}
						>
							{item.label}
						</dt>
						<dd
							className={cn(
								"mt-3 font-heading text-3xl font-medium tabular-nums tracking-tight md:text-4xl",
								onDark ? "text-white-100" : "text-black-950",
							)}
						>
							{item.value}
						</dd>
						{item.note && (
							<p
								className={cn(
									"mt-2 text-sm",
									onDark ? "text-white-60" : "text-black-600",
								)}
							>
								{item.note}
							</p>
						)}
					</div>
				))}
			</dl>
		);
	}

	// inline
	const dividerColor = onDark ? "divide-white-10" : "divide-black-200";
	const labelColor = onDark ? "text-white-60" : "text-black-500";
	const valueColor = onDark ? "text-white-100" : "text-black-950";

	return (
		<dl className={cn("divide-y", dividerColor, className)}>
			{items.map((item) => (
				<div
					key={item.label}
					className="flex items-baseline justify-between gap-6 py-5"
				>
					<dt
						className={cn(
							"font-mono text-[11px] uppercase tracking-[0.2em]",
							labelColor,
						)}
					>
						{item.label}
					</dt>
					<dd
						className={cn(
							"text-right font-heading text-2xl font-medium tabular-nums tracking-tight md:text-3xl",
							valueColor,
						)}
					>
						{item.value}
					</dd>
				</div>
			))}
		</dl>
	);
}
