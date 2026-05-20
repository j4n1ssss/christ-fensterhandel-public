---
phase: 18
slug: statuses-transitions-collection-felder
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.2 with ts-jest |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest --testPathPattern="status\|webhook" --no-coverage` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern="status|webhook" --no-coverage`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | STAT-03 | unit | `npx jest tests/unit/test-status-config.test.ts -x` | Exists -- needs update from 7 to 20 | ⬜ pending |
| 18-01-02 | 01 | 1 | STAT-04 | unit | `npx jest tests/unit/test-status-transitions.test.ts -x` | Exists -- needs expansion | ⬜ pending |
| 18-02-01 | 02 | 1 | FELD-01 | manual | TypeScript compile check (`npx tsc --noEmit`) | N/A | ⬜ pending |
| 18-02-02 | 02 | 1 | FELD-02 | unit | `npx jest tests/unit/test-stornierung-fields.test.ts -x` | Needs creation | ⬜ pending |
| 18-02-03 | 02 | 1 | STAT-06 | manual | Payload runtime required | N/A | ⬜ pending |
| 18-03-01 | 03 | 2 | FELD-03 | unit | `npx jest tests/unit/test-n8n-webhook.test.ts -x` | Exists -- needs update | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-status-config.test.ts` -- update assertions from 7 to 20 status keys, add new color/label/group/customer_text assertions
- [ ] `tests/unit/test-status-transitions.test.ts` -- expand transition tests for all 20 statuses + new branch transitions
- [ ] `tests/unit/test-n8n-webhook.test.ts` -- add assertions for customer_facing, kunden_text, kunden_phase fields on WebhookPayload

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| last_status_change_at auto-updates | STAT-06 | Requires running Payload with PostgreSQL | 1. Create anfrage in admin 2. Change status 3. Verify last_status_change_at timestamp updated |
| Hersteller fields visible from bezahlt | FELD-01 | UI conditional visibility | 1. Open anfrage with status bezahlt 2. Verify Hersteller collapsible group is visible 3. Check fields: bestellnummer, lieferdatum, notizen, antwort |
| Stornierung fields visible at storniert | FELD-02 | UI conditional visibility | 1. Open anfrage with status storniert 2. Verify Stornierung collapsible group visible 3. Check conditional required for rueckerstattung fields |
| PostgreSQL accepts new enum values | STAT-03 | Database migration | 1. Run `npx payload migrate` or rely on push:true 2. Verify no enum errors on startup 3. Check all 20 values accepted |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
