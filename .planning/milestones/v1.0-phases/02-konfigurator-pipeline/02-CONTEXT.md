# Phase 2: Konfigurator-Pipeline - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

10-Step Fenster-Konfigurator mit konditionaler Ketten-Logik und Live-Vorschau. Kunde durchlaeuft alle Steps von Produkttyp bis Zusammenfassung. Jede Auswahl filtert die naechsten Optionen intelligent ueber CMS-Beziehungen. Warenkorb und Anfrage-Absenden sind NICHT Teil dieser Phase (Phase 3).

</domain>

<decisions>
## Implementation Decisions

### Step-Layout & Navigation
- 3-Spalten Layout: Links Step-Sidebar, Mitte Step-Inhalt, Rechts Live-Vorschau
- Sidebar IST die Fortschrittsanzeige (kein separater Balken oben) — Checkmarks fuer erledigte Steps, Pfeil fuer aktiven Step, ausgegraut fuer offene
- Navigation nur zurueck: Steps sind nur klickbar wenn bereits ausgefuellt. Vorwaerts-Springen nicht moeglich
- Auswahl-Optionen als Bild-Karten mit Badges (Titel, Beschreibung, Bild, Badges wie Lieferzeit/Garantie/Beliebt)
- Ausgewaehlte Karte wird visuell hervorgehoben (Border/Schatten)
- Weiter/Zurueck Buttons unter dem Step-Inhalt

### Live-Vorschau
- Rechtes Panel zeigt SVG-Fensterzeichnung OBEN + Text-Zusammenfassung UNTEN
- SVG ab Step 1 sichtbar — startet als generische Fenster-Silhouette, verfeinert sich mit jeder Auswahl
- Schematisch-clean Stil: Klare 2D-Linien, Fluegel als Rechtecke, Oeffnungsart-Symbole (Dreh-Pfeil, Kipp-Dreieck), Griff als Strich, Sprossen als Linien
- SVG zeigt live die gewaehlte Rahmenfarbe (Farb-Code aus CMS als Fuellfarbe)
- Masse werden als Beschriftung angezeigt (Breite x Hoehe), Flaeche berechnet
- Text-Zusammenfassung listet alle bisherigen Auswahlen mit Checkmarks

### Mobile-Verhalten
- Sidebar klappt zusammen zu Dropdown-Header oben ("Step 3/10 — Profil"), Klick oeffnet Step-Liste als Overlay
- Step-Inhalt darunter, Vorschau (SVG + Text) darunter
- Karten-Spalten: Claude's Discretion (1-spaltig auf Smartphone, 2-spaltig auf Tablet)
- Keine Swipe-Gesten — Navigation nur ueber Buttons
- Weiter/Zurueck Buttons als Sticky Footer am unteren Bildschirmrand fixiert

### Daten-Laden & Ladezustaende
- Alle CMS-Optionen beim Start laden (ein API-Call, alles lokal verfuegbar)
- Konditionale Filterung client-seitig aus vorgeladenen Daten (kein API-Call beim Step-Wechsel)
- Loading-State: Skeleton-Karten mit Shimmer-Effekt (Shadcn Skeleton Component)
- Konfigurator-Zustand URL-basiert (/konfigurator/fenster?step=3&material=kunststoff) — Link-Sharing, Browser-Zurueck, Bookmark moeglich
- LocalStorage-Persistenz: Konfiguration wird gespeichert, beim naechsten Besuch "Moechten Sie Ihre letzte Konfiguration fortsetzen?" Dialog

### Claude's Discretion
- State Management Architektur (React Context, Zustand, URL-State Sync)
- Genauer SVG-Aufbau und Rendering-Technik
- Skeleton-Layout Details
- Step-Transition Animationen (falls sinnvoll)
- Responsive Breakpoints fuer Karten-Spalten
- LocalStorage Key-Schema und Cleanup-Strategie

</decisions>

<specifics>
## Specific Ideas

- Referenz-Website: mein-fenster24.de (aehnlicher Konfigurator-Flow)
- SVG soll sich wie ein "echtes" Fenster anfuehlen — nicht zu technisch, nicht zu verspielt
- "Schick mir mal deinen Link" Use-Case fuer URL-State (Kundenberatung per Telefon)
- Bei Mehrfluegel-Fenstern: Fluegel nebeneinander als separate Bereiche in der SVG dargestellt

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `cn()` Utility (src/lib/utils.ts): Tailwind class merging — fuer alle UI-Components nutzen
- Tailwind CSS 4 mit @theme CSS Variables: Shadcn-kompatibles Theming bereits eingerichtet
- Payload REST API: Alle Collections ueber /api/{collection} abrufbar mit ?where-Queries

### Established Patterns
- Tailwind CSS 4 mit CSS-basierter @theme Config (nicht JS config) — neues Tailwind v4 Pattern
- Payload CMS 3.79 embedded in Next.js App Router — Collections in src/collections/ organisiert
- UUID als ID-Typ (postgresAdapter idType: 'uuid')
- Bidirektionale Beziehungen zwischen Collections (z.B. materialien <-> profile)

### Integration Points
- src/app/(frontend)/page.tsx: Aktuell leere Homepage — Landing Page kommt hier hin
- src/app/(frontend)/layout.tsx: Frontend-Layout ohne Navigation — braucht Konfigurator-Route
- Neue Route: src/app/(frontend)/konfigurator/fenster/ fuer den Hauptkonfigurator
- CMS Collections mit konditionaler Filterung: erlaubte_profile, fuer_fenster, fuer_balkontuer, erlaubte_materialien etc.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-konfigurator-pipeline*
*Context gathered: 2026-03-09*
