---
phase: 28
slug: angebots-workflow
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-01
---

# Phase 28 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + ts-jest (configured in jest.config.ts) |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest --testPathPattern=test-angebot --no-coverage` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=test-angebot --no-coverage`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 28-00-01 | 00 | 0 | ALL | scaffold | `npx jest --listTests 2>&1 \| grep -c test-angebot` | Wave 0 creates them | pending |
| 28-01-01 | 01 | 1 | ANG-01 | unit | `npx jest --testPathPattern=test-status-transitions --no-coverage` | exists | pending |
| 28-01-02 | 01 | 1 | ANG-01 | unit | `npx jest --testPathPattern=test-angebot-pricing --no-coverage` | Wave 0 | pending |
| 28-01-03 | 01 | 1 | ANG-01 | type | `npx tsc --noEmit --pretty` | N/A | pending |
| 28-01-04 | 01 | 1 | ANG-03 | unit | `npx jest --testPathPattern="test-angebot-(annehmen\|webhook)" --no-coverage` | Wave 0 | pending |
| 28-02-01 | 02 | 2 | ANG-02 | unit | `npx jest --testPathPattern=test-angebot-versioning --no-coverage` | Wave 0 | pending |
| 28-02-02 | 02 | 2 | ANG-01 | type+grep | `npx tsc --noEmit && grep -c "fetch.*api/angebot/erstellen" src/components/admin/angebots-modal.tsx` | N/A | pending |
| 28-03-01 | 03 | 2 | ANG-03 | type+grep | `npx tsc --noEmit && grep -c "agbLink" src/components/kunden/angebots-annahme.tsx` | N/A | pending |
| 28-03-02 | 03 | 2 | ANG-03 | type+grep | `npx tsc --noEmit && grep -c "getSettings" src/app/\(frontend\)/kunden/dashboard/\[id\]/page.tsx` | N/A | pending |
| 28-04-01 | 04 | 1 | ANG-05 | unit | `npx jest --testPathPattern="test-angebot-agb\|test-anfrage-schemas" --no-coverage` | Wave 0 + exists | pending |
| 28-04-02 | 04 | 1 | ANG-05 | type+grep | `npx tsc --noEmit && grep -c "unverbindlich" src/components/konfigurator/steps/step-zusammenfassung.tsx` | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements (Plan 28-00)

- [ ] `tests/unit/test-angebot-pricing.test.ts` — Brutto->Netto calculation, Rabatt logic, per-position pricing
- [ ] `tests/unit/test-angebot-versioning.test.ts` — Version number increment, latest version selection
- [ ] `tests/unit/test-angebot-annehmen.test.ts` — Validation (status check, expiry check, AGB required), Checkout Session creation
- [ ] `tests/unit/test-angebot-agb.test.ts` — AGB schema validation, timestamp recording
- [ ] `tests/unit/test-angebot-webhook-expiry.test.ts` — Webhook expiry reset logic (flow metadata detection)

All test files live in `tests/unit/` (per jest.config.ts roots, NOT src/lib/__tests__/).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Modal UI renders correctly with scrollable layout, sticky footer | ANG-01 | Visual/interaction testing | Open Anfrage detail -> click "Angebot erstellen" -> verify layout |
| PDF contains correct prices, Rabattzeile when applicable | ANG-01 | PDF visual inspection | Generate Angebot with custom price -> download PDF -> verify |
| Stripe Checkout redirect works after Annahme | ANG-03 | External service integration | Click "Angebot annehmen" -> verify Stripe redirect -> complete payment |
| Gast-Route /angebot/[anfrageId] accessible without login | ANG-03 | E2E browser test | Open URL without auth -> verify page renders correctly |
| Angebots-E-Mail arrives with correct link | ANG-01 | E-Mail delivery | Create Angebot -> check inbox -> verify link to /angebot/[anfrageId] |
| Auftragsbestaetigung E-Mail with product details | ANG-04 | E-Mail content | Complete payment -> verify email with product list and next steps |
| Webhook expiry resets status to angebot_versendet | ANG-03 | Requires Stripe test mode | Let checkout session expire -> verify anfrage status resets |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter
- [x] Test paths use tests/unit/ (per jest.config.ts)

**Approval:** pending execution
