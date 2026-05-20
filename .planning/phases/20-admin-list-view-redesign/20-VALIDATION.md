---
phase: 20
slug: admin-list-view-redesign
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + ts-jest (jsdom) |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest --testPathPattern="test-list\|test-status-config" -x` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern="test-list|test-status-config" -x`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 1 | ADMN-07 | unit | `npx jest tests/unit/test-list-view-helpers.test.ts -x` | No -- Wave 0 | pending |
| 20-01-02 | 01 | 1 | ADMN-07 | unit | `npx jest tests/unit/test-list-view-helpers.test.ts -x` | No -- Wave 0 | pending |
| 20-01-03 | 01 | 1 | ADMN-09 | unit | `npx jest tests/unit/test-list-view-helpers.test.ts -x` | No -- Wave 0 | pending |
| 20-01-04 | 01 | 1 | ADMN-09 | unit | `npx jest tests/unit/test-list-view-helpers.test.ts -x` | No -- Wave 0 | pending |
| 20-01-05 | 01 | 1 | ADMN-09 | unit | `npx jest tests/unit/test-status-config.test.ts -x` | Yes (extend) | pending |
| 20-02-xx | 02 | 2 | ADMN-08 | unit | `npx jest tests/unit/test-detail-view-helpers.test.ts -x` | Yes (existing) | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-list-view-helpers.test.ts` -- stubs for ADMN-07 (tab filters, smart default), ADMN-09 (attention score, score color)
- [ ] Extend `tests/unit/test-status-config.test.ts` -- verify STATUS_WEIGHT covers all StatusKeys, LIST_TAB_FILTERS covers all non-terminal statuses

*Existing `test-detail-view-helpers.test.ts` already covers getWaitingDays, getUrgencyLevel for ADMN-08*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tab-Wechsel filtert Liste visuell | ADMN-07 | React render output in custom Payload view | Navigate to /admin/collections/anfragen, verify tab clicks filter rows |
| Wartezeit-Badge Farbcodierung | ADMN-08 | Visual CSS verification | Inspect row border colors match threshold rules |
| 3-Dot Menu Interaktion | ADMN-07 | DOM event handling in browser | Click 3-dot, verify dropdown, click outside to close |
| Zeilen-Klick navigiert zu Detail | ADMN-07 | Browser navigation | Click row, verify redirect to /admin/collections/anfragen/{id} |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
