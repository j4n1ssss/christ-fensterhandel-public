# Phase 9: Filter Logic Refactor - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Hub-Felder auf Profile ersetzen die Ketten-Filter KOMPLETT fuer Steps 4-6 und 8-9. Kein Legacy-Fallback — Hub-Feld leer = Kategorie nicht angezeigt. USE_HUB Feature-Flag schaltet zwischen altem Ketten-Code und neuem Hub-Code (kein Mischbetrieb). Steps 1-3 und 7 behalten ihre bestehende Logik (vor Profil-Auswahl bzw. bereits am Profil). Validation Script prueft Profil-Vollstaendigkeit vor dem Flag-Switch. Keine UI-Aenderungen am Konfigurator-Layout, nur filters.ts + store.ts Backend-Logik.

</domain>

<decisions>
## Implementation Decisions

### Hub ersetzt Ketten-Filter
- Hub ERSETZT Ketten-Filter komplett (kein Fallback, keine Schnittmenge, kein Mischbetrieb)
- Hub-Feld leer (null/undefined/[]) = Kategorie wird NICHT im Konfigurator angezeigt
- Admin MUSS alle Pflicht-Hub-Felder befuellen bevor USE_HUB=true gesetzt wird
- Steps 1-3 + 7 behalten Ketten-Logik unveraendert (Produkttyp→Material→Profil→Masse)
- Steps 4-6 + 8-9 nutzen ausschliesslich Hub-Felder vom gewaehlten Profil
- Step 6 (Fensterform): Hub-Feld erlaubte_fensterformen ersetzt BEIDE alten Checks (erlaubte_fluegelanzahl + erlaubte_oeffnungsarten der Fensterform)

### getHubField() Helper
- Profil-Objekt wird aus cmsData.profile gelesen (kein separater Store-State)
- getHubField() gibt gefilterte Items zurueck (nicht nur IDs)
- Intersection: Hub-IDs ∩ cmsData-Items (cmsData enthaelt nur aktive Items)
- null-Return = Hub-Feld leer = Kategorie nicht anzeigen
- Signatur: getHubField(profil, field, cmsData, collection) → Item[] | null

### aktiv-Check
- Server-seitig beim Laden: `where[aktiv][equals]=true` als API-Query-Parameter in store.ts loadCMSData()
- Nur auf Collections mit aktiv-Feld (alle Produkt- und Ausstattungs-Collections)
- Collections ohne aktiv-Feld (z.B. preisregeln) werden ohne Filter geladen
- Profile auch aktiv-gefiltert (konsistent mit allen anderen Collections)
- Kein separater aktiv-Check in filters.ts noetig — cmsData enthaelt nur aktive Items

### Dichtungsfarben (Step 8)
- Step 8 Return erweitert: { aussen: Farben[], innen: Farben[], dichtungsfarben: Dichtungsfarben[] }
- Dichtungsfarben Hub-gefiltert via profil.erlaubte_dichtungsfarben
- Farben: Hub liefert erlaubte_farben (alle), Split nach fuer_aussen/fuer_innen NACH dem Hub-Filter
- fuer_aussen/fuer_innen sind Farb-Eigenschaften, keine Filter-Kette

### Step 9 Kategorien
- Alle 6 Kategorien (Verglasung, Schallschutz, Sicherheitsglas, Glasdekore, Sprossen, Extras) gleichbehandelt: Hub-gefiltert
- Hub-Feld leer = Kategorie komplett ausblenden (kein "Nicht verfuegbar"-Hinweis)
- Step 9 Return: jede Kategorie als Item[] | null (null = ausblenden)

### Pflicht vs. optionale Hub-Felder
- **Pflicht (Validation Script meldet Fehler wenn leer):**
  - erlaubte_fluegelanzahl (Step 4)
  - erlaubte_oeffnungsarten (Step 5)
  - erlaubte_fensterformen (Step 6)
  - erlaubte_farben (Step 8)
  - erlaubte_verglasungen (Step 9 — Konfigurator-Pflichtfeld)
- **Optional (leer = Kategorie ausgeblendet):**
  - erlaubte_zusatzlichter, erlaubte_dichtungsfarben, erlaubte_schallschutz, erlaubte_sicherheitsglas, erlaubte_glasdekore, erlaubte_sprossen, erlaubte_extras, erlaubte_produkttypen

### Feature-Flag USE_HUB
- Einzelner Boolean in filters.ts — schaltet zwischen altem Ketten-Code und neuem Hub-Code
- Kein Mischbetrieb (nicht "Hub fuer Step 4 aber Legacy fuer Step 8")
- Rollout: USE_HUB=false deployen → Admin befuellt Profile → validate:hub-fields → USE_HUB=true
- Nach Validierung: alten Ketten-Code und Feature-Flag komplett loeschen (v1.2 FLAG-01 + LEGC-01)

### Validation Script (FILT-06)
- npm-Script: `npm run validate:hub-fields`
- Prueft alle aktiven Profile auf vollstaendige Hub-Feld-Befuellung
- Unterscheidet Pflicht (Fehler) vs. optional (OK wenn leer)
- Output pro Profil: Feldname + Status + Anzahl Items
- Exit-Code 0 nur wenn alle Pflicht-Felder befuellt

### Claude's Discretion
- Exakte getHubField() Implementierung (Type-Guards, Edge Cases)
- store.ts depth-Aenderung (FILT-05): depth=1 fuer Profile vs. globale Aenderung
- Wie alte Ketten-Code-Pfade im Feature-Flag-Block strukturiert werden
- Validation Script Details (Standalone-Script oder in migrations/)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Filter-Architektur (Primary Spec — Source of Truth)
- `docs/todos/009_2026-03-18_hub-ersetzt-ketten-mapping.md` — Vollstaendiges Step-fuer-Step Mapping: was bleibt, was ersetzt wird, was neu ist, getHubField() Hilfsfunktion, langfristig entfernbare Felder

### Implementierungsplan
- `docs/todos/008_2026-03-15_admin-panel-umbau-plan.md` — Abschnitt 3 (Filter-Logik), Abschnitt 8 (Tech-Debt Checkliste)

### Requirements
- `.planning/REQUIREMENTS.md` — FILT-01 bis FILT-06 (Filter-Logik), DEBT-01 (Step 9 Hub-Filterung), DEBT-02 (aktiv-Check)

### Betroffener Code
- `src/lib/konfigurator/filters.ts` — Haupt-Refactor-Ziel (getFilteredOptions Funktion)
- `src/lib/konfigurator/store.ts` — loadCMSData() aktiv-Filter + depth-Aenderung
- `src/lib/konfigurator/types.ts` — CMSData Interface (unveraendert, aber Referenz fuer Types)

### Prior Phase Context
- `.planning/phases/07-deployment/07-CONTEXT.md` — Hub-Felder Struktur, maxDepth: 0, filterOptions
- `.planning/phases/08-migration-backfill/08-CONTEXT.md` — Backfill erlaubte_farben, Ableitungslogik

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `extractId()` in filters.ts (Zeile 15): Extrahiert ID aus String oder populiertem Objekt — wird in getHubField() wiederverwendet
- `cmsData.profile` in store.ts: Profile bereits geladen, kein separater Fetch noetig fuer Hub-Daten
- `STEP_SELECTION_KEYS` in store.ts: Mapping Step→Selektions-Keys (Step 8 enthaelt bereits dichtungsfarbe)

### Established Patterns
- `getFilteredOptions(step, cmsData, selections)` Signatur: Step-basierter Switch mit cmsData + selections
- Payload REST API mit Query-Parametern: `?depth=2&limit=100&sort=sortOrder` — aktiv-Filter als `where[aktiv][equals]=true` hinzufuegen
- `persist` Middleware in Zustand Store: partialize definiert was gespeichert wird

### Integration Points
- `filters.ts` getFilteredOptions(): Hauptfunktion die refactored wird (157 Zeilen → ~100 Zeilen erwartet)
- `store.ts` loadCMSData(): API-Query-Aenderung fuer aktiv-Filter + depth-Aenderung fuer profile
- Step 8 UI-Component: Muss neues `dichtungsfarben` Feld aus dem Return lesen
- Step 9 UI-Component: Muss null-Kategorien ausblenden (conditional rendering)
- Zod-Schemas: Keine Aenderung noetig (Verglasung bleibt Pflicht, Hub nie leer dafuer)

</code_context>

<specifics>
## Specific Ideas

- getHubField() ist die zentrale Abstraktion — ein Helper fuer alle Hub-gefilterten Steps (docs/009 Codebeispiel)
- Alte Ketten-Logik bleibt im Feature-Flag-Block als toter Code bis USE_HUB=true validiert ist
- Step 6 wird die groesste Vereinfachung: 20 Zeilen komplexe Kreuzreferenz-Logik → ein getHubField()-Aufruf
- Validation Script folgt dem Pattern des Backfill-Scripts (src/migrations/)
- fuer_aussen/fuer_innen auf Farben sind Eigenschaften, keine Filter-Kette — bleiben auch nach Ketten-Entfernung

</specifics>

<deferred>
## Deferred Ideas

- Legacy-Ketten-Felder entfernen (fuer_produkttypen, fuer_fenster/balkontuer, etc.) — v1.2 LEGC-01
- USE_HUB Feature-Flag und alten Code loeschen — v1.2 FLAG-01
- Incomplete Profile Badge (HUB-05) — Phase 12

</deferred>

---

*Phase: 09-filter-logic-refactor*
*Context gathered: 2026-03-18*
