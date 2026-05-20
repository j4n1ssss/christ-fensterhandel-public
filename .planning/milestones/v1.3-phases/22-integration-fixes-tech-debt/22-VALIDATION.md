---
phase: 22
slug: integration-fixes-tech-debt
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (grep + file read) |
| **Config file** | none — no test framework needed for these fixes |
| **Quick run command** | `grep -n "formatCurrency" src/components/admin/anfragen/dashboard-overview.tsx` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run grep verification for affected file
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Full build must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 22-01-01 | 01 | 1 | STAT-02 | grep | `grep "from '@/lib/format-currency'" src/components/admin/anfragen/dashboard-overview.tsx` | ✅ | ⬜ pending |
| 22-01-02 | 01 | 1 | KUND-01 | grep | `grep "STATUS_CUSTOMER_TEXT" src/app/(frontend)/anfrage-verfolgen/gast-tracking-form.tsx` | ✅ | ⬜ pending |
| 22-01-03 | 01 | 1 | STAT-02 | grep | `grep "last_status_change_at\|stornpiertDatum" src/components/admin/anfragen/detail/split-button.tsx` | ✅ | ⬜ pending |
| 22-01-04 | 01 | 1 | STAT-02 | grep | `grep -c "link-standard-view" src/app/(payload)/custom.scss` | ✅ | ⬜ pending |
| 22-01-05 | 01 | 1 | STAT-02 | grep | `grep "HERSTELLER_STATUSES" src/components/admin/anfragen/detail/tab-panel.tsx \| grep import` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Badge text length in gast-tracking-form | KUND-01 | Visual check needed for pill badge overflow | Open /anfrage-verfolgen with storniert status, verify badge text fits |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
