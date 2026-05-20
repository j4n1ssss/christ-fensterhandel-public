import type * as React from "react";
import { AlertCircle } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { SectionDivider } from "@/components/marketing/section-divider";

/**
 * LegalPlaceholder — Konsistenter Platzhalter für rechtliche Seiten,
 * solange der finale juristische Text noch nicht eingepflegt ist.
 *
 * Layout-Pattern:
 *   1. MarketingHero (Editorial Hero mit Status-Stats)
 *   2. Hinweis-Section (border-l-4 border-brand-500 Notice)
 *   3. ContactCtaStripe (Anfrage-Variante)
 */

interface LegalPlaceholderProps {
	/** Sichtbarer Page-Titel (H1). */
	title: React.ReactNode;
	/** Brand-Highlight am Ende der Headline. */
	titleHighlight?: string;
	/** Mono-Eyebrow über der H1. */
	eyebrow: string;
	/** Body-Lead unter der H1. */
	body: React.ReactNode;
	/** Breadcrumb-Label für die aktuelle Seite. Erstes Item ist immer "Start". */
	breadcrumbLabel: string;
	/** Eyebrow der Hinweis-Section. */
	noticeEyebrow?: string;
	/** Headline der Hinweis-Section. */
	noticeHeadline?: React.ReactNode;
	/** Body der Hinweis-Section. */
	noticeBody?: React.ReactNode;
}

export function LegalPlaceholder({
	title,
	titleHighlight,
	eyebrow,
	body,
	breadcrumbLabel,
	noticeEyebrow = "Hinweis",
	noticeHeadline = (
		<>
			Dieser Text wird
			<br />
			derzeit erstellt.
		</>
	),
	noticeBody = "Bis die finale Fassung online steht, gelten die gesetzlichen Standards. Bei konkreten Fragen — vor allem zu Datenverarbeitung, Vertragsbedingungen oder Widerrufsrecht — sprich uns direkt an. Wir antworten auf E-Mails am selben Werktag.",
}: LegalPlaceholderProps) {
	return (
		<>
			<MarketingHero
				breadcrumb={[{ label: "Start", href: "/" }, { label: breadcrumbLabel }]}
				eyebrow={eyebrow}
				headline={title}
				headlineHighlight={titleHighlight}
				body={body}
				stats={[
					{ label: "Status", value: "in Vorbereitung" },
					{ label: "Stand", value: "April 2026" },
					{ label: "Frage?", value: "siehe Kontakt" },
				]}
			/>

			<section
				aria-labelledby="legal-notice-heading"
				className="relative bg-black-50 py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
						<div className="md:col-span-4">
							<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
								{noticeEyebrow}
							</p>
						</div>
						<div className="md:col-span-8">
							<div className="rounded-2xl border-l-4 border-brand-500 bg-white p-8 md:p-10">
								<div className="flex items-start gap-4">
									<span
										aria-hidden
										className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"
									>
										<AlertCircle className="size-5" />
									</span>
									<div className="flex-1">
										<h2
											id="legal-notice-heading"
											className="font-heading text-2xl font-medium tracking-tight text-black-950 md:text-3xl"
										>
											{noticeHeadline}
										</h2>
										<p className="mt-4 text-base leading-relaxed text-black-600 md:text-lg">
											{noticeBody}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Container>
			</section>

			<ContactCtaStripe
				variant="anfrage"
				headline="Konkrete Frage?"
				subline="Direkt anrufen reicht."
				body="Datenschutz, Vertragsbedingungen oder Widerruf — wir kennen die Antworten und liefern sie verbindlich. Schriftlich oder mündlich, wie es dir passt."
			/>
		</>
	);
}
