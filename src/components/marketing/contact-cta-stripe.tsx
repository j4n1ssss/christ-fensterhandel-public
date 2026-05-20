import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { Container } from "@/components/layout/container";
import { SectionDivider } from "@/components/marketing/section-divider";
import { PillButton } from "@/components/ui/pill-button";

/**
 * ContactCtaStripe — Black-950 Endstrip.
 *
 * Schließt jede Marketing-Page als letzter Section-Block ab. Extrahiert aus
 * dem FAQ-Page-Closer und vereinheitlicht. Liefert immer dasselbe Atmungs-
 * Pattern: Brand-Glow unten links, Kicker + große Display-H2 mit
 * Highlight-Span, Body, PillButton + Anruf-Link auf links — divided
 * Contact-Rows auf rechts.
 *
 * Variante (variant):
 *   default        — "Direkter Draht" Eyebrow, Standard-Tagline
 *   konfigurator   — Brand-Stripe (kein Black) statt Schwarz, führt zum Konfigurator
 *   anfrage        — führt zum Anfrageformular
 */

export type ContactCtaStripeVariant = "default" | "konfigurator" | "anfrage";

interface ContactCtaStripeProps {
	/** Variante. Default: "default" (Apparat-Tagline). */
	variant?: ContactCtaStripeVariant;
	/** Eigene Headline überschreibt die Default-Tagline. */
	headline?: React.ReactNode;
	/** Eigene Highlight-Sub-Line (Span unter der Headline). */
	subline?: React.ReactNode;
	/** Eigene Body-Copy. */
	body?: React.ReactNode;
	/** Eyebrow-Label. Default: "Direkter Draht". */
	eyebrow?: string;
}

const FIRMA = {
	tel: "+4930000000000",
	telDisplay: "+49 (0)30 000 000 00",
	mail: "info@example.com",
	ort: "Musterstadt",
} as const;

export function ContactCtaStripe({
	variant = "default",
	headline,
	subline,
	body,
	eyebrow = "Direkter Draht",
}: ContactCtaStripeProps) {
	if (variant === "konfigurator") {
		return <KonfiguratorVariant headline={headline} body={body} />;
	}

	// Default + anfrage teilen das Black-950-Layout
	const ctaHref = variant === "anfrage" ? "/anfrage" : "/kontakt";
	const ctaLabel =
		variant === "anfrage" ? "Anfrage senden" : "Kontaktformular öffnen";

	const finalHeadline = headline ?? "Frage nicht dabei?";
	const finalSubline = subline ?? "Wir sind am Apparat.";
	const finalBody =
		body ??
		"Persönliche Beratung, unverbindlich, auf Deutsch oder Polnisch. Wir antworten auf E-Mails am selben Werktag — in dringenden Fällen greif einfach zum Telefon.";

	return (
		<section
			aria-labelledby="contact-cta-heading"
			className="relative overflow-hidden bg-black-950 py-24 md:py-32 lg:py-40"
		>
			<SectionDivider invert />

			{/* Brand-Atmosphäre — großer weicher Blob unten links */}
			<div
				aria-hidden
				className="pointer-events-none absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-brand-500/10 blur-3xl md:-bottom-56 md:-left-56 md:h-[48rem] md:w-[48rem]"
			/>

			<Container size="xl" className="relative">
				<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
					<div className="md:col-span-7">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-400">
							{eyebrow}
						</p>
						<h2
							id="contact-cta-heading"
							className="mt-6 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-white-100 md:mt-8 md:text-5xl lg:text-6xl"
						>
							{finalHeadline}
							{finalSubline && (
								<>
									<br />
									<span className="text-white-60">{finalSubline}</span>
								</>
							)}
						</h2>
						<p className="mt-6 max-w-xl text-base leading-relaxed text-white-80 md:mt-8 md:text-lg">
							{finalBody}
						</p>
						<div className="mt-10 flex flex-wrap items-center gap-6 sm:gap-8">
							<PillButton href={ctaHref} variant="secondary" size="lg">
								{ctaLabel}
							</PillButton>
							<Link
								href={`tel:${FIRMA.tel}`}
								className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-white-80 transition-colors hover:text-brand-400"
							>
								Oder direkt anrufen
								<ArrowRight
									className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
									aria-hidden
								/>
							</Link>
						</div>
					</div>

					<div className="md:col-span-5">
						<div className="divide-y divide-white-10 border-y border-white-10">
							<ContactRow
								icon={<Phone className="size-4" aria-hidden />}
								label="Telefon"
								primary={FIRMA.telDisplay}
								meta="Fr 10 – 17 Uhr · 24/7 erreichbar"
								href={`tel:${FIRMA.tel}`}
							/>
							<ContactRow
								icon={<Mail className="size-4" aria-hidden />}
								label="E-Mail"
								primary={FIRMA.mail}
								meta="Antwort am selben Werktag"
								href={`mailto:${FIRMA.mail}`}
							/>
							<ContactRow
								icon={<MapPin className="size-4" aria-hidden />}
								label="Showroom"
								primary={FIRMA.ort}
								meta="Nach Terminvereinbarung"
								href="/kontakt"
							/>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}

/* ──────────── Konfigurator-Variante (Brand-Stripe) ──────────── */

function KonfiguratorVariant({
	headline,
	body,
}: {
	headline?: React.ReactNode;
	body?: React.ReactNode;
}) {
	const finalHeadline = headline ?? (
		<>
			Jetzt dein
			<br />
			Fenster bauen.
		</>
	);
	const finalBody =
		body ?? "In 5 Minuten durch — kostenlos, unverbindlich, mit Beratung.";

	return (
		<section
			aria-labelledby="cta-heading"
			className="relative overflow-hidden bg-brand-500 py-24 md:py-32"
		>
			{/* Diagonal-Streifen-Pattern */}
			<div
				aria-hidden
				className="absolute inset-0 opacity-[0.08]"
				style={{
					backgroundImage:
						"repeating-linear-gradient(135deg, var(--color-black-950) 0px, var(--color-black-950) 1px, transparent 1px, transparent 14px)",
				}}
			/>

			{/* Warmes Glow unten links */}
			<div
				aria-hidden
				className="pointer-events-none absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full blur-3xl"
				style={{
					background:
						"radial-gradient(circle, var(--color-brand-300) 0%, transparent 70%)",
					opacity: 0.55,
				}}
			/>

			<Container size="xl">
				<div className="relative grid grid-cols-1 items-end gap-12 lg:grid-cols-12 lg:gap-16">
					<div className="lg:col-span-7">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-950">
							Starten
						</p>
						<h2
							id="cta-heading"
							className="mt-4 font-heading text-5xl font-medium leading-[1.0] tracking-tight text-black-950 md:text-6xl lg:text-7xl"
						>
							{finalHeadline}
						</h2>
						<p className="mt-6 max-w-xl text-base leading-relaxed text-black-900 md:text-lg">
							{finalBody}
						</p>
					</div>
					<div className="lg:col-span-5 lg:flex lg:justify-end">
						<PillButton href="/konfigurator" size="xl">
							Konfigurator starten
						</PillButton>
					</div>
				</div>
			</Container>
		</section>
	);
}

function ContactRow({
	icon,
	label,
	primary,
	meta,
	href,
}: {
	icon: React.ReactNode;
	label: string;
	primary: string;
	meta: string;
	href: string;
}) {
	return (
		<Link
			href={href}
			className="group flex items-start gap-4 py-6 transition-colors hover:bg-white-5 md:py-7"
		>
			<span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-white-20 text-white-60 transition-colors group-hover:border-brand-400 group-hover:text-brand-400">
				{icon}
			</span>
			<div className="flex-1">
				<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white-40">
					{label}
				</p>
				<p className="mt-1.5 font-heading text-lg font-medium leading-tight tracking-tight text-white-100 transition-colors group-hover:text-brand-400 md:text-xl">
					{primary}
				</p>
				<p className="mt-1 text-sm text-white-60">{meta}</p>
			</div>
			<ArrowRight
				className="size-4 shrink-0 translate-y-1 text-white-40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-brand-400"
				aria-hidden
			/>
		</Link>
	);
}
