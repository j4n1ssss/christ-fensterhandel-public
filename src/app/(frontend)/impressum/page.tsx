import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { SectionDivider } from "@/components/marketing/section-divider";

export const metadata: Metadata = {
	title: "Impressum · Muster Fenster",
	description:
		"Anbieterkennzeichnung nach § 5 TMG — Muster Fenster, Inhaber M. Mustermann, Musterstadt.",
};

/**
 * /impressum — Anbieterkennzeichnung nach § 5 TMG.
 *
 * Im Gegensatz zu Datenschutz / AGB / Widerruf ist das Impressum
 * gesetzlich vorgeschrieben und muss VOLLSTÄNDIG sichtbar sein.
 * Inhalt aus docs/website/relaunch/firmendaten.md.
 */
export default function ImpressumPage() {
	return (
		<>
			<MarketingHero
				breadcrumb={[{ label: "Start", href: "/" }, { label: "Impressum" }]}
				eyebrow="Rechtliches"
				headline={<>Impressum —</>}
				headlineHighlight="§ 5 TMG."
				body="Angaben gemäß § 5 Telemediengesetz und § 55 Rundfunkstaatsvertrag. Vollständige Anbieterkennzeichnung von Muster Fenster in Musterstadt."
				stats={[
					{ label: "Sitz", value: "Musterstadt" },
					{ label: "Rechtsform", value: "Einzelunternehmen" },
					{ label: "USt-IdNr.", value: "DE 000000000 (Beispiel)" },
				]}
			/>

			<section
				aria-labelledby="impressum-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
						<div className="md:col-span-4">
							<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
								Anbieter
							</p>
						</div>
						<div className="md:col-span-8 space-y-12">
							<LegalBlock label="Firma">
								Muster Fenster
								<br />
								Inhaber: M. Mustermann
							</LegalBlock>

							<LegalBlock label="Anschrift">
								Musterstraße 1
								<br />
								12345 Musterstadt
								<br />
								Deutschland
							</LegalBlock>

							<LegalBlock label="Kontakt">
								Telefon: +49 (0)30 000 000 00
								<br />
								E-Mail: info@example.com
							</LegalBlock>

							<LegalBlock label="Steuerliche Angaben">
								Umsatzsteuer-Identifikationsnummer (USt-IdNr.): DE 000000000 (Beispiel)
								<br />
								Steuernummer: 000/000/00000
							</LegalBlock>

							<LegalBlock label="Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV">
								M. Mustermann (Anschrift wie oben)
							</LegalBlock>

							<LegalBlock label="EU-Streitschlichtung">
								Wir sind zur Teilnahme an einem Streitbeilegungsverfahren vor
								einer Verbraucherschlichtungsstelle weder verpflichtet noch
								bereit.
							</LegalBlock>

							<LegalBlock label="Haftungshinweis">
								Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine
								Haftung für die Inhalte externer Links. Für den Inhalt der
								verlinkten Seiten sind ausschließlich deren Betreiber
								verantwortlich.
							</LegalBlock>
						</div>
					</div>
				</Container>
			</section>

			<ContactCtaStripe
				variant="anfrage"
				headline="Frage zum Impressum?"
				subline="Wir antworten direkt."
				body="Bei Anliegen rund um Anbieterkennzeichnung, Verantwortlichkeit oder rechtliche Themen schreib uns einfach kurz an."
			/>
		</>
	);
}

function LegalBlock({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="border-t border-black-200 pt-8">
			<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
				{label}
			</p>
			<div className="mt-4 text-base leading-relaxed text-black-800 md:text-lg">
				{children}
			</div>
		</div>
	);
}
