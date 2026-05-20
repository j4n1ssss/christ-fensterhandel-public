---
phase: 17
slug: status-config-centralization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + ts-jest (jsdom environment) |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest --testPathPattern status-config -x` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~15 seconds (340 existing tests + new) |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern status-config -x`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green + grep verification
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 01 | 1 | STAT-01 | unit | `npx jest --testPathPattern status-config -x` | ❌ W0 | ⬜ pending |
| 17-01-02 | 01 | 1 | STAT-01 | unit | `npx jest --testPathPattern status-config -x` | ❌ W0 | ⬜ pending |
| 17-01-03 | 01 | 1 | STAT-01 | unit | `npx jest --testPathPattern status-config -x` | ❌ W0 | ⬜ pending |
| 17-02-01 | 02 | 2 | STAT-02 | smoke (grep) | `grep -r "const STATUS_COLORS\|const STATUS_LABELS" src/ \| grep -v status-config.ts \| wc -l` (must be 0) | ✅ | ⬜ pending |
| 17-02-02 | 02 | 2 | STAT-02 | manual | Visual check in browser | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/status-config.test.ts` — stubs for STAT-01 (all exports, all 7 keys, helper functions, fallback behavior)
- [ ] Framework install: none needed — Jest already configured and working (340 existing tests)

*Existing infrastructure covers framework requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin components render correct badge colors | STAT-02 | Visual rendering with inline styles cannot be verified by unit test | Open admin panel, check status badges in anfrage-list, detail-view, timeline, dashboard |
| Kunden components render correct Tailwind classes | STAT-02 | Tailwind class application requires browser rendering | Open kunden tracking page, check status-timeline and gast-tracking-form colors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
