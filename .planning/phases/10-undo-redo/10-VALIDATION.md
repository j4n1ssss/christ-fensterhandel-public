---
phase: 10
slug: undo-redo
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.2 + ts-jest + jsdom |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest tests/unit/test-undo-redo.test.ts --no-coverage` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest tests/unit/test-undo-redo.test.ts --no-coverage`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | UNDO-01 | manual (live admin) | N/A -- requires Payload admin context | N/A -- PoC is the test | ⬜ pending |
| 10-02-01 | 02 | 1 | UNDO-02 | unit | `npx jest tests/unit/test-undo-redo.test.ts -x` | ❌ W0 | ⬜ pending |
| 10-02-02 | 02 | 1 | UNDO-03 | unit | `npx jest tests/unit/test-undo-redo.test.ts -x` | ❌ W0 | ⬜ pending |
| 10-02-03 | 02 | 1 | UNDO-04 | manual (live admin) | N/A -- requires useHotkey context | N/A | ⬜ pending |
| 10-02-04 | 02 | 1 | UNDO-05 | unit | `npx jest tests/unit/test-undo-redo.test.ts -x` | ❌ W0 | ⬜ pending |
| 10-02-05 | 02 | 1 | UNDO-06 | unit | `npx jest tests/unit/test-undo-redo.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-undo-redo.test.ts` — stubs for UNDO-02, UNDO-03, UNDO-05, UNDO-06 (stack logic is pure functions, testable without Payload context)
- [ ] Stack logic extracted into pure function/class for testability (no React hooks dependency)
- [ ] Jest + ts-jest already installed — no additional framework setup needed

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| getFields/replaceState round-trip with relationships | UNDO-01 | Requires live Payload admin context with real FormState | 1. Open Profile edit view 2. Change a relationship field 3. Press Cmd+Z 4. Verify field reverts |
| Keyboard shortcuts (Cmd+Z / Cmd+Shift+Z) | UNDO-04 | Requires useHotkey hook in Payload context + real browser events | 1. Open Profile edit view 2. Make changes 3. Press Cmd+Z/Cmd+Shift+Z 4. Verify undo/redo behavior |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
