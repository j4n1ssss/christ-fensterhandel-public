---
phase: 11
slug: edit-history-hooks-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + ts-jest (jsdom) |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest --testPathPattern=test-profile-hooks -x` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=test-profile-hooks -x`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | HIST-02 | unit | `npx jest --testPathPattern=test-profile-hooks -x` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 1 | HIST-03 | unit | `npx jest --testPathPattern=test-profile-hooks -x` | ❌ W0 | ⬜ pending |
| 11-01-03 | 01 | 1 | HIST-04 | unit | `npx jest --testPathPattern=test-profile-hooks -x` | ❌ W0 | ⬜ pending |
| 11-02-01 | 02 | 2 | HIST-05 | manual | Manual: open profile edit, click Historie tab | N/A | ⬜ pending |
| 11-02-02 | 02 | 2 | HIST-06 | manual | Manual: save profile, check header line | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-profile-hooks.test.ts` — stubs for HIST-02, HIST-03, HIST-04
- [ ] `tests/unit/test-diff-utils.test.ts` — covers diff computation pure functions

*Existing infrastructure covers Jest framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| History panel renders entries with expand/collapse | HIST-05 | React component in Payload Admin, needs full admin context | 1. Open profile edit view 2. Click "Historie" tab 3. Verify 50 entries load 4. Click entry to expand before/after |
| Last-editor header shows editor info | HIST-06 | Custom admin component, needs Payload session | 1. Save a profile 2. Check header shows "Zuletzt bearbeitet von [Name] ([Email]) am [Datum]" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
