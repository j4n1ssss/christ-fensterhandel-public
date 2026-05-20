import {
	AlertTriangle,
	Hammer,
	MapPin,
	Ruler,
	Trash2,
	Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { EditorialSplit } from "@/components/marketing/editorial-split";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { SectionDivider } from "@/components/marketing/section-divider";
import { SpecList } from "@/components/marketing/spec-list";

export const metadata: Metadata = {
	title: "Versand & Lieferung · Muster Fenster",
	description:
		"Wie das Fenster vom Auftrag zur Tür kommt — Fertigung bei DRUTEX, Spedition aus Polen, Liefertermine nach Absprache und auf Wunsch fachgerechter Einbau.",
};

/**
 * /versand-lieferung — Service-Page zu Logistik & Einbau.
 *
 * Struktur (Page-Rhythmus):
 *   1. MarketingHero (weiß)         — Breadcrumb, H1, Stats
 *   2. Prozess (weiß)                — 4-Step-Timeline (Bestellung → Fertigung → Spedition → Lieferung)
 *   3. Lieferzeiten (black-50)       — SpecList stacked + Hinweis Sonderschließungen 2026
 *   4. Liefergebiet (weiß)           — EditorialSplit + 4-Item Region-Grid
 *   5. Einbau (black-50)             — EditorialSplit + 4-Item Service-Grid
 *   6. ContactCtaStripe (black-950)  — Variante "anfrage"
 */
export default function VersandLieferungPage() {
	return (
		<>
			{/* ═══════ HERO ═══════ */}
			<MarketingHero
				breadcrumb={[
					{ label: "Start", href: "/" },
					{ label: "Service" },
					{ label: "Versand & Lieferung" },
				]}
				eyebrow="Logistik"
				headline={
					<>
						Vom Auftrag
						<br />
						bis zur Tür.
					</>
				}
				body="Wir liefern transparent. Jeder Schritt ist abgesprochen, kein Tag bleibt im Dunkeln. Gefertigt wird bei DRUTEX in Polen, geliefert per Spedition — Termin direkt mit dir."
				stats={[
					{ label: "Fertigung", value: "3–6 Wochen" },
					{ label: "Lieferung", value: "~4 Wochen" },
					{ label: "Region", value: "DE-weit" },
				]}
			/>

			{/* ═══════ PROZESS — 4-STEP-TIMELINE ═══════ */}
			<ProzessSection />

			{/* ═══════ LIEFERZEITEN — SPEC-LIST + HINWEIS ═══════ */}
			<LieferzeitenSection />

			{/* ═══════ LIEFERGEBIET — REGION-GRID ═══════ */}
			<LiefergebietSection />

			{/* ═══════ EINBAU — SERVICE-GRID ═══════ */}
			<EinbauSection />

			{/* ═══════ KONTAKT-CTA ═══════ */}
			<ContactCtaStripe
				variant="anfrage"
				eyebrow="Direkter Draht"
				headline="Termin oder Frage?"
				subline="Sprich uns an."
				body="Liefertermin abstimmen, Sondermaß anfragen oder Einbau klären — wir sind erreichbar."
			/>
		</>
	);
}

/* ──────────────────────────────────────────────────────────────────
   PROZESS — 4 Steps mit horizontaler Verbindungslinie (Desktop)
   ────────────────────────────────────────────────────────────────── */

type ProcessStep = {
	number: string;
	title: string;
	description: string;
	duration: string;
};

const PROCESS_STEPS: ProcessStep[] = [
	{
		number: "01",
		title: "Bestellung & Prüfung",
		description:
			"Auftrag bestätigt, Konfiguration final. Wir gehen Maße, Farben und technische Details mit dir durch — kein Schritt ohne Freigabe.",
		duration: "1–3 Tage",
	},
	{
		number: "02",
		title: "Fertigung bei DRUTEX",
		description:
			"Direkte Weitergabe an die Werkstatt in Polen. Jedes Fenster, jede Tür wird auf dein Maß gebaut — Profile, Glas, Beschlag.",
		duration: "3–6 Wochen",
	},
	{
		number: "03",
		title: "Spedition nach Musterstadt",
		description:
			"Sicherer Transport per Spedition aus dem Werk zu unserem Lager. Kontrolle der Lieferung, Prüfung der Ware vor Weitergabe.",
		duration: "3–5 Tage",
	},
	{
		number: "04",
		title: "Lieferung & Einbau",
		description:
			"Anlieferung mit eigenem Fahrzeug oder Spedition, Termin mit dir abgestimmt. Auf Wunsch übernehmen wir die Montage.",
		duration: "Nach Absprache",
	},
];

function ProzessSection() {
	return (
		<section
			aria-labelledby="prozess-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="prozess-heading"
					eyebrow="Ablauf"
					headline={<>Vier klare Schritte.</>}
					body="Kein Rätselraten zwischen Bestellung und Einbau. Du weißt jederzeit, wo dein Auftrag steht — und welcher Schritt als nächstes kommt."
				/>

				{/* Timeline */}
				<div className="relative">
					{/* Verbindungslinie — nur Desktop, dezenter Verlauf */}
					<div
						aria-hidden
						className="absolute left-0 right-0 top-[22px] hidden h-px lg:block"
						style={{
							background:
								"linear-gradient(to right, transparent 0%, var(--color-black-200) 8%, var(--color-black-200) 92%, transparent 100%)",
						}}
					/>

					<ol className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
						{PROCESS_STEPS.map((step) => (
							<li key={step.number} className="relative">
								{/* Step-Dot */}
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
   LIEFERZEITEN — SpecList stacked + Hinweis Sonderschliessungen
   ────────────────────────────────────────────────────────────────── */

function LieferzeitenSection() {
	return (
		<section
			aria-labelledby="lieferzeiten-heading"
			className="relative bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="lieferzeiten-heading"
					eyebrow="Realistische Erwartungen"
					headline={<>Wann steht das Fenster?</>}
					body="Lieferzeiten sind Erfahrungswerte aus laufenden Aufträgen. Sondermaße und Spezialfarben verlängern die Fertigung — wir sagen dir vor der Bestellung, womit du rechnen kannst."
				/>

				<SpecList
					layout="stacked"
					items={[
						{
							label: "Standard-Konfiguration",
							value: "3–4 Wo.",
							note: "IGLO-Profile, weiße Standardfarbe, Lagerglas.",
						},
						{
							label: "Sonderfarbe",
							value: "5–7 Wo.",
							note: "RAL-Töne, Holzdekore, beidseitig farbig.",
						},
						{
							label: "Sondergröße",
							value: "5–8 Wo.",
							note: "XXL-Formate, Schrägen, Rundungen.",
						},
						{
							label: "Aluminium-Haustüren",
							value: "6–10 Wo.",
							note: "Aluprof MB-86, Sonderfüllungen.",
						},
						{
							label: "Rollläden",
							value: "4–6 Wo.",
							note: "Aufsatz oder Vorbau, optional motorisiert.",
						},
					]}
				/>

				{/* Hinweis: Sonderschliessungen 2026 */}
				<div className="mt-16 border-l-4 border-brand-500 bg-white py-8 pl-6 pr-8 md:mt-20 md:py-10 md:pl-8">
					<div className="flex items-start gap-4">
						<span
							aria-hidden
							className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"
						>
							<AlertTriangle className="size-4" />
						</span>
						<div className="flex-1">
							<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-700">
								Sonderschließungen 2026
							</p>
							<h3 className="mt-2 font-heading text-2xl font-medium tracking-tight text-black-950 md:text-3xl">
								Plan etwas Puffer ein.
							</h3>
							<p className="mt-3 max-w-2xl text-base leading-relaxed text-black-600">
								In den folgenden Zeiträumen ist die Fertigung pausiert oder der
								Showroom geschlossen. Bestellungen nehmen wir trotzdem entgegen
								— die Fertigung beginnt nach Wiederöffnung.
							</p>
							<ul className="mt-6 space-y-3 font-mono text-sm tabular-nums text-black-700">
								<li className="flex items-baseline gap-4">
									<span className="w-32 shrink-0 text-black-500">
										23.03.–22.04.
									</span>
									<span>Inventur</span>
								</li>
								<li className="flex items-baseline gap-4">
									<span className="w-32 shrink-0 text-black-500">
										01.08.–31.08.
									</span>
									<span>Sommerpause</span>
								</li>
								<li className="flex items-baseline gap-4">
									<span className="w-32 shrink-0 text-black-500">
										ab 11.12.
									</span>
									<span>Winterpause bis April 2027</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   LIEFERGEBIET — EditorialSplit + Region-Grid
   ────────────────────────────────────────────────────────────────── */

function LiefergebietSection() {
	return (
		<section
			aria-labelledby="liefergebiet-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="liefergebiet-heading"
					eyebrow="Wo wir liefern"
					headline={
						<>
							Musterstadt, Beispielstadt
							<br />
							und ganz Deutschland.
						</>
					}
					body="In der Region fahren wir mit eigenen Fahrzeugen — kurze Wege, direkter Kontakt. Bundesweit liefern wir per Spedition, deine Ware kommt sicher verpackt und versichert an."
				/>

				<FeatureGrid
					size="dense"
					cardStyle="bordered"
					features={[
						{
							icon: <MapPin className="size-5" aria-hidden />,
							title: "Musterstadt",
							kicker: "Region",
							body: "Direktlieferung mit eigenem Fahrzeug, oft am Tag der Avisierung.",
						},
						{
							icon: <MapPin className="size-5" aria-hidden />,
							title: "Beispielstadt & Umland",
							kicker: "Region",
							body: "Eigene Anlieferung, planbar nach Wunschtermin.",
						},
						{
							icon: <MapPin className="size-5" aria-hidden />,
							title: "Deutschland",
							kicker: "Bundesweit",
							body: "Spedition mit Ablade-Service, Termin-Avisierung 24h vorher.",
						},
						{
							icon: <MapPin className="size-5" aria-hidden />,
							title: "Polen Grenzgebiet",
							kicker: "Auf Anfrage",
							body: "Direktlieferung ab Werk, ideal bei Bauvorhaben nahe der Grenze.",
						},
					]}
				/>
			</Container>
		</section>
	);
}

/* ──────────────────────────────────────────────────────────────────
   EINBAU — EditorialSplit + Service-Grid
   ────────────────────────────────────────────────────────────────── */

function EinbauSection() {
	return (
		<section
			aria-labelledby="einbau-heading"
			className="relative bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="einbau-heading"
					eyebrow="Nicht nur Lieferung"
					headline={<>Auf Wunsch montieren wir.</>}
					body="Aufmaß, Demontage des Altfensters, fachgerechter Einbau, Entsorgung — auf Wunsch alles aus einer Hand. Eigene Monteure, kein Subunternehmer-Pingpong."
				/>

				<FeatureGrid
					features={[
						{
							icon: <Ruler className="size-5" aria-hidden />,
							title: "Aufmaß vor Ort",
							kicker: "Schritt 1",
							body: "Wir kommen mit Lasermessgerät, nehmen Brück-, Sturz- und Brüstungsmaße auf — und beraten gleich vor Ort.",
						},
						{
							icon: <Hammer className="size-5" aria-hidden />,
							title: "Demontage Altfenster",
							kicker: "Schritt 2",
							body: "Saubere Demontage mit Schutz von Putz und Innenleibung. Auf Wunsch mit Provisorium über Nacht.",
						},
						{
							icon: <Wrench className="size-5" aria-hidden />,
							title: "Fachgerechte Montage",
							kicker: "Schritt 3",
							body: "Einbau nach RAL-Richtlinien — abgedichtet, gedämmt, einstellbar. Bestätigt mit Montageprotokoll.",
						},
						{
							icon: <Trash2 className="size-5" aria-hidden />,
							title: "Entsorgung Altmaterial",
							kicker: "Optional",
							body: "Komplette Entsorgung der ausgebauten Elemente — fachgerecht und zertifiziert.",
						},
					]}
				/>
			</Container>
		</section>
	);
}
