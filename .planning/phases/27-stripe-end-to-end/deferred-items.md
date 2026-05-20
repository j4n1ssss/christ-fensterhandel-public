# Deferred Items - Phase 27

## Pre-existing Test Failures (Out of Scope)

3 pre-existing tests in `tests/unit/test-stripe-checkout.test.ts` fail due to CSRF token validation (requests in tests lack CSRF tokens). These failures existed before Phase 27 changes and are unrelated to the test stub scaffolding work.

**Failing tests:**
1. `rejects anfrage with status != bestaetigt` - Expected 400, got 403 (CSRF block)
2. `returns 401 if unauthenticated` - Expected 401, got 403 (CSRF block)
3. `returns checkout URL on success` - Expected 200, got 403 (CSRF block)

**Root cause:** CSRF middleware added in Phase 24 blocks test requests that don't include valid CSRF tokens. The checkout route tests were written before CSRF was added and were not updated.

**Fix needed:** Mock CSRF validation in `test-stripe-checkout.test.ts` or add CSRF token to test requests. Should be addressed in Plan 27-02 when checkout route is reimplemented.
