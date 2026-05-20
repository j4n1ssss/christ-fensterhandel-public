---
phase: 5
slug: externe-integrationen
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.x + ts-jest |
| **Config file** | jest.config.ts (exists) |
| **Quick run command** | `npx jest --testPathPattern=test-name -x` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=<relevant-test> -x`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | PAY-01 | unit | `npx jest tests/unit/test-stripe-checkout.test.ts -x` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | PAY-02 | unit | `npx jest tests/unit/test-stripe-webhook.test.ts -x` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | PAY-03 | unit | (covered by PAY-01/PAY-02 using test keys) | N/A | ⬜ pending |
| 05-02-01 | 02 | 1 | N8N-01 | unit | `npx jest tests/unit/test-n8n-webhook.test.ts -x` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 1 | N8N-02 | unit | `npx jest tests/unit/test-n8n-webhook.test.ts -x` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 1 | N8N-03 | manual-only | Manual: trigger test webhook, verify email in N8N execution log | N/A | ⬜ pending |
| 05-02-04 | 02 | 1 | N8N-04 | manual-only | Manual: trigger test webhook, verify email in N8N execution log | N/A | ⬜ pending |
| 05-02-05 | 02 | 1 | N8N-05 | unit | `npx jest tests/unit/test-n8n-webhook.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-stripe-checkout.test.ts` — stubs for PAY-01 (mock Stripe SDK, test session creation logic)
- [ ] `tests/unit/test-stripe-webhook.test.ts` — stubs for PAY-02 (mock constructEvent, test idempotency)
- [ ] `tests/unit/test-n8n-webhook.test.ts` — stubs for N8N-01, N8N-02, N8N-05 (mock fetch, test payload structure and headers)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| N8N sends firma email on neue_anfrage | N8N-03 | N8N workflow runs externally in Docker | 1. Send test webhook to N8N, 2. Check N8N execution log, 3. Verify email content |
| N8N sends kunde email on neue_anfrage | N8N-04 | N8N workflow runs externally in Docker | 1. Send test webhook to N8N, 2. Check N8N execution log, 3. Verify email content |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
