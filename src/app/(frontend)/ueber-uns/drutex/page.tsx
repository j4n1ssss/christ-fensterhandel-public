import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { EditorialSplit } from "@/components/marketing/editorial-split";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { SectionDivider } from "@/components/marketing/section-divider";
import { SpecList } from "@/components/marketing/spec-list";
import { PillButton } from "@/components/ui/pill-button";

export const metadata: Metadata = {
	title: "DRUTEX · Hersteller-Profil · Muster Fenster",
	description:
		"Polens größter Fensterhersteller — gegründet 1985, drei Millionen Fenster pro Jahr, 60.000 m2 Werk in Bytów, ISO 9001. Warum wir exklusiv mit DRUTEX bauen.",
};

/**
 * /ueber-uns/drutex — Hersteller-Profil DRUTEX.
 *
 * Struktur (Page-Rhythmus):
 *   1. MarketingHero (weiß)          — H1, Stats DRUTEX
 *   2. Profil (weiß)                  — 8/4-Editorial mit Body + Image-Marginalia
 *   3. IGLO-Profile (black-50)        — 6 IGLO-Serien als 3-Col bordered FeatureGrid
 *   4. Werk in Zahlen (weiß)          — SpecList stacked
 *   5. Warum exklusiv (black-50)      — 5/7-Split Editorial + 4 Sub-Punkte
 *   6. Atmospheric (black-950)        — CTA-Bridge zum Konfigurator
 *   7. ContactCtaStripe (black-950)   — Default-Variante
 */
export default function DrutexProfilPage() {
	return (
		<>
			{/* HERO */}
			<MarketingHero
				breadcrumb={[
					{ label: "Start", href: "/" },
					{ label: "Über uns", href: "/ueber-uns" },
					{ label: "DRUTEX" },
				]}
				eyebrow="Hersteller-Profil"
				headline={<>DRUTEX —</>}
				headlineHighlight="Polens größter Fensterhersteller."
				body="Gegründet 1985 im pommerschen Bytów, heute Europas große Adresse für PVC- und Aluminium-Fenster. Vertikal integriert, ISO 9001 zertifiziert, drei Millionen Fenster pro Jahr aus einem 60.000 m2 großen Werk. Wir bauen ausschließlich DRUTEX ein — weil wir den Hersteller kennen, nicht nur den Lieferschein."
				stats={[
					{ label: "Gegründet", value: "1985" },
					{ label: "Output / Jahr", value: "3 Mio+" },
					{ label: "Werksfläche", value: "60.000 m2" },
					{ label: "Zertifizierung", value: "ISO 9001" },
				]}
			/>

			{/* PROFIL */}
			<ProfilSection />

			{/* IGLO-PROFILE */}
			<ProfileSection />

			{/* WERK IN ZAHLEN */}
			<WerkSection />

			{/* WARUM EXKLUSIV */}
			<WarumSection />

			{/* ATMOSPHERIC CTA-BRIDGE */}
			<AtmosphericSection />

			{/* CTA */}
			<ContactCtaStripe />
		</>
	);
}

/* ──────────────────────────────────────────────────────────────────
   PROFIL — 8/4-Split mit Body links, Image-Placeholder rechts
   ────────────────────────────────────────────────────────────────── */

function ProfilSection() {
	return (
		<section
			aria-labelledby="profil-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="profil-heading"
					eyebrow="Profil"
					headline={
						<>
							Bytów, Polen —
							<br />
							seit 1985.
						</>
					}
				/>

				<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
					<div className="md:col-span-8">
						<div className="max-w-2xl space-y-6 text-lg leading-relaxed text-black-700">
							<p>
								DRUTEX wurde 1985 als kleiner Drahtwarenbetrieb in der
								pommerschen Provinz gegründet. Aus dem Drahtgeflecht von damals
								ist ein Konzern geworden, der heute drei Millionen Fenster
								jährlich produziert — und trotzdem in zweiter Generation
								Familienunternehmen geblieben ist.
							</p>
							<p>
								Was DRUTEX besonders macht: vertikale Integration. Profile
								werden im eigenen Werk extrudiert, Glas im eigenen
								Floatglas-Werk laminiert, Beschläge im eigenen Werkzeugbau
								montiert. Keine Zwischenhändler, keine Subunternehmer — und
								damit kein Glied in der Kette, das schwach wird.
							</p>
							<p>
								Mehr als 3.000 Mitarbeiter, über 60 Exportländer, ISO 9001 seit
								über zwei Jahrzehnten. Trotzdem bleibt die Endabnahme jedes
								einzelnen Fensters eine Hand-Prüfung. Genau dieser Anspruch ist
								der Grund, warum wir exklusiv mit DRUTEX bauen.
							</p>
						</div>
					</div>

					<div className="md:col-span-4">
						<figure>
							<div
								aria-hidden
								className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black-100"
							>
								<div className="absolute inset-x-6 bottom-6">
									<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
										Werk Bytów
									</p>
									<p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-black-400">
										Pommern · Polen
									</p>
								</div>
							</div>
							<figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
								Hauptwerk · 60.000 m2
							</figcaption>
						</figure>
					</div>
				</div>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   IGLO-PROFILE — 6 Serien als bordered FeatureGrid
   ────────────────────────────────────────────────────────────────── */

const IGLO_PROFILES = [
	{
		kicker: "U-Wert ab 1.3",
		title: "IGLO 5 Classic",
		body: "Standard-Profilserie für Neubau und Sanierung. 5-Kammer, 70 mm Bautiefe, gute Dämmwerte zum fairen Preis.",
	},
	{
		kicker: "U-Wert ab 0.7",
		title: "IGLO Energy",
		body: "Hochdämmendes 6-Kammer-Profil mit 82 mm Bautiefe. Für KfW-Effizienzhaus-Standard und Passivhaus.",
	},
	{
		kicker: "Schmal · 76 mm",
		title: "IGLO Edge",
		body: "Schlanke Optik mit kantigem Profil. Ideal für moderne Architektur, große Glasflächen, klare Linien.",
	},
	{
		kicker: "Mehr Licht",
		title: "IGLO Light",
		body: "Reduzierte Profilbreite für maximalen Lichteinfall. Perfekt bei kleinen Öffnungen oder Nordseiten.",
	},
	{
		kicker: "Außen Aluminium",
		title: "IGLO EXT",
		body: "PVC-Kern mit Aluminium-Schale außen. Wetterfest wie Alu, dämmend wie PVC, wartungsarm.",
	},
	{
		kicker: "U-Wert ab 0.6",
		title: "IGLO Energy Alucover",
		body: "Top-Dämmung kombiniert mit Aluminium-Außenschale. Die Premium-Wahl für Effizienzhäuser mit Anspruch an Optik.",
	},
];

function ProfileSection() {
	return (
		<section
			aria-labelledby="profile-heading"
			className="relative bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="profile-heading"
					eyebrow="IGLO-Familie"
					headline={
						<>
							Sechs
							<br />
							Profilserien.
						</>
					}
					body="Von Standard bis Passivhaus — die IGLO-Familie deckt jeden Bauanspruch ab. Wir beraten dich, welche Serie zu deinem Projekt passt."
				/>

				<FeatureGrid
					cardStyle="bordered"
					features={IGLO_PROFILES.map((p) => ({
						kicker: p.kicker,
						title: p.title,
						body: p.body,
					}))}
				/>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   WERK IN ZAHLEN — SpecList stacked
   ────────────────────────────────────────────────────────────────── */

function WerkSection() {
	return (
		<section
			aria-labelledby="werk-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="werk-heading"
					eyebrow="Skala"
					headline={
						<>
							Was 60.000 m2
							<br />
							bedeuten.
						</>
					}
					body="Fenster-Produktion in Industriegröße — und trotzdem mit Hand-Endabnahme. Die Zahlen, die DRUTEX zu DRUTEX machen."
				/>

				<SpecList
					layout="stacked"
					items={[
						{
							label: "Mitarbeiter",
							value: "3.000+",
							note: "Eigene Belegschaft, kein Zeitarbeit-Modell",
						},
						{
							label: "Produktionsfläche",
							value: "60.000 m2",
							note: "Werk Bytów, Pommern",
						},
						{
							label: "Output pro Jahr",
							value: "3 Mio+",
							note: "Fenster und Türen",
						},
						{ label: "Märkte", value: "60+", note: "Länder weltweit" },
						{
							label: "Zertifizierung",
							value: "ISO 9001",
							note: "Seit über 20 Jahren",
						},
						{
							label: "Vertikale Integration",
							value: "100 %",
							note: "Profil, Glas, Beschlag im Haus",
						},
					]}
				/>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   WARUM EXKLUSIV — 5/7-Split Editorial + 4 Sub-Punkte als 1-Col Grid
   ────────────────────────────────────────────────────────────────── */

function WarumSection() {
	return (
		<section
			aria-labelledby="warum-heading"
			className="relative bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
					{/* 5-Col Editorial links */}
					<div className="md:col-span-5">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
							Partnerschaft
						</p>
						<h2
							id="warum-heading"
							className="mt-6 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl"
						>
							Wir kaufen
							<br />
							nicht ein.
							<br />
							<span className="text-brand-500">Wir partnern.</span>
						</h2>

						<div className="mt-8 max-w-md space-y-5 text-base leading-relaxed text-black-700">
							<p>
								Exklusiv heißt bei uns nicht "alleiniger Vertrieb" — exklusiv
								heißt, dass wir uns auf einen Hersteller festlegen und damit
								Verantwortung übernehmen.
							</p>
							<p>
								Wir kennen die Werkleitung in Bytów persönlich. Wir wissen, wann
								ein Profil vom Band kommt. Und wir können Sonderwünsche direkt
								klären, statt sie über drei Zwischenhändler zu schicken.
							</p>
							<p>
								Diese Nähe gibt es nicht im Mehr-Hersteller-Geschäft. Genau
								deshalb haben wir uns 2010 für DRUTEX entschieden — und seitdem
								nichts anderes mehr eingebaut.
							</p>
						</div>
					</div>

					{/* 7-Col FeatureGrid 1-Col bordered */}
					<div className="md:col-span-7">
						<ul className="space-y-5">
							{[
								{
									title: "Direkter Werks-Kontakt",
									body: "Bei Sonderfarben, Sondermaßen oder technischen Details greifen wir direkt zur Werkleitung — keine Mail-Schleife über Distributoren.",
								},
								{
									title: "Lieferzeit-Sicherheit",
									body: "Weil wir feste Produktions-Slots haben, können wir verlässliche Termine zusagen. Auch in der Hochsaison.",
								},
								{
									title: "Service auch nach Jahren",
									body: "Ersatzbeschläge, Ersatzdichtungen, Ersatzflügel — DRUTEX produziert Profile über Jahrzehnte, wir bekommen Teile noch für Fenster aus 2010.",
								},
								{
									title: "Eine Lieferkette, ein Ansprechpartner",
									body: "Du redest bei jedem Detail mit einem von uns vier — wir reden direkt mit DRUTEX. Keine Schwarze-Peter-Spiele zwischen Vertrieb und Werk.",
								},
							].map((item) => (
								<li
									key={item.title}
									className="rounded-2xl border border-black-200 bg-white p-8 md:p-10"
								>
									<h3 className="font-heading text-xl font-medium tracking-tight text-black-950 md:text-2xl">
										{item.title}
									</h3>
									<p className="mt-3 text-base leading-relaxed text-black-600">
										{item.body}
									</p>
								</li>
							))}
						</ul>
					</div>
				</div>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   ATMOSPHERIC — Black-950 mit Brand-Glow als CTA-Bridge zum Konfigurator
   ────────────────────────────────────────────────────────────────── */

function AtmosphericSection() {
	return (
		<section
			aria-labelledby="atmospheric-heading"
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
				<div className="relative grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
					<div className="lg:col-span-8">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-400">
							Nächster Schritt
						</p>

						<h2
							id="atmospheric-heading"
							className="mt-4 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-white-100 md:text-5xl lg:text-6xl"
						>
							Bereit, ein
							<br />
							<span className="text-brand-400">Drutex-Fenster zu bauen?</span>
						</h2>

						<p className="mt-8 max-w-xl text-base leading-relaxed text-white-80 md:text-lg">
							Profilserie, Verglasung, Farbe, Beschlag — der Konfigurator führt
							dich in fünf Minuten durch jede Entscheidung. Und am Ende haben
							wir einen Vorschlag, über den wir sprechen können.
						</p>
					</div>

					<div className="lg:col-span-4 lg:flex lg:justify-end">
						<PillButton href="/konfigurator" size="lg">
							Konfigurator starten
						</PillButton>
					</div>
				</div>
			</Container>
		</section>
	);
}
