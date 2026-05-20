# Milestones

## v1.4 Bestellungsflow + Integrationen (Shipped: 2026-04-03)

**Phases completed:** 7 phases, 29 plans, 4 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.3 Bestellungsflow + Admin UX Redesign (Shipped: 2026-03-27)

**Phases completed:** 7 Phasen (17-23), 15 Plans
**Timeline:** 4 Tage (2026-03-24 → 2026-03-27)
**Commits:** 104 (19 feat) | **LOC:** 23.412 TypeScript/TSX
**Requirements:** 22/22 satisfied
**Audit:** 3 Runden (gaps_found → gaps_found → passed), alle Gaps geschlossen

**Key accomplishments:**
1. Status-Config als Single Source of Truth — dreifache Duplikation beseitigt, 20 Statuse mit Transitions und Validierung
2. Admin Detail-View komplett neu: AttentionBar + Splitbutton + 2-Spalten-Layout mit Tabs (540 → 200 Zeilen)
3. Admin Listen-View mit Filter-Tabs, Attention-Score-Sortierung und Wartezeit-Farbcodierung
4. Kunden-Dashboard mit 5-Phasen-Fortschrittsbalken und verstaendlichen deutschen Status-Texten
5. E-Mail-Trigger-System fuer 14 kundenrelevante Status-Aenderungen via N8N Webhooks
6. Integration Fixes + Verification Closure: 22/22 Requirements nach 3 Audit-Runden, 0 Gaps, 0 Tech Debt

### Tech Debt
- Nyquist validation: PARTIAL auf allen 7 Phasen (low priority)
- 10 Human-Verification Items pending (Browser-Runtime QA aus Phase 18 + 20)

---

## v1.2 Admin-Navigation Umbau (Shipped: 2026-03-23)

**Phases completed:** 2 Phasen (15-16), 4 Plans, 9 Tasks
**Timeline:** 1 Tag (2026-03-23)
**Commits:** 15 | **Files:** 21 | **LOC:** 26.370 TypeScript/TSX (+6.420 seit v1.1)
**Requirements:** 13/13 satisfied
**Audit:** passed (human-verified 2026-03-23)

**Key accomplishments:**
1. Custom Admin Sidebar -- Standard Payload Nav komplett ersetzt durch custom-nav.tsx mit 4 Direct Links, 4 aufklappbaren Dropdowns und grauen Untergruppen-Ueberschriften
2. WebhookFehlerBadge Refactoring -- Server-zu-Client Component mit useEffect+fetch+60s Polling, Doppel-Badge bei System Header und Webhook Fehler Link
3. Session-persistente Dropdowns -- sessionStorage Dual-Logic (URL-basiert fuer SPA, Storage-basiert fuer Reload) mit additivem Oeffnungsverhalten
4. Rollenbasierte Nav-Filterung -- Admin sieht alle Bereiche, Viewer/Mitarbeiter nur Dashboard+Bestellungen+Produkte
5. Kunden-Admin-Block -- Dual-Layer Security: access.admin Server-Block + Middleware Redirect zu /kunden/dashboard
6. 56 neue Tests -- Custom Nav (20), Config (4), Badge (7), Session (5), Role (7), Access (6), Middleware (7)

### Tech Debt
- Nyquist validation: PARTIAL auf beiden Phasen (low priority)
- hardcoded `/admin` prefix statt useConfig (low risk, funktioniert fuer aktuelle Konfiguration)
- Active link pill statt UI-SPEC accent bar (user-approved)
- Test description mismatch in test-role-visibility.test.tsx Zeile 145

---

## v1.1 Admin-Panel Umbau: Profile Hub + UX (Shipped: 2026-03-23)

**Phases completed:** 8 Phasen (7-14), 14 Plans, 18 Tasks
**Timeline:** 6 Tage (2026-03-18 → 2026-03-23)
**Commits:** 80 | **LOC:** 19.950 TypeScript/TSX (+3.892 seit v1.0)
**Requirements:** 32/32 satisfied
**Audit:** 3 Runden (gaps_found → tech_debt → tech_debt), alle Gaps geschlossen

**Key accomplishments:**
1. Profile als zentraler Hub -- 13 hasMany-Relationship-Felder in 2 Tabs (Kombinationen / Ausstattung) mit filterOptions und maxDepth:0
2. Automatische Migration erlaubte_farben -- Idempotente Backfill-Logik mit paginierter Verarbeitung und Unit Tests
3. Hub-first Filterung ersetzt Ketten-Filter komplett -- Steps 4-6 und 8-9, USE_HUB Feature-Flag, Validation Script
4. Undo/Redo Sicherheitsnetz -- Session-scoped Stack, Cmd+Z/Cmd+Shift+Z, Save-Floor via useFormModified
5. Lueckenlose Edit-History -- afterChange Diff-Logging, History-Panel, ProfileLastEditor Header
6. Hub-Status Badge + QA -- Incomplete-Warnung in Profile-Liste, Type-Fixes, Versions-ADR, Integration-Polish

### Known Gaps
- Nyquist validation: PARTIAL auf allen 8 Phasen (low priority)
- 11 Human-Verification Items pending (Browser-Runtime QA)
- USE_HUB=false hardcoded (operational, by design bis Admin befuellt)
- Undo-Floor session-scoped (by design, kein Persist ueber Reload)

### Tech Debt
- Nyquist gaps: `/gsd:validate-phase` fuer Phasen 7-14
- USE_HUB Feature-Flag + Legacy-Code entfernen nach Hub-Validierung (v1.2 FLAG-01 + LEGC-01)

---

## v1.0 MVP (Shipped: 2026-03-10)

**Phases completed:** 6 Phasen (1-6), 20 Plans
**Timeline:** 2 Tage (2026-03-09 → 2026-03-10)
**Commits:** 116 | **Files:** 260 | **LOC:** 16.058 TypeScript/TSX

**Key accomplishments:**
1. Komplettes CMS-Datenmodell -- 17+ Payload Collections mit konditionaler Filterung und realistischem Drutex Seed-Data
2. 10-Step Fenster-Konfigurator -- Konditionale Ketten-Logik (5 Stufen tief), Live-SVG-Vorschau, Zustand + Zod + React Hook Form
3. Warenkorb + Preisberechnung -- Server-seitige Preisberechnung, Rabattcodes, Konfigurations-Snapshot, Anfrage-Absenden
4. Admin- & Kunden-Dashboards -- Status-Workflow (6 Stufen), Rollenbasiertes Access Control, Kunden-Auth mit eigenen Anfragen
5. Stripe + N8N Integration -- Test-Zahlungen, Webhooks, automatisierte E-Mail-Benachrichtigungen
6. Website + Compliance -- Puck Page Builder, Mehrsprachigkeit DE/EN, Cookie-Banner, DSGVO-Basics

### Known Gaps
- DEPL-01 through DEPL-05: Deployment deferred to v1.2 (Coolify + Docker)

### Tech Debt (7 items)
- Phase 1: Scaffold leftover `src/app/my-route/route.ts`
- Phase 3: Orphaned `/api/anfrage/calculate-price`, useSearchParams Suspense boundary
- Phase 4: Stale TODO comment in anfragen.ts
- Phase 6: No admin UI for anonymize endpoint, 2x type casts (`payload as any`)

---
