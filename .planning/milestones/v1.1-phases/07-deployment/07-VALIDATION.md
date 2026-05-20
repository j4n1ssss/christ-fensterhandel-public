---
phase: 7
slug: deployment
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Payload CMS schema validation + API tests via curl/httpie |
| **Config file** | `src/payload.config.ts` (collection registration) |
| **Quick run command** | `npm run generate:types && npx tsc --noEmit` |
| **Full suite command** | `npm run generate:importmap && npm run generate:types && npx tsc --noEmit` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run generate:types && npx tsc --noEmit`
- **After every plan wave:** Run `npm run generate:importmap && npm run generate:types && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | HUB-01 | schema | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 07-01-02 | 01 | 1 | HUB-02 | schema | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 07-01-03 | 01 | 1 | HUB-03 | api | `curl API + grep maxDepth` | ✅ | ⬜ pending |
| 07-01-04 | 01 | 1 | HUB-04 | schema | `grep "material" src/collections/produkte/profile.ts` | ✅ | ⬜ pending |
| 07-02-01 | 02 | 1 | HIST-01 | schema | `npx tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.* TypeScript compiler and Payload type generation are already configured.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin sieht Tabs "Kombinationen" / "Ausstattung" | HUB-01 | UI rendering requires browser | Open /admin/collections/profile/[id], verify two tabs visible below existing fields |
| filterOptions zeigt nur aktive Eintraege | HUB-02 | Relationship dropdown requires browser | In Profile edit, click any erlaubte_* field, verify inactive items not shown |
| allowCreate button sichtbar | HUB-02 | Admin UI feature | In Profile edit, verify "Create new" button appears on relationship fields |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
