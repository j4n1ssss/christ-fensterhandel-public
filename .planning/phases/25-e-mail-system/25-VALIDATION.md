---
phase: 25
slug: e-mail-system
status: active
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-29
---

# Phase 25 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest --passWithNoTests -x` |
| **Full suite command** | `npx jest --passWithNoTests` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --passWithNoTests -x`
- **After every plan wave:** Run `npx jest --passWithNoTests`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 25-01-T1 | 01 | 1 | MAIL-01 | unit | `npx jest tests/unit/test-event-matrix.test.ts tests/unit/test-render-subject.test.ts -x` | tests/unit/test-event-matrix.test.ts, tests/unit/test-render-subject.test.ts | pending |
| 25-01-T2 | 01 | 1 | MAIL-08 | typecheck | `npx tsc --noEmit --pretty 2>&1 \| head -30` | src/collections/system/email-queue.ts | pending |
| 25-02-T1 | 02 | 2 | MAIL-02, MAIL-03 | typecheck | `npx tsc --noEmit --pretty 2>&1 \| head -30` | src/emails/components/base-layout.tsx | pending |
| 25-02-T2 | 02 | 2 | MAIL-03 | unit | `npx jest tests/unit/test-email-templates.test.ts -x` | tests/unit/test-email-templates.test.ts | pending |
| 25-03-T1 | 03 | 3 | MAIL-05, MAIL-07, MAIL-08 | unit | `npx jest tests/unit/test-email-queue.test.ts -x` | tests/unit/test-email-queue.test.ts | pending |
| 25-03-T2 | 03 | 3 | MAIL-08 | typecheck | `npx tsc --noEmit --pretty 2>&1 \| head -30` | src/instrumentation.ts | pending |
| 25-03-T3 | 03 | 3 | MAIL-08 | typecheck | `npx tsc --noEmit --pretty 2>&1 \| head -30` | src/components/admin/email-queue-retry.tsx | pending |
| 25-04-T1 | 04 | 3 | MAIL-04 | typecheck | `npx tsc --noEmit --pretty 2>&1 \| head -30` | src/app/(payload)/api/email-preview/route.ts | pending |
| 25-04-T2 | 04 | 3 | MAIL-06 | file-exists | `test -f docs/wissen/n8n-email-setup.md` | docs/wissen/n8n-email-setup.md | pending |

*Status: pending -- green -- red -- flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-event-matrix.test.ts` -- created by 25-01-T1 (TDD task, tests written first)
- [ ] `tests/unit/test-render-subject.test.ts` -- created by 25-01-T1 (TDD task, tests written first)
- [ ] `tests/unit/test-email-templates.test.ts` -- created by 25-02-T2 (TDD task, tests written first)
- [ ] `tests/unit/test-email-queue.test.ts` -- created by 25-03-T1 (TDD task, tests written first)
- [ ] jest.config.ts -- already exists in project root

*All test files are created by TDD tasks within their respective plans. No separate Wave 0 plan needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Email renders correctly in Outlook | MAIL-03 | Outlook rendering quirks need visual inspection | Send test email, open in Outlook, verify layout |
| N8N webhook integration | MAIL-05 | External service dependency | Trigger event, verify N8N receives payload |
| Email preview staff-only access | MAIL-04 | Auth + visual verification | Access /api/email-preview as admin, mitarbeiter, and non-staff user |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
