import * as React from "react";
import { Container } from "@/components/layout/container";
import { SectionDivider } from "@/components/marketing/section-divider";
import { PillButton } from "@/components/ui/pill-button";

type Fact = {
	label: string;
	value: string;
};

const FACTS: Fact[] = [
	{ label: "Produktionsstandort", value: "Polen" },
	{ label: "Gegründet", value: "1985" },
	{ label: "Fenster pro Jahr", value: "3 Mio+" },
	{ label: "Zertifizierung", value: "ISO 9001" },
];

export function DrutexSection() {
	return (
		<section
			aria-labelledby="drutex-heading"
			className="relative overflow-hidden bg-black-950 py-24 text-white-80 md:py-32"
		>
			<SectionDivider invert />

			{/* Dezenter Brand-Schein unten rechts */}
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
					{/* Left: Claim */}
					<div className="lg:col-span-7">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-400">
							Unser Hersteller
						</p>

						<h2
							id="drutex-heading"
							className="mt-4 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-white-100 md:text-5xl lg:text-7xl"
						>
							Wir bauen nicht irgendwas ein.
							<br />
							<span className="text-brand-400">Wir bauen DRUTEX ein.</span>
						</h2>

						<div className="mt-10 max-w-2xl space-y-5 text-lg leading-relaxed text-white-80">
							<p>
								Ein polnischer Hersteller, der seit 1985 ausschließlich Fenster
								und Türen produziert. Drei Millionen Stück pro Jahr, ISO 9001
								zertifiziert, eigene Extrusion, eigene Glasverarbeitung —
								Qualität, die nicht delegiert wird.
							</p>
							<p>
								Wir arbeiten exklusiv mit DRUTEX, weil wir wissen wollen, wer
								baut, was wir einbauen. Deshalb können wir dir auch nach zehn
								Jahren noch sagen, welche Dichtung in deinem Fenster steckt.
							</p>
						</div>

						<div className="mt-10">
							<PillButton href="/ueber-uns/drutex" size="lg">
								Zur Partnerschaft
							</PillButton>
						</div>
					</div>

					{/* Right: Facts als typografische Liste */}
					<div className="lg:col-span-5 lg:pt-4">
						<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white-60">
							In Zahlen
						</p>
						<dl className="mt-8 divide-y divide-white-10">
							{FACTS.map((fact) => (
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
