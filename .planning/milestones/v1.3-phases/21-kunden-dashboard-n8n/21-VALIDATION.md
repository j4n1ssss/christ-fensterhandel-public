---
phase: 21
slug: kunden-dashboard-n8n
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.2 + ts-jest + @testing-library/react |
| **Config file** | jest.config.ts |
| **Quick run command** | `npx jest --testPathPattern="tests/unit/test-(progress-stepper|status-banner|kunden-timeline)" --no-coverage` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern="tests/unit/test-(progress-stepper|status-banner|kunden-timeline)" --no-coverage`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 21-00-01 | 00 | 0 | KUND-02 | unit | `npx jest tests/unit/test-progress-stepper.test.tsx -x --no-coverage` | ❌ W0 | ⬜ pending |
| 21-00-02 | 00 | 0 | KUND-02 | unit | `npx jest tests/unit/test-status-banner.test.tsx -x --no-coverage` | ❌ W0 | ⬜ pending |
| 21-00-03 | 00 | 0 | KUND-01 | unit | `npx jest tests/unit/test-kunden-timeline.test.tsx -x --no-coverage` | ❌ W0 | ⬜ pending |
| 21-01-xx | 01 | 1 | STAT-05 | unit | `npx jest tests/unit/test-status-config.test.ts -x --no-coverage` | ✅ | ⬜ pending |
| 21-01-xx | 01 | 1 | KUND-02 | unit | `npx jest tests/unit/test-progress-stepper.test.tsx -x --no-coverage` | ❌ W0 | ⬜ pending |
| 21-01-xx | 01 | 1 | KUND-02 | unit | `npx jest tests/unit/test-status-banner.test.tsx -x --no-coverage` | ❌ W0 | ⬜ pending |
| 21-02-xx | 02 | 1 | KUND-01 | unit | `npx jest tests/unit/test-kunden-timeline.test.tsx -x --no-coverage` | ❌ W0 | ⬜ pending |
| 21-02-xx | 02 | 1 | N8N-01 | unit | `npx jest tests/unit/test-n8n-webhook.test.ts -x --no-coverage` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-progress-stepper.test.tsx` — stubs for KUND-02 (stepper rendering, phase states, null handling, mini variant)
- [ ] `tests/unit/test-status-banner.test.tsx` — stubs for KUND-02 (banner variant selection, text from STATUS_CUSTOMER_TEXT, null return for normal statuses)
- [ ] `tests/unit/test-kunden-timeline.test.tsx` — stubs for KUND-01 (customer text rendering instead of internal labels)

*Existing `test-status-config.test.ts` already covers STAT-05. Existing `test-n8n-webhook.test.ts` already covers N8N-01 data layer.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Pulse animation on active stepper dot | KUND-02 | CSS animation not testable in JSDOM | Browser: check emerald dot pulses on active step |
| Mobile responsive stepper layout | KUND-02 | Viewport behavior requires real browser | Resize browser to <640px, verify stepper remains usable |
| N8N receives webhook and sends email | N8N-01 | Requires external N8N instance | Trigger status change, check N8N execution log |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
