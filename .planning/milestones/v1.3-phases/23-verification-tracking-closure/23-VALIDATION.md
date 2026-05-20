---
phase: 23
slug: verification-tracking-closure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.2 + ts-jest + @testing-library/react |
| **Config file** | jest.config.ts |
| **Quick run command** | `npx jest --no-coverage` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --no-coverage` (confirm no regressions from doc changes)
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 23-01-01 | 01 | 1 | STAT-05 | manual-verify | `grep -n "STATUS_CUSTOMER_TEXT" src/lib/status-config.ts` | N/A | ⬜ pending |
| 23-01-02 | 01 | 1 | KUND-01 | manual-verify | `grep -rn "STATUS_CUSTOMER_TEXT" src/components/kunden/` | N/A | ⬜ pending |
| 23-01-03 | 01 | 1 | KUND-02 | manual-verify | `grep -n "PHASES" src/components/kunden/progress-stepper.tsx` | N/A | ⬜ pending |
| 23-01-04 | 01 | 1 | N8N-01 | manual-verify | `grep -n "EMAIL_TRIGGER_STATUSES" src/lib/status-config.ts` | N/A | ⬜ pending |
| 23-01-05 | 01 | 1 | ADMN-06 | manual-verify | `grep -A2 "ADMN-06" .planning/phases/19-admin-detail-view-redesign/19-VERIFICATION.md` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. This is a documentation-only phase — no new test files needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| VERIFICATION.md follows established format | All | Document format compliance requires human review | Compare structure with Phase 17/18/22 VERIFICATION.md files |
| REQUIREMENTS.md traceability consistency | ADMN-06 | Cross-reference between checkbox, traceability table, and SUMMARY | Check all three sources show consistent status |
| 22/22 re-audit confirms complete | All | Full milestone audit requires holistic review | Re-run v1.3 audit methodology on all 22 requirements |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
