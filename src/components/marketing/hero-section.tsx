import { ArrowRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";

interface CTA {
	label: string;
	href: string;
}

interface HeroVideoProps {
	/** Pfad zum Hintergrund-Video (z. B. /media/hero.mp4). Optional — fällt auf Gradient zurück. */
	videoSrc?: string;
	/** Poster-Bild für das Video (zeigt bis Video bereit ist). */
	posterSrc?: string;
	/** Kleine Überschrift über dem Heading (Eyebrow/Kicker). */
	eyebrow?: string;
	/** Hauptüberschrift — wird in Serif gesetzt. */
	headline: string;
	/** Kleiner Begleittext unten rechts. */
	body?: string;
	/** Primärer CTA — brand-500. */
	ctaPrimary?: CTA;
	/** Sekundärer CTA — Frosted-Glass auf dark. */
	ctaSecondary?: CTA;
}

/**
 * Editorial Hero mit Hintergrund-Video und asymmetrischem Layout.
 * Höhe: 100 vh minus Navbar-Höhe (4 rem).
 * Ohne Video: Fallback-Gradient aus black-900 → black-800 → brand-950.
 */
export function HeroVideo({
	videoSrc,
	posterSrc,
	eyebrow,
	headline,
	body,
	ctaPrimary,
	ctaSecondary,
}: HeroVideoProps) {
	return (
		<section
			aria-label="Hero"
			className="relative h-[calc(100vh-4rem)] min-h-[560px] overflow-hidden bg-black-950"
		>
			{/* Hintergrund-Video · Fallback: bg-black-950 auf Section */}
			{videoSrc && (
				<video
					className="absolute inset-0 h-full w-full object-cover"
					autoPlay
					muted
					loop
					playsInline
					poster={posterSrc}
					aria-hidden
				>
					<source src={videoSrc} type="video/mp4" />
				</video>
			)}

			{/* Brand-Dark-Overlay — der 135°-Fade liegt IMMER über dem Video.
          Gibt dem Bewegtbild eine warme Brand-Tönung unten rechts und
          sorgt gleichzeitig für genug Dunkelheit, dass Text links lesbar ist. */}
			<div
				aria-hidden
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(135deg, var(--color-black-900) 0%, var(--color-black-800) 45%, var(--color-brand-950) 100%)",
					opacity: 0.7,
				}}
			/>

			{/* Zusätzlicher dezenter Left-Fade für extra Text-Kontrast */}
			<div
				aria-hidden
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 45%, transparent 75%)",
				}}
			/>

			{/* Content */}
			<Container size="xl" className="relative h-full">
				<div className="grid h-full grid-rows-[1fr_auto] pb-10 pt-12 md:pb-14 md:pt-16">
					{/* Headline-Block — vertikal mittig */}
					<div className="flex items-center">
						<div className="max-w-3xl">
							{eyebrow && (
								<p className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-white-80">
									{eyebrow}
								</p>
							)}

							<h1 className="font-heading text-5xl font-medium leading-[1.05] tracking-tight text-white-100 sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
								{headline}
							</h1>

							{(ctaPrimary || ctaSecondary) && (
								<div className="mt-10 flex flex-wrap gap-3">
									{ctaPrimary && (
										<Link
											href={ctaPrimary.href}
											className={buttonVariants({
												variant: "primary",
												size: "normal",
											})}
										>
											{ctaPrimary.label}
											<ArrowRight aria-hidden />
										</Link>
									)}
									{ctaSecondary && (
										<Link
											href={ctaSecondary.href}
											className={buttonVariants({
												variant: "alternate-inverse",
												size: "normal",
											})}
										>
											{ctaSecondary.label}
										</Link>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Body-Paragraph — unten rechts, zurückhaltend */}
					{body && (
						<p className="max-w-sm justify-self-end text-right text-sm leading-relaxed text-white-80">
							{body}
						</p>
					)}
				</div>
			</Container>
		</section>
	);
}
