import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Container } from "@/components/layout/container";
import { SectionDivider } from "@/components/marketing/section-divider";

type FaqItem = {
	question: string;
	answer: string;
};

const TOP_FAQS: FaqItem[] = [
	{
		question: "Wie lange dauert die Fertigung meiner Fenster?",
		answer:
			"Nach Auftragsbestätigung und Datenprüfung dauert die Fertigung bei DRUTEX in der Regel 3–6 Wochen. Bei Sonderanfertigungen oder aufwendigen Farben etwas länger. Wir nennen dir einen konkreten Termin direkt nach der Bestellung.",
	},
	{
		question: "Ist eine Beratung vor Ort möglich?",
		answer:
			"Ja. Entweder bei uns im Showroom in Musterstadt — oder wir kommen zu dir, wenn es um größere Projekte geht. Beratung und Erstbesichtigung sind kostenlos und unverbindlich.",
	},
	{
		question: "Übernehmt ihr auch den Einbau?",
		answer:
			"Wir koordinieren den Einbau auf Wunsch mit erfahrenen Partnerbetrieben aus der Region — oder wir bringen dich mit deinem Montagebetrieb zusammen. Lieferung ohne Einbau ist ebenfalls jederzeit möglich.",
	},
];

export function FaqSection() {
	return (
		<section
			aria-labelledby="faq-heading"
			className="relative bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				{/* Editorial-Header */}
				<div className="mb-14 grid grid-cols-1 gap-8 md:mb-20 md:grid-cols-12 md:gap-12">
					<div className="md:col-span-4">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
							Häufig gefragt
						</p>
					</div>
					<div className="md:col-span-8">
						<h2
							id="faq-heading"
							className="font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl"
						>
							Drei Fragen,
							<br />
							die wir oft hören.
						</h2>
					</div>
				</div>

				{/* FAQ-Liste — native <details> für JS-freie Accordion-Funktion */}
				<div className="divide-y divide-black-200 border-y border-black-200">
					{TOP_FAQS.map((faq, i) => (
						<details key={i} className="group">
							<summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 transition-colors hover:text-brand-700 md:py-8">
								<div className="flex items-baseline gap-5">
									<span className="font-mono text-[11px] tabular-nums text-black-400">
										0{i + 1}
									</span>
									<h3 className="font-heading text-xl font-medium leading-tight tracking-tight text-black-950 transition-colors group-hover:text-brand-700 md:text-2xl lg:text-3xl">
										{faq.question}
									</h3>
								</div>
								<div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-black-300 transition-all group-hover:border-brand-500 group-open:border-brand-500 group-open:bg-brand-500">
									<Plus
										className="size-4 text-black-700 transition-all duration-300 group-open:rotate-45 group-open:text-white-100"
										aria-hidden
									/>
								</div>
							</summary>
							<div className="pb-8 pl-10 pr-16 md:pl-12">
								<p className="max-w-3xl text-base leading-relaxed text-black-700">
									{faq.answer}
								</p>
							</div>
						</details>
					))}
				</div>

				{/* CTA zu voller FAQ-Seite */}
				<div className="mt-10 flex justify-end">
					<Link
						href="/faq"
						className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-black-700 transition-colors hover:text-brand-700"
					>
						Alle Fragen ansehen
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
