---
phase: 8
slug: migration-backfill
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.2.0 + ts-jest 29.4.6 |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest --testPathPattern=test-backfill-farben -x` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=test-backfill-farben -x`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | MIG-01 | unit | `npx jest --testPathPattern=test-backfill-farben -x` | -- Wave 0 | ⬜ pending |
| 08-01-02 | 01 | 1 | MIG-02 | unit | `npx jest --testPathPattern=test-backfill-farben -x` | -- Wave 0 | ⬜ pending |
| 08-01-03 | 01 | 1 | MIG-03 | unit | `npx jest --testPathPattern=test-backfill-farben -x` | -- Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-backfill-farben.test.ts` — stubs for MIG-01, MIG-02, MIG-03 (derivation logic + idempotency as pure functions)

*Note: Unit tests cover the pure derivation logic. Full Payload integration requires running database — verified manually.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Script runs end-to-end with real DB | MIG-01, MIG-03 | Requires Payload + PostgreSQL | Run `npm run migrate:farben -- --dry-run`, verify console output; then run without --dry-run, check Admin UI |
| Idempotent re-run produces no changes | MIG-02 | Requires DB state from first run | Run migration twice, verify second run shows all SKIPPED |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
