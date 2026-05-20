# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-10
**Phases:** 6 | **Plans:** 20 | **Commits:** 116

### What Was Built
- Komplettes CMS-Datenmodell (17+ Collections) mit konditionaler Filterung und Seed-Data
- 10-Step Fenster-Konfigurator mit Ketten-Logik, Live-SVG-Vorschau, Zustand/Zod/RHF
- Warenkorb + Server-Preisberechnung + Rabattcodes + Anfrage-Absenden
- Admin-Dashboard mit 6-Stufen-Status-Workflow + Kunden-Dashboard mit Auth
- Stripe Test-Zahlungen + N8N E-Mail-Automatisierung
- Puck Page Builder + Mehrsprachigkeit DE/EN + DSGVO-Basics

### What Worked
- GSD-Workflow mit Phase-Research -> Plan -> Execute -> Verify Zyklus hielt Qualitaet hoch
- Parallelisierung: Phase 6 konnte unabhaengig von Phases 2-5 laufen
- Zustand + persist Pattern war sofort SSR-safe ohne Workarounds
- Payload CMS Local API vermied REST-Overhead fuer Dashboard-Queries
- Konsequente Zod-Validierung auf allen Endpoints verhinderte Dateninkonsistenzen

### What Was Inefficient
- ROADMAP.md Plan-Checkboxen wurden nicht immer nach Execution aktualisiert (kosmetisch)
- Einige `payload as any` Type-Casts statt `npx payload generate:types` zu laufen
- Zod v4 zodResolver Inkompatibilitaet erforderte inline Schemas statt zentraler getStepSchema()
- Phase 7 (Deployment) wurde komplett deferred — haette frueher parallel starten koennen

### Patterns Established
- Inline Zod Schemas fuer zodResolver mit Zod v4 (StepMasse, ContactForm Pattern)
- Non-blocking Webhooks: try/catch um alle N8N-Calls, Fehler in Global loggen
- afterChange Hooks fuer Event-driven Architecture (Status -> Webhook -> E-Mail)
- Separate Zustand Stores pro Domain (konfigurator vs. warenkorb)
- RSC fuer Dashboard mit Local API, Client Components nur wo Interaktivitaet noetig

### Key Lessons
1. Payload CMS 3.x generierte Types muessen nach jeder Collection-Aenderung regeneriert werden — sonst haeufen sich `as any` Casts
2. Puck Editor Plugin hat nicht alle APIs oeffentlich — mapPayloadFieldsToRootProps musste inlined werden
3. i18n Middleware muss explizit Konfigurator/Warenkorb/Kunden Routes skippen
4. SSR + Zustand: skipHydration + useShallow sind Pflicht-Pattern
5. 16K LOC in 2 Tagen ist machbar wenn CMS-Collections das Datenmodell tragen

### Cost Observations
- Model mix: 100% opus (quality profile)
- Sessions: ~10 Sessions ueber 2 Tage
- Notable: Durchschnittlich 5 min pro Plan — Phasen 3+5 am schnellsten (4 min/Plan)

---

## Milestone: v1.1 — Admin-Panel Umbau: Profile Hub + UX

**Shipped:** 2026-03-23
**Phases:** 8 | **Plans:** 14 | **Commits:** 80

### What Was Built
- Profile als zentraler Hub mit 13 hasMany-Relationship-Feldern in 2 Tabs (Kombinationen / Ausstattung)
- Automatische Migration erlaubte_farben mit idempotenter Backfill-Logik und Unit Tests
- Hub-first Filterung ersetzt Ketten-Filter komplett in Steps 4-6, 8-9 mit USE_HUB Feature-Flag
- Undo/Redo Sicherheitsnetz mit Keyboard-Shortcuts (Cmd+Z/Shift+Z) und Save-Floor
- Edit-History mit afterChange Diff-Logging, History-Panel und ProfileLastEditor Header
- Hub-Status Badge mit Tooltip und Incomplete-Filter in Profile-Liste

### What Worked
- 3-Runden Audit-Zyklus (gaps_found → tech_debt → tech_debt) mit dedizierten Gap-Closure-Phasen (13, 14)
- PoC-first bei Undo/Redo — getFields/REPLACE_STATE frühzeitig verifiziert, vermied Sackgasse
- Bewiesene Patterns wiederverwenden: edit_history folgt status_historie Pattern, Hooks identisch
- Phase-Research vor Planning verhinderte Fehlentscheidungen (z.B. kein versions:drafts wegen _status)
- Hub-Mapping Spec in docs/todos/009 als Single Source of Truth fuer die riskanteste Phase (9)
- Parallel-Execution: Phases 10+11 parallel da beide nur von Phase 7 abhaengig

### What Was Inefficient
- ROADMAP bookkeeping (Checkboxen, Progress-Tabelle) musste nachtraeglich in Phase 14 korrigiert werden
- Unicode-Transliterationen (ue statt ü) schlichen sich in Phase 12 ein und brauchten eigene Phase 14
- Nyquist Validation auf keiner Phase vollstaendig — 8/8 PARTIAL
- credentials: "include" vergessen im REST fetch (Phase 11 → erst in Phase 14 gefixt)
- 3 Audit-Runden noetig statt 1 — früheres Cross-Phase Integration Testing haette Gaps frueher gefunden

### Patterns Established
- Hub-Pattern: Collection fields als einzige Filterquelle, kein Dual-Path mit Legacy
- useFormModified() Transition (true→false) als einzig zuverlaessiges Save-Signal in Payload v3
- skipContext Guard fuer afterChange Hooks (req.context.skipEditHistory)
- REQUIRED_HUB_FIELDS als shared Konstante (client-safe, keine Server-Imports)
- Gap-Closure als eigene Mini-Phasen statt Aufblaehen bestehender Phases

### Key Lessons
1. REST fetches in Payload Admin immer mit `{ credentials: "include" }` — ohne Cookie wird 401 geschluckt
2. Unicode: Echte UTF-8 Umlaute (ä/ö/ü) von Anfang an erzwingen, keine ASCII-Transliterationen
3. ROADMAP bookkeeping nach JEDER Phase-Completion sofort aktualisieren, nicht akkumulieren
4. PoC-first bei unbekannten APIs (Payload Form-API) spart massive Rework-Kosten
5. Audit-Milestone vor Completion ist unverzichtbar — findet Integration Gaps die Phase-Verification uebersieht
6. Hub-Pattern mit Feature-Flag erlaubt sicheren Rollout: false deployen → befuellen → validieren → true

### Cost Observations
- Model mix: 100% opus (quality profile)
- Sessions: ~8 Sessions ueber 6 Tage
- Notable: Gap-Closure Phasen (13, 14) waren mit 3-4 min/Plan am schnellsten — klar definierte Fixes

---

## Milestone: v1.2 — Admin-Navigation Umbau

**Shipped:** 2026-03-23
**Phases:** 2 | **Plans:** 4 | **Commits:** 15

### What Was Built
- Custom Admin Sidebar ersetzt Standard Payload Nav komplett (custom-nav.tsx mit Inline Styles)
- WebhookFehlerBadge Server-zu-Client Refactoring mit 60s Polling
- sessionStorage Dual-Logic fuer Dropdown-Persistenz (URL-basiert + Storage-basiert)
- Rollenbasierte Nav-Filterung mit filterByRole<T> generischer Funktion
- Dual-Layer Kunden-Admin-Block (access.admin + Middleware Redirect)
- 56 neue Tests (Custom Nav, Config, Badge, Session, Role, Access, Middleware)

### What Worked
- Fokussierter 1-Tages-Sprint: Klarer Scope (Navigation) mit 13 Requirements, keine Scope-Creep
- Audit in einer Runde bestanden (passed sofort, kein gap-closure noetig)
- TDD RED/GREEN Pattern konsequent in allen 4 Plans — Tests zuerst, dann Implementation
- Phase-Research identifizierte frueh: Payload Admin nutzt kein Tailwind → Inline Styles statt Rework
- Phasen-Verzeichnisse schon waehrend Execution nach milestones/v1.2-phases/ verschoben

### What Was Inefficient
- Plan 15-01 installierte Shadcn Components (Collapsible, Badge, Button) die dann in Plan 15-02 durch Inline Styles ersetzt wurden — haette in Research identifiziert werden koennen
- Nyquist Validation wieder nur PARTIAL (beide Phasen)
- Test description mismatch in test-role-visibility.test.tsx blieb als Tech Debt

### Patterns Established
- Inline Styles + scoped CSS fuer Payload Admin Components (kein Tailwind)
- sessionStorage Dual-Logic mit useRef prevPathnameRef (Reload vs. SPA Detection)
- filterByRole<T> generische Funktion mit optionalem roles Property
- access.admin Pattern fuer Collection-Level Admin Panel Restriction
- JWT Cookie Base64 Decode in Middleware (Edge-safe, ohne Crypto)

### Key Lessons
1. Payload Admin Panel nutzt KEIN Tailwind — alle Custom Components muessen Inline Styles oder scoped CSS verwenden
2. Kleinere Milestones (2 Phasen, 13 Reqs) sind effizienter als grosse — weniger Koordination, schnellerer Audit
3. Research-Phase sollte auch Build-Tool Kompatibilitaet pruefen (Shadcn→Inline war vermeidbar)
4. Dual-Layer Security (access + middleware) ist gutes Pattern fuer Defense in Depth
5. 1-Runden-Audit beweist: saubere Research und TDD minimieren Integration Gaps

### Cost Observations
- Model mix: 100% opus (quality profile)
- Sessions: ~3 Sessions an 1 Tag
- Notable: Durchschnittlich 4.25 min pro Plan — schnellster Milestone bisher

---

## Milestone: v1.3 — Bestellungsflow + Admin UX Redesign

**Shipped:** 2026-03-27
**Phases:** 7 | **Plans:** 15 | **Commits:** 104

### What Was Built
- status-config.ts als Single Source of Truth fuer 20 Statuse mit Farben, Labels, Kunden-Texten und Transitions
- Admin Detail-View komplett redesignt: AttentionBar + Splitbutton + 2-Spalten-Layout mit Tab-Panel (540 → 200 Zeilen)
- Admin Listen-View mit Filter-Tabs (Alle/Offen/Rueckfrage/In Produktion/Abgeschlossen), Attention-Score-Sortierung, Wartezeit-Farbcodierung
- Kunden-Dashboard mit 5-Phasen-Fortschrittsbalken (ProgressStepper) und verstaendlichen deutschen Status-Texten
- E-Mail-Trigger-System: 14 kundenrelevante Status-Aenderungen loesen N8N Webhooks mit customer_facing Flag aus
- Hersteller- und Stornierung-Felder mit konditionaler Sichtbarkeit und Validierung

### What Worked
- status-config.ts als zentraler Export-Punkt: Alle Consumer-Dateien importieren eine Map statt lokale Definitionen — Duplikation auf 0 reduziert
- Separate flat Records statt nested Config Object: Einfachere Imports, besseres Tree-Shaking, weniger Boilerplate
- BEM-Konvention fuer admin-custom.css: Strukturierte CSS-Klassen (.component__element--modifier) verhinderten Naming-Chaos
- 3-Runden-Audit mit Gap-Closure-Phasen (22, 23): Alle 22 Requirements zu 100% verified nach systematischer Schliessung
- QUICK_ACTIONS Map mit Test-Time Validation gegen VALID_TRANSITIONS: Garantiert konsistente UI/Backend Transitions
- formatCurrency als shared Module extrahiert: Ein Import statt 4 lokale Kopien

### What Was Inefficient
- Phase 21 hatte kein VERIFICATION.md — musste retroaktiv in Phase 23 erstellt werden (Prozess-Luecke)
- gast-tracking-form.tsx wurde in Phase 21 bewusst uebersprungen ("deferred") und brauchte dann Phase 22 Gap-Closure
- 3 Audit-Runden noetig (statt 1): erste Audit fand 5 Gaps, zweite Audit fand nochmal 2 Integration-Gaps
- ROADMAP Progress-Tabelle hatte falsche Spalten-Zuordnung fuer Phases 17-23 (kosmetisch, aber verwirrend)
- Nyquist Validation wieder nur PARTIAL auf allen 7 Phasen — systematisches Problem ueber alle Milestones

### Patterns Established
- Dual-Export Pattern: STATUS_COLORS (hex fuer admin inline styles) + STATUS_TAILWIND (classes fuer kunden components)
- Splitbutton-Pattern: primaere Status-Aktion als grosser Button + sekundaere im Chevron-Dropdown
- Attention-Score: Wartezeit x Status-Gewicht als automatische Prioritaets-Sortierung
- ProgressStepper mit CSS contents: Flat DOM mit connecting lines, wiederverwendbar als Mini-Variante
- Gap-Closure Phasen als Standard nach Audit: Eigene Phasen fuer Integration-Fixes und Verification-Closure

### Key Lessons
1. VERIFICATION.md muss in jeder Phase erstellt werden — retroaktive Erstellung ist teurer und fehleranfaellig
2. "Deferred" Items in Phase-Scope muessen explizit als Requirement in einer Folge-Phase getrackt werden
3. Flat Record Maps sind besser als nested Config: `STATUS_COLORS[key]` schlaegt `CONFIG[key].color` fuer Consumer-Ergonomie
4. BEM-Konvention im Admin-CSS verhindert Naming-Konflikte bei wachsender Komponentenzahl
5. 3-Runden-Audits kosten eigene Phasen — staerker in Cross-Phase Integration Testing investieren ab Phase 2
6. customer_facing Flag als Webhook-Filter ist eleganter als separate Email-Config
7. Admin-Components: Inline Styles fuer dynamische Werte + CSS-Klassen fuer strukturelle Layouts ist das optimale Muster

### Cost Observations
- Model mix: 100% opus (quality profile)
- Sessions: ~6 Sessions ueber 4 Tage
- Notable: Gap-Closure Phasen (22, 23) mit je 1 Plan waren am schnellsten (5 min/Plan). Hauptphasen (19) mit 4 Plans brauchten am laengsten pro Plan (~5-7 min)

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~10 | 6 | Initial GSD workflow established |
| v1.1 | ~8 | 8 | Audit-driven gap closure, PoC-first pattern |
| v1.2 | ~3 | 2 | Focused sprint, 1-round audit, Payload Admin styling lesson |
| v1.3 | ~6 | 7 | Status-Config centralization, Gap-Closure as standard post-audit |

### Cumulative Quality

| Milestone | Nyquist | Requirements | Tech Debt |
|-----------|---------|-------------|-----------|
| v1.0 | 6/6 compliant | 62/67 (93%) | 7 items |
| v1.1 | 0/8 compliant (PARTIAL) | 32/32 (100%) | 12 items + 8 Nyquist gaps |
| v1.2 | 0/2 compliant (PARTIAL) | 13/13 (100%) | 3 items |
| v1.3 | 0/7 compliant (PARTIAL) | 22/22 (100%) | 0 items |

### Velocity Trend

| Milestone | Plans | Days | Plans/Day | Min/Plan |
|-----------|-------|------|-----------|----------|
| v1.0 | 20 | 2 | 10.0 | ~5 |
| v1.1 | 14 | 6 | 2.3 | ~7 |
| v1.2 | 4 | 1 | 4.0 | ~4.25 |
| v1.3 | 15 | 4 | 3.75 | ~5 |

### Top Lessons (Verified Across Milestones)

1. CMS-first Architektur (Collections vor Code) beschleunigt alle folgenden Phasen massiv
2. Server-seitige Validierung + Access Control von Anfang an spart Nachruestung
3. Bewiesene Patterns (status_historie → edit_history, Zod inline) wiederverwenden statt neu erfinden
4. ROADMAP bookkeeping nach jeder Phase aktualisieren — akkumulierte Korrekturen kosten eigene Phasen
5. Audit-Milestone vor Completion findet Integration Gaps die Phase-level Verification uebersieht
6. Payload Admin nutzt kein Tailwind — Custom Admin Components immer mit Inline Styles/scoped CSS
7. Kleinere fokussierte Milestones (2 Phasen) laufen effizienter als grosse (8 Phasen)
8. VERIFICATION.md muss in jeder Phase erstellt werden — retroaktive Erstellung ist teurer
9. Flat Record Maps schlagen nested Config Objects fuer Consumer-Ergonomie und Tree-Shaking
10. Gap-Closure Phasen als Standard nach Audit einplanen — findet sich in v1.1 und v1.3 bestaetigt
