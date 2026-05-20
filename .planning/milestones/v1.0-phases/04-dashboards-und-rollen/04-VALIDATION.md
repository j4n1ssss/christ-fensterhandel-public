---
phase: 4
slug: dashboards-und-rollen
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.2.0 + ts-jest |
| **Config file** | `jest.config.ts` (exists) |
| **Quick run command** | `npx jest --testPathPattern="tests/unit" --no-coverage -x` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern="tests/unit" --no-coverage -x`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | SEC-01 | unit | `npx jest tests/unit/test-access-control.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | SEC-02 | unit | `npx jest tests/unit/test-access-control.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | SEC-03 | unit | `npx jest tests/unit/test-access-control.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 1 | ADMIN-04 | unit | `npx jest tests/unit/test-status-transitions.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-05 | 01 | 1 | ADMIN-05 | unit | `npx jest tests/unit/test-status-transitions.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-06 | 01 | 1 | ADMIN-06 | unit | `npx jest tests/unit/test-access-control.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-07 | 01 | 1 | KUND-03 | unit | `npx jest tests/unit/test-access-control.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | ADMIN-01 | manual | Visual verification in Admin Panel | N/A | ⬜ pending |
| 04-02-02 | 02 | 2 | ADMIN-02 | manual | Visual verification in Admin Panel | N/A | ⬜ pending |
| 04-02-03 | 02 | 2 | ADMIN-03 | manual | Visual verification in Admin Panel | N/A | ⬜ pending |
| 04-03-01 | 03 | 2 | KUND-01 | manual | Browser test: /kunden/login + /kunden/register | N/A | ⬜ pending |
| 04-03-02 | 03 | 2 | KUND-02 | manual | Browser test: /kunden/dashboard without login | N/A | ⬜ pending |
| 04-03-03 | 03 | 2 | KUND-04 | manual | Visual verification of Status-Timeline | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-access-control.test.ts` — stubs for SEC-01, SEC-02, SEC-03, ADMIN-06, KUND-03
- [ ] `tests/unit/test-status-transitions.test.ts` — stubs for ADMIN-04, ADMIN-05

*Existing `jest.config.ts` covers framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Anfragen list with filters | ADMIN-01 | Payload Admin UI rendering | Open Admin Panel > Anfragen > verify filters for Status, Datum, Kategorie |
| Search by name/email/nr | ADMIN-02 | Payload Admin search UI | Type name/email/nr in Admin Panel search bar |
| Detail view shows config data | ADMIN-03 | Custom admin component rendering | Open Anfrage detail > verify all fields visible |
| Login/Register works | KUND-01 | Browser auth flow with cookies | Visit /kunden/register, create account, login |
| Protected route redirects | KUND-02 | Browser redirect behavior | Visit /kunden/dashboard without login > verify redirect to /kunden/login |
| Status-Timeline renders | KUND-04 | Visual component rendering | Login as Kunde > open Anfrage > verify timeline |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
