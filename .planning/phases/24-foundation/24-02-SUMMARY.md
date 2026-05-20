---
phase: 24-foundation
plan: 02
subsystem: finance-infrastructure
tags: [tax, cent-arithmetic, nummernkreise, formatCents, unit-tests]
dependency_graph:
  requires: [24-01]
  provides: [tax-library, format-cents, nummernkreise-collection, nummernkreise-helper]
  affects: [PDF-generation, Stripe-integration, Angebote, Rechnungen]
tech_stack:
  added: []
  patterns: [cent-integer-arithmetic, atomic-counter-with-transaction, pure-functions]
key_files:
  created:
    - src/lib/tax.ts
    - src/collections/system/nummernkreise.ts
    - src/lib/nummernkreise.ts
    - tests/unit/test-tax.test.ts
    - tests/unit/test-format-cents.test.ts
    - tests/unit/test-nummernkreise.test.ts
  modified:
    - src/lib/format-currency.ts
    - src/payload.config.ts
decisions:
  - "Test expectation fix: calcNetFromGross(999,19) yields 839 not 840 (Math.round rounds 839.495 down)"
  - "Type assertions (as any) on nummernkreise collection slug until payload-types.ts is regenerated"
  - "Null-guard on transactionID before commit/rollback (Payload types allow null return)"
metrics:
  duration: 6m 27s
  completed: 2026-03-28
---

# Phase 24 Plan 02: Tax Library, formatCents, Nummernkreise Summary

Cent-integer tax calculation library with 4 pure functions, formatCents display helper for German locale, and atomic Nummernkreise counter collection with getNextNumber helper using Payload transactions and retry logic.

## What Was Built

### 1. src/lib/tax.ts -- Cent-Integer Tax Arithmetic
- `calcGrossFromNet(netCents, ratePercent)` -- net to gross with tax
- `calcNetFromGross(grossCents, ratePercent)` -- gross to net extraction
- `calcTax(netCents, ratePercent)` -- tax amount from net
- `splitLine(unitCents, qty, ratePercent)` -- line item split into net/tax/gross
- Zero dependencies, no imports, no OOP, only Math.round for rounding

### 2. src/lib/format-currency.ts -- formatCents Extension
- Added `formatCents(cents, currency?)` below existing functions
- Uses Intl.NumberFormat with German locale (de-DE)
- Default currency EUR, configurable via parameter
- Existing `formatCurrency` and `formatPrice` unchanged (backward compatible)

### 3. src/collections/system/nummernkreise.ts -- Counter Collection
- Payload collection with slug 'nummernkreise', group 'System'
- Fields: typ (select: ANG/RE/GS), jahr (number), letzte_nummer (number, default 0), prefix (text)
- Admin-only access, delete permanently denied
- Registered in payload.config.ts under System collections

### 4. src/lib/nummernkreise.ts -- Atomic Counter Helper
- `getNextNumber(typ)` -- produces ANG-YYYY-NNNN / RE-YYYY-NNNN / GS-YYYY-NNNN
- Uses Payload transaction (beginTransaction/commitTransaction/rollbackTransaction)
- Retry loop: up to 3 attempts for serialization conflicts
- Auto-creates counter row on first use per typ+year combination
- 4-digit zero padding via padStart

## Test Coverage

| Test File | Cases | Status |
|-----------|-------|--------|
| test-tax.test.ts | 10 | PASS |
| test-format-cents.test.ts | 8 | PASS |
| test-nummernkreise.test.ts | 6 | PASS |
| **Total** | **24** | **ALL PASS** |

## Commits

| # | Hash | Message |
|---|------|---------|
| 1 | 43b4b7d | test(24-02): add failing tests for tax.ts and formatCents |
| 2 | 794b36c | feat(24-02): implement tax.ts cent-integer arithmetic and formatCents helper |
| 3 | 803408d | feat(24-02): add Nummernkreise collection and getNextNumber atomic helper |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test expectation for calcNetFromGross(999, 19)**
- **Found during:** Task 1 (GREEN phase)
- **Issue:** Plan specified result should be 840, but Math.round(839.4957) = 839 (rounds down at .49)
- **Fix:** Updated test expectation from 840 to 839 -- the implementation is mathematically correct
- **Files modified:** tests/unit/test-tax.test.ts

**2. [Rule 3 - Blocking] Fixed TypeScript errors in nummernkreise.ts**
- **Found during:** Task 2 (tsc --noEmit verification)
- **Issue:** payload-types.ts not yet regenerated, so 'nummernkreise' slug not in type union; also transactionID can be null
- **Fix:** Added `as any` type assertions on collection slug and data params; added null-guard on transactionID before commit/rollback
- **Files modified:** src/lib/nummernkreise.ts

## Self-Check: PASSED

All 7 files found. All 3 commits verified.
