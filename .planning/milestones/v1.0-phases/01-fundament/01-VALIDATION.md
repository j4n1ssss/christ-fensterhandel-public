---
phase: 1
slug: fundament
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No test framework in Phase 1 (data model only, no business logic) |
| **Config file** | none — Wave 0 covers smoke checks |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit && npx payload run src/seed/index.ts` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npx payload run src/seed/index.ts`
- **Before `/gsd:verify-work`:** Full suite must be green + manual admin panel check
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | SETUP-01 | smoke | `npm run dev` (starts without error) | n/a | ⬜ pending |
| 01-01-02 | 01 | 1 | SETUP-02 | smoke | Check tailwind.config.ts exists | n/a | ⬜ pending |
| 01-01-03 | 01 | 1 | SETUP-03 | smoke | `npx tsc --noEmit` | n/a | ⬜ pending |
| 01-02-01 | 02 | 2 | CMS-01..CMS-07 | manual | Admin panel: collections visible | n/a | ⬜ pending |
| 01-03-01 | 03 | 2 | CMS-08..CMS-15 | manual | Admin panel: collections visible | n/a | ⬜ pending |
| 01-04-01 | 04 | 3 | CMS-16 | manual | Admin panel: conditional filtering | n/a | ⬜ pending |
| 01-04-02 | 04 | 3 | CMS-17 | smoke | `npx payload run src/seed/index.ts` exits 0 | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] TypeScript strict mode configured — `npx tsc --noEmit` passes
- [ ] Dev server starts — `npm run dev` shows Payload admin

*No test framework needed for Phase 1 — data model only, validated via admin panel + seed script.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Collections visible in admin | CMS-01..CMS-15 | Admin UI visual check | Open /admin, verify all 17+ collections in sidebar grouped into 4 categories |
| Fields editable | CMS-01..CMS-15 | Admin UI interaction | Create/edit an entry in each collection, verify all fields render correctly |
| Relationships navigable | CMS-01..CMS-15 | Admin UI interaction | Click relationship links, verify navigation between related collections |
| Conditional filtering | CMS-16 | Admin UI interaction | Select Material "Kunststoff", verify Profile dropdown shows only matching profiles |
| Seed data present | CMS-17 | Admin UI visual check | After seed script, verify data in admin: 4 profiles, 10+ colors, 4 glazings |
| Anfragen status workflow | CMS-17 | Admin UI interaction | Create Anfrage, verify status field and status_historie array |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
