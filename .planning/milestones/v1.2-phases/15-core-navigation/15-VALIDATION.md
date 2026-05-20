---
phase: 15
slug: core-navigation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.2.0 + ts-jest 29.4.6 |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest --testPathPattern=custom-nav --no-coverage` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=custom-nav --no-coverage`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 0 | NAV-01..08, UX-01, INT-01, INT-02 | unit | `npx jest tests/unit/test-custom-nav.test.tsx --no-coverage -x` | ❌ W0 | ⬜ pending |
| 15-02-01 | 02 | 1 | NAV-01 | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "direct links" -x` | ❌ W0 | ⬜ pending |
| 15-02-02 | 02 | 1 | NAV-02..05 | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "dropdown" -x` | ❌ W0 | ⬜ pending |
| 15-02-03 | 02 | 1 | NAV-06 | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "subgroup headings" -x` | ❌ W0 | ⬜ pending |
| 15-02-04 | 02 | 1 | NAV-07 | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "no emojis" -x` | ❌ W0 | ⬜ pending |
| 15-02-05 | 02 | 1 | NAV-08 | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "nav order" -x` | ❌ W0 | ⬜ pending |
| 15-02-06 | 02 | 1 | UX-01 | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "active link" -x` | ❌ W0 | ⬜ pending |
| 15-02-07 | 02 | 1 | INT-01 | unit | `npx jest tests/unit/test-webhook-badge.test.tsx -x` | ❌ W0 | ⬜ pending |
| 15-02-08 | 02 | 1 | INT-02 | unit | `npx jest tests/unit/test-nav-config.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/test-custom-nav.test.tsx` — stubs for NAV-01 through NAV-08, UX-01
- [ ] `tests/unit/test-webhook-badge.test.tsx` — stubs for INT-01 (client-side badge fetch)
- [ ] `tests/unit/test-nav-config.test.ts` — stubs for INT-02 (config registration)
- [ ] Test mocks for `@payloadcms/ui` hooks (`useConfig`, `useAuth`, `useNav`)
- [ ] Test mock for `next/navigation` (`usePathname`)
- [ ] Test mock for `fetch` (webhook errors API)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual appearance of active accent bar | UX-01 | CSS rendering cannot be asserted in jsdom | Open `/admin`, click each nav item, verify left accent bar + background color visible |
| Sidebar toggle (hamburger) works | N/A | Payload's NavToggler CSS interaction | Open `/admin` on narrow viewport, click hamburger, verify sidebar toggles |
| Collection list tables not broken by Tailwind | Pitfall 4 | CSS collision only visible in real browser | Navigate to each collection list page, verify table renders correctly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
