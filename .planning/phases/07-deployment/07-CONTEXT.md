# Phase 7: Data Model Foundation - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Profile-Collection zum zentralen Hub ausbauen: 13 hasMany-Relationship-Felder in zwei Tabs (Kombinationen / Ausstattung) hinzufuegen. Neue edit_history Collection fuer Audit-Logging anlegen. Bestehendes material-Feld und alle anderen Felder bleiben unveraendert. KEINE Hooks, KEINE Filter-Aenderungen, KEINE Migration — das kommt in spaeteren Phasen.

</domain>

<decisions>
## Implementation Decisions

### Admin Edit-View Layout
- Bestehende Felder (name_technisch, name_einfach, beschreibung, bild, qualitaetsstufe, technische_daten, masse, material) bleiben oben wie bisher — kein Umbau
- Darunter die zwei neuen Tabs: "Kombinationen" (5 Felder) und "Ausstattung" (8 Felder)
- Sidebar-Felder (slug, aktiv, sortOrder) bleiben in der Sidebar
- Kein "Stammdaten"-Tab — bestehende Felder werden NICHT in Tabs gepackt

### Hub-Felder (13 Relationship-Felder)
- Alle 13 Felder: hasMany, maxDepth: 0, admin.allowCreate: true
- filterOptions: { aktiv: { equals: true } } auf allen 13 Feldern (HUB-02)
- Tab "Kombinationen": erlaubte_produkttypen, erlaubte_fensterformen, erlaubte_fluegelanzahl, erlaubte_oeffnungsarten, erlaubte_zusatzlichter
- Tab "Ausstattung": erlaubte_farben, erlaubte_dichtungsfarben, erlaubte_verglasungen, erlaubte_schallschutz, erlaubte_sicherheitsglas, erlaubte_glasdekore, erlaubte_sprossen, erlaubte_extras
- Bestehendes Einzel-Feld `material` (single relation) bleibt unveraendert (HUB-04)

### Hilfetexte
- Alle 13 Hub-Felder bekommen kurze admin.description Hilfetexte
- Format: einzeilig, erklaert was das Feld steuert und was "leer" bedeutet
- Beispiel: "Welche Farben sind fuer dieses Profil erlaubt? Leer = Fallback auf Material-Filter."
- Besonders wichtig fuer die 12 manuell zu befuellenden Felder (nur erlaubte_farben ist auto-migrierbar)

### edit_history Collection
- Pattern: identisch zu status_historie (bewiesenes Audit-Pattern im Projekt)
- Access: create via overrideAccess (nur Hooks), read: admin+mitarbeiter, update: false, delete: admin
- Felder: collection (text), doc_id (text), event (text — flexibel fuer spaetere Event-Typen), diff (json), editor (relationship users), timestamp (date dayAndTime)
- Admin-Gruppe: "System"
- KEINE Hooks in Phase 7 — nur die Collection anlegen (Hooks kommen in Phase 11)

### Claude's Discretion
- Exakte Hilfetext-Formulierungen pro Feld
- filterOptions-Syntax falls Collections kein aktiv-Feld haben (ggf. weglassen)
- Reihenfolge der Felder innerhalb der Tabs
- admin.useAsTitle und defaultColumns fuer edit_history

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Implementierungsplan (Primary Spec)
- `docs/todos/008_2026-03-15_admin-panel-umbau-plan.md` — Vollstaendiger Umbau-Plan mit Code-Snippets, Feature A (Hub), Feature C (edit_history), Risiken, Anti-Patterns. Abschnitte 1-3 und 6 sind relevant fuer Phase 7.

### Requirements
- `.planning/REQUIREMENTS.md` — HUB-01 bis HUB-04 (Profile Hub), HIST-01 (edit_history Collection)

### Bestehende Patterns
- `src/collections/business/status-historie.ts` — Vorlage fuer edit_history (Access Control, unveraenderliche Eintraege)
- `src/collections/produkte/profile.ts` — Aktuelle Profile-Collection die erweitert wird

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `status_historie.ts`: Bewiesenes Audit-Collection Pattern (create via Hooks, update/delete gesperrt) — 1:1 als Vorlage fuer edit_history nutzbar
- `isAdmin` / `isAdminOrMitarbeiter` Access-Helpers (src/access/): Bestehende Access-Control Funktionen
- Collection-Gruppen Pattern: "Produkte", "Ausstattung", "Business", "System" — edit_history gehoert in "System"

### Established Patterns
- Payload 3.79 Collection-Config mit deutschen Labels und slug-Konvention
- UUID als ID-Typ (PostgreSQL Adapter)
- `aktiv` Checkbox + `sortOrder` Number auf sichtbaren Collections
- Relationship-Felder mit `filterOptions` (z.B. materialien.erlaubte_profile)
- Groups fuer zusammengehoerige Felder (technische_daten, masse)

### Integration Points
- `src/payload.config.ts`: edit_history Collection muss hier registriert werden
- `src/collections/produkte/profile.ts`: Hauptdatei die erweitert wird
- Nach Schema-Aenderungen: `npm run generate:importmap && npm run generate:types` ausfuehren
- DB-Dump VOR Schema-Migration erstellen (push:true Sicherheit)

</code_context>

<specifics>
## Specific Ideas

- Die 13 Felder und Tab-Struktur folgt exakt dem Spec (docs/todos/008, Feature A.1)
- edit_history folgt dem status_historie Pattern — nicht dem Spec-Vorschlag (der hatte create: () => true)
- Hilfetexte sollen dem Mitarbeiter klar machen was "leer" bedeutet (Fallback-Verhalten), da 12 von 13 Feldern manuell befuellt werden muessen

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-deployment*
*Context gathered: 2026-03-18*
