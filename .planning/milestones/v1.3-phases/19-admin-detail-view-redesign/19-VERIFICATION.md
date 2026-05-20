---
phase: 19-admin-detail-view-redesign
verified: 2026-03-25T13:41:00Z
status: gaps_found
score: 6/7 must-haves verified
gaps:
  - truth: "Anonymize button hides after data is already anonymized"
    status: failed
    reason: "tab-panel.tsx guards on 'GELOESCHT' (no umlaut) but anonymize-customer route writes 'GELÖSCHT' (with ö). The guard condition will never match: button stays visible even after anonymization."
    artifacts:
      - path: "src/components/admin/tab-panel.tsx"
        issue: "Line 175: checks `kontakt.vorname !== \"GELOESCHT\"` -- should be `!== \"GELÖSCHT\"`"
      - path: "src/app/(payload)/api/admin/anonymize-customer/route.ts"
        issue: "Sets vorname: 'GELÖSCHT' (with real ö) -- this is the correct value"
    missing:
      - "Change tab-panel.tsx line 175: `kontakt.vorname !== \"GELOESCHT\"` -> `kontakt.vorname !== \"GELÖSCHT\"`"
human_verification:
  - test: "Full detail view visual check in browser"
    expected: "Attention Bar shows anfrage number, colored status badge, wartezeit badge with color coding, produkt-zusammenfassung and gesamtpreis. Splitbutton shows primary action with correct color. 2-column layout with product cards left and tab panel right."
    why_human: "Visual appearance, layout proportions, color correctness, and interactive behavior cannot be verified programmatically."
  - test: "Splitbutton storniert terminal state date accuracy"
    expected: "For stornierte Anfragen, the terminal info shows the actual stornierung date, not today's date"
    why_human: "splitbutton.tsx line 140 renders `new Date().toLocaleDateString('de-DE')` (always today), but the Splitbutton receives no stornierung date prop. This is a known data-prop issue that may be acceptable UX, but needs human judgement."
---

# Phase 19: Admin Detail View Redesign — Verification Report

**Phase Goal:** Admin-Mitarbeiter sehen auf einen Blick den Zustand einer Anfrage und koennen die naechste Aktion mit einem Klick ausfuehren -- statt durch eine unstrukturierte Seite zu scrollen
**Verified:** 2026-03-25T13:41:00Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `admin-custom.css` is loaded via Payload Config and structural styles defined as CSS classes | VERIFIED | `custom.scss` imported in `src/app/(payload)/layout.tsx`; 631 lines with 60+ BEM-like classes covering all components |
| 2 | Attention Bar shows: Anfrage-Nummer, colored status badge, wartezeit with color coding, Gesamtpreis, Produkt-Zusammenfassung | VERIFIED | `attention-bar.tsx` fully implemented with urgency modifiers, status-badge, urgency-badge, right-section price and summary |
| 3 | Splitbutton shows primary action as large button + secondary actions in chevron dropdown, context-dependent per status | VERIFIED | `splitbutton.tsx` uses `QUICK_ACTIONS[currentStatus]`, renders primary + chevron dropdown with secondary actions |
| 4 | Detail view has 2-column layout: product cards (60%) left, tab panel with Kontakt/Timeline/Notizen (40%) right | VERIFIED | `anfrage-detail-view.tsx` uses `className="detail-layout"` (CSS: `grid-template-columns: 3fr 2fr`); `tab-panel.tsx` renders 4 tabs |
| 5 | Quantity badge on each product card shows amount, price per unit x quantity = total | VERIFIED | `product-card.tsx` renders `className="quantity-badge"` only when `stueckzahl > 1`; price math shows `{formatCurrency(p.einzelpreis)} x {stueckzahl} = {formatCurrency(p.einzelpreis * stueckzahl)}` |
| 6 | CSS classes used instead of static inline styles (Plan 04 gap closure) | VERIFIED | `product-card.tsx`: 0 inline styles; `anfrage-detail-view.tsx`: 0 inline styles; `attention-bar.tsx`: 2 (dynamic status/urgency colors); `splitbutton.tsx`: 7 (dynamic computed colors); `tab-panel.tsx`: 3 (dynamic statusColor, savingNotizen opacity) |
| 7 | Anonymize button hides correctly after customer data is anonymized | FAILED | `tab-panel.tsx` checks `!== "GELOESCHT"` but route writes `"GELÖSCHT"` (with real ö). Guard never matches -- button stays visible permanently after anonymization. |

**Score:** 6/7 truths verified

### Required Artifacts

| Artifact | Provides | Status | Details |
|----------|----------|--------|---------|
| `src/lib/status-config.ts` | QUICK_ACTIONS with all 20 StatusKey entries | VERIFIED | 20 keys confirmed, `storniert: []`, `in_bearbeitung` has 3 entries, real UTF-8 umlauts in labels |
| `src/lib/format-currency.ts` | Shared `formatCurrency` utility | VERIFIED | `Intl.NumberFormat("de-DE")` with `currency: "EUR"` |
| `src/lib/detail-view-helpers.ts` | `getWaitingDays`, `getUrgencyLevel`, `getProduktZusammenfassung`, `isTerminalStatus`, `isCompletedStatus`, `shouldShowDetailsTab`, `URGENCY_COLORS` | VERIFIED | All exports present, correct thresholds (warn<3, urgent<7, critical>=7), URGENCY_COLORS values match spec |
| `src/app/(payload)/custom.scss` | 60+ BEM-like CSS classes for all components | VERIFIED | All 26 required class families confirmed present; 631 lines; existing `.admin-content` and `.collection-list` preserved |
| `src/components/admin/attention-bar.tsx` | AttentionBar with urgency color coding | VERIFIED | Imports from `detail-view-helpers`, `status-config`, `format-currency`; uses CSS classes; 2 dynamic inline styles (statusColor, urgencyColor) |
| `src/components/admin/splitbutton.tsx` | Splitbutton with primary action, dropdown, comment panel, stornierung flow | VERIFIED | Imports `QUICK_ACTIONS`, `COMMENT_REQUIRED`; implements stornierung confirm flow; terminal/completed states; outside-click + Escape handlers |
| `src/components/admin/product-card.tsx` | ProductCard with quantity badge and price math | VERIFIED | 0 inline styles; `stueckzahl > 1` badge guard; price math with `formatCurrency` |
| `src/components/admin/tab-panel.tsx` | TabPanel with 4 tabs, sessionStorage persistence, conditional Details tab | VERIFIED (with bug) | sessionStorage persistence wired; 4 tabs; Details tab conditional on `shouldShowDetailsTab`; **anonymize guard uses wrong string** |
| `src/components/admin/anfrage-detail-view.tsx` | Complete rewrite composing all 4 sub-components | VERIFIED | 165 lines; 0 inline styles; `admin-content` wrapper; `detail-layout` grid; all business logic preserved |
| `tests/unit/test-quick-actions.test.ts` | Validates QUICK_ACTIONS completeness | VERIFIED | 90 lines, 7 tests, imports from `status-config` |
| `tests/unit/test-detail-view-helpers.test.ts` | Validates wartezeit, urgency, produkt-zusammenfassung, tab visibility | VERIFIED | 106 lines, 16 tests, imports from `detail-view-helpers` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `anfrage-detail-view.tsx` | `attention-bar.tsx` | `import { AttentionBar }` + `<AttentionBar ...>` | WIRED | Confirmed in file |
| `anfrage-detail-view.tsx` | `splitbutton.tsx` | `import { Splitbutton }` + `<Splitbutton ...>` | WIRED | Confirmed in file |
| `anfrage-detail-view.tsx` | `product-card.tsx` | `import { ProductCard }` + `<ProductCard ...>` | WIRED | Confirmed in file |
| `anfrage-detail-view.tsx` | `tab-panel.tsx` | `import { TabPanel }` + `<TabPanel ...>` | WIRED | Confirmed in file |
| `anfrage-detail-view.tsx` | `/api/anfragen/{id}?depth=1` | `fetch` in `loadDoc` callback | WIRED | Line 23 |
| `attention-bar.tsx` | `detail-view-helpers.ts` | `import { getWaitingDays, getUrgencyLevel, getProduktZusammenfassung, URGENCY_COLORS, isTerminalStatus, isCompletedStatus }` | WIRED | Lines 6-12 |
| `splitbutton.tsx` | `status-config.ts` | `import { QUICK_ACTIONS, STATUS_COLORS, STATUS_LABELS }` | WIRED | Lines 4-9 |
| `splitbutton.tsx` | `status-transitions.ts` | `import { COMMENT_REQUIRED }` | WIRED | Line 10 |
| `product-card.tsx` | `format-currency.ts` | `import { formatCurrency }` | WIRED | Line 4 |
| `tab-panel.tsx` | `detail-view-helpers.ts` | `import { shouldShowDetailsTab }` | WIRED | Line 5 |
| `tab-panel.tsx` | `status-timeline.tsx` | `import { StatusTimeline }` + `<StatusTimeline key={refreshKey} ...>` | WIRED | Lines 4, 114 |
| `custom.scss` | Payload admin | `import './custom.scss'` in `src/app/(payload)/layout.tsx` | WIRED | Confirmed |

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|----------------|-------------|--------|----------|
| ADMN-01 | 19-01, 19-04 | admin-custom.css fuer strukturelle Admin-Styles | SATISFIED | 631-line `custom.scss` loaded via `layout.tsx`; all components use CSS classes |
| ADMN-02 | 19-02 | Attention Bar Component | SATISFIED | `attention-bar.tsx` fully implemented with all specified fields |
| ADMN-03 | 19-02 | Aktions-Leiste mit Splitbutton-Pattern | SATISFIED | `splitbutton.tsx` with primary + chevron dropdown, context-dependent actions |
| ADMN-04 | 19-02 | 2-Spalten Layout mit Produkte (60%) und Tab-Panel (40%) | SATISFIED | `detail-layout` CSS class (`grid-template-columns: 3fr 2fr`), 4-tab TabPanel |
| ADMN-05 | 19-02 | Stueckzahl-Badge pro Produktkarte | SATISFIED | `quantity-badge` only for `stueckzahl > 1`; price math with Einzelpreis x Menge = Gesamt |
| ADMN-06 | 19-03 | Anfrage-Detail-View komplett umgebaut | SATISFIED | `anfrage-detail-view.tsx` fully rewritten to 165 lines composing all 4 sub-components; REQUIREMENTS.md status table shows "Pending" but implementation is complete and verified |
| ADMN-10 | 19-01 | Kontextabhaengige Quick-Actions pro Status | SATISFIED | `QUICK_ACTIONS` record in `status-config.ts` with 20-status map; `Splitbutton` consumes `QUICK_ACTIONS[currentStatus]` |

**Note on ADMN-06:** REQUIREMENTS.md status tracking table shows `ADMN-06 | Phase 19 | Pending`. This is a stale tracking entry -- the implementation is fully present and wired in the codebase. The REQUIREMENTS.md status table was not updated after Plans 03/04 completed.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `splitbutton.tsx` | 235, 276, 288 | `placeholder="..."` attributes | Info | HTML placeholder attributes for textarea/input fields -- not code anti-patterns, these are legitimate UX labels |
| `splitbutton.tsx` | 140 | `new Date().toLocaleDateString("de-DE")` in terminal status | Warning | Shows today's date for storniert, not the actual stornierung date. Splitbutton receives no date prop for this case. Minor UX inaccuracy. |

**Placeholder false positives:** The anti-pattern scanner flagged `placeholder=` HTML attributes as "PLACEHOLDER" matches. These are valid form field hints, not code stubs.

### Bug Found: Anonymize Guard String Mismatch

**Severity: Blocker for DSGVO compliance feature**

**Location:** `src/components/admin/tab-panel.tsx` line 175

**Problem:**
```typescript
// tab-panel.tsx (what exists):
{kontakt.vorname && kontakt.vorname !== "GELOESCHT" && (
  <button ...>Kundendaten anonymisieren (DSGVO)</button>
)}
```

```typescript
// anonymize-customer/route.ts (what the API writes):
vorname: 'GELÖSCHT',  // real ö umlaut
```

The guard checks for `"GELOESCHT"` (ASCII fallback), but the anonymize route writes `"GELÖSCHT"` (real UTF-8 ö). After anonymization, `vorname === 'GELÖSCHT'`, which is not equal to `"GELOESCHT"`, so the condition `!== "GELOESCHT"` remains `true` and the anonymize button stays visible permanently.

**The plan (19-02-PLAN.md acceptance criteria) explicitly required:** `tab-panel.tsx contains GELÖSCHT (real umlaut)`. This was changed during implementation per the summary: "Changed 'GELOESCHT' string check from unicode to ASCII match in tab-panel kontakt anonymize guard" -- but the API was not changed to match.

**Fix:** Change line 175 in `tab-panel.tsx`:
```typescript
kontakt.vorname !== "GELOESCHT"  ->  kontakt.vorname !== "GELÖSCHT"
```

### Human Verification Required

#### 1. Full Detail View Visual Check

**Test:** Start dev server, open admin, navigate to any Anfrage, inspect the detail view
**Expected:** Attention Bar spans full width at top with anfrage number, colored status badge, wartezeit badge (if applicable), produkt-zusammenfassung, and gesamtpreis. Splitbutton appears below with correct action color. 2-column layout with products left and tab panel right.
**Why human:** Visual appearance, color accuracy, layout proportions, and interactive states cannot be verified programmatically.

#### 2. Storniert Terminal Date Accuracy

**Test:** Open a Anfrage with status "storniert". Observe the terminal-info text in the Splitbutton zone.
**Expected (ambiguous):** Shows the actual stornierung date, not today's date
**Why human:** `splitbutton.tsx` line 140 uses `new Date().toLocaleDateString("de-DE")` (always today's date). The component receives no date prop for the stornierung date. Whether this is acceptable UX or a bug requires product owner judgement.

### Gaps Summary

One functional bug blocks full goal achievement: the anonymize-button visibility guard in `tab-panel.tsx` uses an ASCII string `"GELOESCHT"` but the anonymize API writes `"GELÖSCHT"` (with real ö). This means the "Kundendaten anonymisieren (DSGVO)" button remains clickable after data has already been anonymized, which contradicts the DSGVO compliance intent and could allow repeated (no-op) anonymization attempts.

The fix is a single character change in `tab-panel.tsx` line 175.

All other must-haves are fully implemented and wired:
- All 7 source files (4 components + 3 lib modules) exist with substantive implementations
- All 11 key links verified as wired
- 60+ CSS classes in `custom.scss` covering every component
- `custom.scss` loaded globally via Payload layout
- All 7 ADMN requirements satisfied (ADMN-06 REQUIREMENTS.md table is stale, implementation is present)
- Test files exist with 7 and 16 tests respectively

---

_Verified: 2026-03-25T13:41:00Z_
_Verifier: Claude (gsd-verifier)_
