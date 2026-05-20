---
phase: 24
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 24 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.2.0 + ts-jest 29.4.6 |
| **Config file** | `jest.config.ts` (exists) |
| **Quick run command** | `npx jest --testPathPattern="test-name" --no-coverage -x` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern="<relevant-test>" --no-coverage -x`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 24-01-01 | 01 | 1 | BASE-01 | unit | `npx jest --testPathPattern="test-settings" --no-coverage -x` | ❌ W0 | ⬜ pending |
| 24-02-01 | 02 | 1 | BASE-02 | unit | `npx jest --testPathPattern="test-tax" --no-coverage -x` | ❌ W0 | ⬜ pending |
| 24-02-02 | 02 | 1 | BASE-02 | unit | `npx jest --testPathPattern="test-format-cents" --no-coverage -x` | ❌ W0 | ⬜ pending |
| 24-03-01 | 03 | 1 | BASE-03 | unit | `npx jest --testPathPattern="test-nummernkreise" --no-coverage -x` | ❌ W0 | ⬜ pending |
| 24-04-01 | 04 | 2 | SEC-02 | unit | `npx jest --testPathPattern="test-rate-limit" --no-coverage -x` | ❌ W0 | ⬜ pending |
| 24-04-02 | 04 | 2 | SEC-03 | unit | `npx jest --testPathPattern="test-csrf" --no-coverage -x` | ❌ W0 | ⬜ pending |
| 24-05-01 | 05 | 2 | BASE-04 | unit | `npx jest --testPathPattern="test-optimistic-lock" --no-coverage -x` | ❌ W0 | ⬜ pending |
| 24-06-01 | 06 | 2 | SEC-04 | unit | `npx jest --testPathPattern="test-seed-guard" --no-coverage -x` | ❌ W0 | ⬜ pending |
| 24-06-02 | 06 | 2 | SEC-01 | manual | Manual verification | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-settings.test.ts` — stubs for BASE-01 (getSettings helper)
- [ ] `tests/unit/test-tax.test.ts` — stubs for BASE-02 (calcNetFromGross, calcGrossFromNet, calcTax, splitLine)
- [ ] `tests/unit/test-format-cents.test.ts` — stubs for BASE-02 (formatCents function)
- [ ] `tests/unit/test-nummernkreise.test.ts` — stubs for BASE-03 (getNextNumber, year rollover)
- [ ] `tests/unit/test-rate-limit.test.ts` — stubs for SEC-02 (checkRateLimit, withRateLimit)
- [ ] `tests/unit/test-csrf.test.ts` — stubs for SEC-03 (withCsrf, generateCsrfToken, validateCsrfToken)
- [ ] `tests/unit/test-optimistic-lock.test.ts` — stubs for BASE-04 (version comparison)
- [ ] `tests/unit/test-seed-guard.test.ts` — stubs for SEC-04 (production guard)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| .env.example exists with all keys | SEC-01 | File content review | Verify .env.example has all env vars with comments and categories |
| .gitignore includes .env | SEC-01 | Config file check | Run `grep '^\.env$' .gitignore` |
| Settings Admin Page renders 4 tabs | BASE-01 | UI verification | Navigate to /admin/einstellungen and verify all 4 tabs render |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
