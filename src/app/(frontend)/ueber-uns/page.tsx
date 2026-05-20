import { Award, Hammer, Heart, RefreshCw } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { EditorialSplit } from "@/components/marketing/editorial-split";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { SectionDivider } from "@/components/marketing/section-divider";
import { PillButton } from "@/components/ui/pill-button";

export const metadata: Metadata = {
	title: "Über uns · Muster Fenster",
	description:
		"Familienbetrieb in Musterstadt, seit 1985. Drei Generationen, vier Ansprechpartner, exklusiver DRUTEX-Partner — Fenster und Türen als Handwerk.",
};

/**
 * /ueber-uns — Firmenporträt als editorial Marketing-Page.
 *
 * Struktur (Page-Rhythmus):
 *   1. MarketingHero (weiß)         — H1, Stats, Familienbetrieb-Claim
 *   2. Story (weiß)                  — 8/4-Editorial mit Body + Timeline-Marginalia
 *   3. Werte (black-50)              — 4 Prinzipien als bordered FeatureGrid
 *   4. Team (weiß)                   — 4 Personen-Cards mit Foto-Slot
 *   5. Drutex-Atmosphäre (black-950) — Brand-Glow Stripe als Hersteller-Bridge
 *   6. ContactCtaStripe (black-950)  — Default-Variante
 */
export default function UeberUnsPage() {
	return (
		<>
			{/* HERO */}
			<MarketingHero
				breadcrumb={[{ label: "Start", href: "/" }, { label: "Über uns" }]}
				eyebrow="Wer wir sind"
				headline={<>Handwerk,</>}
				headlineHighlight="kein Katalog."
				body="Muster Fenster ist ein inhabergeführter Familienbetrieb in Musterstadt. Drei Generationen, ein Standort, ein Hersteller. Wir bauen keine Massenware ein — jeder Auftrag ist ein eigenes Projekt, vermessen vor Ort, abgestimmt mit dir, kontrolliert per Hand. Das geht nicht im großen Stil. Genau das ist der Punkt."
				stats={[
					{ label: "Familienbetrieb", value: "1" },
					{ label: "Musterstadt seit", value: "1985" },
					{ label: "DRUTEX-Anteil", value: "100 %" },
					{ label: "Ansprechpartner", value: "4" },
				]}
			/>

			{/* STORY */}
			<StorySection />

			{/* WERTE */}
			<WerteSection />

			{/* TEAM */}
			<TeamSection />

			{/* DRUTEX-ATMOSPHERIC */}
			<DrutexAtmosphericSection />

			{/* CTA */}
			<ContactCtaStripe />
		</>
	);
}

/* ──────────────────────────────────────────────────────────────────
   STORY — 8/4-Split mit Body links und vertikaler Timeline rechts
   ────────────────────────────────────────────────────────────────── */

type TimelineEntry = {
	year: string;
	label: string;
};

const TIMELINE: TimelineEntry[] = [
	{ year: "1985", label: "Gründung" },
	{ year: "1995", label: "Showroom Musterstraße" },
	{ year: "2010", label: "DRUTEX exklusiv" },
	{ year: "2025", label: "Neue Konfigurator-Plattform" },
];

function StorySection() {
	return (
		<section
			aria-labelledby="story-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="story-heading"
					eyebrow="Geschichte"
					headline={
						<>
							Drei Generationen,
							<br />
							ein Standort.
						</>
					}
				/>

				<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
					{/* 8-Col Body */}
					<div className="md:col-span-8">
						<div className="max-w-2xl space-y-6 text-lg leading-relaxed text-black-700">
							<p>
								Angefangen hat alles 1985 als kleiner Baustoffhandel in
								Musterstadt. Damals noch mit Holzfenstern aus
								regionaler Schreinerei, einem Lkw und einer Telefonnummer. Was
								sich seitdem geändert hat: Material, Technik, Hersteller. Was
								geblieben ist: dass wir jeden Kunden persönlich kennen, dass Maß
								per Hand kontrolliert wird, dass Anfragen am selben Werktag eine
								Antwort bekommen.
							</p>
							<p>
								Heute führt M. Mustermann den Betrieb in zweiter Generation,
								gemeinsam mit drei langjährigen Mitarbeitern und Mitarbeiterin A. für
								die Technik. Wir verkaufen nicht aus dem Katalog — wir planen,
								vermessen, bauen ein und kommen wieder, wenn nach fünfzehn
								Jahren mal ein Beschlag hängt. Genau das ist der Unterschied
								zwischen Handel und Handwerk.
							</p>
						</div>
					</div>

					{/* 4-Col Marginalia: Timeline */}
					<div className="md:col-span-4">
						<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
							Meilensteine
						</p>
						<ol className="mt-8 space-y-8 border-l border-black-200 pl-6">
							{TIMELINE.map((entry) => (
								<li key={entry.year} className="relative">
									<span
										aria-hidden
										className="absolute -left-[27px] top-1.5 inline-block size-2.5 rounded-full bg-brand-500 ring-4 ring-white"
									/>
									<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-600 tabular-nums">
										{entry.year}
									</p>
									<p className="mt-2 font-heading text-lg font-medium leading-snug tracking-tight text-black-950">
										{entry.label}
									</p>
								</li>
							))}
						</ol>
					</div>
				</div>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   WERTE — 4 Prinzipien als bordered FeatureGrid (4-Col dense)
   ────────────────────────────────────────────────────────────────── */

function WerteSection() {
	return (
		<section
			aria-labelledby="werte-heading"
			className="relative bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="werte-heading"
					eyebrow="Was uns wichtig ist"
					headline={
						<>
							Vier
							<br />
							Prinzipien.
						</>
					}
					body="Handwerk lässt sich nicht in Werbesprüchen abbilden. Aber wir können sagen, woran wir gemessen werden wollen."
				/>

				<FeatureGrid
					size="dense"
					cardStyle="bordered"
					features={[
						{
							icon: <Hammer className="size-5" aria-hidden />,
							title: "Handwerk",
							body: "Jedes Maß per Hand kontrolliert. Keine automatisierte Freigabe, keine blinde Bestellung — wir lesen jede Konfiguration.",
						},
						{
							icon: <Heart className="size-5" aria-hidden />,
							title: "Persönlich",
							body: "Vier Ansprechpartner, kein Callcenter. Du landest beim ersten Anruf direkt bei dem, der dir weiterhilft.",
						},
						{
							icon: <Award className="size-5" aria-hidden />,
							title: "Kompromisslos",
							body: "Wir kennen den Hersteller. Wir wissen, wo es herkommt. Und wir verkaufen nichts, was wir uns nicht selbst einbauen würden.",
						},
						{
							icon: <RefreshCw className="size-5" aria-hidden />,
							title: "Langfristig",
							body: "Ersatzteile noch nach fünfzehn Jahren. Wer mit DRUTEX arbeitet, weiß: Profile, Beschläge und Dichtungen bleiben verfügbar.",
						},
					]}
				/>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   TEAM — 4 Personen mit Initialen-Avatar als Foto-Slot
   ────────────────────────────────────────────────────────────────── */

type TeamMember = {
	initials: string;
	name: string;
	role: string;
	responsibility: string;
	bio: string;
};

const TEAM: TeamMember[] = [
	{
		initials: "FC",
		name: "Mitarbeiterin A.",
		role: "Technik & Neubestellungen",
		responsibility: "Konfiguration · Maßaufnahme",
		bio: "Begleitet jede Bestellung von der ersten Frage bis zur Werks-Freigabe. Bei technischen Details der erste Anruf.",
	},
	{
		initials: "HB",
		name: "Mitarbeiter B.",
		role: "Transport & Lieferung",
		responsibility: "Spedition · Auslieferung",
		bio: "Plant Touren, koordiniert Termine, fährt selber. Kennt jede Adresse zwischen Beispielstadt und Musterhausen auswendig.",
	},
	{
		initials: "HR",
		name: "Mitarbeiterin C.",
		role: "Lager & Bestand",
		responsibility: "Lagerware · Verfügbarkeit",
		bio: "Weiß bei Lagerware sofort, was da ist, was kommt und in welcher Höhe. Das spart bei dringenden Anfragen Tage.",
	},
	{
		initials: "HB",
		name: "Mitarbeiter D.",
		role: "Einbau & Montage",
		responsibility: "Vor-Ort-Termine · Montage",
		bio: "Baut selber ein. Vermisst auf Wunsch vor Ort und macht das Fenster dicht — auch im Altbau mit krummen Wandungen.",
	},
];

function TeamSection() {
	return (
		<section
			aria-labelledby="team-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="team-heading"
					eyebrow="Vier Personen"
					headline={
						<>
							Das
							<br />
							Team.
						</>
					}
					body="Klein genug, dass jeder jeden Auftrag kennt. Groß genug, dass immer jemand erreichbar ist."
				/>

				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
					{TEAM.map((member) => (
						<li
							key={member.name}
							className="rounded-2xl border border-black-200 bg-white p-8"
						>
							{/* Foto-Slot mit Mono-Initialen */}
							<div
								aria-hidden
								className="flex size-24 items-center justify-center rounded-full bg-black-100"
							>
								<span className="font-mono text-sm uppercase tracking-[0.25em] text-black-700 tabular-nums">
									{member.initials}
								</span>
							</div>

							<p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
								{member.responsibility}
							</p>
							<h3 className="mt-3 font-heading text-2xl font-medium tracking-tight text-black-950">
								{member.name}
							</h3>
							<p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-600">
								{member.role}
							</p>
							<p className="mt-4 text-base leading-relaxed text-black-600">
								{member.bio}
							</p>
						</li>
					))}
				</ul>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   DRUTEX-ATMOSPHERIC — Black-950 Stripe mit Brand-Glow
   ────────────────────────────────────────────────────────────────── */

const DRUTEX_FACTS = [
	{ label: "Gegründet", value: "1985" },
	{ label: "Standort", value: "Polen" },
	{ label: "Output", value: "3 Mio+" },
	{ label: "Zertifizierung", value: "ISO 9001" },
];

function DrutexAtmosphericSection() {
	return (
		<section
			aria-labelledby="drutex-bridge-heading"
			className="relative overflow-hidden bg-black-950 py-24 text-white-80 md:py-32"
		>
			<SectionDivider invert />

			{/* Brand-Glow */}
			<div
				aria-hidden
				className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl"
				style={{
					background:
						"radial-gradient(circle, var(--color-brand-600) 0%, transparent 70%)",
					opacity: 0.35,
				}}
			/>

			<Container size="xl">
				<div className="relative grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
					<div className="lg:col-span-7">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-400">
							Hersteller
						</p>

						<h2
							id="drutex-bridge-heading"
							className="mt-4 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-white-100 md:text-5xl lg:text-7xl"
						>
							Wir bauen
							<br />
							<span className="text-brand-400">DRUTEX ein.</span>
						</h2>

						<div className="mt-10 max-w-2xl space-y-5 text-lg leading-relaxed text-white-80">
							<p>
								Seit 2010 arbeiten wir exklusiv mit DRUTEX. Ein
								Familienunternehmen aus Bytów, Polen, das jedes Profil selber
								extrudiert, jedes Glas selber laminiert und jeden Beschlag
								selber montiert. Vertikal integriert, ISO 9001, drei Millionen
								Fenster pro Jahr — und trotzdem fertigt jedes einzelne nach
								deinen Maßen.
							</p>
							<p>
								Wir kennen die Werkhalle. Wir wissen, wer die Endabnahme macht.
								Und genau deshalb können wir dir auch nach fünfzehn Jahren noch
								sagen, welche Dichtung in deinem Fenster steckt.
							</p>
						</div>

						<div className="mt-10">
							<PillButton href="/ueber-uns/drutex" size="lg">
								Zum Drutex-Profil
							</PillButton>
						</div>
					</div>

					{/* Facts */}
					<div className="lg:col-span-5 lg:pt-4">
						<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white-60">
							In Zahlen
						</p>
						<dl className="mt-8 divide-y divide-white-10">
							{DRUTEX_FACTS.map((fact) => (
								<div
									key={fact.label}
									className="flex items-baseline justify-between gap-6 py-5"
								>
									<dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-white-60">
										{fact.label}
									</dt>
									<dd className="font-heading text-2xl font-medium tabular-nums tracking-tight text-white-100 md:text-3xl">
										{fact.value}
									</dd>
								</div>
							))}
						</dl>
					</div>
				</div>
			</Container>
		</section>
	);
}
