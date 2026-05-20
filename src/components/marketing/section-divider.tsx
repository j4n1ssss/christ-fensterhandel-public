import * as React from "react";

/**
 * Editorial Signature-Line.
 * Horizontaler 1px-Strich mit Brand-Gradient, der nur im mittleren
 * Bereich sichtbar ist (fades in/out zu transparent). Wird als
 * wiederkehrendes Element oben in Sektionen eingesetzt.
 */
export function SectionDivider({
	className,
	invert = false,
}: {
	className?: string;
	/** Für dunkle Sektionen (Brand-Farbe bleibt, nur Fades werden dunkel egal). */
	invert?: boolean;
}) {
	const color = invert ? "var(--color-brand-400)" : "var(--color-brand-500)";
	return (
		<div
			aria-hidden
			className={className ?? "absolute inset-x-0 top-0 h-px"}
			style={{
				background: `linear-gradient(to right, transparent 0%, ${color} 40%, ${color} 60%, transparent 100%)`,
			}}
		/>
	);
}
