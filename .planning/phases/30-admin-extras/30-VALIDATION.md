---
phase: 30
slug: admin-extras
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-03
---

# Phase 30 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (already configured) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 30-00-01 | 00 | 0 | ALL | scaffold | `npx vitest run --reporter=verbose` | Created by W0 | pending |
| 30-01-01 | 01 | 1 | ADMN-03 | integration | `npx vitest run tests/unit/test-freitext-template.test.ts` | W0 stub | pending |
| 30-01-02 | 01 | 1 | ADMN-03 | unit | `npx vitest run tests/unit/test-email-queue.test.ts` | Existing | pending |
| 30-01-03 | 01 | 1 | ADMN-03 | unit | `grep + file exists` | N/A | pending |
| 30-01-04 | 01 | 1 | ADMN-03 | unit | `npx vitest run tests/unit/test-send-email.test.ts` | W0 stub | pending |
| 30-02-01 | 02 | 2 | ADMN-01 | manual | browser check | N/A | pending |
| 30-02-02 | 02 | 2 | ADMN-01, ADMN-02 | manual | browser check | N/A | pending |
| 30-03-01 | 03 | 1 | ADMN-04 | integration | `npx vitest run tests/unit/test-anfragen-list-api.test.ts` | W0 stub | pending |
| 30-03-02 | 03 | 1 | ADMN-04 | manual | browser check | N/A | pending |

*Status: pending . green . red . flaky*

---

## Wave 0 Requirements

Plan 30-00 creates the following test stubs before any Wave 1 execution:

- [x] `tests/unit/test-freitext-template.test.ts` -- covers ADMN-02 FreitextEmail template rendering
- [x] `tests/unit/test-send-email.test.ts` -- covers ADMN-02 send route validation + queue creation
- [x] `tests/unit/test-email-preview-manual.test.ts` -- covers ADMN-02 preview route rendering
- [x] `tests/unit/test-anfragen-list-api.test.ts` -- covers ADMN-04 pagination logic + tab counts
- [x] `tests/unit/test-dashboard-stats-api.test.ts` -- covers ADMN-04 dashboard stats aggregation

*Note: Phase 30 is primarily UI integration work (Payload Admin custom views). Automated tests cover API routes and templates; UI behavior verified manually.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Webhook-Tab displays chronological list | ADMN-01 | Payload Admin custom component rendering | Open Anfrage detail -> click Webhooks tab -> verify list |
| Retry button re-queues webhook | ADMN-01 | Requires n8n endpoint | Click retry on failed webhook -> verify re-queue |
| Manual email send form | ADMN-02 | Payload Admin custom component | Open Anfrage -> click Email senden -> fill form -> verify queue entry |
| StatusHistorie logs email_gesendet | ADMN-02 | Requires UI + API interaction | Send email -> check StatusHistorie tab for entry |
| Anfragen-Liste pagination | ADMN-04 | Requires test data + browser | Load list -> verify offset pagination controls + page numbers |
| Dashboard 5th Dringend card | ADMN-04 | Visual verification | Open Dashboard -> verify 5 stat cards including Dringend |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
