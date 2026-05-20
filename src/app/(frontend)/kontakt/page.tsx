import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { EditorialSplit } from "@/components/marketing/editorial-split";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { SectionDivider } from "@/components/marketing/section-divider";

export const metadata: Metadata = {
	title: "Kontakt · Muster Fenster",
	description:
		"Telefon, WhatsApp, E-Mail, Showroom und Ansprechpartner — Beratung auf Deutsch oder Polnisch in Musterstadt.",
};

/**
 * /kontakt — Kontakt-Hub mit allen Wegen, Ansprechpartnern und Showroom-Info.
 *
 * Struktur (Page-Rhythmus):
 *   1. MarketingHero (weiß)          — Breadcrumb, H1, Stats
 *   2. Wege (weiß)                    — 4-Col bordered FeatureGrid (Tel/WhatsApp/Mail/Showroom)
 *   3. Ansprechpartner (black-50)     — 4-Col Person-Cards mit Tel + Mail
 *   4. Öffnungszeiten (weiß)          — 5/7-Split mit Editorial links + 2 Tabellen rechts
 *   5. Showroom (black-50)            — EditorialSplit + 7/5-Split mit Map-Placeholder
 *   6. ContactCtaStripe (black-950)   — Default-Variante
 */
export default function KontaktPage() {
	return (
		<>
			{/* ═══════ HERO ═══════ */}
			<MarketingHero
				breadcrumb={[{ label: "Start", href: "/" }, { label: "Kontakt" }]}
				eyebrow="Kontakt"
				headline={
					<>
						Komm vorbei,
						<br />
						ruf an
					</>
				}
				headlineHighlight="oder schreib."
				body="Beratung im Showroom, Maßaufnahme vor Ort oder einfach ein ehrliches Gespräch. Wir nehmen uns Zeit — auf Deutsch oder Polnisch."
				stats={[
					{ label: "Showroom", value: "Fr 10–17" },
					{ label: "Erreichbar", value: "24/7" },
					{ label: "Antwort", value: "selber Werktag" },
				]}
			/>

			{/* ═══════ WEGE — 4 KONTAKT-KANAELE ═══════ */}
			<WegeSection />

			{/* ═══════ ANSPRECHPARTNER — 4 PERSONEN ═══════ */}
			<AnsprechpartnerSection />

			{/* ═══════ OEFFNUNGSZEITEN — 5/7-SPLIT ═══════ */}
			<OeffnungszeitenSection />

			{/* ═══════ SHOWROOM — MAP-PLACEHOLDER + ADRESSE ═══════ */}
			<ShowroomSection />

			{/* ═══════ KONTAKT-CTA ═══════ */}
			<ContactCtaStripe />
		</>
	);
}

/* ──────────────────────────────────────────────────────────────────
   WEGE — 4-Col Kontakt-Kanaele als bordered FeatureGrid
   ────────────────────────────────────────────────────────────────── */

function WegeSection() {
	return (
		<section
			aria-labelledby="wege-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="wege-heading"
					eyebrow="So erreichst du uns"
					headline={<>Direkt, schnell, persönlich.</>}
					body="Vier Wege, ein Team. Suche dir aus, was dir am leichtesten fällt — wir antworten überall."
				/>

				<FeatureGrid
					size="dense"
					cardStyle="bordered"
					features={[
						{
							icon: <Phone className="size-5" aria-hidden />,
							kicker: "Telefon",
							title: "+49 (0)30 000 000 00",
							body: "24/7 erreichbar. Persönliche Beratung, schnelle Antwort.",
						},
						{
							icon: <MessageCircle className="size-5" aria-hidden />,
							kicker: "WhatsApp",
							title: "0000 000 000 11",
							body: "Nur Nachrichten — keine Anrufe. Ideal für Fotos und Maße.",
						},
						{
							icon: <Mail className="size-5" aria-hidden />,
							kicker: "E-Mail",
							title: "info@example.com",
							body: "Antwort am selben Werktag. Anhänge bis 20 MB willkommen.",
						},
						{
							icon: <MapPin className="size-5" aria-hidden />,
							kicker: "Showroom",
							title: "Musterstraße 1",
							body: "12345 Musterstadt. Freitags geöffnet.",
						},
					]}
				/>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   ANSPRECHPARTNER — 4 Person-Cards
   ────────────────────────────────────────────────────────────────── */

type Contact = {
	responsibility: string;
	name: string;
	role: string;
	tel: string;
	telDisplay: string;
};

const CONTACTS: Contact[] = [
	{
		responsibility: "Zuständig für technische Fragen",
		name: "Mitarbeiterin A.",
		role: "Technische Beratung und Neubestellungen — Profile, Glas, Konfiguration.",
		tel: "+4900000000011",
		telDisplay: "0000 000 000 11",
	},
	{
		responsibility: "Zuständig für Transport",
		name: "Mitarbeiter B.",
		role: "Lieferung Lagerware, Transportplanung und Avisierung deiner Bestellung.",
		tel: "+4900000000022",
		telDisplay: "0000 000 000 22",
	},
	{
		responsibility: "Zuständig für Lager",
		name: "Mitarbeiterin C.",
		role: "Verfügbarer Lagerbestand, Sofortabholung und Reservierungen.",
		tel: "+4900000000011",
		telDisplay: "0000 000 000 11",
	},
	{
		responsibility: "Zuständig für Einbau",
		name: "Mitarbeiter D.",
		role: "Aufmaß vor Ort, Montage und Koordination mit dem Bauherrn.",
		tel: "+4900000000044",
		telDisplay: "0000 000 000 44",
	},
];

function AnsprechpartnerSection() {
	return (
		<section
			aria-labelledby="ansprechpartner-heading"
			className="relative bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="ansprechpartner-heading"
					eyebrow="Wer hilft wobei?"
					headline={
						<>
							Vier Personen,
							<br />
							ein Team.
						</>
					}
					body="Du landest direkt bei dem, der dir am besten weiterhilft. Falls jemand nicht da ist — Nachricht hinterlassen reicht, wir rufen zurück."
				/>

				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
					{CONTACTS.map((c) => (
						<li
							key={c.name}
							className="rounded-2xl border border-black-200 bg-white p-8"
						>
							<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
								{c.responsibility}
							</p>
							<h3 className="mt-3 font-heading text-2xl font-medium tracking-tight text-black-950">
								{c.name}
							</h3>
							<p className="mt-3 text-base leading-relaxed text-black-600">
								{c.role}
							</p>

							<div className="mt-6 space-y-2 border-t border-black-100 pt-5">
								<a
									href={`tel:${c.tel}`}
									className="group flex items-center gap-2 font-mono text-sm tabular-nums text-black-700 transition-colors hover:text-brand-700"
								>
									<Phone
										className="size-3.5 text-black-400 group-hover:text-brand-600"
										aria-hidden
									/>
									{c.telDisplay}
								</a>
								<a
									href="mailto:info@example.com"
									className="group flex items-center gap-2 font-mono text-sm text-black-700 transition-colors hover:text-brand-700"
								>
									<Mail
										className="size-3.5 text-black-400 group-hover:text-brand-600"
										aria-hidden
									/>
									info@example.com
								</a>
							</div>
						</li>
					))}
				</ul>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   OEFFNUNGSZEITEN — 5/7-Split: Editorial links, 2 Tabellen rechts
   ────────────────────────────────────────────────────────────────── */

function OeffnungszeitenSection() {
	return (
		<section
			aria-labelledby="oeffnungszeiten-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
					{/* Links — Kicker + H2 + Body */}
					<div className="md:col-span-5">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
							Showroom
						</p>
						<h2
							id="oeffnungszeiten-heading"
							className="mt-6 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl"
						>
							Wann wir
							<br />
							da sind.
						</h2>
						<p className="mt-6 max-w-md text-lg leading-relaxed text-black-600">
							Voranmeldung bevorzugt — dann ist sicher jemand vor Ort und nimmt
							sich Zeit für dein Projekt. Außerhalb der Showroom-Zeiten sind wir
							per Telefon und Mail erreichbar.
						</p>
						<p className="mt-6 max-w-md text-base leading-relaxed text-black-700">
							Bis 20:00 Uhr nach Voranmeldung möglich.
						</p>
					</div>

					{/* Rechts — 2 Tabellen */}
					<div className="md:col-span-7">
						<div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12">
							{/* Tabelle 1 — Regulaer 2026 */}
							<div>
								<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
									Regulär 2026
								</p>
								<dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 font-mono text-sm tabular-nums">
									<dt className="text-black-400">Mo</dt>
									<dd className="text-black-400">geschlossen</dd>
									<dt className="text-black-400">Di</dt>
									<dd className="text-black-400">geschlossen</dd>
									<dt className="text-black-400">Mi</dt>
									<dd className="text-black-400">geschlossen</dd>
									<dt className="text-black-400">Do</dt>
									<dd className="text-black-400">geschlossen</dd>
									<dt className="text-black-950">Fr</dt>
									<dd className="text-black-950">10:00 – 17:00</dd>
									<dt className="text-black-400">Sa</dt>
									<dd className="text-black-400">geschlossen</dd>
									<dt className="text-black-400">So</dt>
									<dd className="text-black-400">geschlossen</dd>
								</dl>
								<p className="mt-5 border-t border-black-100 pt-4 text-xs leading-relaxed text-black-600">
									Außerhalb davon: 24/7 per Telefon & Mail.
								</p>
							</div>

							{/* Tabelle 2 — Sonderschliessungen */}
							<div>
								<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
									Sonderschließungen
								</p>
								<dl className="mt-5 space-y-4 font-mono text-sm tabular-nums text-black-700">
									<div>
										<dt className="text-black-950">23.03.–22.04.</dt>
										<dd className="mt-1 text-black-500">Inventur</dd>
									</div>
									<div>
										<dt className="text-black-950">01.08.–31.08.</dt>
										<dd className="mt-1 text-black-500">Sommerpause</dd>
									</div>
									<div>
										<dt className="text-black-950">ab 11.12.</dt>
										<dd className="mt-1 text-black-500">
											Winterpause bis April 2027
										</dd>
									</div>
								</dl>
								<p className="mt-5 border-t border-black-100 pt-4 text-xs leading-relaxed text-black-600">
									Bestellungen laufen weiter — Fertigung pausiert.
								</p>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   SHOWROOM — Map-Placeholder + Adress-Block
   ────────────────────────────────────────────────────────────────── */

function ShowroomSection() {
	return (
		<section
			aria-labelledby="showroom-heading"
			className="relative bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="showroom-heading"
					eyebrow="Vor Ort"
					headline={<>Musterstraße 1.</>}
					body="Unser Showroom in Musterstadt — DRUTEX-Profile zum Anfassen, Glas-Aufbauten zum Testen, Beschläge zum Ausprobieren. Persönliche Beratung ohne Termin-Stress."
				/>

				<div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
					{/* Map-Placeholder */}
					<div className="md:col-span-7">
						<div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-black-100">
							{/* Dezentes Raster-Pattern */}
							<div
								aria-hidden
								className="absolute inset-0 opacity-[0.5]"
								style={{
									backgroundImage:
										"linear-gradient(var(--color-black-200) 1px, transparent 1px), linear-gradient(90deg, var(--color-black-200) 1px, transparent 1px)",
									backgroundSize: "40px 40px",
								}}
							/>
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="flex flex-col items-center gap-3 text-center">
									<span
										aria-hidden
										className="flex size-12 items-center justify-center rounded-full border border-black-300 bg-white"
									>
										<MapPin className="size-5 text-brand-600" />
									</span>
									<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
										Karte wird mit Cookie-Consent geladen
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Adresse + Anfahrt */}
					<div className="md:col-span-5">
						<div className="space-y-10">
							<div>
								<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
									Adresse
								</p>
								<address className="mt-3 not-italic font-heading text-2xl leading-tight tracking-tight text-black-950 md:text-3xl">
									Muster Fenster
									<br />
									Musterstraße 1
									<br />
									12345 Musterstadt
								</address>
								<Link
									href="https://www.google.com/maps/search/?api=1&query=Musterstrasse+1+12345+Musterstadt"
									target="_blank"
									rel="noopener noreferrer"
									className="group mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-700 transition-colors hover:text-brand-600"
								>
									Route in Google Maps öffnen
									<ArrowUpRight
										className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
										aria-hidden
									/>
								</Link>
							</div>

							<div>
								<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
									Anfahrt
								</p>
								<ul className="mt-3 space-y-2 text-base leading-relaxed text-black-700">
									<li>S-Bahn Musterstadt Hbf · 8 Min Auto</li>
									<li>A1 Abfahrt Musterstadt · 12 Min</li>
									<li>Parkplätze direkt am Hof</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
