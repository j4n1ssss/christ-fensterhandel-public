---
phase: 16
slug: session-persistence-role-visibility
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.2 + ts-jest 29.4 + @testing-library/react 16.3 |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest tests/unit/test-custom-nav.test.tsx tests/unit/test-role-visibility.test.tsx tests/unit/test-session-persistence.test.tsx --no-cache` |
| **Full suite command** | `npx jest --no-cache` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest tests/unit/test-custom-nav.test.tsx tests/unit/test-role-visibility.test.tsx tests/unit/test-session-persistence.test.tsx --no-cache`
- **After every plan wave:** Run `npx jest --no-cache`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 16-01-01 | 01 | 0 | UX-02 | unit | `npx jest tests/unit/test-session-persistence.test.tsx -x` | ❌ W0 | ⬜ pending |
| 16-01-02 | 01 | 0 | UX-03 | unit | `npx jest tests/unit/test-role-visibility.test.tsx -x` | ❌ W0 | ⬜ pending |
| 16-01-03 | 01 | 0 | UX-03 | unit | `npx jest tests/unit/test-access-admin-block.test.ts -x` | ❌ W0 | ⬜ pending |
| 16-01-04 | 01 | 0 | UX-03 | unit | `npx jest tests/unit/test-middleware-redirect.test.ts -x` | ❌ W0 | ⬜ pending |
| 16-02-01 | 02 | 1 | UX-02 | unit | `npx jest tests/unit/test-session-persistence.test.tsx -x` | ❌ W0 | ⬜ pending |
| 16-02-02 | 02 | 1 | UX-03 | unit | `npx jest tests/unit/test-role-visibility.test.tsx -x` | ❌ W0 | ⬜ pending |
| 16-03-01 | 03 | 1 | UX-03 | unit | `npx jest tests/unit/test-access-admin-block.test.ts -x` | ❌ W0 | ⬜ pending |
| 16-03-02 | 03 | 1 | UX-03 | unit | `npx jest tests/unit/test-middleware-redirect.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-session-persistence.test.tsx` — sessionStorage dual-logic, additive open, first-load fallback (UX-02)
- [ ] `tests/unit/test-role-visibility.test.tsx` — admin vs. viewer nav filtering, empty section hiding, separator logic (UX-03)
- [ ] `tests/unit/test-access-admin-block.test.ts` — access.admin function returns correct boolean per role (UX-03)
- [ ] `tests/unit/test-middleware-redirect.test.ts` — middleware customer redirect logic (UX-03)
- [ ] Verify jsdom sessionStorage mock works in existing jest-setup.ts or add per-test mock

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual dropdown open/close animation smoothness | UX-02 | CSS transition quality is visual | Open/close dropdowns, verify no flickering or layout shift |
| Separator spacing between direct links and dropdowns | UX-03 | Visual spacing precision | Log in as admin (separator visible) and viewer (fewer separators) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
