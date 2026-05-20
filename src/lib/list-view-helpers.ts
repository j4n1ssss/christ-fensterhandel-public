/**
 * Helper functions for admin list view.
 *
 * Pure data module: no "use client", no React imports.
 * Provides attention-score computation, score coloring,
 * relative time formatting, smart default tab selection,
 * and "letzte Aktion" text generation.
 */

import { getWaitingDays } from "@/lib/detail-view-helpers";
import {
  STATUS_WEIGHT,
  STATUS_LABELS,
  type StatusKey,
} from "@/lib/status-config";

// --- Attention Score ---

export function getAttentionScore(
  lastStatusChangeAt: string | null,
  createdAt: string,
  status: string,
): number {
  const days = getWaitingDays(lastStatusChangeAt || createdAt);
  const weight = STATUS_WEIGHT[status as StatusKey] ?? 0;
  return days * weight;
}

export function getScoreColor(score: number): string {
  if (score <= 0) return "";
  if (score <= 5) return "#22c55e";
  if (score <= 15) return "#eab308";
  if (score <= 30) return "#f97316";
  return "#ef4444";
}

// --- Relative Time ---

export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "gerade eben";
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours}h`;
  if (diffDays === 1) return "vor 1 Tag";
  return `vor ${diffDays} Tagen`;
}

// --- Smart Default Tab ---

export function getSmartDefaultTab(tabCounts: Record<string, number>): string {
  if ((tabCounts.rueckfrage ?? 0) > 0) return "rueckfrage";
  if ((tabCounts.offen ?? 0) > 0) return "offen";
  return "alle";
}

// --- Letzte Aktion ---

export function getLetzeAktion(
  status: string,
  lastStatusChangeAt: string | null,
): string {
  const label = STATUS_LABELS[status as StatusKey] ?? status;
  if (!lastStatusChangeAt) return label;
  return `${label} ${formatRelativeTime(lastStatusChangeAt)}`;
}
