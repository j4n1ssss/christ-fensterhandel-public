---
phase: 2
slug: konfigurator-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x + @testing-library/react + ts-jest |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx jest --passWithNoTests` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --passWithNoTests`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | KONF-01 | unit | `npx jest tests/unit/test-landing-page.test.tsx` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | KONF-03,04,05 | unit | `npx jest tests/unit/test-filters.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | KONF-13 | unit | `npx jest tests/unit/test-cascade-reset.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 2 | KONF-15 | unit | `npx jest tests/unit/test-schemas.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | KONF-12 | unit | `npx jest tests/unit/test-price-calculator.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 3 | KONF-06-11 | unit | `npx jest tests/unit/test-step-*.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install -D jest @testing-library/react @testing-library/jest-dom ts-jest jest-environment-jsdom @types/jest` — install test framework
- [ ] `jest.config.ts` — Jest config with Next.js/JSX support
- [ ] `tests/unit/test-filters.test.ts` — stubs for KONF-03 through KONF-11 (filtering logic)
- [ ] `tests/unit/test-cascade-reset.test.ts` — stubs for KONF-13
- [ ] `tests/unit/test-schemas.test.ts` — stubs for KONF-15
- [ ] `tests/unit/test-price-calculator.test.ts` — stubs for KONF-12
- [ ] `tests/unit/test-landing-page.test.tsx` — stubs for KONF-01

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SVG Live-Vorschau zeigt korrektes Fenster | KONF-14 | Visual rendering requires human eye check | Open /konfigurator/fenster, go through all steps, verify SVG updates correctly |
| Mobile Sidebar klappt zusammen | KONF-02 | Responsive layout visual check | Open on mobile viewport, verify sidebar becomes dropdown |
| Skeleton Loading States | KONF-02 | Visual shimmer effect check | Throttle network, verify shimmer appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
