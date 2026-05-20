---
phase: 14
slug: integration-polish-bookkeeping
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest / manual grep |
| **Config file** | vitest.config.ts |
| **Quick run command** | `grep -c "Vollständig" src/components/admin/profile-hub-status-cell.tsx` |
| **Full suite command** | `pnpm exec vitest run --reporter verbose 2>&1 | tail -20` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick grep verification
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 14-01-01 | 01 | 1 | INT-COSMETIC-01 | grep | `grep "Vollständig" src/components/admin/profile-hub-status-cell.tsx` | ✅ | ⬜ pending |
| 14-01-02 | 01 | 1 | INT-CREDENTIALS-01 | grep | `grep 'credentials.*include' src/components/admin/profile-last-editor.tsx` | ✅ | ⬜ pending |
| 14-01-03 | 01 | 1 | ROADMAP-BOOKKEEPING | grep | `grep -c '\[x\]' .planning/ROADMAP.md` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — only grep-based verification needed.*

---

## Manual-Only Verifications

*All phase behaviors have automated verification via grep.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
