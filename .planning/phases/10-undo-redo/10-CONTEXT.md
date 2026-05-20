# Phase 10: Undo/Redo - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin bekommt ein Sicherheitsnetz beim Bearbeiten von Profilen: jede Formular-Aenderung kann per Button oder Keyboard-Shortcut rueckgaengig gemacht und wiederhergestellt werden. Reine Client-Side UI-Feature im Payload Admin Panel — kein Backend, keine API-Aenderungen, keine DB-Migration. Scope: nur Profile Edit-View, nicht andere Collections.

</domain>

<decisions>
## Implementation Decisions

### PoC-Strategie (UNDO-01)
- PoC ZUERST: form.getFields() + replaceState() mit Relationship-Feldern verifizieren BEVOR volle Implementierung
- getFields() verwenden, NICHT getData() (Type-Mismatch mit replaceState)
- Falls replaceState fuer Relationships fehlschlaegt: Fallback auf per-field dispatchFields

### Toolbar-Design (UNDO-03)
- Nur Icons (Pfeil-links / Pfeil-rechts), kein Text-Label, kein Zaehler
- Position: beforeDocumentControls im Profile Edit-View (links neben den Payload-Buttons)
- Buttons im Payload-nativen Stil (ghost/outline) — kein visueller Stilbruch
- Disabled-State: Opacity reduziert (~40%) wenn kein Undo/Redo moeglich
- Tooltip bei Hover zeigt Aktion + Keyboard-Shortcut: "Rueckgaengig (⌘Z)" / "Wiederherstellen (⌘⇧Z)"

### Undo-Feedback
- Doppeltes Feedback: Feld-Highlight UND Toast-Nachricht
- Feld-Highlight: Geaenderte Felder flashen kurz gelb (Warnung-Farbe, ~500ms)
- Toast: Kleine Benachrichtigung mit Aktion + Feldanzahl ("3 Felder rueckgaengig gemacht")
- Toast verschwindet nach 2 Sekunden

### Keyboard-Shortcuts (UNDO-04)
- Cmd+Z (Undo) und Cmd+Shift+Z (Redo) im Profile Edit-View
- Shortcuts nur aktiv wenn Profile Edit-View fokussiert (kein Conflict mit Browser/Payload-eigenen Shortcuts)

### Stack-Verhalten (UNDO-05, UNDO-06)
- Stack per collectionSlug:id isoliert (useDocumentInfo) — kein Cross-Document Bleed
- Snapshots mit 300ms Debounce (natuerliches Editier-Verhalten: schnelle Klicks werden zusammengefasst)
- Stack-Limit: maximal 50 Snapshots pro Session
- Session-scoped: Stack wird bei Navigation (Dokument wechseln) verworfen
- **Save als Checkpoint:** Nach erfolgreichem Speichern bleibt der Stack bestehen, aber Undo geht maximal bis zum letzten Save-Zeitpunkt zurueck (Boden-Index Muster)
- Relationship-Aenderungen: Debounce regelt die Granularitaet (300ms erfasst natuerliches Editier-Verhalten)

### Architektur (UNDO-02)
- UndoRedoProvider als globaler Admin-Provider registriert (admin.components.providers)
- ProfileEditToolbar rendert nur im Profile Edit-View (beforeDocumentControls)
- Kein RHF reset() — Payload Form-API (getFields/replaceState oder dispatchFields)

### Claude's Discretion
- Exakte PoC-Implementierung (wie getFields/replaceState getestet wird)
- Snapshot-Datenstruktur (welche Form-Fields in den Snapshot einfliessen)
- Toast-Implementierung (Payload-eigene Toast-API oder eigene Loesung)
- Feld-Highlight CSS-Implementierung (CSS Transition vs. requestAnimationFrame)
- Diff-Berechnung fuer Feld-Highlight (welche Felder sich zwischen Snapshots geaendert haben)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Implementierungsplan (Primary Spec)
- `docs/todos/008_2026-03-15_admin-panel-umbau-plan.md` — Feature B (Undo/Redo): Architektur, Provider-Code, Toolbar-Code, Session-Scope, API-Hooks. Abschnitte B.1-B.4 sind die primaere Referenz.

### Requirements
- `.planning/REQUIREMENTS.md` — UNDO-01 bis UNDO-06 (Undo/Redo Requirements)

### Betroffener Code
- `src/payload.config.ts` — Provider-Registrierung unter admin.components.providers
- `src/collections/produkte/profile.ts` — Toolbar-Registrierung unter admin.components.edit.beforeDocumentControls

### Prior Phase Context
- `.planning/phases/07-deployment/07-CONTEXT.md` — Hub-Felder Struktur, Admin Edit-View Layout (Tabs Kombinationen/Ausstattung)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/admin/` — Bestehendes Admin-Component-Verzeichnis (dashboard-overview, status-workflow, etc.)
- `src/payload.config.ts` — Admin-Config mit afterNavLinks, views, graphics bereits konfiguriert (aber noch keine providers)
- `src/collections/produkte/profile.ts` — Profile-Collection mit 13 Hub-Relationship-Feldern in Tabs, aktuell ohne admin.components.edit

### Established Patterns
- Payload 3.79 Admin-Components: String-basierte Component-Registrierung (`"@/components/admin/name#export"`)
- Admin-Views: Custom Views unter admin.components.views registriert (dashboard-overview, puck-editor)
- Collection-spezifische Components: Noch kein Beispiel fuer beforeDocumentControls im Projekt — das waere die erste Nutzung

### Integration Points
- `src/payload.config.ts` admin.components.providers: Neuer Eintrag fuer UndoRedoProvider
- `src/collections/produkte/profile.ts` admin.components.edit.beforeDocumentControls: Neuer Eintrag fuer ProfileEditToolbar
- `@payloadcms/ui` Hooks: useForm, useAllFormFields, useDocumentInfo — muessen im PoC verifiziert werden
- Import Map: Nach neuen Components `npm run generate:importmap` ausfuehren

</code_context>

<specifics>
## Specific Ideas

- Save-als-Checkpoint Pattern: Bei Save wird ein "Boden-Index" im Stack gesetzt, undo() stoppt dort und gibt null zurueck. Bei erneutem Save verschiebt sich der Boden. Inspiriert von Text-Editoren (VS Code Undo-Marker).
- Feld-Highlight gelb: Passt zum Warn-/Aufmerksamkeits-Pattern, signalisiert "hier hat sich was geaendert" ohne Alarm.
- Toast mit Feldanzahl: "3 Felder rueckgaengig gemacht" gibt dem Admin quantitatives Feedback ueber den Umfang der Aenderung.
- PoC ist Gate: Volle Implementierung erst nach PoC-Erfolg. Wenn replaceState nicht funktioniert, Fallback auf dispatchFields dokumentieren und dann erst bauen.

</specifics>

<deferred>
## Deferred Ideas

- Undo/Redo fuer andere Collections (nicht nur Profile) — v1.2 GLOB-01
- Undo-History persistieren ueber Sessions hinweg — nicht geplant
- Undo nach Navigation (zurueck zum vorherigen Dokument) — bewusst nicht implementiert

</deferred>

---

*Phase: 10-undo-redo*
*Context gathered: 2026-03-18*
