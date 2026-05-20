---
phase: 12
slug: qa-tech-debt
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + ts-jest (jsdom) |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest --testPathPattern=test-validate-hub` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run generate:types && npx tsc --noEmit` + `npx jest`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green + `npm run build` clean
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | DEBT-03 | build | `npm run generate:types && npx tsc --noEmit` | N/A (build) | ⬜ pending |
| 12-01-02 | 01 | 1 | DEBT-03 | build | `npx tsc --noEmit` | N/A (build) | ⬜ pending |
| 12-02-01 | 02 | 1 | HUB-05 | manual | Admin UI visual check | N/A | ⬜ pending |
| 12-03-01 | 03 | 2 | DEBT-06 | manual | File existence check | N/A | ⬜ pending |
| 12-04-01 | 04 | 2 | DEBT-04 | unit | `npx jest tests/unit/test-filters-hub.test.ts` | ✅ | ⬜ pending |
| 12-04-02 | 04 | 2 | DEBT-05 | unit | `npx jest tests/unit/test-profile-hub.test.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Badge visible in Profile list view | HUB-05 | Requires running Payload Admin UI | 1. Open /admin/collections/profile 2. Verify "Hub-Status" column shows 3. Check badge color for complete/incomplete profiles 4. Hover over "Unvollstaendig" to verify tooltip |
| ADR document completeness | DEBT-06 | Content review, not automatable | 1. Read ADR file 2. Verify Status, Kontext, Entscheidung, Begruendung sections 3. Check REQUIREMENTS.md update |
| Filter dropdown for incomplete profiles | HUB-05 | Admin UI interaction | 1. Open Profile list view 2. Use filter to show only incomplete profiles 3. Verify results match expected |

*Manual verifications required for Admin UI visual components and documentation review.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
