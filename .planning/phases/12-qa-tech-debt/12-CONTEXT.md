# Phase 12: QA & Tech-Debt - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Gesamtsystem validieren, verbleibende Tech-Debt bereinigen und bewusste Architektur-Entscheidungen dokumentieren. Letzte Phase vor v1.1 Milestone-Abschluss. Umfasst: Incomplete-Badge fuer Profile, Typo-Korrektur in Collection-Labels, Versions-Entscheidung dokumentieren, voller QA-Check mit Regressions-Pruefung und sofortiger Fehlerbehebung.

</domain>

<decisions>
## Implementation Decisions

### Incomplete-Badge (HUB-05)
- Badge als farbiger Tag in eigener Spalte "Hub-Status" in der Profil-Liste (Admin-Uebersicht)
- Nur Pflicht-Hub-Felder zaehlen als "incomplete" (konsistent mit validate:hub-fields Script aus Phase 9):
  - erlaubte_fluegelanzahl (Step 4)
  - erlaubte_oeffnungsarten (Step 5)
  - erlaubte_fensterformen (Step 6)
  - erlaubte_farben (Step 8)
  - erlaubte_verglasungen (Step 9)
- Visuell: Gruener Tag "Vollstaendig" vs. oranger/roter Tag "Unvollstaendig"
- Tooltip bei Hover auf "Unvollstaendig" zeigt welche Pflicht-Felder noch leer sind
- Filter-Option in der Profil-Liste: "Nur unvollstaendige anzeigen" (Dropdown oder Toggle)
- KEIN Badge im Edit-View (redundant — leere Felder direkt sichtbar)

### Typo-Korrektur (DEBT-03)
- Collection-Labels anpassen, damit Payload saubere Type-Namen generiert
- ALLE Collections systematisch pruefen, nicht nur die 2 bekannten Typos (Fensterforman, Sicherheitsgla)
- Nach Label-Aenderung: `npm run generate:types` + alle Imports in filters.ts, types.ts, Step-Components etc. aktualisieren
- Bekannte Typos: `Fensterforman` (aus slug "fensterformen") und `Sicherheitsgla` (aus slug "sicherheitsglas")

### Versions-Dokumentation (DEBT-06)
- Dreifache Dokumentation der Entscheidung "Kein versions:drafts in v1.1":
  1. ADR: `docs/entscheidungen/001_2026-03-20_keine-versions-drafts-v11.md` (formell mit Kontext, Entscheidung, Begruendung, Konsequenzen)
  2. Inline-Kommentar in `src/collections/produkte/profile.ts` (direkt am Code)
  3. REQUIREMENTS.md Out-of-Scope Eintrag um Begruendung erweitern
- Kernbegruendung: _status Migration-Risiko — bestehende Profile werden unsichtbar wegen _status=null

### Gesamtvalidierung
- Voller QA-Check inkl. Regressions-Pruefung:
  1. Build + TypeCheck + Lint laufen lassen
  2. Alle 32 v1.1 Requirements nochmal durchgehen und Status verifizieren
  3. Konfigurator-Steps manuell durchtesten (alle 10 Steps)
  4. Admin-Panel Funktionen pruefen (Undo/Redo, Edit-History, Hub-Felder)
  5. Die 5 Phase-12 Success Criteria explizit pruefen
- Gefundene Fehler sofort fixen (nicht nur dokumentieren)
- Validierungsbericht erstellen: `docs/audits/001_2026-03-20_v11-qa-validierung.md`
- REQUIREMENTS.md updaten: alle erledigten Requirements auf Complete setzen

### Bereits erledigte Items (kein Handlungsbedarf)
- DEBT-04 (dichtungsfarben Hub-Filter): Bereits in Phase 9 implementiert (filters.ts Zeile 206-213)
- DEBT-05 (filterOptions konsistent): Bereits auf allen 13 Hub-Feldern gesetzt (Code-Scan: 13/13)
- DEBT-01 (Step 9 Hub-Filterung): Phase 9 erledigt
- DEBT-02 (aktiv-Check): Phase 9 erledigt

### Claude's Discretion
- Payload Admin List-Component Implementierung fuer das Incomplete-Badge (Custom Cell Component)
- Exakte Label-Aenderungen fuer saubere Type-Generierung (Payload Singular/Plural Logik)
- ADR-Format und Detaillierungsgrad
- QA-Bericht Struktur und Checklisten-Format
- Reihenfolge der QA-Pruefungen (Build first, dann funktional)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Tech-Debt Checkliste (Primary Spec)
- `docs/todos/008_2026-03-15_admin-panel-umbau-plan.md` Section 8 — Tech-Debt Checkliste mit allen bekannten Schulden und Priorisierung

### Hub-Filter Architektur
- `docs/todos/009_2026-03-18_hub-ersetzt-ketten-mapping.md` — Vollstaendiges Step-fuer-Step Mapping, Pflicht vs. optionale Hub-Felder

### Requirements
- `.planning/REQUIREMENTS.md` — HUB-05, DEBT-03, DEBT-04, DEBT-05, DEBT-06 (Phase 12 Requirements)

### Validation Script (Referenz fuer Incomplete-Kriterien)
- `src/scripts/validate-hub-fields.ts` oder `src/migrations/` — validate:hub-fields Script definiert Pflicht-Felder (als Referenz fuer Badge-Logik)

### Prior Phase Context
- `.planning/phases/09-filter-logic-refactor/09-CONTEXT.md` — Hub-Filter Entscheidungen, getHubField(), Pflicht vs. optionale Felder
- `.planning/phases/07-deployment/07-CONTEXT.md` — Hub-Felder Struktur, 13 Relationship-Felder, filterOptions
- `.planning/phases/11-edit-history-hooks-ui/11-CONTEXT.md` — Edit-History Pattern, Profile-Collection Hooks

### Betroffener Code
- `src/collections/produkte/profile.ts` — Incomplete-Badge Cell Component, Inline-Kommentar Versions-Entscheidung
- `src/collections/ausstattung/sicherheitsglas.ts` — Label-Korrektur fuer Type-Generierung
- `src/collections/produkte/fensterformen.ts` — Label-Korrektur fuer Type-Generierung (falls vorhanden)
- `src/payload-types.ts` — Generiert, wird nach Label-Fix neu generiert
- `src/lib/konfigurator/filters.ts` — Import-Updates nach Type-Rename
- `src/lib/konfigurator/types.ts` — Import-Updates nach Type-Rename

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/admin/` — 15 Admin-Components vorhanden (dashboard, toolbar, history-panel etc.)
- `src/scripts/validate-hub-fields.ts` — Bestehendes Validation Script definiert Pflicht-Felder, Logik kann fuer Badge wiederverwendet werden
- `src/collections/produkte/profile.ts` — 13 Hub-Felder mit filterOptions bereits gesetzt, Zeile 165-346
- Payload Admin Cell Components: Custom Cells koennen pro Collection-Feld registriert werden

### Established Patterns
- Payload 3.79 Admin-Components: String-basierte Component-Registrierung (`"@/components/admin/name#export"`)
- Admin Custom Cells: Payload unterstuetzt `admin.components.Cell` pro Feld oder Virtual Fields fuer List-Views
- Profile-Collection hat bereits beforeDocumentControls (ProfileEditToolbar) und Tabs (Kombinationen/Ausstattung/Historie)
- docs/-Ordner Namensschema: `{NNN}_{YYYY-MM-DD}_{beschreibung-kebab-case}.md`

### Integration Points
- `src/collections/produkte/profile.ts` admin.listSearchableFields oder admin.components: Badge-Spalte registrieren
- `src/payload.config.ts`: Keine Aenderungen erwartet
- `npm run generate:types` + `npm run generate:importmap` nach Schema-Aenderungen
- Import Map muss nach neuen Admin-Components regeneriert werden

</code_context>

<specifics>
## Specific Ideas

- Incomplete-Badge Tooltip zeigt z.B.: "Fehlend: erlaubte_oeffnungsarten, erlaubte_verglasungen" — Feldnamen als Liste
- Filter "Nur unvollstaendige" ist besonders nuetzlich beim initialen Hub-Befuellen (Admin arbeitet systematisch alle ab)
- ADR-Format: Kontext → Entscheidung → Begruendung → Konsequenzen → Alternativen betrachtet
- QA-Bericht als Checkliste: jedes Kriterium mit Pass/Fail/Fixed Status
- Bei Typo-Pruefung: `npm run generate:types` ausfuehren und diff pruefen fuer unerwartete Type-Namen

</specifics>

<deferred>
## Deferred Ideas

- Detailliertes Badge mit Zaehler "3/5 Pflichtfelder" statt binaer — BADG-01 (v1.2)
- Incomplete-Badge fuer den Edit-View als Banner — nicht noetig, leere Felder direkt sichtbar
- Automatische Hub-Feld-Vorschlaege basierend auf Material/Produkttyp — eigene Feature-Phase
- PDF-Export des QA-Berichts — nicht geplant

</deferred>

---

*Phase: 12-qa-tech-debt*
*Context gathered: 2026-03-20*
