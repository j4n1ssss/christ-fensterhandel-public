---
phase: 27
slug: stripe-end-to-end
status: draft
nyquist_compliant: true
wave_0_complete: false
wave_0_plan: 27-00-PLAN.md
created: 2026-04-01
---

# Phase 27 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x |
| **Config file** | jest.config.ts |
| **Quick run command** | `npm test -- --testPathPattern=stripe` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=stripe`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 27-00-01 | 00 | 0 | ALL | scaffold | `npm test -- --testPathPattern=stripe` | W0 creates | pending |
| 27-01-01 | 01 | 1 | STRP-02, STRP-06 | unit | `npm test -- --testPathPattern="test-status-config\|test-status-transitions"` | existing | pending |
| 27-01-02 | 01 | 1 | STRP-11 | unit | `npm test -- --testPathPattern=test-stripe-checkout` | W0 extends | pending |
| 27-02-01 | 02 | 2 | STRP-01, STRP-07, STRP-09 | unit | `npm test -- --testPathPattern="test-stripe-webhook\|test-event-matrix"` | W0 extends | pending |
| 27-02-02 | 02 | 2 | STRP-04, STRP-05, STRP-08 | unit | `npm test -- --testPathPattern=test-stripe` | W0 creates | pending |
| 27-03-01 | 03 | 3 | STRP-04 | unit | `npm test -- --testPathPattern=test-stripe` | W0 creates | pending |
| 27-03-02 | 03 | 3 | STRP-04 | unit | `npm test -- --testPathPattern=test-stripe` | W0 creates | pending |
| 27-04-01 | 04 | 3 | STRP-03, STRP-08 | unit | `npm test -- --testPathPattern=test-stripe` | W0 creates | pending |
| 27-04-02 | 04 | 3 | STRP-03, STRP-05 | unit | `npm test -- --testPathPattern=test-stripe` | W0 creates | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Plan

**Plan:** `27-00-PLAN.md` (wave: 0, depends_on: [])

Creates/extends 5 test files in `tests/unit/`:
- [x] `tests/unit/test-stripe-checkout.test.ts` -- EXTEND with stubs for STRP-01, STRP-02, STRP-06, STRP-11
- [x] `tests/unit/test-stripe-webhook.test.ts` -- EXTEND with stubs for STRP-07, STRP-09, STRP-10
- [ ] `tests/unit/test-stripe-helpers.test.ts` -- NEW stubs for STRP-03
- [ ] `tests/unit/test-stripe-refund.test.ts` -- NEW stubs for STRP-08
- [ ] `tests/unit/test-stripe-redirect.test.ts` -- NEW stubs for STRP-04, STRP-05

Uses project test convention: `tests/unit/test-*.test.ts` (not `tests/stripe/`).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stripe Checkout redirect | STRP-01 | External Stripe hosted page | Click Zahlungslink, verify Stripe Checkout loads |
| Webhook delivery timing | STRP-04 | Depends on Stripe infrastructure | Use Stripe CLI to forward webhooks, verify processing |
| Email receipt with link | STRP-01 | N8N email delivery | Check email inbox for Zahlungslink email |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify with behavioral tests (not just tsc)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 plan (27-00-PLAN.md) covers all MISSING test references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending (Wave 0 must execute first)
