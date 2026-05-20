"use client";

import Link from "next/link";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import {
	ScrollFrameAnimation,
	type ScrollFrameAnimationProps,
} from "./scroll-frame-animation";

export type ScrollAnimationSectionProps = Omit<
	ScrollFrameAnimationProps,
	"scrollTargetRef" | "className"
> & {
	/** "left" oder "right" — Seite des Text-Overlays auf Desktop. Auf Mobile immer zentriert unten. */
	textPosition: "left" | "right";
	eyebrow: string;
	headline: string;
	body: string;
	cta?: { label: string; href: string };
	/** Scroll-Strecke. Default "150vh". */
	scrollLength?: `${number}vh`;
	/** Zusätzliche Klassen für die äußere <section>. */
	className?: string;
};

export function ScrollAnimationSection({
	textPosition,
	eyebrow,
	headline,
	body,
	cta,
	scrollLength = "150vh",
	className,
	...animationProps
}: ScrollAnimationSectionProps) {
	const trackRef = useRef<HTMLDivElement>(null);

	return (
		<section
			ref={trackRef}
			className={cn("relative w-full", className)}
			style={{ height: scrollLength }}
		>
			{/* Sticky-Viewport: bleibt im Bild während man durch die 200vh scrollt */}
			<div className="sticky top-0 flex h-screen w-full overflow-hidden">
				{/* Animation im Hintergrund */}
				<ScrollFrameAnimation
					{...animationProps}
					scrollTargetRef={trackRef}
					className="absolute inset-0"
				/>

				{/* Gradient-Overlay für Text-Lesbarkeit */}
				<div
					className={cn(
						"absolute inset-0",
						// Mobile: Gradient von unten (Text stackt unten)
						"bg-gradient-to-t from-black/75 via-black/30 to-transparent",
						// Desktop: Gradient von links bzw. rechts
						textPosition === "left"
							? "md:bg-gradient-to-r md:from-black/65 md:via-black/25 md:to-transparent"
							: "md:bg-gradient-to-l md:from-black/65 md:via-black/25 md:to-transparent",
					)}
					aria-hidden="true"
				/>

				{/* Text-Overlay */}
				<div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center px-6 md:px-10">
					<div
						className={cn(
							"w-full max-w-xl text-left text-white",
							// Mobile: unten linksbündig, volle Breite
							"self-end pb-16",
							// Desktop: mittig, links oder rechts je nach textPosition
							"md:self-center md:pb-0",
							textPosition === "right" && "md:ml-auto",
						)}
					>
						<p className="mb-3 text-sm uppercase tracking-widest text-white/70">
							{eyebrow}
						</p>
						<h2 className="mb-5 text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
							{headline}
						</h2>
						<p className="mb-8 text-lg text-white/85 md:text-xl">{body}</p>
						{cta && (
							<Link
								href={cta.href}
								className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
							>
								{cta.label}
								<span aria-hidden="true">&rarr;</span>
							</Link>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
