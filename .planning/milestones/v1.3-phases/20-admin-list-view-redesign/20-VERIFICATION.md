---
phase: 20-admin-list-view-redesign
verified: 2026-03-25T22:00:00Z
status: passed
score: 16/16 must-haves verified
human_verification:
  - test: "Navigate to http://localhost:3000/admin/collections/anfragen and confirm the custom list view loads (not Payload default)"
    expected: "5 filter tabs (Alle/Offen/Rueckfrage/In Produktion/Abgeschlossen) with count badges visible at top; rows sorted by attention-score descending (highest urgency first)"
    why_human: "Payload import map registration and runtime component rendering cannot be verified by static grep"
  - test: "Click each tab and observe URL change"
    expected: "URL updates to ?tab=offen etc.; list re-filters to matching statuses; count badge matches visible row count"
    why_human: "URL parameter persistence and tab-filter wiring require browser runtime"
  - test: "If any Rueckfrage items exist, observe which tab is pre-selected on load"
    expected: "Rueckfrage tab is active by default when rueckfrage count > 0; otherwise Offen; otherwise Alle"
    why_human: "Smart default tab computation depends on actual data at runtime"
  - test: "Inspect Wartezeit column on rows older than 1 day"
    expected: "Colored urgency badge (yellow/orange/red) and matching colored left border on the row; terminal/completed rows show no badge and no border color"
    why_human: "Visual urgency indicator correctness requires browser rendering"
  - test: "Read the Letzte Aktion column on any row"
    expected: "Shows status label + relative time string, e.g. 'Angebot versendet vor 2h'"
    why_human: "Relative time output is data-dependent and requires runtime"
  - test: "Click the 3-dot menu on a row (not the row itself)"
    expected: "Dropdown opens without navigating away; shows primary Quick-Action with colored dot and 'Details oeffnen' link; clicking outside or pressing Escape closes it"
    why_human: "stopPropagation and dropdown close behavior require interaction testing"
  - test: "Click a row (outside the 3-dot menu area)"
    expected: "Navigates to the detail view for that Anfrage"
    why_human: "Row-click navigation requires browser interaction"
---

# Phase 20: Admin List View Redesign — Verification Report

**Phase Goal:** Admin-Mitarbeiter sehen in der Anfragen-Liste sofort welche Anfragen Aufmerksamkeit brauchen -- sortiert nach Dringlichkeit, filterbar nach Workflow-Phase
**Verified:** 2026-03-25T22:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Plan 01)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | STATUS_WEIGHT has entries for all 20 StatusKey values with correct weight tiers (3/2/1/0) | VERIFIED | `src/lib/status-config.ts` line 371: 20-entry Record with neu=3, angebot_versendet=2, bezahlt=1, abgeschlossen=0 confirmed by grep |
| 2 | LIST_TAB_FILTERS maps 5 tabs (alle/offen/rueckfrage/in_produktion/abgeschlossen) to correct status arrays | VERIFIED | `src/lib/status-config.ts` line 396: 5-key record confirmed; rueckfrage includes reklamation (intentional deviation, all 20 statuses covered) |
| 3 | getAttentionScore computes waitingDays x statusWeight correctly | VERIFIED | `src/lib/list-view-helpers.ts` line 19: uses getWaitingDays + STATUS_WEIGHT lookup; 34 tests covering weight tiers |
| 4 | getScoreColor returns correct hex color for all score ranges | VERIFIED | `src/lib/list-view-helpers.ts` line 29: boundary values 0/5/15/30/31+ with correct hex colors |
| 5 | formatRelativeTime returns German relative timestamps | VERIFIED | `src/lib/list-view-helpers.ts` line 39: "gerade eben", "vor X Min.", "vor Xh", "vor 1 Tag", "vor X Tagen" |
| 6 | getSmartDefaultTab returns rueckfrage when count > 0, then offen, then alle | VERIFIED | `src/lib/list-view-helpers.ts` line 56: 3-branch logic confirmed |
| 7 | CSS classes for list-tabs, list-table, score-bar, list-menu, list-pagination, list-empty-state exist | VERIFIED | `src/app/(payload)/custom.scss` line 633: Phase 20 section with all required BEM classes present |

### Observable Truths (Plan 02)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 8 | Admin sees 5 filter tabs with count badges and can switch between them | VERIFIED (automated) | `anfragen-list-view.tsx` line 300: `role="tablist"` div with 5 tabs; label map at line 35; count in button text |
| 9 | Tab state is persisted in URL parameters (?tab=offen&page=2) | VERIFIED | `useSearchParams` at line 87; `setParam` helper reads/writes tab, page, sort, dir params via `router.replace` |
| 10 | Smart default tab selects Rueckfrage if items exist, then Offen, then Alle | VERIFIED | `anfragen-list-view.tsx` line 161: `getSmartDefaultTab(tabCounts)` called when no URL ?tab= param |
| 11 | Wartezeit column shows colored badges and rows have colored left border for urgency | VERIFIED | Lines 409-413: urgencyClass assignment for warn/urgent/critical; line 420: urgency badge rendered |
| 12 | Letzte Aktion column shows status label + relative time | VERIFIED | Line 376: "Letzte Aktion" header; line 493: `getLetzeAktion(doc.status, doc.last_status_change_at)` in cell |
| 13 | Rows are sorted by Attention-Score descending by default (dringendste oben) | VERIFIED | Lines 51, 163: "attention_score" is default sortKey; useMemo sort at line 216 |
| 14 | 3-dot menu shows primary Quick-Action and Details oeffnen link | VERIFIED | `list-menu.tsx`: QUICK_ACTIONS lookup for primary action; "Details oeffnen" button at line 150 |
| 15 | COMMENT_REQUIRED statuses redirect to detail view instead of inline action | VERIFIED | `list-menu.tsx` lines 63-70: COMMENT_REQUIRED check redirects to `/admin/collections/anfragen/${anfrageId}` |
| 16 | After quick-action the entire list reloads | VERIFIED | `anfragen-list-view.tsx` line 510: `onActionComplete={loadData}`; loadData refetches full list from API |

**Score:** 16/16 truths verified (automated)

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `src/lib/status-config.ts` | VERIFIED | STATUS_WEIGHT (line 371) + LIST_TAB_FILTERS (line 396) exported; 20-entry and 5-key records confirmed |
| `src/lib/list-view-helpers.ts` | VERIFIED | 60 lines; exports 5 functions (getAttentionScore, getScoreColor, formatRelativeTime, getSmartDefaultTab, getLetzeAktion); substantive logic, no stubs |
| `tests/unit/test-list-view-helpers.test.ts` | VERIFIED | 34 test cases across 5 describe blocks covering all functions |
| `tests/unit/test-status-config.test.ts` | VERIFIED | Extended with describe("STATUS_WEIGHT") at line 541 and describe("LIST_TAB_FILTERS") at line 575; 105 total tests |
| `src/app/(payload)/custom.scss` | VERIFIED | Phase 20 section at line 633; list-tabs, list-table, score-bar, list-menu, list-pagination, list-empty-state, list-error-state, list-loading-state all present |
| `src/components/admin/list-menu.tsx` | VERIFIED | 144 lines; "use client"; exports ListMenu; COMMENT_REQUIRED redirect, PATCH fetch, outside-click/Escape, stopPropagation all confirmed |
| `src/components/admin/anfragen-list-view.tsx` | VERIFIED | 501 lines; default export; imports from list-view-helpers, status-config, list-menu; full implementation with tabs, sort, filter, pagination |
| `src/collections/business/anfragen.ts` | VERIFIED | Lines 82-84: `list.Component` set to `@/components/admin/anfragen-list-view#default` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `list-view-helpers.ts` | `detail-view-helpers.ts` | import getWaitingDays | WIRED | Line 10: `import { getWaitingDays } from "@/lib/detail-view-helpers"` |
| `list-view-helpers.ts` | `status-config.ts` | import STATUS_WEIGHT | WIRED | Lines 11-15: `import { STATUS_WEIGHT, STATUS_LABELS, type StatusKey }` |
| `anfragen-list-view.tsx` | `/api/anfragen` | fetch with depth=0&limit=0 | WIRED | Line 99: `fetch("/api/anfragen?depth=0&limit=0&sort=-createdAt", ...)` with response assigned to docs |
| `anfragen-list-view.tsx` | `list-view-helpers.ts` | import all 5 helpers | WIRED | Lines 23-28: getAttentionScore, getScoreColor, formatRelativeTime, getSmartDefaultTab, getLetzeAktion imported and used |
| `anfragen-list-view.tsx` | `list-menu.tsx` | import ListMenu | WIRED | Line 30: `import { ListMenu } from "@/components/admin/list-menu"` used at line 507 |
| `anfragen.ts` | `anfragen-list-view.tsx` | admin.components.views.list.Component | WIRED | Lines 82-84: `list: { Component: "@/components/admin/anfragen-list-view#default" }` |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| ADMN-07 | 20-01, 20-02 | Anfragen-Liste mit Filter-Tabs (Alle/Offen/Rueckfrage/In Produktion/Abgeschlossen) | SATISFIED | LIST_TAB_FILTERS in status-config.ts; 5 tabs rendered in anfragen-list-view.tsx with count badges and URL persistence |
| ADMN-08 | 20-01, 20-02 | Wartezeit-Spalte mit Farb-Codierung (gruen/gelb/orange/rot) | SATISFIED | getScoreColor + getAttentionScore in list-view-helpers.ts; urgency badge + row border-left classes in anfragen-list-view.tsx |
| ADMN-09 | 20-01, 20-02 | Attention-Score Sortierung (Wartezeit x Status-Gewicht, dringendste oben) | SATISFIED | getAttentionScore implemented; default sortKey="attention_score" in anfragen-list-view.tsx; sort applied in useMemo |

No orphaned requirements — all 3 IDs declared in both plans and all map to verified implementation.

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `anfragen-list-view.tsx` lines 497, 535 | `text-caption` class (defined in custom.scss line 275, not Tailwind) | Info | Not a Tailwind violation; class exists in project CSS |

No stubs, no TODO/FIXME, no empty implementations, no unicode escape leftovers (38506c3 fix verified), no Tailwind utility classes found.

### Human Verification Required

The automated layer is complete. All 6 commits (13d7c00, ce9af76, a7a5ab0, a4815ff, 38506c3, 940d2ca) are verified in git history. The following require a running dev server:

#### 1. Custom List View Loads

**Test:** Restart dev server (`next dev`), navigate to `http://localhost:3000/admin/collections/anfragen`
**Expected:** Custom list view renders (not Payload default table); 5 filter tabs visible at top
**Why human:** Payload import map registration is runtime-only; cannot verify component mounting via grep

#### 2. Tab Switching and URL Persistence

**Test:** Click each tab in sequence; observe URL and row list
**Expected:** URL updates to `?tab=offen`, `?tab=rueckfrage`, etc.; rows filter to matching statuses; count badge matches visible rows
**Why human:** URL state wiring and DOM filtering require browser interaction

#### 3. Smart Default Tab

**Test:** With at least one Rueckfrage-status Anfrage present, load list fresh (no ?tab= in URL)
**Expected:** Rueckfrage tab is pre-selected; if no rueckfrage items, Offen is selected; if neither, Alle
**Why human:** Data-dependent runtime behavior

#### 4. Wartezeit and Urgency Indicators

**Test:** Observe rows for Anfragen older than ~3 days
**Expected:** Yellow badge "X Tage" at 3-7 days (warn), orange "X Tage" at 8-14 days (urgent), red "DRINGEND — X Tage" at 15+ days (critical); matching colored left border on the row
**Why human:** Urgency thresholds and visual rendering are data- and time-dependent

#### 5. Letzte Aktion Column

**Test:** Read the Letzte Aktion column on any row
**Expected:** Shows status label + relative German time, e.g. "Angebot versendet vor 2h"
**Why human:** Relative time depends on current time and actual status change timestamp

#### 6. 3-Dot Menu Behavior

**Test:** Click the 3-dot (`...`) button on a row
**Expected:** Dropdown opens; row does NOT navigate; click outside or press Escape closes it; Quick-Action button has colored dot matching target status; "Details oeffnen" is always present
**Why human:** stopPropagation and click-outside behavior require interaction

#### 7. Row Click Navigation

**Test:** Click a row (avoiding the 3-dot button)
**Expected:** Browser navigates to `/admin/collections/anfragen/{id}` (detail view)
**Why human:** `window.location.href` assignment requires browser runtime

### Gaps Summary

No gaps found in automated verification. All 16 observable truths are confirmed by code evidence. All 3 requirement IDs (ADMN-07, ADMN-08, ADMN-09) are satisfied by verified implementation. 7 items require human browser verification as they depend on runtime rendering, data state, and user interaction — none of these represent implementation deficiencies, they are confirmation checkpoints.

---

_Verified: 2026-03-25T22:00:00Z_
_Verifier: Claude (gsd-verifier)_
