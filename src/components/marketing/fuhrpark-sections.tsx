import { Container } from "@/components/layout/container";
import { EditorialSplit } from "@/components/marketing/editorial-split";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { SectionDivider } from "@/components/marketing/section-divider";
import { SpecList } from "@/components/marketing/spec-list";

/**
 * FuhrparkSections — Geteilte Page-Inhalte für den Fuhrpark-Bereich.
 *
 * Wird genutzt von:
 *   - /fuhrpark (Top-Level)
 *   - /ueber-uns/drutex/fuhrpark (DRUTEX-Sub-Page laut Navbar)
 *
 * Damit beide URLs identischen Inhalt zeigen, ohne Duplikat.
 */

type Vehicle = {
	index: string;
	brand: string;
	model: string;
	specs: string[];
	body: string;
	caption: string;
};

const VEHICLES: Vehicle[] = [
	{
		index: "01",
		brand: "Mercedes Sprinter",
		model: "Sprinter L3H2",
		specs: ["Nutzlast 1.4 t", "Länge 4.3 m", "Hebebühne ja"],
		body: "Für Standardlieferungen Beispielstadt/Musterstadt, bis 8 Fenster pro Tour. Wendig genug für Innenstadt, groß genug für Standardware.",
		caption: "Hauptlieferer · Stadt + Land",
	},
	{
		index: "02",
		brand: "MAN TGE",
		model: "TGE 5.180",
		specs: ["Nutzlast 1.7 t", "Länge 5.0 m", "Bordwand klappbar"],
		body: "Für größere Fenster und Sondermaße. Klappbare Bordwand erlaubt seitliches Beladen mit Stapler — ideal für Bauprojekte.",
		caption: "Sondermaß · Bauprojekt",
	},
	{
		index: "03",
		brand: "VW Crafter",
		model: "Crafter 35 kurz",
		specs: ["Nutzlast 1.0 t", "Länge 3.6 m", "Wendekreis 12 m"],
		body: "Für enge Stadtfahrten in Beispielstadt-Mitte, Beispielort-Altstadt oder Musterstadt-Innenstadt. Kommt durch jede Hofzufahrt.",
		caption: "Stadtfahrten · Altbau",
	},
	{
		index: "04",
		brand: "Anhänger",
		model: "Spezial-Anhänger",
		specs: ["Nutzlast 2.0 t", "Länge 6.0 m", "Plane abnehmbar"],
		body: "Für Sonderladung, lange Aluminium-Profile oder übergroße Hebeschiebetüren. Kombinierbar mit Sprinter oder TGE.",
		caption: "Sonderladung · übergroß",
	},
];

export function FuhrparkSections() {
	return (
		<>
			<FlotteSection />
			<LiefergebietSection />
			<EingerechnetSection />
		</>
	);
}

function FlotteSection() {
	return (
		<section
			aria-labelledby="flotte-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="flotte-heading"
					eyebrow="Vier Fahrzeuge"
					headline={
						<>
							Was wir
							<br />
							fahren.
						</>
					}
					body="Vom Stadtwagen bis zum Sonderlast-Anhänger — jede Tour bekommt das passende Fahrzeug."
				/>

				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
					{VEHICLES.map((v) => (
						<li
							key={v.index}
							className="rounded-2xl border border-black-200 bg-white p-8"
						>
							<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500 tabular-nums">
								{v.index} · {v.brand}
							</p>
							<h3 className="mt-3 font-heading text-2xl font-medium tracking-tight text-black-950">
								{v.model}
							</h3>

							<ul className="mt-5 flex flex-wrap gap-2 border-y border-black-100 py-4">
								{v.specs.map((spec) => (
									<li
										key={spec}
										className="rounded-full bg-black-50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-black-600"
									>
										{spec}
									</li>
								))}
							</ul>

							<p className="mt-5 text-base leading-relaxed text-black-600">
								{v.body}
							</p>

							<div
								aria-hidden
								className="relative mt-6 aspect-[4/3] w-full overflow-hidden rounded-xl bg-black-100"
							>
								<div className="absolute inset-x-4 bottom-4">
									<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
										{v.caption}
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

function LiefergebietSection() {
	return (
		<section
			aria-labelledby="liefergebiet-heading"
			className="relative bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="liefergebiet-heading"
					eyebrow="Reichweite"
					headline={
						<>
							100 Kilometer Radius —
							<br />
							direkt.
						</>
					}
				/>

				<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
					<div className="md:col-span-7">
						<div className="max-w-2xl space-y-6 text-lg leading-relaxed text-black-700">
							<p>
								Im 100-Kilometer-Radius rund um Musterstadt liefern
								wir mit eigenem Fuhrpark — Musterstadt, Beispielstadt, Werder, Potsdam,
								Beelitz, Rathenow und alles dazwischen. Du bekommst deine
								Wunschtermin-Anlieferung und du redest am Liefertag mit Herrn
								Beck, nicht mit einem Spediteur.
							</p>
							<p>
								Außerhalb des 100-km-Radius arbeiten wir mit ausgesuchten
								Speditionen. Auch dort gilt: terminiert, abgestimmt, mit
								Hebebühne wenn benötigt. Deutschlandweite Lieferung in 1–3 Tagen
								ab Muster-Hof.
							</p>
							<p>
								Was wir nicht machen: Inseln, Berg-Außenposten, Adressen ohne
								Lkw-Zufahrt. Bei Sonderfällen klären wir die Logistik vor der
								Bestellung — so gibt es keine Überraschungen am Liefertag.
							</p>
						</div>
					</div>

					<div className="md:col-span-5">
						<SpecList
							layout="inline"
							items={[
								{ label: "Direktlieferung", value: "100 km" },
								{ label: "Spedition", value: "DE-weit" },
								{ label: "Lieferzeit", value: "1–3 Tage" },
								{ label: "Hebebühne", value: "an Bord" },
								{ label: "Etagentransport", value: "bis 4. OG" },
							]}
						/>
					</div>
				</div>
			</Container>
		</section>
	);
}

function EingerechnetSection() {
	return (
		<section
			aria-labelledby="eingerechnet-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<EditorialSplit
					headingId="eingerechnet-heading"
					eyebrow="Im Lieferpreis"
					headline={
						<>
							Kein Aufpreis
							<br />
							für normale Stadt.
						</>
					}
					body="Was bei anderen Spediteuren extra kostet, ist bei uns Standard. Du zahlst keinen Treppen-Zuschlag für den dritten Stock."
				/>

				<FeatureGrid
					size="dense"
					cardStyle="bordered"
					features={[
						{
							kicker: "Standard",
							title: "Anlieferung Wunschtermin",
							body: "Du nennst uns ein Datum, wir bestätigen es spätestens 24h vorher mit Stunden-Slot.",
						},
						{
							kicker: "Standard",
							title: "Hebebühne bei Bedarf",
							body: "Treppenhaus oder Balkon? Wir bringen die Hebebühne mit, ohne extra Aufschlag.",
						},
						{
							kicker: "Standard",
							title: "Etagentransport bis 4. OG",
							body: "Bis zur vierten Etage tragen wir hoch — auch bei Altbau ohne Aufzug. Standardleistung.",
						},
						{
							kicker: "Standard",
							title: "Entsorgung Verpackung",
							body: "Wir nehmen Folie, Karton und Holzlatten gleich wieder mit. Du bleibst müllfrei zurück.",
						},
					]}
				/>

				<aside
					aria-label="Hinweis Sonderfälle"
					className="mt-12 rounded-2xl border border-black-200 bg-black-50 p-8 md:mt-16 md:p-10"
				>
					<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-600">
						Sonderfälle mit Aufschlag
					</p>
					<h3 className="mt-3 font-heading text-xl font-medium tracking-tight text-black-950 md:text-2xl">
						Wann es teurer wird.
					</h3>
					<p className="mt-4 max-w-2xl text-base leading-relaxed text-black-700">
						Hochhaus über 4. OG ohne Lastenaufzug · Innenhof ohne Lkw-Zufahrt ·
						Treppe über 4 OG · Lieferung am Wochenende. Bei diesen
						Konstellationen kommt ein Zuschlag dazu — wir nennen ihn dir vor der
						Bestellung schriftlich, damit nichts überrascht.
					</p>
				</aside>
			</Container>
		</section>
	);
}
