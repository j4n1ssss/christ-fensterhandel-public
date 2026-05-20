import { ArrowRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Container } from "@/components/layout/container";
import { SectionDivider } from "@/components/marketing/section-divider";

type Step = {
	number: string;
	title: string;
	description: string;
	duration: string;
};

const STEPS: Step[] = [
	{
		number: "01",
		title: "Bestellung & Prüfung",
		description:
			"Konfiguration abgeschlossen, Auftrag bestätigt. Wir prüfen Maße, technische Details und klären offene Fragen persönlich mit dir.",
		duration: "1–3 Tage",
	},
	{
		number: "02",
		title: "Fertigung bei DRUTEX",
		description:
			"Direkte Weitergabe an die DRUTEX-Werkstatt. Jedes Fenster, jede Tür wird individuell gefertigt — nach deinen Maßen, deinen Farben.",
		duration: "3–6 Wochen",
	},
	{
		number: "03",
		title: "Lieferung & Einbau",
		description:
			"Anlieferung per Spedition, Termin mit dir abgestimmt. Auf Wunsch übernehmen wir den Einbau oder koordinieren ihn mit deinem Montagebetrieb.",
		duration: "Nach Absprache",
	},
];

export function ShippingSection() {
	return (
		<section
			aria-labelledby="shipping-heading"
			className="relative bg-white py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				{/* Editorial-Header */}
				<div className="mb-14 grid grid-cols-1 gap-8 md:mb-20 md:grid-cols-12 md:gap-12">
					<div className="md:col-span-4">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
							Vom Auftrag bis zur Tür
						</p>
					</div>
					<div className="md:col-span-8">
						<h2
							id="shipping-heading"
							className="font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl"
						>
							Drei klare Schritte.
						</h2>
						<p className="mt-6 max-w-2xl text-lg leading-relaxed text-black-600">
							Kein Rätselraten, keine versteckten Zwischenschritte. Du weißt
							jederzeit, wo dein Auftrag steht.
						</p>
					</div>
				</div>

				{/* Timeline — 3 Steps horizontal (auf Desktop), vertikal gestackt (auf Mobile) */}
				<div className="relative">
					{/* Verbindungslinie — dezent, nur sichtbar auf Desktop, läuft durch alle Steps */}
					<div
						aria-hidden
						className="absolute left-0 right-0 top-[22px] hidden h-px lg:block"
						style={{
							background:
								"linear-gradient(to right, transparent 0%, var(--color-black-200) 10%, var(--color-black-200) 90%, transparent 100%)",
						}}
					/>

					<ol className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
						{STEPS.map((step) => (
							<li key={step.number} className="relative">
								{/* Step-Dot — liegt auf der Verbindungslinie */}
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

				{/* CTA-Link unten */}
				<div className="mt-16 border-t border-black-100 pt-8 md:mt-20">
					<Link
						href="/versand-lieferung"
						className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-black-700 transition-colors hover:text-brand-700"
					>
						Alle Details zur Lieferung
						<ArrowRight
							className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
							aria-hidden
						/>
					</Link>
				</div>
			</Container>
		</section>
	);
}
