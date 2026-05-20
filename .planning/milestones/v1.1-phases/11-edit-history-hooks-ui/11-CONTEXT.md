# Phase 11: Edit-History Hooks + UI - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Jede Änderung an einem Profil wird automatisch protokolliert: beforeChange Hook setzt last_edited_by, afterChange Hook erstellt edit_history Eintrag mit vollem Before/After Diff. Admin sieht wer was wann geändert hat — direkt im Profile Edit-View über einen eigenen "Historie"-Tab und eine Header-Zeile mit letztem Bearbeiter. Die edit_history Collection existiert bereits (Phase 7). KEIN versions:drafts, KEIN last_published_by, nur Profile-Collection.

</domain>

<decisions>
## Implementation Decisions

### Diff-Granularität
- Volle Before/After Werte für ALLE Feldtypen (nicht nur Feldnamen)
- Einfache Felder (Text, Number, Select): `{ field: "name_einfach", from: "Iglo 5", to: "Iglo 5 Classic" }`
- Relationship-Felder: IDs + aufgelöste Namen zusammen speichern: `{ field: "erlaubte_farben", from: [{ id: "uuid1", label: "Weiß RAL 9016" }], to: [{ id: "uuid1", label: "Weiß RAL 9016" }, { id: "uuid2", label: "Anthrazit RAL 7016" }] }`
- Relationship-Namen werden zum Zeitpunkt des Saves resolved und im Diff eingefroren (Snapshot, nicht live-resolved)
- Dies zieht DIFF-01 (v1.2) effektiv in v1.1

### History-Panel Design
- Eigener Tab "Historie" als dritter Tab neben "Kombinationen" und "Ausstattung"
- Kompakte Einträge: Zeitstempel + Bearbeiter-Name + Liste geänderter Feldnamen
- Expand/Collapse pro Eintrag: Klick zeigt Before/After Werte
- Lazy Loading: Daten werden erst beim Tab-Klick geladen (kein initialer API-Call)
- Limit: 50 Einträge, sortiert nach Timestamp absteigend
- Bearbeiter-Anzeige: "Max Müller (admin@christ-fensterhandel.de)" — Vorname Nachname + E-Mail

### last_edited_by Anzeige
- Header-Zeile unter dem Profil-Titel als Custom Component (beforeDocumentControls oder eigene Position)
- Zeigt: "Zuletzt bearbeitet von [Name] ([E-Mail]) am [Datum]"
- Datenquelle: `profile.last_edited_by` + `profile.updatedAt` (kein extra API-Call)
- KEIN Sidebar-Feld — Header-Zeile ist prominenter und reicht
- last_edited_by Feld existiert im Schema, wird aber `admin.hidden` oder nicht in der Sidebar angezeigt

### Hook-Scope & Filtering
- JEDES Save wird geloggt, auch wenn nichts geändert wurde (event: "save_no_changes" bei leerem Diff)
- Auch Create-Events werden geloggt (event: "create")
- Ausgeschlossene Felder aus dem Diff: `updatedAt`, `createdAt`, `id`, `last_edited_by`
- Infinite-Loop-Prävention: `req.context.skipEditHistory` Guard im afterChange Hook
- last_edited_by wird in beforeChange gesetzt (NICHT afterChange + update)
- edit_history Einträge werden mit `overrideAccess: true` erstellt (Collection access create: false)

### Users-Collection Erweiterung
- Neue Felder `vorname` und `nachname` auf der Users-Collection hinzufügen
- Anzeige im History-Panel: "Max Müller (admin@christ-fensterhandel.de)"
- Felder sind optional (bestehende User ohne Namen bleiben funktionsfähig — Fallback auf E-Mail)

### Claude's Discretion
- Exakte Diff-Berechnung (deep comparison Algorithmus für verschachtelte Objekte/Groups)
- Name-Resolution für Relationship-Felder (wie Labels aus den referenzierten Collections geholt werden)
- CSS/Styling des History-Panels und der Header-Zeile (Payload-natives Styling)
- Expand/Collapse Animation und Interaktion
- Error-Handling wenn History-Fetch fehlschlägt (graceful degradation)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Implementierungsplan (Primary Spec)
- `docs/todos/008_2026-03-15_admin-panel-umbau-plan.md` — Feature C (Edit-History & Editor-Tracking): Hook-Code, Diff-Berechnung, History-Panel Code, Abschnitte C.1-C.3

### Requirements
- `.planning/REQUIREMENTS.md` — HIST-02 bis HIST-06 (Edit-History Requirements), plus implizit DIFF-01 (vorgezogen)

### Bestehende Patterns
- `src/collections/system/edit-history.ts` — Bestehende Collection (Phase 7), Access Control Pattern
- `src/collections/business/status-historie.ts` — Bewiesenes Audit-Log Pattern (Vorlage für Hook-Struktur)
- `src/collections/business/anfragen.ts` — beforeChange + afterChange Hook-Muster (Status-Historie + N8N Webhook)
- `src/collections/produkte/profile.ts` — Ziel-Collection für Hooks und neue Felder
- `src/components/admin/profile-edit-toolbar.tsx` — Bestehendes beforeDocumentControls Component (Undo/Redo)

### Prior Phase Context
- `.planning/phases/07-deployment/07-CONTEXT.md` — edit_history Collection Design, Hub-Felder Struktur
- `.planning/phases/10-undo-redo/10-CONTEXT.md` — ProfileEditToolbar Pattern, Provider-Registrierung, beforeDocumentControls Nutzung

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/collections/system/edit-history.ts`: Collection existiert bereits mit Feldern collection, doc_id, event, diff (JSON), editor, timestamp
- `src/components/admin/profile-edit-toolbar.tsx`: ProfileEditToolbar bereits als beforeDocumentControls registriert — neues Header-Component muss daneben oder darüber platziert werden
- `src/access/is-admin.ts` / `src/access/is-admin-or-mitarbeiter.ts`: Access-Helper für Hook-Berechtigungsprüfungen
- `src/collections/business/anfragen.ts`: beforeChange Hook-Pattern mit Status-Tracking und afterChange mit try/catch wrapping

### Established Patterns
- Payload 3.79 Admin-Components: String-basierte Component-Registrierung (`"@/components/admin/name#export"`)
- beforeChange für Daten-Mutation (last_edited_by setzen), afterChange für Side-Effects (History-Eintrag erstellen)
- `req.payload.create()` mit `overrideAccess: true` für System-Einträge (status_historie Pattern)
- Collection-Config Tabs für Gruppierung (Kombinationen/Ausstattung bereits vorhanden)
- Users-Collection hat `rolle` Feld, aber keine vorname/nachname Felder (müssen hinzugefügt werden)

### Integration Points
- `src/collections/produkte/profile.ts`: hooks.beforeChange + hooks.afterChange hinzufügen, last_edited_by Feld, Historie-Tab
- `src/collections/system/users.ts`: vorname + nachname Felder hinzufügen
- `src/payload.config.ts`: Keine Änderungen nötig (edit_history bereits registriert)
- Import Map: Nach neuen Components `npm run generate:importmap` ausführen
- `npm run generate:types` nach Schema-Änderungen an profile.ts und users.ts

</code_context>

<specifics>
## Specific Ideas

- "Max Müller (admin@christ-fensterhandel.de)" als Bearbeiter-Format — voller Name mit E-Mail in Klammern, Fallback nur E-Mail wenn kein Name gesetzt
- History-Einträge mit Expand zeigen Before/After im gleichen Stil wie Git-Diffs: Vorher/Nachher klar getrennt
- Relationship-Diffs speichern Labels zum Zeitpunkt des Saves (Snapshot) — wenn ein Farbname später geändert wird, zeigt die Historie den alten Namen korrekt
- "save_no_changes" Event für lückenlose Audit-Trail — Admin sieht auch wann jemand "nur geguckt und gespeichert" hat
- Header-Zeile soll visuell dezent sein (nicht dominant über der Toolbar), aber klar lesbar

</specifics>

<deferred>
## Deferred Ideas

- Before/After Value Diffs im History-Panel expandierbar machen mit Syntax-Highlighting — DIFF-01 teilweise vorgezogen, aber visuelles Highlighting kann v1.2 sein
- Undo/Redo für andere Collections (GLOB-01) — v1.2
- last_published_by Tracking (PUBL-01) — v1.2, nur mit Drafts/Publish relevant
- History für andere Collections als Profile — eigene Phase
- Export/Download der History als CSV/JSON — nicht geplant
- Pagination im History-Panel (über 50 Einträge) — v1.2 wenn nötig

</deferred>

---

*Phase: 11-edit-history-hooks-ui*
*Context gathered: 2026-03-19*
