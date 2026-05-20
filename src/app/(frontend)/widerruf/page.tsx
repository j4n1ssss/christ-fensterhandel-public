import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/marketing/legal-placeholder";

export const metadata: Metadata = {
	title: "Widerrufsbelehrung · Muster Fenster",
	description:
		"Widerrufsrecht bei Fernabsatzverträgen — Hinweise zu Ausnahmen bei Maßanfertigungen für Fenster, Türen und Rollläden.",
};

/**
 * /widerruf — Platzhalter für die Widerrufsbelehrung.
 *
 * Wichtig fachlich: Bei Maßanfertigungen (was Fenster und Türen praktisch
 * immer sind) ist das gesetzliche Widerrufsrecht nach § 312g BGB
 * eingeschränkt — der finale Text muss diese Ausnahme korrekt abbilden.
 */
export default function WiderrufPage() {
	return (
		<LegalPlaceholder
			breadcrumbLabel="Widerruf"
			eyebrow="Rechtliches"
			title={<>Widerrufs­belehrung</>}
			titleHighlight="bei Fernabsatz."
			body="Verbraucher haben grundsätzlich ein 14-tägiges Widerrufsrecht bei Fernabsatzverträgen. Bei nach Kundenmaß angefertigten Fenstern, Türen und Rollläden gelten Einschränkungen nach § 312g Abs. 2 BGB. Die finale Widerrufsbelehrung wird derzeit erstellt."
			noticeEyebrow="Wichtig"
			noticeHeadline={
				<>
					Maßanfertigung bedeutet:
					<br />
					eingeschränktes Widerrufsrecht.
				</>
			}
			noticeBody="Sobald wir eine Maßaufnahme genommen oder eine individuelle Konfiguration in Auftrag gegeben haben, ist der Vertrag nach § 312g Abs. 2 Nr. 1 BGB vom Widerrufsrecht ausgeschlossen. Vor der Bestellung beraten wir ausführlich und schicken dir alle Daten schriftlich. Bei Fragen — direkt anrufen."
		/>
	);
}
