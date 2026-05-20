# Deferred Items - Phase 03

## Pre-existing Build Issue

- **Issue:** `useSearchParams()` in `/konfigurator/fenster` page needs Suspense boundary wrapper
- **Origin:** Phase 02 (konfigurator pipeline)
- **Impact:** `next build` fails at static generation phase
- **Fix:** Wrap the konfigurator fenster page component in `<Suspense>` boundary
- **Not fixed here:** Out of scope for Phase 03 (pre-existing, not caused by cart changes)
