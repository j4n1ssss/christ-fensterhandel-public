import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { EditorialSplit } from "@/components/marketing/editorial-split";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { SectionDivider } from "@/components/marketing/section-divider";
import { SpecList } from "@/components/marketing/spec-list";
import { PillButton } from "@/components/ui/pill-button";

export const metadata: Metadata = {
	title: "Produktion · Muster Fenster",
	description:
		"Vom Profil bis zum eingebauten Fenster — Drutex-Werk Bytów, Spedition nach Musterstadt, Muster-Hof, Endkunde. Vier Stationen, eine Wertkette.",
};

/**
 * /produktion — Wertkette von Drutex-Werk bis Muster-Hof.
 *
 * Struktur (Page-Rhythmus):
 *   1. MarketingHero (weiß)         — H1, Wertkette-Stats
 *   2. Vier Stationen (weiß)         — Timeline-Pattern aus shipping-section.tsx
 *   3. Drutex-Werk (black-50)        — 5/7-Split Image-Placeholder + SpecList
 *   4. Muster-Hof (weiß)             — 5/7-Split SpecList + Image-Placeholder
 *   5. Qualitätssicherung (black-50) — 2-Col bordered FeatureGrid
 *   6. ContactCtaStripe (black-950)  — Default-Variante
 */
export default function ProduktionPage() {
	return (
		<>
			{/* HERO */}
			<MarketingHero
				breadcrumb={[{ label: "Start", href: "/" }, { label: "Produktion" }]}
				eyebrow="Wie es entsteht"
				headline={<>Vom Profil</>}
				headlineHighlight="zum eingebauten Fenster."
				body="Vier Stationen, ein Weg: Profil-Extrusion und Glasverarbeitung im Drutex-Werk Bytów, Direkt-Spedition nach Musterstadt, Lager und Auslieferung vom Muster-Hof. Wir kennen jeden Schritt — und garantieren Termin, Maß und Optik."
				stats={[
					{ label: "Werk Bytów", value: "60.000 m2" },
					{ label: "Fertigung", value: "3–6 Wochen" },
					{ label: "Spedition", value: "~3 Tage" },
					{ label: "Lager Musterstadt", value: "1.500 m2" },
				]}
			/>

			{/* VIER STATIONEN */}
			<StationenSection />

			{/* DRUTEX-WERK */}
			<DrutexWerkSection />

			{/* MUSTER-HOF */}
			<MusterHofSection />

			{/* QUALITÄTSSICHERUNG */}
			<QualitaetSection />

			{/* CTA */}
			<ContactCtaStripe />
		</>
	);
}

/* ──────────────────────────────────────────────────────────────────
   VIER STATIONEN — Timeline analog shipping-section.tsx
   ────────────────────────────────────────────────────────────────── */

type Step = {
	number: string;
	title: string;
	description: string;
	duration: string;
};

const STEPS: Step[] = [
	{
		number: "01",
		title: "Profil-Extrusion",
		description:
			"Drutex-Werk Bytów. Eigene PVC-Linie, Aluminium von Aluprof. Profile werden im Haus extrudiert und farb-coextrudiert — kein Zukauf, keine Zwischenhändler.",
		duration: "Tag 1–5",
	},
	{
		number: "02",
		title: "Glas + Beschlag",
		description:
			"Drutex-Werk, eigene Glasverarbeitung. Isolierglas wird im Haus laminiert, Beschläge im Werkzeugbau montiert. Endabnahme jedes Fensters per Hand.",
		duration: "Tag 5–14",
	},
	{
		number: "03",
		title: "Spedition",
		description:
			"Direkt-Logistik per Lkw von Bytów nach Musterstadt. Keine Zwischenstationen, keine Umlade-Beschädigungen. Anlieferung in der Regel innerhalb von drei Tagen.",
		duration: "~3 Tage",
	},
	{
		number: "04",
		title: "Lager + Lieferung",
		description:
			"Muster-Hof Musterstraße. Eingang geprüft, eingelagert, terminiert. Auslieferung per eigenem Fuhrpark zum Endkunden — auf Wunsch mit Montage.",
		duration: "Nach Absprache",
	},
];

function StationenSection() {
	return (
		<section
			aria-labelledby="stationen-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="stationen-heading"
					eyebrow="Wertkette"
					headline={
						<>
							Vom Polen
							<br />
							bis zur Tür.
						</>
					}
					body="Vier Stationen, ein durchgängiger Faden. Du weißt zu jedem Zeitpunkt, wo dein Auftrag steht."
				/>

				<div className="relative">
					{/* Verbindungslinie auf Desktop */}
					<div
						aria-hidden
						className="absolute left-0 right-0 top-[22px] hidden h-px lg:block"
						style={{
							background:
								"linear-gradient(to right, transparent 0%, var(--color-black-200) 8%, var(--color-black-200) 92%, transparent 100%)",
						}}
					/>

					<ol className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
						{STEPS.map((step) => (
							<li key={step.number} className="relative">
								<div
									aria-hidden
									className="mb-6 inline-flex size-11 items-center justify-center rounded-full border border-black-200 bg-white"
								>
									<span className="font-mono text-xs tabular-nums text-brand-600">
										{step.number}
									</span>
								</div>

								<h3 className="font-heading text-2xl font-medium tracking-tight text-black-950 md:text-3xl">
									{step.title}
								</h3>
								<p className="mt-4 max-w-md text-base leading-relaxed text-black-600">
									{step.description}
								</p>

								<div className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
									<span
										aria-hidden
										className="inline-block h-1 w-3 rounded-full bg-brand-500"
									/>
									Dauer · {step.duration}
								</div>
							</li>
						))}
					</ol>
				</div>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   DRUTEX-WERK — 5/7-Split: Image-Placeholder links, SpecList stacked rechts
   ────────────────────────────────────────────────────────────────── */

function DrutexWerkSection() {
	return (
		<section
			aria-labelledby="drutex-werk-heading"
			className="relative bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="drutex-werk-heading"
					eyebrow="Quelle"
					headline={
						<>
							Drutex-Werk
							<br />
							Bytów.
						</>
					}
					body="Pommern, Polen. Sechzigtausend Quadratmeter unter einem Dach — und jedes Fenster trotzdem von Hand abgenommen."
				/>

				<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
					<div className="md:col-span-5">
						<figure>
							<div
								aria-hidden
								className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black-200"
							>
								<div className="absolute inset-x-6 bottom-6">
									<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-600">
										Bytów, Pommern
									</p>
									<p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
										Drutex Hauptwerk
									</p>
								</div>
							</div>
							<figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
								Werk · ISO 9001
							</figcaption>
						</figure>
					</div>

					<div className="md:col-span-7">
						<SpecList
							layout="stacked"
							items={[
								{ label: "Produktionsfläche", value: "60.000 m2" },
								{ label: "Mitarbeiter", value: "3.000+" },
								{ label: "Output / Jahr", value: "3 Mio+" },
								{ label: "Eigene Extrusion", value: "PVC + Alu" },
								{ label: "Eigene Glasverarbeitung", value: "100 %" },
								{ label: "Zertifizierung", value: "ISO 9001" },
							]}
						/>
					</div>
				</div>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   MUSTER-HOF — 5/7-Split: SpecList links, Image-Placeholder rechts
   ────────────────────────────────────────────────────────────────── */

function MusterHofSection() {
	return (
		<section
			aria-labelledby="muster-hof-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="muster-hof-heading"
					eyebrow="Ankunft"
					headline={
						<>
							Muster-Hof
							<br />
							Musterstadt.
						</>
					}
					body="Musterstraße 1. Lager, Showroom, Fuhrpark — der Ort, an dem aus Drutex-Lieferung dein Auftrag wird."
				/>

				<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
					<div className="md:col-span-7 md:order-1">
						<SpecList
							layout="stacked"
							items={[
								{ label: "Lagerfläche", value: "1.500 m2" },
								{ label: "Showroom", value: "200 m2" },
								{ label: "Fuhrpark", value: "4 Fahrzeuge" },
								{ label: "Mitarbeiter", value: "6" },
								{ label: "Liefer-Radius", value: "100 km" },
								{ label: "Sprachen", value: "DE · PL" },
							]}
						/>

						<div className="mt-10">
							<PillButton href="/kontakt" size="lg">
								Showroom besuchen
							</PillButton>
						</div>
					</div>

					<div className="md:col-span-5 md:order-2">
						<figure>
							<div
								aria-hidden
								className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black-100"
							>
								<div className="absolute inset-x-6 bottom-6">
									<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-600">
										Musterstraße
									</p>
									<p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
										Musterstadt
									</p>
								</div>
							</div>
							<figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
								Muster-Hof · seit 1995
							</figcaption>
						</figure>
					</div>
				</div>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   QUALITÄTSSICHERUNG — 2-Col bordered FeatureGrid
   ────────────────────────────────────────────────────────────────── */

function QualitaetSection() {
	return (
		<section
			aria-labelledby="qualitaet-heading"
			className="relative bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="qualitaet-heading"
					eyebrow="Prüfung"
					headline={
						<>
							Zwei Mal
							<br />
							kontrolliert.
						</>
					}
					body="Ein Fenster, zwei Endabnahmen. Beim Hersteller, bei uns — bevor es zum Kunden geht."
				/>

				<ul className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
					{[
						{
							kicker: "Station 02",
							title: "Werk-Prüfung Drutex",
							body: "ISO 9001 Endabnahme jedes einzelnen Fensters. Profil, Verglasung, Beschlag, Dichtung — sechs Prüfpunkte pro Fenster, dokumentiert mit Prüfnummer.",
						},
						{
							kicker: "Station 04",
							title: "Anlieferungs-Prüfung",
							body: "Bei jeder Lieferung kontrollieren wir Maß, Optik und Beschlag pro Fenster nach. Erst dann wird eingelagert oder direkt ausgeliefert.",
						},
					].map((item) => (
						<li
							key={item.title}
							className="rounded-2xl border border-black-200 bg-white p-8 md:p-10"
						>
							<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-600">
								{item.kicker}
							</p>
							<h3 className="mt-3 font-heading text-2xl font-medium tracking-tight text-black-950 md:text-3xl">
								{item.title}
							</h3>
							<p className="mt-4 text-base leading-relaxed text-black-600">
								{item.body}
							</p>
						</li>
					))}
				</ul>
			</Container>
		</section>
	);
}
