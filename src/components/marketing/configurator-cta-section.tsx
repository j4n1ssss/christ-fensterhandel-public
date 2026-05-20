import { CircleCheck, Clock, Phone } from "lucide-react";
import type * as React from "react";
import { Container } from "@/components/layout/container";
import { PillButton } from "@/components/ui/pill-button";

type Perk = {
	icon: React.ReactNode;
	text: string;
};

const PERKS: Perk[] = [
	{
		icon: <Clock className="size-4" aria-hidden />,
		text: "In 5 Minuten durch",
	},
	{
		icon: <CircleCheck className="size-4" aria-hidden />,
		text: "Kostenlos & unverbindlich",
	},
	{
		icon: <Phone className="size-4" aria-hidden />,
		text: "Beratung inklusive",
	},
];

export function ConfiguratorCtaSection() {
	return (
		<section
			aria-labelledby="cta-heading"
			className="relative overflow-hidden bg-brand-500 py-24 md:py-32"
		>
			{/* Dezentes Textur-Pattern — geometrische Streifen diagonal */}
			<div
				aria-hidden
				className="absolute inset-0 opacity-[0.08]"
				style={{
					backgroundImage:
						"repeating-linear-gradient(135deg, var(--color-black-950) 0px, var(--color-black-950) 1px, transparent 1px, transparent 14px)",
				}}
			/>

			{/* Warmes Glow unten links */}
			<div
				aria-hidden
				className="pointer-events-none absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full blur-3xl"
				style={{
					background:
						"radial-gradient(circle, var(--color-brand-300) 0%, transparent 70%)",
					opacity: 0.55,
				}}
			/>

			<Container size="xl">
				<div className="relative grid grid-cols-1 items-end gap-12 lg:grid-cols-12 lg:gap-16">
					{/* Left: Heading + Perks */}
					<div className="lg:col-span-7">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-950">
							Starten
						</p>
						<h2
							id="cta-heading"
							className="mt-4 font-heading text-5xl font-medium leading-[1.0] tracking-tight text-black-950 md:text-6xl lg:text-7xl xl:text-[5.5rem]"
						>
							Jetzt dein
							<br />
							Fenster bauen.
						</h2>

						{/* Perks-Strip */}
						<ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
							{PERKS.map((perk, i) => (
								<li
									key={i}
									className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-black-950"
								>
									{perk.icon}
									<span>{perk.text}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Right: Einzelner großer CTA-Button */}
					<div className="lg:col-span-5 lg:flex lg:justify-end">
						<PillButton href="/konfigurator" size="xl">
							Konfigurator starten
						</PillButton>
					</div>
				</div>
			</Container>
		</section>
	);
}
