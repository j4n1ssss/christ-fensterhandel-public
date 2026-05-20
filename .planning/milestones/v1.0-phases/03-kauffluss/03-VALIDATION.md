---
phase: 3
slug: kauffluss
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.2.0 + ts-jest 29.4.6 |
| **Config file** | jest.config.ts (exists) |
| **Quick run command** | `npx jest --testPathPattern=tests/unit -x` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=tests/unit -x`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | CART-01 | unit | `npx jest tests/unit/test-cart-store.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | CART-02 | unit | `npx jest tests/unit/test-cart-store.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | CART-03 | unit | `npx jest tests/unit/test-cart-store.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | CART-04 | unit | `npx jest tests/unit/test-cart-store.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-01-05 | 01 | 1 | CART-05 | manual | Manual: complete configurator with items in cart | N/A | ⬜ pending |
| 03-01-06 | 01 | 1 | CART-06 | unit | `npx jest tests/unit/test-cart-store.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | PREIS-01 | unit | `npx jest tests/unit/test-price-calculator.test.ts -x` | ✅ | ⬜ pending |
| 03-02-02 | 02 | 1 | PREIS-02 | unit | `npx jest tests/unit/test-server-price.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 1 | PREIS-03 | unit | `npx jest tests/unit/test-server-price.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-02-04 | 02 | 1 | PREIS-04 | unit | `npx jest tests/unit/test-discount-validation.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-02-05 | 02 | 1 | PREIS-05 | unit | `npx jest tests/unit/test-snapshot.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | SEND-01 | manual | Manual: visual check of contact form fields | N/A | ⬜ pending |
| 03-03-02 | 03 | 2 | SEND-02 | unit | `npx jest tests/unit/test-anfrage-schemas.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-03-03 | 03 | 2 | SEND-03 | unit | `npx jest tests/unit/test-anfrage-nummer.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-03-04 | 03 | 2 | SEND-04 | manual | Manual: submit flow end-to-end, verify redirect | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-cart-store.test.ts` — stubs for CART-01, CART-02, CART-03, CART-04, CART-06
- [ ] `tests/unit/test-server-price.test.ts` — stubs for PREIS-02, PREIS-03
- [ ] `tests/unit/test-discount-validation.test.ts` — stubs for PREIS-04
- [ ] `tests/unit/test-snapshot.test.ts` — stubs for PREIS-05
- [ ] `tests/unit/test-anfrage-schemas.test.ts` — stubs for SEND-02
- [ ] `tests/unit/test-anfrage-nummer.test.ts` — stubs for SEND-03

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| New konfigurator run adds to existing cart | CART-05 | Requires full configurator UI interaction | 1. Add item to cart 2. Go back to configurator 3. Configure new product 4. Add to cart 5. Verify both items appear |
| Contact form renders all fields | SEND-01 | Visual UI verification | 1. Navigate to /anfrage 2. Verify all fields: Vorname, Nachname, E-Mail, Telefon, Adresse, PLZ, Ort, Nachricht, Datenschutz-Checkbox |
| Redirect to danke page with anfrage nummer | SEND-04 | End-to-end browser flow | 1. Complete full flow 2. Verify redirect to /anfrage/danke 3. Verify Anfrage-Nummer displayed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
