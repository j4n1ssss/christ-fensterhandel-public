# Phase 19: Admin Detail View Redesign - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Die Anfrage-Detail-Ansicht im Admin komplett umbauen: Attention Bar oben (Status + Wartezeit + Preis + Produkt-Zusammenfassung), Splitbutton-Aktionsleiste (primaere Aktion + Dropdown fuer Abzweigungen), und 2-Spalten-Layout mit Produktkarten links (60%) und Tab-Panel rechts (40%). Dazu admin-custom.css als zentrale CSS-Datei fuer strukturelle Admin-Styles. Die Listenansicht (Phase 20) und das Kunden-Dashboard (Phase 21) sind separate Phasen.

</domain>

<decisions>
## Implementation Decisions

### Splitbutton & Quick-Actions

- Splitbutton-Pattern: Primaere Aktion als grosser farbiger Button links, Chevron-Dropdown rechts fuer sekundaere Aktionen
- Primaere Aktion = erster Eintrag in VALID_TRANSITIONS (Vorwaerts-Aktion im linearen Flow)
- Button-Labels kommen aus einer neuen QUICK_ACTIONS Map in status-config.ts (menschenlesbare Aktions-Texte aus Todo 017), NICHT aus STATUS_LABELS
  - Beispiel: "Angebot erstellen" statt "Angebot versendet"
  - Beispiel: "An Hersteller weiterleiten" statt "An Hersteller"
- Sekundaere Aktionen (Rueckfrage, Ablehnen, Stornierung etc.) im Dropdown mit Status-Farbe als Dot-Indikator
- Kommentar-Pflicht (COMMENT_REQUIRED Statuse): Inline-Panel klappt unter dem Splitbutton auf (bewaehrtes Pattern aus status-workflow.tsx) -- kein Modal
- Stornierung-Sonderregel: Zusaetzlicher window.confirm() Dialog BEVOR das Kommentar-Panel aufklappt ("Stornierung ist endgueltig. Fortfahren?")
- Terminal-Statuse (storniert, abgeschlossen ohne wieder_geoeffnet): Splitbutton verschwindet komplett, stattdessen grauer Info-Text ("Diese Anfrage ist abgeschlossen." / "Storniert am [Datum]")
- Bei abgeschlossen: Kleiner "Wieder oeffnen" Link unterhalb des Info-Texts

### Tab-Panel (40% rechte Spalte)

- 4 Tabs: Kontakt / Timeline / Notizen / Details
- Kontakt-Tab: Name, E-Mail (mailto-Link), Telefon, Adresse, Nachricht, DSGVO-Anonymisieren-Button
- Timeline-Tab: Bestehende StatusTimeline Component (wird per refreshKey aktualisiert nach Status-Wechsel)
- Notizen-Tab: Textarea + Speichern-Button fuer interne_notizen (bestehende Logik)
- Details-Tab: ReadOnly-Anzeige von Hersteller-Infos und Stornierung-Feldern
  - Jede Sektion hat einen kleinen "Bearbeiten" Link der zur Standard-Payload-Ansicht navigiert
  - Hersteller-Infos: Bestellnummer, Lieferdatum, Notizen, Antwort
  - Stornierung-Infos: Grund, Rueckerstattungsbetrag, Rueckerstattungsstatus
- Details-Tab Sichtbarkeit: Nur bei relevantem Status (ab bezahlt fuer Hersteller-Felder, bei storniert fuer Stornierung-Felder). Bei fruehen Status (neu, in_bearbeitung, angebot_versendet) gibt es keinen Details-Tab
- Default-Tab: Letzter aktiver Tab per sessionStorage (wie Dropdown-Persistenz aus Phase 16). Fallback wenn kein gespeicherter Tab: Kontakt

### Attention Bar

- Volle Breite, ganz oben ueber dem Content
- Inhalte: Anfrage-Nummer, farbiger Status-Badge, Wartezeit mit Farb-Codierung, Gesamtpreis, Produkt-Zusammenfassung
- Wartezeit-Berechnung: last_status_change_at (Phase 18 Feld) -- zeigt wie lange die Anfrage im aktuellen Status steht
- Wartezeit-Schwellenwerte (in Tagen seit letztem Status-Wechsel):
  - Gruen (normal): < 1 Tag -- kein Signal, normaler Rand
  - Gelb (warn): 1-3 Tage -- gelber linker Rand (4px), Badge "Wartet X Tage"
  - Orange (urgent): 3-7 Tage -- oranger linker Rand, Badge "Wartet X Tage"
  - Rot (critical): > 7 Tage -- roter linker Rand, Badge "DRINGEND -- X Tage"
  - Farben: #eab308 (gelb), #f97316 (orange), #ef4444 (rot)
- Terminal-Statuse: Kein Wartezeit-Badge, stattdessen Abschluss-Datum anzeigen
- Produkt-Zusammenfassung: Typen-Aufschluesselung ("2x Fenster, 1x Balkontuer") -- gruppiert nach produkttyp mit Stueckzahl

### Produktkarten (60% linke Spalte)

- Stueckzahl-Badge: 32x32px, fett, farbiger Hintergrund, nur bei stueckzahl > 1 (bei 1 kein Badge -- weniger visuelles Rauschen)
- Preis-Darstellung: "249,00 EUR x 2 = 498,00 EUR" als separate Werte (nicht als zusammengesetzter String). Bei stueckzahl === 1 nur den Einzelpreis zeigen
- Produkt-Identitaet oben: Produkttyp + Material (groessere Schrift)
- Masse hervorgehoben: font-size 15px, font-weight 600 (die wichtigste Info fuer den Hersteller)
- Spec-Grid fuer Farben, Verglasung, Fluegel etc. darunter

### admin-custom.css

- Zentrale CSS-Datei fuer strukturelle Admin-Styles
- Eingebunden via Payload Config (admin.css oder custom SCSS Einstiegspunkt)
- Ersetzt repetitive Inline-Styles fuer Layout-Grid, Spacing, Card-Styles, Badge-Styles
- BEM-aehnliche Klassen: .attention-bar, .attention-bar--warn, .splitbutton, .product-card, .tab-panel etc.
- Nutzt var(--theme-*) Payload CSS Variables fuer Dark/Light Theme Kompatibilitaet

### Claude's Discretion

- Exakte Quick-Actions Labels fuer alle 20 Status (Basis: Todo 017 Tabelle, ergaenzt wo noetig)
- Tab-Panel Implementierung (State-Management, Tab-Switching Animation)
- Produktkarten Spec-Grid Layout (Farb-Swatches nur wenn Hex-Code vorhanden)
- admin-custom.css Klassen-Benennung und Struktur
- Attention Bar genaues Layout (Flexbox vs Grid)
- Kommentar-Panel Styling nach Splitbutton-Klick

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UX-Spezifikation
- `docs/audits/001_2026-03-23_anfrage-detail-view-ux-audit.md` -- Detaillierte Mockups fuer Attention Bar, Quantity Badge, Quick-Actions, 2-Spalten-Layout, Produktkarten-Design, Wartezeit-Logik, CSS-Refactoring-Empfehlung
- `docs/todos/017_2026-03-22_bestellungs-flow-verbesserung.md` -- Quick-Actions-Tabelle pro Status, Farb-Codierung, Admin-UX Verbesserungen, Wartezeit-Anzeige, Edge Cases

### Status-System (Phase 17+18 Basis)
- `src/lib/status-config.ts` -- STATUS_COLORS, STATUS_LABELS, STATUS_GROUP, alle 20 StatusKeys (QUICK_ACTIONS Map hier ergaenzen)
- `src/lib/status-transitions.ts` -- VALID_TRANSITIONS, COMMENT_REQUIRED, getNextStatuses()

### Bestehende Detail-View (komplett umzubauen)
- `src/components/admin/anfrage-detail-view.tsx` -- Aktuelle 540-Zeilen Implementation mit 3-Spalten-Layout und Inline-Styles
- `src/components/admin/status-workflow.tsx` -- Aktuelle flat-button Implementation, Kommentar-Pflicht-Pattern, submitStatusChange() Logik
- `src/components/admin/status-timeline.tsx` -- Timeline-Component, wird im Tab-Panel wiederverwendet

### Payload Config
- `src/payload.config.ts` -- Admin-Konfiguration Zeile 51-74, CSS-Einstiegspunkt hier ergaenzen

### Anfragen-Collection (Felder-Referenz)
- `src/collections/business/anfragen.ts` -- Alle Felder inkl. Phase 18 Hersteller/Stornierung-Felder, last_status_change_at

### Requirements
- `.planning/REQUIREMENTS.md` -- ADMN-01 bis ADMN-06, ADMN-10

### Prior Phase Context
- `.planning/phases/17-status-config-centralization/17-CONTEXT.md` -- Admin=hex/inline, Kunden=Tailwind Pattern
- `.planning/phases/18-statuses-transitions-collection-felder/18-CONTEXT.md` -- 20 Statuse, Transitions, neue Felder

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/admin/status-workflow.tsx`: submitStatusChange() Logik und Kommentar-Pflicht-Pattern koennen in den neuen Splitbutton uebernommen werden
- `src/components/admin/status-timeline.tsx`: Timeline-Component wird 1:1 im Tab-Panel wiederverwendet
- `src/lib/status-config.ts`: STATUS_COLORS (hex), STATUS_LABELS, STATUS_GROUP bereits fuer alle 20 Statuse vorhanden
- `src/lib/status-transitions.ts`: getNextStatuses() liefert bereits primary + branch Statuse
- formatCurrency() Helper in anfrage-detail-view.tsx -- wiederverwenden oder nach lib/ extrahieren

### Established Patterns
- Admin-Bereich: Inline Styles mit `var(--theme-*)` Payload CSS Variables + hex aus STATUS_COLORS (KEIN Tailwind)
- Kein Shadcn im Admin -- Radix Primitives direkt mit inline styles wo noetig
- sessionStorage fuer UI-State-Persistenz (Phase 16 Dropdown-Pattern als Vorlage)
- Payload useDocumentInfo() Hook fuer Document-ID
- Client-seitiges Fetch gegen /api/anfragen/{id}?depth=1 fuer Daten-Laden

### Integration Points
- Payload Config admin.components.views: anfrage-detail-view ist Custom View fuer Anfragen-Collection
- admin-custom.css muss in Payload Config eingebunden werden (admin.css oder custom import)
- QUICK_ACTIONS Map wird in status-config.ts ergaenzt (neue Export, gleiches Pattern wie STATUS_LABELS)
- Details-Tab "Bearbeiten" Link navigiert zu /admin/collections/anfragen/{id}?disableCustomView=true (bestehender Pattern)

</code_context>

<specifics>
## Specific Ideas

- Quick-Actions-Labels aus der Tabelle in Todo 017 ("Anfrage annehmen", "Angebot erstellen", "An Hersteller weiterleiten" etc.) statt technische Status-Namen
- Splitbutton inspiriert von GitHub's Status-Dropdown und Linear's Workflow-Picker
- Wartezeit-Rand (4px, volle Hoehe, farbig) inspiriert von Linear's Issue Priority -- staerkstes visuelles Signal
- "Diese Anfrage ist abgeschlossen" / "Storniert am [Datum]" als ruhiger Info-Text bei Terminal-Statuses
- Produkt-Zusammenfassung in Attention Bar: "2x Fenster, 1x Balkontuer" (gruppiert nach produkttyp)
- Stueckzahl-Badge NUR bei Menge > 1 (sonst visuelles Rauschen bei Einzelbestellungen)
- Preis als separate Werte: "249,00 EUR x 2 = 498,00 EUR" (nicht als String-Formel)

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 19-admin-detail-view-redesign*
*Context gathered: 2026-03-25*
