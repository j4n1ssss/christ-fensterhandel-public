import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Container } from "@/components/layout/container";
import { SectionDivider } from "@/components/marketing/section-divider";
import { buttonVariants } from "@/components/ui/button";

/**
 * Kontakt-Section — Editorial Split-Layout.
 *
 * Bewusst kein Formular, keine Karte, kein Prosa-Text —
 * stattdessen Kontakt-Info als typografische „Visitenkarte",
 * die vom Hero-Loudness abweicht und Ruhe in die Seite bringt.
 *
 * Firmendaten aus docs/website/relaunch/firmendaten.md.
 */
export function ContactSection() {
	return (
		<section
			aria-labelledby="contact-heading"
			className="relative overflow-hidden bg-black-50 py-24 md:py-32"
		>
			<SectionDivider />

			<Container size="xl">
				<div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-20">
					{/* Links: Einladung + CTA */}
					<div className="lg:col-span-5">
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
							Kontakt
						</p>
						<h2
							id="contact-heading"
							className="mt-4 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl"
						>
							Komm vorbei
							<br />
							oder ruf an.
						</h2>
						<p className="mt-6 max-w-md text-lg leading-relaxed text-black-600">
							Beratung im Showroom, Maßaufnahme vor Ort oder einfach ein
							ehrliches Gespräch am Telefon. Wir nehmen uns Zeit.
						</p>

						<div className="mt-10 flex flex-wrap gap-3">
							<Link
								href="/kontakt"
								className={buttonVariants({
									variant: "primary",
									size: "normal",
								})}
							>
								Nachricht schreiben
								<ArrowRight aria-hidden />
							</Link>
							<a
								href="tel:+4930000000000"
								className={buttonVariants({
									variant: "alternate",
									size: "normal",
								})}
							>
								Anrufen
							</a>
						</div>
					</div>

					{/* Rechts: Kontakt-Info als Typo-Visitenkarte */}
					<div className="lg:col-span-6 lg:col-start-7 lg:pt-4">
						<div className="space-y-12">
							{/* Adresse */}
							<div>
								<div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
									<MapPin className="size-3" aria-hidden />
									Adresse
								</div>
								<address className="mt-3 not-italic font-heading text-2xl leading-tight tracking-tight text-black-950 md:text-3xl">
									Musterstraße 1
									<br />
									12345 Musterstadt
								</address>
							</div>

							{/* Telefon + Email — nebeneinander */}
							<div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
								<div>
									<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
										Telefon
									</p>
									<a
										href="tel:+4930000000000"
										className="group mt-3 inline-flex items-baseline gap-2 text-xl tracking-tight text-black-950 transition-colors hover:text-brand-700 md:text-2xl"
									>
										<span className="tabular-nums">030 000 000 00</span>
										<ArrowRight
											className="size-3 translate-y-[-2px] text-black-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600 group-hover:opacity-100"
											aria-hidden
										/>
									</a>
								</div>
								<div>
									<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
										E-Mail
									</p>
									<a
										href="mailto:info@example.com"
										className="group mt-3 inline-flex items-baseline gap-2 break-all text-xl tracking-tight text-black-950 transition-colors hover:text-brand-700 md:text-2xl"
									>
										<span>info@example.com</span>
										<ArrowRight
											className="size-3 translate-y-[-2px] text-black-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600 group-hover:opacity-100"
											aria-hidden
										/>
									</a>
								</div>
							</div>

							{/* Öffnungszeiten */}
							<div>
								<p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
									Öffnungszeiten
								</p>
								<dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 font-mono text-base text-black-800">
									<dt className="tabular-nums">Mo – Fr</dt>
									<dd>10:00 – 18:00 Uhr</dd>
									<dt className="tabular-nums text-black-400">Sa</dt>
									<dd className="text-black-400">Nach Vereinbarung</dd>
									<dt className="tabular-nums text-black-400">So</dt>
									<dd className="text-black-400">Geschlossen</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
