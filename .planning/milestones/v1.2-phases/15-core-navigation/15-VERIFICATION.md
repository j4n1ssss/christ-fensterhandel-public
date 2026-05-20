---
phase: 15-core-navigation
verified: 2026-03-23T00:00:00Z
status: human_needed
score: 10/10 must-haves verified
re_verification: false
human_verification:
  - test: "Open http://localhost:3000/admin and login. Verify Custom Sidebar is visible with 4 direct links at top: Dashboard, Bestellungen, Produkte, Benutzer."
    expected: "Custom sidebar replaces Payload default nav. Four links visible at top."
    why_human: "CSS rendering and Payload Nav slot injection cannot be verified in jsdom."
  - test: "Click each of the 4 dropdown sections (Bestellungsverwaltung, Produktverwaltung, Website, System). Verify they expand and collapse."
    expected: "Collapsible dropdowns work. ChevronDown rotates. Items appear and disappear."
    why_human: "Radix Collapsible animation and state require real browser."
  - test: "Open Produktverwaltung. Verify 4 gray non-clickable subgroup headings: HAUPTPRODUKTE, AUSSTATTUNG, KONFIGURATION, PREISE."
    expected: "Headings are visually distinct (smaller, uppercase, dimmed), not wrapped in <a> tags."
    why_human: "Visual style rendering cannot be verified programmatically."
  - test: "Navigate to /admin/collections/anfragen. Verify BOTH 'Bestellungen' direct link AND 'Anfragen' dropdown item are visually highlighted (Doppel-Highlight)."
    expected: "Both nav items have the active state (rounded pill background). Bestellungsverwaltung dropdown auto-opens."
    why_human: "Active CSS class rendering and auto-expand on navigation require real browser."
  - test: "Active link styling: verify the active link uses rounded pill background (rgba white) not a left accent bar. Confirm this matches the reference screenshot the user approved."
    expected: "Active links show rounded background highlight. UI-SPEC specified accent bar but user approved pill style during execution."
    why_human: "The implemented styling deviates from UI-SPEC (pill vs accent bar). Requires explicit user acceptance."
  - test: "Verify WebhookFehlerBadge appears next to System header when errors exist. Trigger a test error or mock the API to return errors."
    expected: "Badge (red circle with count) appears next to 'System' header AND next to 'Webhook Fehler' link inside the dropdown."
    why_human: "Badge only renders when errorCount > 0, which requires a live API or browser devtools mock."
  - test: "Verify sidebar toggle (hamburger) still opens and closes the sidebar."
    expected: "Hamburger button from Payload's NavToggler still works with custom nav's nav + nav--nav-open CSS classes."
    why_human: "CSS class interaction between Payload's NavToggler and custom nav cannot be tested in jsdom."
  - test: "Navigate to each collection list page (e.g. Anfragen, Profile, Benutzer). Verify collection tables render correctly without visual regressions."
    expected: "Collection list tables show correctly. No layout breakage from Tailwind collision with Payload's CSS."
    why_human: "CSS collision is only visible in a real browser."
  - test: "Verify Logout button is visible at the bottom of the sidebar and works."
    expected: "Logout button present at bottom. Clicking it logs out the user."
    why_human: "Payload Logout component behavior requires a real auth session."
---

# Phase 15: Core Navigation Verification Report

**Phase Goal:** Admin sieht eine vollstaendig custom Sidebar mit festen Links, aufklappbaren Dropdowns, grauen Untergruppen-Ueberschriften und eingebettetem WebhookFehlerBadge -- die Standard-Payload-Nav ist komplett ersetzt
**Verified:** 2026-03-23
**Status:** human_needed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Admin sieht Custom Sidebar mit Dashboard, Bestellungen, Produkte, Benutzer als direkte Links oben, gefolgt von 4 aufklappbaren Dropdown-Sektionen in exakter Mockup-Reihenfolge | ? HUMAN | All labels present in code. Collapsible structure wired. Visual rendering needs browser confirmation. |
| 2 | Produktverwaltung-Dropdown zeigt 4 graue nicht-klickbare Untergruppen-Ueberschriften (HAUPTPRODUKTE, AUSSTATTUNG, KONFIGURATION, PREISE) mit Collection-Links | ? HUMAN | Headings in code with `role="presentation"` and `cn-subheading` class. Tests confirm not in `<a>` tags. Visual style needs browser. |
| 3 | Aktiver Nav-Link ist visuell hervorgehoben und bleibt korrekt hervorgehoben beim Navigieren | ? HUMAN | `isActive()` logic verified. `cn-link--active` class applied. `aria-current="page"` set. Visual style deviates from UI-SPEC (pill not accent bar) -- needs explicit user acceptance. |
| 4 | WebhookFehlerBadge ist in Custom Navigation sichtbar und zeigt Fehler-Count (keine Regression gegenueber afterNavLinks) | ? HUMAN | Badge component imported and rendered in 2 locations (System header + Webhook Fehler link). `afterNavLinks` removed from config. Visual confirmation needs browser with live errors. |
| 5 | Navigation enthaelt ausschliesslich Text-Labels, keine Emojis | ✓ VERIFIED | Python regex scan of custom-nav.tsx found zero emoji codepoints. Test `no emojis` describe block passes. |

**Score:** 1/5 truths fully verified programmatically. 4/5 require human visual confirmation. All automated evidence supports truths -- no code-level failures found.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/admin/custom-nav.tsx` | Complete custom admin sidebar, min 150 lines, `'use client'` | ✓ VERIFIED | 486 lines. Starts with `"use client"`. Exports `default function CustomNav`. All nav structure present. |
| `src/components/admin/webhook-fehler-badge.tsx` | Client component, useEffect+fetch, `'use client'` | ✓ VERIFIED | Starts with `"use client"`. `useEffect` + `fetch('/api/globals/webhook_errors')` + `setInterval(fetchErrors, 60_000)`. Named + default export. |
| `src/payload.config.ts` | Contains `custom-nav#default` Nav registration | ✓ VERIFIED | Line 57: `Nav: "@/components/admin/custom-nav#default"`. `afterNavLinks` absent (grep count: 0). |
| `src/components/ui/collapsible.tsx` | Shadcn Collapsible, exports Collapsible | ✓ VERIFIED | Wraps `@radix-ui/react-collapsible`. Exports `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`. |
| `src/components/ui/badge.tsx` | Shadcn Badge with destructive variant | ✓ VERIFIED | Uses `cva`. Has `destructive` variant. Exports `Badge` and `badgeVariants`. |
| `src/components/ui/button.tsx` | Shadcn Button with ghost variant | ✓ VERIFIED | Uses `cva`. Has `ghost` variant. Exports `Button` and `buttonVariants`. |
| `tests/unit/test-webhook-badge.test.tsx` | WebhookFehlerBadge unit tests | ✓ VERIFIED | 157 lines. 7 test cases. All use `@testing-library/react`. Mock for fetch. Polling test. |
| `tests/unit/test-custom-nav.test.tsx` | 9 describe blocks, all requirements | ✓ VERIFIED | 290 lines. 9 describe blocks (direct links, bestellungsverwaltung, produktverwaltung, website, system, subgroup headings, no emojis, nav order, active link). Mocks for `@payloadcms/ui`, `next/navigation`, `next/link`, collapsible. |
| `tests/unit/test-nav-config.test.ts` | Config registration tests | ✓ VERIFIED | 35 lines. Reads actual `payload.config.ts` from filesystem. Tests Nav registration, afterNavLinks absence, graphics preservation, providers. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `custom-nav.tsx` | `@payloadcms/ui` | import hooks | PARTIAL | `useAuth`, `useNav`, `Logout` imported. `useConfig` NOT imported (plan required it). Deliberate deviation: hardcoded `/admin` paths used instead of `config.routes.admin`. Functionally equivalent for this project. |
| `custom-nav.tsx` | `webhook-fehler-badge.tsx` | import WebhookFehlerBadge | ✓ WIRED | Line 13: `import { WebhookFehlerBadge } from "@/components/admin/webhook-fehler-badge"`. Used 4 times (import + 2 renders + 1 type use). |
| `custom-nav.tsx` | `src/components/ui/collapsible.tsx` | import Collapsible | ✓ WIRED | Lines 8-12: `import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"`. All three used in component body. |
| `src/payload.config.ts` | `custom-nav.tsx` | importMap path string | ✓ WIRED | Line 57: `Nav: "@/components/admin/custom-nav#default"`. ImportMap regenerated: `src/app/(payload)/admin/importMap.js` contains `"@/components/admin/custom-nav#default"` entry. |
| `webhook-fehler-badge.tsx` | `/api/globals/webhook_errors` | fetch in useEffect | ✓ WIRED | Line 17: `fetch("/api/globals/webhook_errors")`. Response handled: `res.ok` checked, `data.errors` filtered by timestamp, `setErrorCount(recent.length)` called. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| NAV-01 | 15-02 | Custom Sidebar mit direkten Links | ? HUMAN | DIRECT_LINKS array contains Dashboard/Bestellungen/Produkte/Benutzer with correct hrefs. Rendered in `<NavLink>` components. Tests verify hrefs. Visual confirmation needed. |
| NAV-02 | 15-02 | Bestellungsverwaltung aufklappbar mit Anfragen + Status-Historie | ? HUMAN | `bestellungsverwaltung` section in DROPDOWN_SECTIONS. Items: Anfragen + Status-Historie. Tests pass. Visual confirmation needed. |
| NAV-03 | 15-02 | Produktverwaltung aufklappbar mit subgrouped collections | ? HUMAN | `produktverwaltung` section with 4 subgroups (HAUPTPRODUKTE: 3, AUSSTATTUNG: 8, KONFIGURATION: 4, PREISE: 2 = 17 collections). Tests verify all 17 labels. Visual confirmation needed. |
| NAV-04 | 15-02 | Website aufklappbar mit Pages/Navigation/Footer/Puck Templates | ? HUMAN | `website` section in DROPDOWN_SECTIONS. Items: Pages, Navigation, Footer, Puck Templates. Tests pass. Visual confirmation needed. |
| NAV-05 | 15-02 | System aufklappbar mit Medien/Edit-History/Webhook Fehler | ? HUMAN | SYSTEM_SECTION with 3 items. Tests pass. Visual confirmation needed. |
| NAV-06 | 15-02 | Graue nicht-klickbare Untergruppen-Ueberschriften | ? HUMAN | `<span className="cn-subheading" role="presentation">`. Tests confirm not wrapped in `<a>`. Visual style (color, uppercase) needs browser. |
| NAV-07 | 15-02 | Keine Emojis in Navigation | ✓ VERIFIED | Python regex scan: zero emoji codepoints in custom-nav.tsx. Unit test `no emojis` checks rendered HTML. |
| NAV-08 | 15-02 | Nav-Reihenfolge entspricht Mockup | ? HUMAN | DIRECT_LINKS rendered first, then DROPDOWN_SECTIONS in order (bestellungsverwaltung, produktverwaltung, website), then SYSTEM_SECTION last. Tests verify text order. Visual confirmation needed. |
| UX-01 | 15-02 | Aktiver Nav-Link visuell hervorgehoben | ? HUMAN | `isActive()` function correct. `cn-link--active` CSS class adds `background: rgba(255,255,255,0.1)` + white text. `aria-current="page"` set. NOTE: UI-SPEC specified left accent bar (border-l-3px + success-500). Implemented as rounded pill per user-approved dark-theme reference. Requires explicit user confirmation. |
| INT-01 | 15-01 + 15-02 | WebhookFehlerBadge in Custom Nav sichtbar | ? HUMAN | Badge imported and rendered twice: `badge={<WebhookFehlerBadge />}` on System DropdownSection (header level), `{isWebhookLink && <WebhookFehlerBadge />}` inside Webhook Fehler link. `afterNavLinks` removed. Visual confirmation with live errors needed. |
| INT-02 | 15-01 + 15-02 | Custom Nav in payload.config.ts registriert + importMap generiert | ✓ VERIFIED | `Nav: "@/components/admin/custom-nav#default"` in payload.config.ts line 57. importMap.js contains the entry. Config tests pass. |

**Orphaned requirements check:** UX-02 (session persistence) and UX-03 (role filtering) are mapped to Phase 16 in REQUIREMENTS.md traceability table. Neither appears in Phase 15 plans. Not orphaned -- correctly deferred.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `webhook-fehler-badge.tsx` | 39 | `return null` | ℹ️ Info | Intentional: component renders nothing when errorCount is 0. This is correct behavior per spec, not a stub. |
| `custom-nav.tsx` | 3 | `useConfig` missing from `@payloadcms/ui` import | ⚠️ Warning | Plan 02 specified `useConfig` should be imported for dynamic admin route resolution. Component hardcodes `/admin` prefix instead. Works for this project (Payload default route is always `/admin`) but is not resilient to `admin.routes` config changes. Low risk given project constraints. |

### Human Verification Required

#### 1. Custom Sidebar Visual Appearance

**Test:** Start dev server (`npm run dev`), open `http://localhost:3000/admin`, login.
**Expected:** Custom sidebar visible with 4 direct links at top, then 4 collapsible sections. No Payload default nav.
**Why human:** CSS rendering and Payload component slot injection require real browser.

#### 2. Collapsible Dropdown Behavior

**Test:** Click each section header (Bestellungsverwaltung, Produktverwaltung, Website, System). Click again to close.
**Expected:** Sections expand and collapse. ChevronDown rotates 180 degrees when open.
**Why human:** Radix Collapsible open/close state and CSS transitions require real browser.

#### 3. Subgroup Headings Visual Style

**Test:** Open Produktverwaltung. Inspect HAUPTPRODUKTE, AUSSTATTUNG, KONFIGURATION, PREISE headings.
**Expected:** Headings are smaller (11px), uppercase, dimmed/gray, not clickable. Collection links appear indented below each heading.
**Why human:** `.cn-subheading` CSS style rendering cannot be verified in jsdom.

#### 4. Active Link Highlighting and Doppel-Highlight

**Test:** Navigate to Anfragen (/admin/collections/anfragen).
**Expected:** "Bestellungen" direct link AND "Anfragen" dropdown item both show active highlight (rounded pill background). Bestellungsverwaltung section should auto-open.
**Why human:** Active CSS class rendering and pathname-based auto-expand require real browser.

#### 5. Active Link Style Deviation Acceptance

**Test:** Compare active link appearance to UI-SPEC.
**Expected:** UI-SPEC specified left accent bar (3px green border-left). Implementation uses rounded pill (background rgba white). Summary documents user approved this via dark-theme reference screenshot.
**Why human:** This is a design decision that requires explicit user confirmation. The implementation differs from the signed-off UI-SPEC.

#### 6. WebhookFehlerBadge Visibility

**Test:** Either wait for webhook errors or use browser devtools to mock `/api/globals/webhook_errors` to return a recent error. Check System header and Webhook Fehler link.
**Expected:** Red circle badge with error count appears next to "System" label. After opening System dropdown, badge also appears next to "Webhook Fehler" link.
**Why human:** Badge only renders when errorCount > 0, requiring a live API response.

#### 7. Sidebar Toggle (Hamburger)

**Test:** Find the hamburger/toggle button (from Payload's NavToggler). Click to close and open sidebar.
**Expected:** Sidebar toggles. Payload's NavToggler reads `nav--nav-open` CSS class from custom nav's `<aside>`. State managed via `useNav()` hook.
**Why human:** CSS class interaction between Payload's NavToggler and custom nav requires real browser.

#### 8. Collection List Tables Not Broken

**Test:** Navigate to 3-5 collection list pages (Anfragen, Profile, Benutzer, Farben, etc.).
**Expected:** Collection tables render correctly. No layout breakage from Tailwind CSS collision with Payload's admin CSS.
**Why human:** Tailwind CSS collision is only visible in real browser. Plan 02 summary notes this as a known risk (switched to inline styles to mitigate, but verification needed).

#### 9. Logout Button

**Test:** Scroll to bottom of sidebar. Click Logout.
**Expected:** Logout button visible at bottom. Clicking it logs out and redirects to login page.
**Why human:** Payload `<Logout />` component behavior requires real auth session.

### Gaps Summary

No code-level gaps found. All artifacts exist, are substantive (not stubs), and are wired. All 11 Phase 15 requirement IDs are addressed in code.

One notable deviation from plan specifications: `useConfig` is not imported in `custom-nav.tsx` (Plan 02 required it). The component hardcodes `/admin` prefix in all hrefs instead of using `config.routes.admin`. This is functionally acceptable for this project but reduces resilience. No action required unless admin route is ever changed from the Payload default.

A second deviation: the active link styling uses a rounded pill (rgba white background) instead of the UI-SPEC's specified left accent bar (3px border-left + success-500 color). The summary documents this was changed per a user-provided dark-theme reference screenshot. This deviation requires explicit user confirmation during visual verification (human verification item 5 above).

All other verified checks pass. The phase is ready for human visual sign-off. Once the 9 human verification items above are confirmed, all 11 requirements can be marked Complete in REQUIREMENTS.md.

---

_Verified: 2026-03-23_
_Verifier: Claude (gsd-verifier)_
