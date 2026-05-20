---
phase: 13
slug: undo-save-floor-doc-cleanup
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.2.0 + ts-jest 29.4.6 |
| **Config file** | jest.config.ts |
| **Quick run command** | `npx jest --testPathPattern=test-undo-redo -x` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=test-undo-redo -x`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | SC-1 (undo floor) | unit | `npx jest --testPathPattern=test-undo-redo -x` | ✅ (Tests 7, 8, 8b) | ⬜ pending |
| 13-01-02 | 01 | 1 | SC-2 (filter comment) | manual-only | `grep -c "erlaubte_produkttypen" src/lib/konfigurator/filters.ts` | N/A | ⬜ pending |
| 13-01-03 | 01 | 1 | SC-3 (summary fix) | manual-only | `grep -c "REST fetch" .planning/phases/11-*/11-02-SUMMARY.md` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| filters.ts comment exists | SC-2 | Code comment, no behavioral change | `grep "erlaubte_produkttypen" src/lib/konfigurator/filters.ts` must show comment |
| 11-02-SUMMARY.md corrected | SC-3 | Documentation text change | `grep "REST fetch" .planning/phases/11-*/11-02-SUMMARY.md` must match |
| Save floor advances in UI | SC-1 (integration) | Requires Payload admin environment | Open profile → edit → save → Cmd+Z should not go past save point |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
