---
phase: 9
slug: filter-logic-refactor
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.2.0 with ts-jest 29.4.6 |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest --testPathPattern=filters-hub` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=filters-hub`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | FILT-01 | unit | `npx jest tests/unit/test-filters-hub.test.ts` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | FILT-02 | unit | `npx jest tests/unit/test-filters-hub.test.ts` | ❌ W0 | ⬜ pending |
| 09-01-03 | 01 | 1 | FILT-03 | unit | `npx jest tests/unit/test-filters-hub.test.ts` | ❌ W0 | ⬜ pending |
| 09-02-01 | 02 | 2 | FILT-04 | unit | `npx jest tests/unit/test-filters-hub.test.ts` | ❌ W0 | ⬜ pending |
| 09-02-02 | 02 | 2 | DEBT-01 | unit | `npx jest tests/unit/test-filters-hub.test.ts` | ❌ W0 | ⬜ pending |
| 09-02-03 | 02 | 2 | DEBT-02 | manual | Code review of store.ts query params | N/A | ⬜ pending |
| 09-02-04 | 02 | 2 | FILT-05 | manual | Code review of store.ts depth param | N/A | ⬜ pending |
| 09-03-01 | 03 | 3 | FILT-06 | unit | `npx jest tests/unit/test-validate-hub.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-filters-hub.test.ts` — stubs for FILT-01, FILT-02, FILT-03, FILT-04, DEBT-01
- [ ] `tests/unit/test-validate-hub.test.ts` — stubs for FILT-06
- [ ] No framework install needed — Jest already configured and working

*Test approach: Export pure functions (getHubField, validateProfile) and test with mock data objects. No Payload/database dependency for unit tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Profile depth reduced to 1 | FILT-05 | Network request depth is runtime config | Inspect store.ts loadCMSData() code for `depth=1` on profile fetch |
| aktiv filter on API queries | DEBT-02 | API query params are runtime behavior | Inspect store.ts loadCMSData() for `where[aktiv][equals]=true` on collections with aktiv field |
| All 10 steps work end-to-end | FILT-04 | Full configurator flow requires running app | Walk through all 10 steps with USE_HUB=true and USE_HUB=false |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
