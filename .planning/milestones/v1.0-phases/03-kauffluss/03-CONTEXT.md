# Phase 3: Kauffluss - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Konfigurierte Produkte in den Warenkorb legen, Preise server-seitig berechnen, Rabattcodes anwenden, Kontaktdaten eingeben und Anfrage absenden. Reiner Gast-Flow (kein Login/Account). Auth und Dashboards sind Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Warenkorb-UI & Persistenz
- Eigene /warenkorb Seite (kein Drawer/Overlay)
- Warenkorb-Icon in der Navigation mit Badge-Zaehler (Anzahl Produkte)
- Kompakte Produktkarte mit Mini-SVG links (WindowSVG aus Phase 2 wiederverwenden) + Infos rechts (Profil, Masse, Farbe, Preis)
- Details per Aufklappen sichtbar (alle Konfigurations-Optionen)
- Stueckzahl direkt in der Karte aenderbar (+/- Buttons)
- "Bearbeiten" oeffnet Konfigurator mit allen Auswahlen vorausgefuellt, "Aktualisieren" ueberschreibt das Produkt im Warenkorb
- "Loeschen" entfernt Produkt mit Bestaetigung
- Warenkorb wird nach erfolgreichem Absenden komplett geleert
- Persistenz via Zustand + LocalStorage (gleicher Ansatz wie Konfigurator-Store)

### Preisdarstellung & Transparenz
- Gesamtpreis pro Produkt prominent sichtbar, aufklappbare Detail-Aufschluesselung (Grundpreis Flaeche x m2-Preis, einzelne Aufpreise fuer Verglasung, Farbe, Extras etc.)
- Preis-Label: "Preisvorschau: 1.234,00 EUR*" mit Fussnote "Unverbindliche Preisvorschau. Der endgueltige Preis wird bei der Anfrage berechnet."
- Einzelpreis + Zwischensumme bei Stueckzahl > 1 (z.B. "2x Fenster — Einzelpreis: 1.234 EUR — Zwischensumme: 2.468 EUR")
- MwSt separat ausgewiesen: Zwischensumme (netto), + 19% MwSt, = Gesamtbetrag (brutto)
- Server-seitige Preisberechnung beim Absenden liefert den verbindlichen Preis (Client-Preis ist nur Vorschau)

### Rabattcode
- Eingabefeld im Warenkorb (unter der Produktliste, vor der Gesamtsumme)
- Maximal ein Code pro Anfrage (kein Stacking)
- Spezifische Fehlermeldungen je nach Grund: "Code abgelaufen", "Mindestbestellwert X EUR nicht erreicht", "Code bereits aufgebraucht", "Code ungueltig"
- Erfolgreiche Anwendung: Alter Preis durchgestrichen + neuer Preis in Gruen, plus Rabatt-Zeile in der Aufschluesselung ("Rabatt (SOMMER2026): -10%")
- Server-seitige Validierung (gueltig, abgelaufen, aufgebraucht, min-bestellwert)

### Anfrage-Absenden Flow
- 3-Schritt-Flow: (1) Warenkorb pruefen → (2) Kontaktformular → (3) Zusammenfassung + Absenden
- Kontaktformular Pflichtfelder: Vorname, Nachname, E-Mail, Datenschutz-Checkbox
- Kontaktformular optionale Felder: Telefon, Adresse (Strasse, PLZ, Ort), Nachricht
- Server-seitige Zod-Validierung aller Kontaktdaten
- Reiner Gast-Flow (kein Login/Account) — Auth kommt in Phase 4
- Anfrage wird in CMS gespeichert mit Status "NEU" + eingefrorener Konfigurations-Snapshot (JSON)
- Konfigurations-Snapshot enthaelt alle Auswahlen + berechneten verbindlichen Preis

### Danke-Seite
- Zeigt: Anfrage-Nummer, kurze Zusammenfassung (Anzahl Produkte, Gesamtbetrag), naechste Schritte
- Text: "Sie erhalten eine Bestaetigung per E-Mail" + "Wir melden uns innerhalb von 2 Werktagen"
- Button: "Neue Konfiguration starten" (zurueck zur Landing Page)
- Warenkorb ist zu diesem Zeitpunkt bereits geleert

### Claude's Discretion
- Warenkorb-Store Architektur (eigener Zustand-Store vs. Erweiterung des Konfigurator-Stores)
- API-Route Struktur fuer Server-seitige Preisberechnung und Anfrage-Erstellung
- Exakte Zod-Schemas fuer Server-Validierung
- Snapshot-JSON-Struktur (welche Felder eingefroren werden)
- Konfigurator-Wiederherstellung beim "Bearbeiten" (URL-Params vs. Store-Injection)
- Zusammenfassungs-Schritt Layout und Darstellung
- Loading-States beim Absenden

</decisions>

<specifics>
## Specific Ideas

- Mini-SVG im Warenkorb: WindowSVG Component aus Phase 2 in kleiner Version (kein neues SVG noetig)
- Preis-Aufschluesselung inspiriert von Online-Shop Warenkorbseiten (Amazon/Zalando Style: aufklappbar)
- "Preisvorschau" statt "Preis" — bewusst als unverbindlich gekennzeichnet
- Christ verkauft B2B + B2C, daher MwSt-Ausweis wichtig
- Referenz mein-fenster24.de fuer den Anfrage-Flow (Kontaktformular nach Konfiguration)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `calculatePreviewPrice()` (src/lib/konfigurator/price-calculator.ts): Client-seitige Preisberechnung — Basis fuer Warenkorb-Preisanzeige
- `KonfiguratorSelections` Interface (src/lib/konfigurator/types.ts): Vollstaendige Typdefinition aller Auswahlen — wird fuer Snapshot genutzt
- `CMSData` Interface + `loadCMSData()` im Store: CMS-Daten bereits verfuegbar fuer Preisberechnung
- `WindowSVG` Component (src/components/konfigurator/preview/): Fenster-Vorschau — als Mini-Version im Warenkorb nutzbar
- `cn()` Utility (src/lib/utils.ts): Tailwind class merging
- Zustand Store Pattern mit persist/LocalStorage (src/lib/konfigurator/store.ts): Gleiches Pattern fuer Warenkorb-Store

### Established Patterns
- Zustand mit `persist` Middleware + `skipHydration:true` fuer SSR (Phase 2)
- Payload REST API fuer CMS-Daten (/api/{collection})
- React Hook Form + Zod fuer Formulare (Phase 2)
- UUID als IDs (Payload PostgreSQL Adapter)
- extractId Helper fuer Payload relationship fields (string | object)

### Integration Points
- Step 10 (Zusammenfassung) hat "In den Warenkorb" als naechsten Schritt — Uebergang von Konfigurator zu Warenkorb
- Anfragen-Collection (src/collections/business/anfragen.ts): Ziel fuer gespeicherte Anfragen mit Status + Snapshot
- StatusHistorie-Collection (src/collections/business/status-historie.ts): Erster Eintrag "NEU" bei Erstellung
- Rabattcodes-Collection (src/collections/business/rabattcodes.ts): Server-seitige Validierung
- Preisregeln-Collection (src/collections/business/preisregeln.ts): Grundpreis pro m2 nach Produkttyp/Material/Profil
- src/app/(frontend)/layout.tsx: Navigation erweitern um Warenkorb-Icon
- Neue Routes: /warenkorb, /anfrage (Kontaktformular), /anfrage/zusammenfassung, /anfrage/danke

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-kauffluss*
*Context gathered: 2026-03-09*
