---
phase: 03-kauffluss
plan: 01
subsystem: ui
tags: [zustand, cart, react, localstorage, tailwindcss, lucide]

requires:
  - phase: 02-konfigurator-pipeline
    provides: "KonfiguratorSelections, WindowSVG, calculatePreviewPrice, Zustand persist pattern"
provides:
  - "useCartStore: Zustand cart store with persist (addItem, removeItem, updateQuantity, updateItem, getSubtotal, clearCart, editingCartItemId, discount)"
  - "CartItem, ResolvedNames, DiscountResult types"
  - "formatEUR and calculateMwSt helpers"
  - "/warenkorb page with product list and summary sidebar"
  - "Navigation header with CartBadge on all frontend pages"
  - "Step 10 'In den Warenkorb' button fully wired (add/edit mode)"
affects: [03-kauffluss, 04-auth-dashboard]

tech-stack:
  added: []
  patterns: ["Cart store with Zustand persist + skipHydration (same as konfigurator)", "Hydration guard via useState(false) + useEffect for client-only rendering", "Inline delete confirmation without AlertDialog dependency"]

key-files:
  created:
    - src/lib/cart/types.ts
    - src/lib/cart/store.ts
    - src/lib/cart/format.ts
    - src/components/cart/cart-badge.tsx
    - src/components/cart/cart-empty.tsx
    - src/components/cart/cart-item-card.tsx
    - src/components/cart/cart-summary.tsx
    - src/app/(frontend)/warenkorb/page.tsx
    - tests/unit/test-cart-store.test.ts
  modified:
    - src/app/(frontend)/layout.tsx
    - src/components/konfigurator/steps/step-zusammenfassung.tsx

key-decisions:
  - "Separate cart Zustand store rather than extending konfigurator store"
  - "Inline delete confirmation (button state toggle) instead of adding shadcn AlertDialog dependency"
  - "Edit mode uses setSelection per field + completeStep(1-9) for full konfigurator access"

patterns-established:
  - "Cart store key 'christ-warenkorb' with skipHydration:true, same persist pattern as konfigurator"
  - "CartBadge hydration guard: useState(false) + useEffect(setMounted(true)) to avoid SSR mismatch"
  - "ResolvedNames interface for human-readable display of CMS UUID selections"

requirements-completed: [CART-01, CART-02, CART-03, CART-04, CART-05, CART-06]

duration: 6min
completed: 2026-03-09
---

# Phase 3 Plan 01: Warenkorb Store + Cart Page Summary

**Zustand cart store with LocalStorage persist, /warenkorb page with mini-SVG product cards, quantity controls, edit/delete actions, MwSt summary, and navigation badge -- Step 10 button fully wired**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-09T19:22:00Z
- **Completed:** 2026-03-09T19:28:00Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Cart store with full CRUD (add, remove, update, quantity, subtotal, clear, edit mode, discount)
- /warenkorb page with product list (mini WindowSVG, collapsible details, +/- quantity, edit/delete) and sticky summary sidebar (netto, MwSt 19%, brutto, discount display)
- Navigation header with CartBadge item count on all frontend pages
- Step 10 "In den Warenkorb" button creates CartItem from konfigurator selections, handles edit mode, resets konfigurator
- 16 unit tests for cart store and format helpers, all passing (82 total tests)

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Cart store failing tests** - `82c3df0` (test)
2. **Task 1 GREEN: Cart store + format helpers implementation** - `919cbbb` (feat)
3. **Task 2: Cart page UI + navigation + konfigurator integration** - `f077020` (feat)

_TDD task had RED and GREEN commits_

## Files Created/Modified
- `src/lib/cart/types.ts` - CartItem, ResolvedNames, DiscountResult interfaces
- `src/lib/cart/store.ts` - Zustand cart store with persist middleware
- `src/lib/cart/format.ts` - formatEUR and calculateMwSt helpers
- `src/components/cart/cart-badge.tsx` - Navigation cart icon with item count badge
- `src/components/cart/cart-empty.tsx` - Empty cart state with CTA
- `src/components/cart/cart-item-card.tsx` - Product card with mini-SVG, details, controls
- `src/components/cart/cart-summary.tsx` - Price summary with MwSt and discount display
- `src/app/(frontend)/warenkorb/page.tsx` - Cart page with product list and summary
- `src/app/(frontend)/layout.tsx` - Added navigation header with CartBadge
- `src/components/konfigurator/steps/step-zusammenfassung.tsx` - Wired "In den Warenkorb" button
- `tests/unit/test-cart-store.test.ts` - 16 unit tests for store + format helpers

## Decisions Made
- Separate cart Zustand store (`christ-warenkorb`) rather than extending the konfigurator store -- cleaner separation of concerns, independent lifecycle
- Inline delete confirmation (button state toggle) instead of adding shadcn AlertDialog dependency -- avoids new dependency for simple UX
- Edit mode injects all selections into konfigurator store via setSelection + marks steps 1-9 complete for full navigation access

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test assertion for Intl.NumberFormat output**
- **Found during:** Task 1 GREEN (format helper tests)
- **Issue:** Test expected "EUR" text but Intl.NumberFormat de-DE outputs Euro symbol instead
- **Fix:** Changed test to accept both "EUR" and Euro symbol via regex
- **Files modified:** tests/unit/test-cart-store.test.ts
- **Verification:** All 16 tests pass
- **Committed in:** 919cbbb (Task 1 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 bug in test)
**Impact on plan:** Minor test adjustment. No scope creep.

## Issues Encountered
- Pre-existing `next build` failure (useSearchParams without Suspense boundary in /konfigurator/fenster page from Phase 2) -- logged to deferred-items.md, TypeScript compilation passes clean
- jest 30 uses `--bail` not `-x` flag (different from plan verification command)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Cart store and page fully functional, ready for Plan 03-02 (API routes, discount, Anfrage submission)
- /anfrage route link in CartSummary ready for next plan
- Discount display UI ready (setDiscount/clearDiscount in store, visual in CartSummary)

---
*Phase: 03-kauffluss*
*Completed: 2026-03-09*
