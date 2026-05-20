import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/marketing/legal-placeholder";

export const metadata: Metadata = {
	title: "AGB · Muster Fenster",
	description:
		"Allgemeine Geschäftsbedingungen von Muster Fenster — Regelungen zu Bestellung, Lieferung, Zahlung und Gewährleistung.",
};

/**
 * /agb — Platzhalter für die Allgemeinen Geschäftsbedingungen.
 * Inhalt wird später entweder hardcoded oder als Puck-Page verwaltet.
 */
export default function AGBPage() {
	return (
		<LegalPlaceholder
			breadcrumbLabel="AGB"
			eyebrow="Rechtliches"
			title={<>Allgemeine</>}
			titleHighlight="Geschäftsbedingungen."
			body="Die AGB regeln Bestellprozess, Lieferung, Zahlung, Eigentumsvorbehalt und Gewährleistung für Fenster, Türen und Rollläden — angepasst an die Besonderheit von maßgefertigten Bauteilen."
		/>
	);
}
