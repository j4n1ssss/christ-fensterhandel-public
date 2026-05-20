---
phase: 6
slug: website-und-compliance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30 + @testing-library/react 16 |
| **Config file** | `jest.config.ts` (exists) |
| **Quick run command** | `npx jest --testPathPattern=tests/unit --bail` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=tests/unit --bail`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | WEB-01 | integration | Manual verification (Payload startup + admin visit) | N/A - manual | ⬜ pending |
| 06-01-02 | 01 | 1 | WEB-02 | unit | `npx jest tests/unit/test-puck-blocks.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | WEB-03 | manual-only | Manual: verify in admin UI | N/A - manual | ⬜ pending |
| 06-01-04 | 01 | 1 | WEB-04 | integration | Manual: create draft, check frontend 404, publish, check frontend 200 | N/A - manual | ⬜ pending |
| 06-02-01 | 02 | 2 | I18N-01 | unit | `npx jest tests/unit/test-i18n-config.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 2 | I18N-02 | integration | Manual: set DE/EN content, query with locale param | N/A - manual | ⬜ pending |
| 06-02-03 | 02 | 2 | I18N-03 | unit | `npx jest tests/unit/test-i18n-middleware.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-02-04 | 02 | 2 | DSGVO-01 | unit | Already covered by Phase 3 tests | ✅ Existing | ⬜ pending |
| 06-02-05 | 02 | 2 | DSGVO-02 | unit | `npx jest tests/unit/test-cookie-banner.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-02-06 | 02 | 2 | DSGVO-03 | unit | `npx jest tests/unit/test-anonymization.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-puck-blocks.test.ts` — stubs for WEB-02 (block render output)
- [ ] `tests/unit/test-i18n-config.test.ts` — stubs for I18N-01 (localization config validation)
- [ ] `tests/unit/test-i18n-middleware.test.ts` — stubs for I18N-03 (middleware routing logic)
- [ ] `tests/unit/test-cookie-banner.test.ts` — stubs for DSGVO-02 (banner visibility logic)
- [ ] `tests/unit/test-anonymization.test.ts` — stubs for DSGVO-03 (data anonymization logic)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Puck plugin registers in Payload config | WEB-01 | Requires running Payload server + admin UI visit | Start dev server, visit /admin, confirm Puck editor available |
| Live preview breakpoints toggle | WEB-03 | Visual/UI behavior not automatable | Open Puck editor, toggle mobile/tablet/desktop breakpoints |
| Draft pages not visible on frontend | WEB-04 | Requires full Payload draft/publish workflow | Create draft page, verify 404 on frontend, publish, verify 200 |
| Localized fields return correct locale data | I18N-02 | Requires Payload API with locale parameter | Set DE/EN content in admin, query API with ?locale=de and ?locale=en |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
