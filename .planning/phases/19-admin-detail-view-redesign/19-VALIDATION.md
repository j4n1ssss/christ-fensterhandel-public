---
phase: 19
slug: admin-detail-view-redesign
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual browser verification (Admin Panel UI) |
| **Config file** | none — no automated test framework for Payload Admin custom views |
| **Quick run command** | `pnpm build` (compile check) |
| **Full suite command** | `pnpm build && pnpm lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm build`
- **After every plan wave:** Run `pnpm build && pnpm lint`
- **Before `/gsd:verify-work`:** Full build must be green + manual browser walkthrough
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | ADMN-01 | build | `pnpm build` | N/A | ⬜ pending |
| 19-01-02 | 01 | 1 | ADMN-01 | build | `pnpm build` | N/A | ⬜ pending |
| 19-02-01 | 02 | 1 | ADMN-02, ADMN-03 | build+manual | `pnpm build` | N/A | ⬜ pending |
| 19-02-02 | 02 | 1 | ADMN-04 | build+manual | `pnpm build` | N/A | ⬜ pending |
| 19-02-03 | 02 | 1 | ADMN-05, ADMN-06 | build+manual | `pnpm build` | N/A | ⬜ pending |
| 19-03-01 | 03 | 2 | ADMN-10 | build+manual | `pnpm build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test framework needed.

This phase is entirely UI-focused within Payload Admin Panel custom views. TypeScript compilation (`pnpm build`) serves as the primary automated verification. Visual correctness requires manual browser verification.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Attention Bar displays correct urgency colors | ADMN-02 | Visual styling verification | Open anfrage with >3 days wait, verify orange left border and badge text |
| Splitbutton shows correct primary action per status | ADMN-03 | Status-dependent UI behavior | Change anfrage to each status, verify splitbutton label matches QUICK_ACTIONS |
| Comment panel expands for COMMENT_REQUIRED statuses | ADMN-03 | Interactive flow | Click "Rueckfrage senden", verify textarea appears inline |
| Stornierung confirm dialog fires before panel | ADMN-03 | window.confirm interaction | Click "Anfrage stornieren", verify confirm dialog appears first |
| Two-column layout 60/40 split | ADMN-04 | Visual layout verification | Open detail view, verify product cards left (60%), tabs right (40%) |
| Quantity badge only shows for stueckzahl > 1 | ADMN-05 | Conditional rendering | Create anfrage with stueckzahl=1 and stueckzahl=3, verify badge presence |
| Tab persistence via sessionStorage | ADMN-06 | Browser storage interaction | Switch to "Timeline" tab, reload page, verify "Timeline" is still active |
| Details tab hidden at early statuses | ADMN-06 | Status-conditional tab visibility | View anfrage at status "neu", verify only 3 tabs shown |
| Dark/light theme compatibility | ADMN-01 | Visual theme switch | Toggle Payload theme, verify all CSS variables resolve correctly |
| Terminal status info text (no splitbutton) | ADMN-03 | Status-dependent rendering | Set anfrage to "storniert", verify no splitbutton, gray info text shown |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
