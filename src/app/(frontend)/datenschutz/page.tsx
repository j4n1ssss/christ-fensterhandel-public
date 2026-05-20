import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ContactCtaStripe } from "@/components/marketing/contact-cta-stripe";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { SectionDivider } from "@/components/marketing/section-divider";

export const metadata: Metadata = {
	title: "Datenschutz · Muster Fenster",
	description:
		"Datenschutzerklärung nach Art. 13/14 DSGVO — Muster Fenster, Musterstadt.",
};

/**
 * /datenschutz — Datenschutzerklärung nach Art. 13/14 DSGVO.
 * Stand: 2026-05-07. Bei Änderungen an Tools/Services muss der
 * jeweilige Abschnitt angepasst werden.
 */
export default function DatenschutzPage() {
	return (
		<>
			<MarketingHero
				breadcrumb={[{ label: "Start", href: "/" }, { label: "Datenschutz" }]}
				eyebrow="Rechtliches"
				headline={<>Datenschutz —</>}
				headlineHighlight="DSGVO-konform."
				body="Informationen zur Verarbeitung personenbezogener Daten nach Art. 13 und 14 DSGVO. Wir verarbeiten Daten nur, soweit es für Beratung, Angebot, Vertrag, Lieferung sowie den sicheren Betrieb dieser Website erforderlich ist."
				stats={[
					{ label: "Stand", value: "Mai 2026" },
					{ label: "Server", value: "Deutschland" },
					{ label: "Tracking", value: "cookielos" },
				]}
			/>

			<section
				aria-labelledby="datenschutz-heading"
				className="relative bg-white py-24 md:py-32"
			>
				<SectionDivider />
				<Container size="xl">
					<div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
						<div className="md:col-span-4">
							<p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
								Datenschutzerklärung
							</p>
							<p className="mt-4 text-sm leading-relaxed text-black-600">
								Diese Erklärung gilt für die Datenverarbeitung auf dieser
								Website sowie im Rahmen vorvertraglicher und vertraglicher
								Beziehungen mit Muster Fenster.
							</p>
						</div>

						<div className="md:col-span-8 space-y-12">
							<LegalBlock label="1. Verantwortlicher">
								Muster Fenster
								<br />
								Inhaber: M. Mustermann
								<br />
								Musterstraße 1
								<br />
								12345 Musterstadt
								<br />
								Deutschland
								<br />
								<br />
								Telefon: +49 (0)30 000 000 00
								<br />
								E-Mail: info@example.com
							</LegalBlock>

							<LegalBlock label="2. Allgemeine Hinweise">
								Personenbezogene Daten sind alle Daten, die sich auf eine
								identifizierte oder identifizierbare natürliche Person beziehen
								(Art. 4 Nr. 1 DSGVO). Wir verarbeiten Ihre personenbezogenen
								Daten ausschließlich auf Grundlage der DSGVO und des BDSG. Eine
								Übermittlung in Drittländer findet nur statt, wenn
								Garantien nach Art. 44 ff. DSGVO bestehen. Diese Website wird
								ausschließlich verschlüsselt per TLS / HTTPS ausgeliefert.
							</LegalBlock>

							<LegalBlock label="3. Hosting und Server-Logfiles">
								Diese Website wird auf einem Server in Deutschland
								gehostet. Bei jedem Aufruf erhebt der Server automatisch
								technische Daten (Server-Logfiles): IP-Adresse, Datum und
								Uhrzeit der Anfrage, abgerufene Datei und Datenmenge,
								HTTP-Statuscode, Referrer-URL und User-Agent.
								<br />
								<br />
								<strong>Zweck:</strong> Sicherstellung des Betriebs, Abwehr von
								Angriffen, Fehleranalyse.
								<br />
								<strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO
								(berechtigtes Interesse am sicheren Betrieb).
								<br />
								<strong>Speicherdauer:</strong> in der Regel 14 Tage, danach
								automatische Löschung — sofern nicht zur Abwehr eines konkreten
								Angriffs länger erforderlich.
							</LegalBlock>

							<LegalBlock label="4. Cookies und Cookie-Einwilligung">
								Wir setzen technisch notwendige Cookies ein, um den Betrieb der
								Website (Login-Sessions, Sicherheit, Cookie-Einwilligung) zu
								gewährleisten. Diese sind nicht zustimmungspflichtig (§ 25 Abs.
								2 Nr. 2 TDDDG, Art. 6 Abs. 1 lit. f DSGVO).
								<br />
								<br />
								Beim ersten Besuch zeigen wir einen Cookie-Banner mit den
								Kategorien <em>Notwendig</em>, <em>Statistik</em> und{" "}
								<em>Marketing</em>. Ihre Auswahl wird im Cookie{" "}
								<code>cookie-consent</code> für 365 Tage gespeichert
								(Rechtsgrundlage: Art. 6 Abs. 1 lit. c DSGVO i.V.m. § 25 Abs. 1
								TDDDG zur Dokumentation der Einwilligung).
								<br />
								<br />
								Sie können Ihre Einwilligung jederzeit widerrufen, indem Sie das
								Cookie in Ihrem Browser löschen. Die Rechtmäßigkeit der bis zum
								Widerruf erfolgten Verarbeitung bleibt unberührt.
							</LegalBlock>

							<LegalBlock label="5. Reichweitenmessung mit Pirsch Analytics">
								Wir nutzen <strong>Pirsch Analytics</strong> der emvi software
								GmbH, Schkeuditzer Str. 1, 04435 Schkeuditz, Deutschland, zur
								statistischen Auswertung von Besucherzugriffen.
								<br />
								<br />
								Pirsch arbeitet <strong>cookielos</strong> und verzichtet auf
								Cross-Site-Tracking. Zur Wiedererkennung von Sitzungen wird ein
								täglich rotierender Hash aus IP-Adresse, User-Agent und einem
								serverseitigen Salt gebildet — die IP-Adresse selbst wird{" "}
								<strong>nicht gespeichert</strong>. Erfasst werden:
								Seitenaufruf, Referrer, anonymisierte Geo-Daten (Land, ggf.
								Region), Browser-/Geräte-Typ.
								<br />
								<br />
								<strong>Zweck:</strong> Reichweitenmessung, Optimierung von
								Inhalten und Performance.
								<br />
								<strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO
								(berechtigtes Interesse an einer datenschutzfreundlichen
								Reichweitenanalyse). Da Pirsch keine Endgeräte-Informationen im
								Sinne des § 25 TDDDG speichert oder ausliest, ist keine
								Einwilligung erforderlich.
								<br />
								<strong>Server-Standort:</strong> Deutschland.
								<br />
								<strong>Auftragsverarbeitung:</strong> Es besteht ein
								Auftragsverarbeitungsvertrag (AVV) nach Art. 28 DSGVO.
								<br />
								<strong>Speicherdauer:</strong> aggregierte Statistik-Daten
								werden zeitlich unbegrenzt in anonymisierter Form gespeichert.
								<br />
								<br />
								Datenschutzerklärung des Anbieters:{" "}
								<a
									href="https://pirsch.io/privacy"
									target="_blank"
									rel="noopener noreferrer"
									className="underline decoration-brand-600 underline-offset-2 hover:text-brand-700"
								>
									pirsch.io/privacy
								</a>
								.
							</LegalBlock>

							<LegalBlock label="6. Konfigurator und Angebotsanfragen">
								Wenn Sie unseren Fenster-/Tür-Konfigurator nutzen oder ein
								Angebot anfragen, verarbeiten wir die von Ihnen angegebenen
								Daten (Name, Anschrift, E-Mail, Telefon, Konfigurations- und
								Maßangaben, ggf. Objekt-/Bauinformationen).
								<br />
								<br />
								<strong>Zweck:</strong> Erstellung und Übermittlung eines
								individuellen Angebots, Beratung, Vertragsanbahnung,
								Abwicklung der Bestellung.
								<br />
								<strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
								(Vertrag bzw. vorvertragliche Maßnahmen).
								<br />
								<strong>Empfänger:</strong> intern Mitarbeitende von
								Muster Fenster, ggf. Hersteller/Lieferanten zur
								Auftragsabwicklung sowie unser Workflow-Backend (n8n,
								selbstgehostet in Deutschland) zur Weiterleitung der Anfrage.
								<br />
								<strong>Speicherdauer:</strong> bis zum Abschluss der Anfrage,
								bei Vertragsschluss bis zum Ablauf der gesetzlichen
								Aufbewahrungspflichten (i.d.R. 6 bzw. 10 Jahre nach §§ 147 AO,
								257 HGB).
							</LegalBlock>

							<LegalBlock label="7. Kundenkonto und Login">
								Für die Nutzung des Kundenbereichs (Anfragen, Angebote,
								Bestellungen verwalten) können Sie ein Kundenkonto anlegen.
								Dabei verarbeiten wir E-Mail-Adresse, Passwort (nur als
								gesalzener Hash gespeichert) sowie die mit dem Konto
								verknüpften Anfragen und Bestellungen. Die Anmeldung erfolgt
								über ein technisch notwendiges Session-Cookie.
								<br />
								<br />
								<strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
								(Vertrag bzw. vorvertragliche Maßnahmen).
								<br />
								<strong>Speicherdauer:</strong> bis zur Löschung des Kontos
								durch Sie. Eine Löschung können Sie jederzeit per E-Mail an{" "}
								<a
									href="mailto:info@example.com"
									className="underline decoration-brand-600 underline-offset-2 hover:text-brand-700"
								>
									info@example.com
								</a>{" "}
								verlangen, sofern keine gesetzlichen Aufbewahrungspflichten
								entgegenstehen.
							</LegalBlock>

							<LegalBlock label="8. Zahlungsabwicklung über Stripe">
								Für die Online-Zahlung von Anzahlungen oder Rechnungen nutzen
								wir den Zahlungsdienstleister <strong>Stripe</strong>: Stripe
								Payments Europe Ltd., 1 Grand Canal Street Lower, Grand Canal
								Dock, Dublin, Irland.
								<br />
								<br />
								Beim Aufruf des Bezahlvorgangs werden die für die Abwicklung
								erforderlichen Daten (Name, Rechnungsbetrag, Vorgangs-ID, ggf.
								E-Mail-Adresse) an Stripe übermittelt. Zahlungsdaten
								(Kartennummer, IBAN etc.) geben Sie ausschließlich gegenüber
								Stripe an — wir erhalten keinen Zugriff darauf.
								<br />
								<br />
								<strong>Zweck:</strong> Zahlungsabwicklung, Betrugsprävention.
								<br />
								<strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
								(Vertragserfüllung), bzgl. Betrugsprävention Art. 6 Abs. 1 lit.
								f DSGVO.
								<br />
								<strong>Drittlandtransfer:</strong> Stripe kann Daten in die USA
								übermitteln. Stripe ist nach dem EU-US Data Privacy Framework
								zertifiziert; ergänzend liegen Standardvertragsklauseln nach
								Art. 46 Abs. 2 lit. c DSGVO vor.
								<br />
								<br />
								Datenschutzerklärung von Stripe:{" "}
								<a
									href="https://stripe.com/de/privacy"
									target="_blank"
									rel="noopener noreferrer"
									className="underline decoration-brand-600 underline-offset-2 hover:text-brand-700"
								>
									stripe.com/de/privacy
								</a>
								.
							</LegalBlock>

							<LegalBlock label="9. Kontaktaufnahme per E-Mail oder Telefon">
								Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten
								wir Ihre Angaben (Name, Kontaktdaten, Inhalt der Anfrage) zur
								Bearbeitung Ihres Anliegens.
								<br />
								<br />
								<strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO bei
								vertragsbezogenen Anfragen, sonst Art. 6 Abs. 1 lit. f DSGVO
								(berechtigtes Interesse an der Beantwortung Ihrer Anfrage).
								<br />
								<strong>Speicherdauer:</strong> bis zur Erledigung der Anfrage,
								längstens bis zum Ablauf gesetzlicher Aufbewahrungspflichten.
							</LegalBlock>

							<LegalBlock label="10. Empfänger und Auftragsverarbeiter">
								Eine Weitergabe Ihrer Daten erfolgt nur, soweit dies zur
								Vertragserfüllung erforderlich ist, eine gesetzliche
								Verpflichtung besteht oder Sie eingewilligt haben. Typische
								Empfänger sind:
								<br />
								<br />
								— Hosting-Dienstleister (Server in Deutschland)
								<br />
								— Pirsch Analytics (emvi software GmbH, Deutschland)
								<br />
								— Stripe Payments Europe Ltd. (Irland / USA)
								<br />
								— Hersteller / Lieferanten zur Auftragsabwicklung
								<br />
								— Logistik-/Versanddienstleister
								<br />
								— Steuerberater, Banken, ggf. Inkasso- und Rechtsdienstleister
								<br />
								<br />
								Mit allen Auftragsverarbeitern sind Verträge nach Art. 28 DSGVO
								geschlossen.
							</LegalBlock>

							<LegalBlock label="11. Ihre Rechte als betroffene Person">
								Sie haben das Recht auf:
								<br />
								<br />
								— <strong>Auskunft</strong> über Ihre verarbeiteten Daten (Art.
								15 DSGVO)
								<br />
								— <strong>Berichtigung</strong> unrichtiger Daten (Art. 16
								DSGVO)
								<br />
								— <strong>Löschung</strong> (Art. 17 DSGVO)
								<br />
								— <strong>Einschränkung</strong> der Verarbeitung (Art. 18
								DSGVO)
								<br />
								— <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)
								<br />
								— <strong>Widerspruch</strong> gegen Verarbeitungen auf
								Grundlage berechtigter Interessen (Art. 21 DSGVO)
								<br />
								— <strong>Widerruf</strong> erteilter Einwilligungen mit
								Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)
								<br />
								<br />
								Zur Ausübung Ihrer Rechte genügt eine formlose Mitteilung an{" "}
								<a
									href="mailto:info@example.com"
									className="underline decoration-brand-600 underline-offset-2 hover:text-brand-700"
								>
									info@example.com
								</a>
								.
							</LegalBlock>

							<LegalBlock label="12. Beschwerderecht bei der Aufsichtsbehörde">
								Unbeschadet anderweitiger Rechtsbehelfe haben Sie das Recht auf
								Beschwerde bei einer Datenschutz-Aufsichtsbehörde (Art. 77
								DSGVO). Für uns zuständig ist:
								<br />
								<br />
								Die zuständige Aufsichtsbehörde für den Datenschutz und das Recht auf
								Akteneinsicht (Musterbehörde)
								<br />
								Musterallee 99
								<br />
								12345 Musterstadt
								<br />
								Telefon: +49 (0)30 000 000 99
								<br />
								E-Mail: datenschutz@example.com
							</LegalBlock>

							<LegalBlock label="13. Keine automatisierte Entscheidungsfindung">
								Eine automatisierte Entscheidungsfindung im Sinne des Art. 22
								DSGVO einschließlich Profiling findet nicht statt.
							</LegalBlock>

							<LegalBlock label="14. Aktualität und Änderung">
								Diese Datenschutzerklärung hat den Stand{" "}
								<strong>7. Mai 2026</strong>. Durch die Weiterentwicklung
								unserer Website oder geänderte gesetzliche bzw. behördliche
								Vorgaben kann es notwendig werden, diese Datenschutzerklärung
								anzupassen. Die jeweils aktuelle Fassung kann jederzeit auf
								dieser Seite abgerufen werden.
							</LegalBlock>
						</div>
					</div>
				</Container>
			</section>

			<ContactCtaStripe
				variant="anfrage"
				headline="Frage zum Datenschutz?"
				subline="Wir antworten direkt."
				body="Bei Anliegen zu Ihren Rechten als betroffene Person, zu Auskunft, Berichtigung oder Löschung Ihrer Daten schreib uns kurz an info@example.com."
			/>
		</>
	);
}

function LegalBlock({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="border-t border-black-200 pt-8">
			<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
				{label}
			</p>
			<div className="mt-4 text-base leading-relaxed text-black-800 md:text-lg">
				{children}
			</div>
		</div>
	);
}
