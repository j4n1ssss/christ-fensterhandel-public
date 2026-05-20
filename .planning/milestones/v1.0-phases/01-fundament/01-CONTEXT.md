# Phase 1: Fundament - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Next.js + Payload CMS + PostgreSQL aufsetzen, alle 17+ CMS Collections mit Beziehungen und konditionaler Filterung anlegen, Seed-Script mit realistischen Drutex-Daten befuellen. Kein Frontend ausser Payload Admin Panel. Kein Konfigurator-UI.

</domain>

<decisions>
## Implementation Decisions

### Seed-Daten
- Echte Drutex-Daten verwenden (keine Platzhalter)
- 4 Kunststoff-Profile: Iglo 5 (Standard, 70mm, Uw 1.3), Iglo Energy (Premium, 82mm, Uw 0.95), Iglo Energy Classic (Top, 82mm, Uw 0.90), Iglo Light (Einstieg, 60mm, Uw 1.4)
- Nur Material "Kunststoff" im Seed befuellt — Holz, Alu, Kunststoff-Alu als Collections angelegt aber leer
- Schaetzpreise reichen (z.B. Iglo 5: ~150 EUR/m2, Iglo Energy: ~220 EUR/m2) — werden spaeter mit echten Preisen ueberschrieben
- ~10-15 Farben im Seed: Weiss, Cremweiss (Standard), Golden Oak, Nussbaum, Winchester, Mahagoni, Schokobraun (Dekor), Anthrazit RAL 7016, Basaltgrau RAL 7012, Silbergrau RAL 9006, Schwarzbraun RAL 8022 (Uni), plus RAL-Sonderfarbe als Kategorie
- 4 Verglasungen: 2-fach Standard (Ug 1.1), 3-fach Standard (Ug 0.7), 3-fach Schallschutz, 3-fach Sicherheitsglas
- Extras: Sprossen (Wiener, Helima, aufgesetzt), Glasdekore (Ornament, Milch, Chinchilla etc.), Griffe/Beschlaege (Standard, Sicherheit, abschliessbar)

### Admin-Panel Organisation
- 4 Gruppen nach Funktion: Produkte, Ausstattung, Business, System
- Produkte: Produkttypen, Materialien, Profile, Fluegelanzahl, Oeffnungsarten, Fensterformen, Zusatzlichter
- Ausstattung: Farben, Dichtungsfarben, Verglasungen, Schallschutz, Sicherheitsglas, Glasdekore, Sprossen, Extras
- Business: Anfragen, Preisregeln, Rabattcodes
- System: Users
- Deutsche Labels im Admin Panel (nicht englisch) — intuitiv fuer Christ-Mitarbeiter

### Collection-Felder Standards
- Jede Collection hat ein "aktiv" Boolean-Feld (Standard: true) — Admin kann Optionen deaktivieren ohne zu loeschen
- "sortOrder" Number-Feld nur bei sichtbaren Collections (die im Frontend/Konfigurator angezeigt werden), nicht bei Business-Collections (Anfragen, Preisregeln etc.)

### Preisstruktur
- Modell: Grundpreis pro m2 (abhaengig von Produkttyp + Material + Profil) + additive Aufpreise fuer Verglasung, Farben, Extras etc.
- Aufpreise: Standard-Aufpreis direkt im jeweiligen Item (z.B. Verglasung hat "aufpreis" Feld), PLUS Preisregeln-Collection kann Aufpreise materialabhaengig ueberschreiben (z.B. RAL-Farbe kostet bei Holz mehr)
- Anzeige: "ab X Euro" als unverbindliche Vorschau im Client, verbindlicher Preis erst nach Server-Berechnung
- Rabattcodes: Prozent-Rabatt, Festbetrag-Rabatt, Min-Bestellwert, Gueltigkeitszeitraum (von/bis Datum)

### Farben
- Aussen und Innen unabhaengig waehlbar, mit "Gleich wie Aussen" als Default-Option
- Dichtungsfarbe separat waehlbar
- Farb-Kategorien: Standard (kein Aufpreis), Dekor (kleiner Aufpreis), Uni-Farben (mittlerer Aufpreis), RAL-Sonderfarbe (hoher Aufpreis)

### Claude's Discretion
- Exakte Payload Collection Slugs und Field Types
- Database-Adapter Konfiguration (drizzle vs. node-postgres)
- TypeScript Ordnerstruktur und Import-Patterns
- ESLint/Prettier Konfiguration
- Seed-Script Architektur (einzelnes Script vs. modulare Dateien)
- Exakte Schaetzpreise fuer Grundpreise und Aufpreise

</decisions>

<specifics>
## Specific Ideas

- Referenz: mein-fenster24.de fuer den Konfigurator-Flow (Phase 2, aber Collection-Struktur sollte kompatibel sein)
- Drutex Iglo-Serie als Haupt-Produktlinie, mit echten technischen Daten (Kammern, Bautiefe, Uw-Werte)
- Farben orientieren sich am echten Drutex-Farbprogramm (Standard, Dekor, Uni, RAL)
- Griffe/Beschlaege als Teil der "Extras" Collection (nicht als separate Collection)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Keine — Projekt ist leer (nur .planning/ und CLAUDE.md)

### Established Patterns
- Keine bestehenden Patterns — dieses ist die erste Phase

### Integration Points
- Payload CMS Admin Panel ist das einzige Frontend in Phase 1
- Collections muessen kompatibel sein mit Phase 2 (10-Step Konfigurator) — konditionale API-Filterung muss stehen
- Anfragen-Collection muss kompatibel sein mit Phase 3 (Warenkorb) und Phase 4 (Dashboards)

</code_context>

<deferred>
## Deferred Ideas

- Rolllaeden/Insektenschutz als Extras — eigener Konfigurator in v2 (KONF-V2-02)
- Tueren-Konfigurator — eigene Pipeline in v2 (KONF-V2-01)

</deferred>

---

*Phase: 01-fundament*
*Context gathered: 2026-03-09*
