# Phase 23: Verification + Tracking Closure - Research

**Researched:** 2026-03-27
**Domain:** GSD verification workflow, requirements traceability, documentation gap closure
**Confidence:** HIGH

## Summary

Phase 23 is a pure documentation and tracking phase -- no code changes are required. The v1.3 Milestone Audit (`v1.3-MILESTONE-AUDIT.md`) identified 5 requirements that are fully implemented in the codebase but lack formal verification or have tracking inconsistencies. Specifically:

- **4 orphaned requirements** (STAT-05, KUND-01, KUND-02, N8N-01) are marked as completed in SUMMARY frontmatter and `[x]` in REQUIREMENTS.md, but Phase 21 has no VERIFICATION.md -- so they were never formally verified.
- **1 tracking gap** (ADMN-06) is verified as complete in Phase 19's VERIFICATION.md, listed in plan 19-03's scope, but the REQUIREMENTS.md checkbox is still `[ ]` and no SUMMARY frontmatter claims it.

All 5 requirements have live, working implementations in the codebase. This phase creates the missing VERIFICATION.md for Phase 21 and fixes the ADMN-06 tracking entry in REQUIREMENTS.md.

**Primary recommendation:** Create a Phase 21 VERIFICATION.md following the established format (see Phase 17/18/22 as templates), then update REQUIREMENTS.md traceability for ADMN-06 and the 4 Phase 21 requirements.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STAT-05 | Admin-Status zu Kunden-Text Mapping mit 5-Phasen-Modell | Implementation verified in status-config.ts (STATUS_CUSTOMER_TEXT at line 191, STATUS_CUSTOMER_PHASE at line 219). All 20 statuses mapped. Consumed by ProgressStepper, StatusBanner, anfrage-detail.tsx, anfragen-liste.tsx, status-timeline.tsx, gast-tracking-form.tsx. Tests exist in test-status-config.test.ts and test-progress-stepper.test.tsx. Needs formal VERIFICATION.md entry. |
| KUND-01 | Kunden sehen vereinfachte Status-Texte statt interner Admin-Statuse | All kunden components now use STATUS_CUSTOMER_TEXT. Phase 22 fixed the last holdout (gast-tracking-form.tsx). grep confirms zero getStatusLabel() calls in kunden components. Tests exist in test-kunden-timeline.test.tsx (8 tests). Needs formal VERIFICATION.md entry. |
| KUND-02 | 5-Phasen Fortschrittsbalken | ProgressStepper component exists in progress-stepper.tsx with 5 phases (Anfrage/Angebot/Zahlung/Produktion/Lieferung). Integrated into anfrage-detail.tsx (full stepper) and anfragen-liste.tsx (mini dots). Tests exist in test-progress-stepper.test.tsx (11 tests). Needs formal VERIFICATION.md entry. |
| N8N-01 | E-Mail-Trigger bei kundenrelevanten Status-Aenderungen | afterChange hook in anfragen.ts sends webhook with customer_facing flag via isCustomerFacing(). EMAIL_TRIGGER_STATUSES has 14 entries (expanded from original 10). WebhookPayload includes kunden_text/kunden_phase fields. Tests in test-n8n-webhook.test.ts (8 tests). Needs formal VERIFICATION.md entry. |
| ADMN-06 | Anfrage-Detail-View komplett umgebaut | anfrage-detail-view.tsx composes AttentionBar + Splitbutton + ProductCard + TabPanel. Verified as PASSED in Phase 19 VERIFICATION.md. Only needs REQUIREMENTS.md checkbox flip from [ ] to [x] and traceability table update. |
</phase_requirements>

## Standard Stack

This phase requires no libraries or code changes. It is purely a documentation and verification phase.

### Tools Used
| Tool | Purpose | Why Standard |
|------|---------|--------------|
| grep/find | Code evidence gathering for verification | Standard verification approach used in all prior phases |
| git log | Commit trail verification | Established pattern from Phase 17-22 VERIFICATION.md files |
| Markdown | VERIFICATION.md + REQUIREMENTS.md updates | GSD documentation format |

## Architecture Patterns

### VERIFICATION.md Format (Established Pattern)

All existing VERIFICATION.md files in this project follow a consistent structure. Phase 23 must match this format exactly.

**Required sections** (from Phase 17/18/19/20/22 VERIFICATION.md files):

```
---
phase: {phase-slug}
verified: {ISO timestamp}
status: passed | gaps_found
score: {N}/{M} must-haves verified
re_verification: true | false
gaps: []
human_verification: []
---

# Phase {N}: {Name} -- Verification Report

**Phase Goal:** {from ROADMAP.md}
**Verified:** {timestamp}
**Status:** PASSED | GAPS_FOUND
**Re-verification:** {yes/no} -- {reason}

## Goal Achievement
### Observable Truths (from ROADMAP.md Success Criteria)
| # | Truth | Status | Evidence |

## Required Artifacts
| Artifact | Expected | Status | Details |

## Key Link Verification
| From | To | Via | Status | Details |

## Requirements Coverage
| Requirement | Source Plan | Description | Status | Evidence |

## Anti-Patterns Found
| File | Line | Pattern | Severity | Impact |

## Human Verification Required
| Test | Expected | Why Human |

## Git Commit Verification
| Commit | Message | Status |

## Gaps Summary
{summary text}

_Verified: {timestamp}_
_Verifier: Claude (gsd-verifier)_
```

### REQUIREMENTS.md Update Pattern

The traceability table at the bottom of REQUIREMENTS.md uses this format:
```
| Requirement | Phase | Status |
| ADMN-06 | Phase 19+23 | Complete |
```

Checkbox format: `- [x] **ADMN-06**: Description`

### Evidence Gathering Pattern

Each truth claim must cite specific file:line evidence. The pattern from Phase 22 VERIFICATION.md:
```
| 1 | {truth statement} | VERIFIED | {file} line {N}: {code snippet}. {grep confirmation}. |
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Verification format | Custom document structure | Existing VERIFICATION.md template from Phase 17/18/22 | Consistency with 5 existing verification reports |
| Evidence gathering | Manual file reading | grep commands with line numbers | Reproducible, automatable, matches existing evidence patterns |
| Requirement status determination | Guesswork | 3-source cross-reference (VERIFICATION + SUMMARY + REQUIREMENTS) | Established audit methodology from v1.3-MILESTONE-AUDIT.md |

## Common Pitfalls

### Pitfall 1: Claiming Code Verification Without Line-Level Evidence
**What goes wrong:** Writing "VERIFIED" without citing specific file:line references
**Why it happens:** Tempting to say "implementation exists" without proving it
**How to avoid:** Every VERIFIED claim must include: file path, line number, code snippet or grep result
**Warning signs:** Vague evidence like "component exists" without line references

### Pitfall 2: N8N-01 Count Discrepancy
**What goes wrong:** N8N-01 says "10 kundenrelevante Status-Aenderungen" but EMAIL_TRIGGER_STATUSES has 14 entries
**Why it happens:** Original requirement scope expanded during implementation (Phase 18 added 4 more)
**How to avoid:** Verify all 10 originally listed events are covered, note the 14-total as scope expansion, not a gap. The original 10 are: Eingang (neu), Rueckfrage, Angebot (angebot_versendet), Zahlungslink (zahlungslink_versendet), Zahlung eingegangen (bezahlt), In Produktion, Versandbereit, Geliefert, Storniert, Hersteller-Problem. All 10 are present in EMAIL_TRIGGER_STATUSES.
**Warning signs:** Marking N8N-01 as "partial" because count doesn't match exactly

### Pitfall 3: KUND-01 Was Split Across Phase 21 + 22
**What goes wrong:** Forgetting that Phase 22 fixed gast-tracking-form.tsx, which was deferred from Phase 21
**Why it happens:** Phase 21 SUMMARY explicitly deferred gast-tracking-form.tsx
**How to avoid:** KUND-01 verification must cite BOTH Phase 21 work (3 kunden components) AND Phase 22 work (gast-tracking-form.tsx). The REQUIREMENTS.md traceability already shows "Phase 22+23" for KUND-01.
**Warning signs:** Only checking Phase 21 files and missing the Phase 22 fix

### Pitfall 4: Confusing Phase 21 VERIFICATION.md Location
**What goes wrong:** Creating VERIFICATION.md in Phase 23 directory instead of Phase 21 directory
**Why it happens:** Phase 23 is the current phase, but the VERIFICATION.md belongs to Phase 21
**How to avoid:** The Phase 21 VERIFICATION.md goes in `.planning/phases/21-kunden-dashboard-n8n/21-VERIFICATION.md`. Phase 23 has its own separate VERIFICATION.md after completion.
**Warning signs:** Looking for 21-VERIFICATION.md in the wrong directory

### Pitfall 5: Not Updating All Three Tracking Sources
**What goes wrong:** Updating REQUIREMENTS.md but forgetting the traceability table, or vice versa
**Why it happens:** REQUIREMENTS.md has both checkboxes (top) and a traceability table (bottom)
**How to avoid:** For ADMN-06: update the checkbox `[ ]` to `[x]` AND update the traceability row from "Pending" to "Complete". For the 4 Phase 21 requirements: update traceability status from "Pending" to "Complete" for STAT-05, KUND-02, N8N-01; KUND-01 is already "Complete" in traceability but verify it stays that way.
**Warning signs:** Checkbox says [x] but traceability still says "Pending"

## Code Examples

### Evidence Pattern for STAT-05 Verification

```
# STATUS_CUSTOMER_TEXT has all 20 statuses
grep -c ":" src/lib/status-config.ts  # in the STATUS_CUSTOMER_TEXT block

# STATUS_CUSTOMER_PHASE maps to 5 phases + null
grep "STATUS_CUSTOMER_PHASE" src/lib/status-config.ts | head -25

# Kunden components consume the mapping
grep -rn "STATUS_CUSTOMER_PHASE\|STATUS_CUSTOMER_TEXT" src/components/kunden/
```

### Evidence Pattern for KUND-01 Verification

```
# No getStatusLabel() in kunden components (Phase 22 fixed the last one)
grep -rn "getStatusLabel" src/components/kunden/
# Expected: zero matches

# All kunden components use STATUS_CUSTOMER_TEXT
grep -rn "STATUS_CUSTOMER_TEXT" src/components/kunden/
# Expected: matches in anfrage-detail.tsx, anfragen-liste.tsx (via ProgressStepper),
#           status-timeline.tsx, gast-tracking-form.tsx
```

### Evidence Pattern for KUND-02 Verification

```
# ProgressStepper component exists with 5 phases
grep -n "PHASES" src/components/kunden/progress-stepper.tsx
# Expected: ["Anfrage", "Angebot", "Zahlung", "Produktion", "Lieferung"]

# Integrated into kunden views
grep -rn "ProgressStepper" src/components/kunden/
# Expected: progress-stepper.tsx (definition), anfrage-detail.tsx, anfragen-liste.tsx
```

### Evidence Pattern for N8N-01 Verification

```
# afterChange hook sends webhook with customer_facing flag
grep -n "customer_facing\|isCustomerFacing\|sendN8NWebhook" src/collections/business/anfragen.ts

# EMAIL_TRIGGER_STATUSES covers all 10+ required events
grep -A20 "EMAIL_TRIGGER_STATUSES" src/lib/status-config.ts

# WebhookPayload includes customer fields
grep -n "customer_facing\|kunden_text\|kunden_phase" src/lib/n8n-webhook.ts
```

### Evidence Pattern for ADMN-06 Verification

```
# anfrage-detail-view.tsx composes all sub-components
grep -n "AttentionBar\|Splitbutton\|ProductCard\|TabPanel" src/components/admin/anfrage-detail-view.tsx
# Expected: all 4 imports + all 4 JSX usages

# Already verified in Phase 19 VERIFICATION.md
grep -A2 "ADMN-06" .planning/phases/19-admin-detail-view-redesign/19-VERIFICATION.md
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No Phase 21 VERIFICATION.md | Phase 23 creates it retroactively | This phase | Closes 4 orphaned requirements |
| ADMN-06 checkbox [ ] | Update to [x] | This phase | Fixes tracking gap |
| 17/22 satisfied | 22/22 satisfied | This phase | v1.3 milestone fully verified |

## Open Questions

1. **N8N-01 scope expansion from 10 to 14 triggers**
   - What we know: Original requirement said 10, implementation has 14 in EMAIL_TRIGGER_STATUSES
   - What's unclear: Whether the VERIFICATION should note this as an acceptable scope expansion or flag it
   - Recommendation: Note it as enhancement (14 >= 10 original), not a gap. All 10 original events are included.

2. **Phase 21 VALIDATION.md status**
   - What we know: Phase 21 has a VALIDATION.md in draft status with wave 0 items not completed
   - What's unclear: Whether Phase 23 should also update the VALIDATION.md sign-off
   - Recommendation: Out of scope for Phase 23. The VALIDATION.md is about test execution tracking, not requirements verification. Phase 23 focuses on VERIFICATION.md and REQUIREMENTS.md only.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2 + ts-jest + @testing-library/react |
| Config file | jest.config.ts |
| Quick run command | `npx jest --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAT-05 | Customer text mapping for all 20 statuses | unit | `npx jest tests/unit/test-status-config.test.ts -x --no-coverage` | Yes |
| KUND-01 | Customer-facing text in timeline, no internal labels | unit | `npx jest tests/unit/test-kunden-timeline.test.tsx -x --no-coverage` | Yes |
| KUND-02 | 5-phase progress stepper rendering | unit | `npx jest tests/unit/test-progress-stepper.test.tsx -x --no-coverage` | Yes |
| KUND-02 | Status banner for special statuses | unit | `npx jest tests/unit/test-status-banner.test.tsx -x --no-coverage` | Yes |
| N8N-01 | Webhook payload with customer_facing flag | unit | `npx jest tests/unit/test-n8n-webhook.test.ts -x --no-coverage` | Yes |
| ADMN-06 | Detail view composition (tracking fix only) | manual-only | Verify Phase 19 VERIFICATION.md already passed | N/A |

### Sampling Rate
- **Per task commit:** No code changes -- run existing tests to confirm no regressions
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
None -- all relevant test files already exist from Phase 21 implementation. This phase creates documentation only, not code.

## Key Files for Verification

### Files to Create
| File | Purpose |
|------|---------|
| `.planning/phases/21-kunden-dashboard-n8n/21-VERIFICATION.md` | Formal verification of STAT-05, KUND-01, KUND-02, N8N-01 |

### Files to Modify
| File | Change |
|------|--------|
| `.planning/REQUIREMENTS.md` | Flip ADMN-06 checkbox to [x], update traceability table for STAT-05/KUND-02/N8N-01 to "Complete" |

### Source Files to Cite as Evidence (read-only)
| File | Requirement | What to Verify |
|------|-------------|----------------|
| `src/lib/status-config.ts` | STAT-05 | STATUS_CUSTOMER_TEXT (line ~191), STATUS_CUSTOMER_PHASE (line ~219) with all 20 entries |
| `src/components/kunden/progress-stepper.tsx` | KUND-02 | ProgressStepper with 5 PHASES array, ProgressStepperMini |
| `src/components/kunden/status-banner.tsx` | KUND-02 | StatusBanner with error/warning variants |
| `src/components/kunden/anfrage-detail.tsx` | KUND-01, KUND-02 | ProgressStepper integration, STATUS_CUSTOMER_TEXT usage |
| `src/components/kunden/anfragen-liste.tsx` | KUND-01, KUND-02 | ProgressStepperMini integration |
| `src/components/kunden/status-timeline.tsx` | KUND-01 | STATUS_CUSTOMER_TEXT usage, no getStatusLabel |
| `src/components/kunden/gast-tracking-form.tsx` | KUND-01 | STATUS_CUSTOMER_TEXT usage (fixed in Phase 22) |
| `src/lib/n8n-webhook.ts` | N8N-01 | WebhookPayload interface with customer_facing, kunden_text, kunden_phase |
| `src/collections/business/anfragen.ts` | N8N-01 | afterChange hook calling sendN8NWebhook with isCustomerFacing() |
| `src/components/admin/anfrage-detail-view.tsx` | ADMN-06 | Composes AttentionBar + Splitbutton + ProductCard + TabPanel |
| `tests/unit/test-status-config.test.ts` | STAT-05 | Tests for STATUS_CUSTOMER_TEXT and STATUS_CUSTOMER_PHASE |
| `tests/unit/test-progress-stepper.test.tsx` | KUND-02 | 11 tests for stepper rendering |
| `tests/unit/test-status-banner.test.tsx` | KUND-02 | 10 tests for banner variants |
| `tests/unit/test-kunden-timeline.test.tsx` | KUND-01 | 8 tests for customer text in timeline |
| `tests/unit/test-n8n-webhook.test.ts` | N8N-01 | 8 tests for webhook payload |

### Commit Trail to Verify
| Phase | Commits | Requirements |
|-------|---------|-------------|
| Phase 21 Plan 01 | `2fa9020`, `13f3b81`, `6867e64` | KUND-02, STAT-05 |
| Phase 21 Plan 02 | `336008b`, `fc8b110`, `6f6e217` | KUND-01, KUND-02, N8N-01, STAT-05 |
| Phase 22 Plan 01 | `98592a0`, `fb28a06` | KUND-01 (gast-tracking-form fix) |

## Success Criteria Mapping

| Success Criteria | How to Achieve |
|------------------|----------------|
| 1. Phase 21 hat ein vollstaendiges VERIFICATION.md das STAT-05, KUND-01, KUND-02, N8N-01 formal verifiziert | Create `21-VERIFICATION.md` in Phase 21 directory with line-level evidence for all 4 requirements |
| 2. ADMN-06 Checkbox in REQUIREMENTS.md ist [x] mit korrektem Status "Complete" | Edit REQUIREMENTS.md: flip checkbox, update traceability row |
| 3. Alle 22 v1.3 Requirements haben Status "satisfied" im Re-Audit | After 1+2, update the coverage summary from 17/22 to 22/22 in REQUIREMENTS.md |

## Sources

### Primary (HIGH confidence)
- `.planning/v1.3-MILESTONE-AUDIT.md` -- Identified all 5 gaps, provides 3-source cross-reference
- `.planning/REQUIREMENTS.md` -- Current checkbox and traceability state
- `.planning/phases/21-kunden-dashboard-n8n/21-01-SUMMARY.md` -- Phase 21 Plan 01 completion evidence
- `.planning/phases/21-kunden-dashboard-n8n/21-02-SUMMARY.md` -- Phase 21 Plan 02 completion evidence
- `.planning/phases/19-admin-detail-view-redesign/19-VERIFICATION.md` -- ADMN-06 already verified as passed
- `.planning/phases/22-integration-fixes-tech-debt/22-VERIFICATION.md` -- KUND-01 gast-tracking fix verified
- Source files: status-config.ts, progress-stepper.tsx, status-banner.tsx, n8n-webhook.ts, anfragen.ts, anfrage-detail-view.tsx

### Secondary (MEDIUM confidence)
- None needed -- all evidence is in the codebase and planning docs

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No code changes, purely documentation
- Architecture: HIGH - 5 existing VERIFICATION.md files establish the exact format to follow
- Pitfalls: HIGH - Gaps are precisely catalogued in v1.3-MILESTONE-AUDIT.md with specific file:line evidence

**Research date:** 2026-03-27
**Valid until:** Indefinite (documentation phase, no external dependencies)
