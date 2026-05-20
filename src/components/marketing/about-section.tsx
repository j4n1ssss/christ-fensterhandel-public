import { ArrowRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Container } from "@/components/layout/container";
import { SectionDivider } from "@/components/marketing/section-divider";
import { buttonVariants } from "@/components/ui/button";

type Stat = {
	value: string;
	label: string;
	note?: string;
};

const STATS: Stat[] = [
	{
		value: "1",
		label: "Familienbetrieb",
		note: "Inhabergeführt in Musterstadt",
	},
	{
		value: "100 %",
		label: "DRUTEX-Fertigung",
		note: "Exklusiver Partner seit vielen Jahren",
	},
	{
		value: "∅ 4",
		label: "Wochen bis zur Lieferung",
		note: "Vom Auftrag bis zum Einbau",
	},
];

export function AboutSection() {
	return (
		<section
			aria-labelledby="about-heading"
			className="relative bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-20">
					{/* Links: Kicker + Story */}
					<div className="lg:col-span-7">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
							Wer wir sind
						</p>
						<h2
							id="about-heading"
							className="mt-4 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl"
						>
							Handwerk,
							<br />
							kein Katalog.
						</h2>

						<div className="mt-10 max-w-2xl space-y-5 text-lg leading-relaxed text-black-700">
							<p>
								Muster Fenster ist ein inhabergeführter Familienbetrieb in
								Musterstadt. Kein Lagergeschäft, kein Massenmarkt —
								jeder Auftrag ist ein eigenes Projekt.
							</p>
							<p>
								Seit Jahren ausschließlich Fertigung mit DRUTEX — weil wir
								wissen, wo die Fenster und Türen herkommen, wer sie baut und wie
								lange sie halten. Dieses Vertrauen geben wir weiter.
							</p>
						</div>

						<div className="mt-10 flex flex-wrap gap-3">
							<Link
								href="/ueber-uns"
								className={buttonVariants({
									variant: "primary",
									size: "normal",
								})}
							>
								Mehr über uns
								<ArrowRight aria-hidden />
							</Link>
							<Link
								href="/ueber-uns/drutex"
								className={buttonVariants({
									variant: "alternate",
									size: "normal",
								})}
							>
								DRUTEX-Partnerschaft
							</Link>
						</div>
					</div>

					{/* Rechts: Stats-Stack */}
					<div className="lg:col-span-5 lg:border-l lg:border-black-200 lg:pl-12">
						<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
							In Zahlen
						</p>
						<dl className="mt-8 space-y-10">
							{STATS.map((stat) => (
								<div key={stat.label}>
									<dt className="font-heading text-6xl font-medium leading-none tracking-tight text-black-950 md:text-7xl">
										<span className="tabular-nums">{stat.value}</span>
									</dt>
									<dd className="mt-3">
										<div className="font-heading text-lg font-medium text-black-900">
											{stat.label}
										</div>
										{stat.note && (
											<div className="mt-1 text-sm text-black-600">
												{stat.note}
											</div>
										)}
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
