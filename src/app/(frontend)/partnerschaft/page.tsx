import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { EditorialSplit } from "@/components/marketing/editorial-split";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MaterialOptions } from "@/components/marketing/material-options";
import { SectionDivider } from "@/components/marketing/section-divider";
import { PillButton } from "@/components/ui/pill-button";

export const metadata: Metadata = {
	title: "Partnerschaft · Muster Fenster",
	description:
		"B2B-Konditionen für Architekten, Bauträger und Hausbau-Unternehmen. Mengenrabatt, dedizierter Ansprechpartner, direkter DRUTEX-Kontakt — Musterstadt.",
};

/**
 * /partnerschaft — B2B-Hub für Architekten, Bauträger, Hausbau-Unternehmen.
 *
 * Struktur (Page-Rhythmus):
 *   1. MarketingHero (weiß)         — H1, B2B-Stats
 *   2. Profile (weiß)                — 3 Zielgruppen als MaterialOptions-Cards
 *   3. Konditionen (black-50)        — 4 Vorteile als 4-Col bordered FeatureGrid
 *   4. Showroom (weiß)               — Bemusterungs-Termin Editorial + CTA
 *   5. Aktuelle Partner (black-50)   — 4-Col Logo-Grid
 *   6. ContactCtaStripe (anfrage)    — Anfrage-Variante
 */
export default function PartnerschaftPage() {
	return (
		<>
			{/* HERO */}
			<MarketingHero
				breadcrumb={[{ label: "Start", href: "/" }, { label: "Partnerschaft" }]}
				eyebrow="Für Profis"
				headline={<>Architekten,</>}
				headlineHighlight="Bauträger, Bauherren."
				body="Wir arbeiten gerne mit Profis. Architekten bekommen maßgenaue CAD-Daten, Bauträger feste Mengenkonditionen, Hausbau-Unternehmen Standardpakete mit Vorab-Konfiguration. In jedem Fall: ein dedizierter Ansprechpartner, direkter Drutex-Werkskontakt, kurze Wege."
				stats={[
					{ label: "Konditionen", value: "B2B" },
					{ label: "Mengenrabatt", value: "ab 10 Stk" },
					{ label: "Zahlungsziel", value: "30 Tage" },
					{ label: "Ansprechpartner", value: "1 dediziert" },
				]}
			/>

			{/* PROFILE */}
			<ProfileSection />

			{/* KONDITIONEN */}
			<KonditionenSection />

			{/* SHOWROOM */}
			<ShowroomSection />

			{/* AKTUELLE PARTNER */}
			<PartnerSection />

			{/* CTA */}
			<ContactCtaStripe
				variant="anfrage"
				headline="Partner werden?"
				subline="Erstgespräch vereinbaren."
				body="Wir kommen vorbei, du kommst zu uns oder wir telefonieren — wie es passt."
			/>
		</>
	);
}

/* ──────────────────────────────────────────────────────────────────
   PROFILE — 3 Zielgruppen als MaterialOptions-Card-Grid
   ────────────────────────────────────────────────────────────────── */

function ProfileSection() {
	return (
		<section
			aria-labelledby="profile-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="profile-heading"
					eyebrow="Wer profitiert"
					headline={
						<>
							Drei
							<br />
							Profile.
						</>
					}
					body="Wir wissen, dass Architekten andere Daten brauchen als Bauträger, und Bauträger andere Termine als Hausbau-Unternehmen. Deshalb haben wir drei klare Wege."
				/>

				<MaterialOptions
					cols={3}
					options={[
						{
							name: "Architekten",
							tagline:
								"Maßgenaue CAD-Daten, Bemusterung im Showroom, technische Beratung von Profilserie bis U-Wert. Wir liefern, was du in deine Pläne einbauen kannst.",
							href: "/kontakt",
							subCategories: [
								"CAD-Daten",
								"Bemusterung",
								"U-Werte",
								"DIN-Normen",
							],
							imageSrc: "/images/products/fenster.jpg",
							imageAlt: "Architekt mit Bauplan im Showroom",
						},
						{
							name: "Bauträger",
							tagline:
								"Mengenkonditionen, feste Liefertermine im Bauablauf, koordinierte Anlieferung pro Bauabschnitt. Wir denken in deinem Zeitplan.",
							href: "/kontakt",
							subCategories: [
								"Mengenrabatt",
								"Termintreue",
								"Koordination",
								"30 Tage Ziel",
							],
							imageSrc: "/images/products/tueren.jpg",
							imageAlt: "Baustelle mit angelieferten Fenstern",
						},
						{
							name: "Hausbau-Unternehmen",
							tagline:
								"Standardpakete für wiederkehrende Haustypen, Vorab-Konfigurationen, Montage-Support. Du bekommst pro Hauslinie eine fertige Spec.",
							href: "/kontakt",
							subCategories: [
								"Standardpakete",
								"Vorab-Specs",
								"Montage",
								"Hauslinien",
							],
							imageSrc: "/images/products/rolllaeden.jpg",
							imageAlt: "Fertighaus mit eingebauten DRUTEX-Fenstern",
						},
					]}
				/>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   KONDITIONEN — 4 Vorteile als bordered FeatureGrid (dense)
   ────────────────────────────────────────────────────────────────── */

function KonditionenSection() {
	return (
		<section
			aria-labelledby="konditionen-heading"
			className="relative bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="konditionen-heading"
					eyebrow="Was wir bieten"
					headline={
						<>
							Gemeinsame Sprache,
							<br />
							klare Konditionen.
						</>
					}
					body="Keine versteckten Mindestmengen, keine Jahresumsatz-Ziele. Du bekommst die Konditionen, die zu deinem Projekt passen."
				/>

				<FeatureGrid
					size="dense"
					cardStyle="bordered"
					features={[
						{
							kicker: "Skaliert mit Volumen",
							title: "Mengenrabatt",
							body: "Ab 10 Stück pro Bestellung gestaffelte Konditionen. Bei größeren Bauprojekten: individueller Rahmenvertrag.",
						},
						{
							kicker: "Liquidität schonen",
							title: "30 Tage Zahlungsziel",
							body: "Standard-B2B-Zahlungsziel. Bei lang laufenden Projekten auch Teil-Rechnungen pro Bauabschnitt möglich.",
						},
						{
							kicker: "Eine Telefonnummer",
							title: "Dedizierter Ansprechpartner",
							body: "Du landest immer beim selben Menschen — der dein Projekt kennt, deine Pläne auf dem Tisch hat und Antworten gibt.",
						},
						{
							kicker: "Kurze Wege",
							title: "Direkter Drutex-Kontakt",
							body: "Bei Sondermaßen, Sonderfarben, Sonderprofilen klären wir direkt mit der Werkleitung in Bytów. Ohne Mail-Pingpong.",
						},
					]}
				/>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   SHOWROOM — Editorial + Body + CTA für Bemusterungs-Termin
   ────────────────────────────────────────────────────────────────── */

function ShowroomSection() {
	return (
		<section
			aria-labelledby="showroom-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="showroom-heading"
					eyebrow="Termin"
					headline={
						<>
							Bemusterung in
							<br />
							Musterstadt.
						</>
					}
				/>

				<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
					<div className="md:col-span-8">
						<div className="max-w-2xl space-y-6 text-lg leading-relaxed text-black-700">
							<p>
								Im Showroom Musterstraße stehen alle IGLO-Profilserien,
								die wichtigsten Drutex-Türen und ein Querschnitt der
								Beschlag-Welt zum Anfassen bereit. Du siehst, was du
								ausschreibst — und kannst es deinem Kunden zeigen, statt nur ein
								Datenblatt zu reichen.
							</p>
							<p>
								Termine machen wir individuell — auch außerhalb der regulären
								Showroom-Zeiten. Ruf einfach an, mail uns eine grobe Anforderung
								oder schick deinen Bauplan vorab. Wir bereiten dir vor Ort die
								relevanten Profile, Verglasungen und Farbproben vor.
							</p>
						</div>

						<div className="mt-10">
							<PillButton href="/kontakt" size="lg">
								Showroom-Termin anfragen
							</PillButton>
						</div>
					</div>

					<div className="md:col-span-4">
						<dl className="divide-y divide-black-200 border-y border-black-200">
							<div className="flex items-baseline justify-between gap-4 py-5">
								<dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
									Standort
								</dt>
								<dd className="text-right font-heading text-base font-medium tracking-tight text-black-950">
									Musterstadt
								</dd>
							</div>
							<div className="flex items-baseline justify-between gap-4 py-5">
								<dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
									Adresse
								</dt>
								<dd className="text-right font-mono text-sm text-black-950">
									Musterstraße 1
								</dd>
							</div>
							<div className="flex items-baseline justify-between gap-4 py-5">
								<dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
									Termin
								</dt>
								<dd className="text-right font-heading text-base font-medium tracking-tight text-black-950">
									Nach Absprache
								</dd>
							</div>
							<div className="flex items-baseline justify-between gap-4 py-5">
								<dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
									Sprachen
								</dt>
								<dd className="text-right font-heading text-base font-medium tracking-tight text-black-950">
									DE · PL
								</dd>
							</div>
						</dl>
					</div>
				</div>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   AKTUELLE PARTNER — 4-Col Logo-Grid mit Placeholder-Cards
   ────────────────────────────────────────────────────────────────── */

const PARTNERS = [
	{ label: "Architekt", note: "Beispielstadt · Mitte" },
	{ label: "Bauträger", note: "Musterstadt" },
	{ label: "Holzbau", note: "Potsdam · Umland" },
	{ label: "Sanierer", note: "Werder · Beelitz" },
	{ label: "Architekt", note: "Musterstadt" },
	{ label: "Bauträger", note: "Beispielstadt · Nord" },
	{ label: "Holzbau", note: "Rathenow · Westhavelland" },
	{ label: "Sanierer", note: "Potsdam · Babelsberg" },
];

function PartnerSection() {
	return (
		<section
			aria-labelledby="partner-heading"
			className="relative bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="partner-heading"
					eyebrow="Mit wem wir bauen"
					headline={
						<>
							Auszug aus
							<br />
							Projekten.
						</>
					}
					body="Architekturbüros, Bauträger, Sanierer und Hausbau-Unternehmen aus Beispielstadt und Musterstadt — anonymisiert, weil Diskretion Teil der Partnerschaft ist."
				/>

				<ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 md:gap-6">
					{PARTNERS.map((partner, i) => (
						<li
							key={partner.label}
							className="relative aspect-square rounded-2xl border border-black-200 bg-white p-6 transition-colors hover:border-brand-500"
						>
							<div className="flex h-full flex-col justify-between">
								<span className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-400 tabular-nums">
									{String(i + 1).padStart(2, "0")}
								</span>
								<div>
									<p className="font-heading text-lg font-medium tracking-tight text-black-950">
										{partner.label}
									</p>
									<p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
										{partner.note}
									</p>
								</div>
							</div>
						</li>
					))}
				</ul>
			</Container>
		</section>
	);
}
