# Phase 8: Migration & Backfill - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Das Hub-Feld `erlaubte_farben` fuer alle bestehenden Profile automatisch korrekt befuellen. Ableitungslogik: `farben.erlaubte_materialien` enthaelt Material-IDs — `profile.material` ist eine Single-Relation — alle Farben deren `erlaubte_materialien` das Material des Profils enthalten werden zu `erlaubte_farben` auf dem Profil. KEINE Aenderungen an der Filter-Logik, KEINE UI-Aenderungen, KEINE anderen Hub-Felder migrieren (die werden manuell im Admin befuellt).

</domain>

<decisions>
## Implementation Decisions

### Script-Typ & Aufruf
- Standalone TypeScript-Script mit Payload Local API (`getPayload({ config })`)
- Pfad: `src/migrations/backfill-erlaubte-farben.ts`
- npm-Script in package.json: `"migrate:farben": "tsx src/migrations/backfill-erlaubte-farben.ts"`
- Aufruf: `npm run migrate:farben` oder `npm run migrate:farben -- --dry-run`
- `--dry-run` Flag: zeigt was geaendert wuerde, ohne zu schreiben (update-Call ueberspringen)
- Script beendet sich mit `process.exit(0)` bei Erfolg, `process.exit(1)` bei Fehler

### Fehlerbehandlung
- **Datenprobleme (skip + warn):** Profil ohne Material oder Material mit 0 passenden Farben wird als SKIPPED/WARN geloggt, Migration laeuft weiter
- **Technische Fehler (abbruch):** Bei DB-Fehlern, Payload-API-Fehlern oder Netzwerkproblemen sofort abbrechen — Idempotenz erlaubt sicheren Neustart
- Kein leeres Array setzen bei 0 Matches — Profil bleibt bei null, Legacy-Fallback greift spaeter (Phase 9)

### Idempotenz-Verhalten
- Pruefung: `erlaubte_farben === null || erlaubte_farben === undefined || erlaubte_farben.length === 0` → befuellen
- Bereits befuellte Felder (length > 0) werden uebersprungen — respektiert manuelle Admin-Aenderungen
- Erneuter Lauf aendert nichts an bereits befuellten Profilen (MIG-02)

### Logging & Reporting
- Nur Console-Output (kein Logfile)
- Pro Seite: Header mit Seitennummer und Profilanzahl
- Pro Profil eine Zeile: `[UPDATED] Profilname: N Farben zugeordnet` / `[SKIPPED] Profilname: bereits befuellt (N Farben)` / `[WARN] Profilname: Grund`
- Summary am Ende: Gesamt, Befuellt, Uebersprungen (bereits gesetzt), Warnungen, Seiten
- Kein --verbose Flag — nur eine Detailstufe (Name + Anzahl Farben)
- Bei --dry-run: `[DRY-RUN]` Prefix in allen Zeilen

### Claude's Discretion
- Exakte Paginierungs-Implementierung (PAGE_SIZE 100 ist vorgegeben)
- Query-Strategie: alle Farben vorab laden vs. pro Profil abfragen
- Reihenfolge der Farben-Zuordnung (z.B. nach sortOrder)
- process.argv Parsing fuer --dry-run (minimalistisch, kein Library noetig)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Implementierungsplan (Primary Spec)
- `docs/todos/008_2026-03-15_admin-panel-umbau-plan.md` — Vollstaendiger Umbau-Plan, Abschnitt 2 (Migration & Backfill) definiert Ableitungslogik und Paginierung

### Requirements
- `.planning/REQUIREMENTS.md` — MIG-01 (automatische Befuellung), MIG-02 (Idempotenz), MIG-03 (paginiert + Logging)

### Datenmodell
- `src/collections/produkte/profile.ts` — Profile-Collection mit Hub-Feldern (erlaubte_farben ist Zeile 213)
- `src/collections/ausstattung/farben.ts` — Farben-Collection mit erlaubte_materialien (Zeile 78)
- `src/seed/index.ts` — Bestehendes Seed-Pattern als Referenz fuer Payload Local API Nutzung

### Prior Phase Context
- `.planning/phases/07-deployment/07-CONTEXT.md` — Phase 7 Entscheidungen (maxDepth: 0, Hub-Felder Struktur)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/seed/index.ts`: Payload Local API Pattern mit `getPayload({ config })` — Migration-Script kann dieses Pattern 1:1 uebernehmen
- `extractId()` Helper in `src/lib/konfigurator/filters.ts` (Zeile 15): extrahiert ID aus String oder populiertem Objekt — gleiches Pattern in Migration noetig

### Established Patterns
- Payload Local API: `payload.find()` mit `limit`, `page`, `depth` Parametern fuer paginierte Abfragen
- `payload.update()` mit `id` und `data` fuer Einzel-Updates
- Alle Relationship-Felder koennen als ID-Arrays gespeichert werden (maxDepth: 0)

### Integration Points
- `package.json`: npm-Script `migrate:farben` hinzufuegen
- `src/migrations/`: Neuer Ordner fuer Migration-Scripts
- Farben-Collection: `erlaubte_materialien` ist hasMany Relationship zu `materialien` (Zeile 78-83 in farben.ts)
- Profile-Collection: `material` ist Single Relationship zu `materialien` (Zeile 119-125 in profile.ts)
- Profile-Collection: `erlaubte_farben` ist hasMany Relationship zu `farben` (Zeile 213-225 in profile.ts)

</code_context>

<specifics>
## Specific Ideas

- Ableitungslogik: Alle Farben laden → fuer jedes Profil das Material-ID holen → Farben filtern deren `erlaubte_materialien` dieses Material-ID enthaelt → IDs als `erlaubte_farben` setzen
- Log-Format orientiert sich am Preview: Seitenweise mit indentierten Profil-Zeilen, Summary-Block am Ende
- `profile.material` ist `required: true`, aber Migration soll defensiv sein (skip bei null)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-migration-backfill*
*Context gathered: 2026-03-18*
