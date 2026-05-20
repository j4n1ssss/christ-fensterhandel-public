# Phase 14: Integration Polish + Bookkeeping - Research

**Researched:** 2026-03-23
**Domain:** Gap closure -- UTF-8 string fixes, fetch credentials, ROADMAP documentation
**Confidence:** HIGH

## Summary

Phase 14 is a small gap closure phase addressing two code-level integration issues and one documentation bookkeeping item identified by the v1.1 milestone audit. All three items are well-scoped, low-risk, and require no new libraries, patterns, or architectural decisions.

The two code changes are single-line fixes in existing files: replacing ASCII transliterations with real UTF-8 umlauts in `profile-hub-status-cell.tsx` (3 strings), and adding `{ credentials: "include" }` to a fetch call in `profile-last-editor.tsx`. The ROADMAP bookkeeping (success criterion #3) was already completed in commit 7c3f11f prior to this phase starting.

**Primary recommendation:** Execute as a single plan with two file edits (badge text + fetch credentials) and a verification that ROADMAP is already correct. No tests need modification -- these are cosmetic/consistency fixes with no logic changes.

## Standard Stack

### Core

No new libraries needed. All changes are within the existing codebase.

| Library | Version | Purpose | Relevance to Phase |
|---------|---------|---------|-------------------|
| React | 19.x | Component rendering | Badge text is a React component |
| Next.js | 15.x | App framework | Fetch runs in browser context |
| Payload CMS | 3.x | Admin panel | Both components render inside Payload Admin |

### Supporting

None required.

### Alternatives Considered

None -- this phase is pure fix work, no decisions to make.

## Architecture Patterns

### Pattern 1: UTF-8 in German UI Strings

**What:** All user-facing German text uses real Unicode characters (ae -> ae, oe -> oe, ue -> ue, ss -> ss), not ASCII transliterations.

**When to use:** Every string visible to users in the admin panel or frontend.

**Existing decision:** STATE.md records `[Phase quick]: All user-facing German text uses real Unicode umlauts; GELOSCHT sentinel consistent`. The umlaut audit (quick task 260318-uog) already converted most strings, but these three in `profile-hub-status-cell.tsx` were missed.

**Current state (needs fix):**
```typescript
// profile-hub-status-cell.tsx line 31
{isComplete ? "Vollstaendig" : "Unvollstaendig"}
// profile-hub-status-cell.tsx line 36
? "Alle Pflicht-Hub-Felder befuellt"
```

**Target state:**
```typescript
{isComplete ? "Vollständig" : "Unvollständig"}
// and
? "Alle Pflicht-Hub-Felder befüllt"
```

### Pattern 2: Fetch with credentials: "include"

**What:** All admin-panel fetch calls to Payload REST API include `{ credentials: "include" }` to send authentication cookies.

**When to use:** Every client-side `fetch()` call to `/api/*` endpoints within Payload Admin components.

**Why it matters:** Without `credentials: "include"`, the browser may not send the Payload session cookie. Currently this works because `profile-last-editor.tsx` uses a simple `fetch()` without an options object, and same-origin requests in most browsers default to `credentials: "same-origin"`. However, the pattern is inconsistent with all other admin fetch calls (6+ instances use `credentials: "include"` explicitly) and could break under certain proxy configurations.

**Existing pattern in codebase (verified):**
```typescript
// anfrage-detail-view.tsx line 44
const res = await fetch(`/api/anfragen/${id}?depth=1`, { credentials: 'include' })

// status-timeline.tsx line 45
{ credentials: 'include' }

// profile-history-panel.tsx line 363
credentials: "include",

// status-workflow.tsx line 57
credentials: 'include',
```

**Current state (needs fix):**
```typescript
// profile-last-editor.tsx line 61
fetch(`/api/profile/${id}?depth=1`)
```

**Target state:**
```typescript
fetch(`/api/profile/${id}?depth=1`, { credentials: "include" })
```

### Pattern 3: ROADMAP Bookkeeping (Already Done)

**What:** ROADMAP.md must accurately reflect phase completion status with correct checkboxes and progress table entries.

**Current state:** Already fixed in commit 7c3f11f (2026-03-23). Phase 8/9 checkboxes corrected from `[ ]` to `[x]`, plan checkboxes updated for phases 7-13, progress table corrected from "Not started" to "Complete" with dates and v1.1 milestone tags.

**Action needed:** Verify and update the Phase 14 row in the progress table after completion (mark `[x]` and add completion date). No other ROADMAP changes needed.

## Don't Hand-Roll

Not applicable to this phase -- no functionality is being built, only strings and options corrected.

## Common Pitfalls

### Pitfall 1: Encoding Issues When Editing UTF-8 Files

**What goes wrong:** Editor or tool writes file with wrong encoding, corrupting umlauts.
**Why it happens:** Some terminals or file-writing tools default to ASCII.
**How to avoid:** The Write tool handles UTF-8 correctly. Verify the file after writing by reading it back.
**Warning signs:** Characters like `Ã¤` or `\u00e4` instead of real umlauts in the output.

### Pitfall 2: Missing Second Argument to fetch()

**What goes wrong:** Adding credentials as part of the URL string or adding it incorrectly.
**Why it happens:** Simple oversight.
**How to avoid:** Match the exact pattern used in `profile-history-panel.tsx` (same author, same phase):
```typescript
fetch(url, { credentials: "include" })
```

### Pitfall 3: Assuming ROADMAP Still Needs Fixing

**What goes wrong:** Making unnecessary ROADMAP edits that duplicate commit 7c3f11f.
**Why it happens:** Phase description says "ROADMAP-Checkboxen korrigiert" but this was pre-fixed.
**How to avoid:** Verify current ROADMAP state. Only update the Phase 14 row (mark complete + date) after execution.

## Code Examples

### Fix 1: UTF-8 Badge Text (profile-hub-status-cell.tsx)

**File:** `src/components/admin/profile-hub-status-cell.tsx`
**Lines to change:** 31 and 35-36

Three string replacements:
1. Line 31: `"Vollstaendig"` -> `"Vollständig"`
2. Line 31: `"Unvollstaendig"` -> `"Unvollständig"`
3. Line 36: `"Alle Pflicht-Hub-Felder befuellt"` -> `"Alle Pflicht-Hub-Felder befüllt"`

### Fix 2: Add credentials to fetch (profile-last-editor.tsx)

**File:** `src/components/admin/profile-last-editor.tsx`
**Line to change:** 61

```typescript
// Before
fetch(`/api/profile/${id}?depth=1`)

// After
fetch(`/api/profile/${id}?depth=1`, { credentials: "include" })
```

### Fix 3: ROADMAP Phase 14 completion (after execution)

**File:** `.planning/ROADMAP.md`
**Changes after plan execution:**
- Line 34: `- [ ] **Phase 14:` -> `- [x] **Phase 14:` + add `(completed YYYY-MM-DD)`
- Line 200 (plan): `- [ ] 14-01-PLAN.md` -> `- [x] 14-01-PLAN.md`
- Progress table: Update Phase 14 row from `Not started` to `Complete` with date

## State of the Art

Not applicable -- this phase involves no library upgrades or pattern changes.

## Open Questions

None. All three changes are fully specified with exact file paths, line numbers, and target content.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest (jsdom) |
| Config file | `jest.config.ts` |
| Quick run command | `npx jest --passWithNoTests` |
| Full suite command | `npx jest` |

### Phase Requirements -> Test Map

This phase has no formal requirement IDs (gap closure). The changes are purely cosmetic/consistency fixes.

| Gap ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INT-COSMETIC-01 | Badge shows UTF-8 umlauts | manual-only | N/A (visual in admin panel) | N/A |
| INT-CREDENTIALS-01 | Fetch includes credentials | manual-only | N/A (runtime behavior) | N/A |
| ROADMAP-BOOKKEEPING | Checkboxes correct | manual-only | `grep -c "\- \[x\]" .planning/ROADMAP.md` | N/A |

**Justification for manual-only:** These are string literal changes and a fetch options addition. No logic is altered. The existing test suite (`tests/unit/`) does not render admin panel components (they depend on Payload Admin context). A unit test for string content would be brittle and add no value beyond visual verification.

### Sampling Rate

- **Per task commit:** `npx jest --passWithNoTests` (verify no regressions)
- **Per wave merge:** `npx jest` (full suite)
- **Phase gate:** Full suite green + visual verification of badge text in admin

### Wave 0 Gaps

None -- existing test infrastructure covers all phase requirements. No new test files needed.

## Sources

### Primary (HIGH confidence)

- **Source code inspection** (direct Read of target files):
  - `src/components/admin/profile-hub-status-cell.tsx` -- confirmed 3 ASCII strings on lines 31, 36
  - `src/components/admin/profile-last-editor.tsx` -- confirmed missing credentials on line 61
  - `.planning/ROADMAP.md` -- confirmed bookkeeping already fixed in commit 7c3f11f

- **Codebase pattern verification** (Grep across src/):
  - 6+ fetch calls in admin components all use `credentials: "include"` -- profile-last-editor is the only exception
  - No other ASCII umlaut transliterations remain in `src/` besides the 3 in profile-hub-status-cell

- **v1.1 Milestone Audit** (`.planning/v1.1-MILESTONE-AUDIT.md`):
  - INT-COSMETIC-01 and INT-CREDENTIALS-01 documented with file paths and fix descriptions

### Secondary (MEDIUM confidence)

- **Git history** (commit 7c3f11f): Confirmed ROADMAP bookkeeping fixes already applied

### Tertiary (LOW confidence)

None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new libraries, just string edits
- Architecture: HIGH - following established patterns (credentials, UTF-8)
- Pitfalls: HIGH - trivial changes with well-understood risk profile

**Research date:** 2026-03-23
**Valid until:** indefinite (these are simple code fixes, not library-dependent)
