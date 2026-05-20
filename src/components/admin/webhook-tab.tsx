"use client";

import React, { useEffect, useState } from "react";
import { toast } from "@payloadcms/ui";
import { ChevronRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/list-view-helpers";

interface QueueEntry {
  id: string;
  event_type: string;
  to: string;
  subject: string;
  status: string;
  attempts: number;
  max_attempts: number;
  idempotency_key?: string;
  error_log?: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  sent: "#22c55e",
  failed: "#f97316",
  dead: "#ef4444",
  pending: "#3b82f6",
  processing: "#8b5cf6",
  skipped: "#6b7280",
};

export function WebhookTab({ anfrageId }: { anfrageId: string }) {
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchEntries = async () => {
    try {
      const res = await fetch(
        `/api/email_queue?where[anfrage][equals]=${anfrageId}&sort=-createdAt&limit=50`,
        { credentials: "include" },
      );
      if (res.ok) {
        const data = await res.json();
        setEntries(data.docs || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!anfrageId) return;
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anfrageId]);

  // Compute stats
  const stats = entries.reduce(
    (acc, entry) => {
      if (entry.status === "sent") acc.sent++;
      else if (entry.status === "failed") acc.failed++;
      else if (entry.status === "dead") acc.dead++;
      return acc;
    },
    { sent: 0, failed: 0, dead: 0 },
  );

  const handleRetry = async (entryId: string) => {
    setRetryingId(entryId);
    try {
      const res = await fetch(`/api/email_queue/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "pending",
          attempts: 0,
          next_retry_at: null,
          error_log: "",
        }),
      });
      if (res.ok) {
        toast.success("E-Mail wurde erneut in die Queue eingereiht");
        await fetchEntries();
      } else {
        toast.error("Fehler beim Wiederholen");
      }
    } catch {
      toast.error("Fehler beim Wiederholen");
    } finally {
      setRetryingId(null);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "16px",
          color: "var(--theme-elevation-500)",
          fontSize: "13px",
        }}
      >
        Lade E-Mail-Events...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="webhook-tab__empty">
        Keine E-Mail-Events für diese Anfrage.
      </div>
    );
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="webhook-tab__stats">
        <span
          className="webhook-tab__stats-badge"
          style={{ background: "#22c55e20", color: "#16a34a" }}
        >
          {stats.sent} gesendet
        </span>
        <span
          className="webhook-tab__stats-badge"
          style={{ background: "#f9731620", color: "#ea580c" }}
        >
          {stats.failed} fehlgeschlagen
        </span>
        <span
          className="webhook-tab__stats-badge"
          style={{ background: "#ef444420", color: "#dc2626" }}
        >
          {stats.dead} abgebrochen
        </span>
      </div>

      {/* Queue entry rows */}
      {entries.map((entry) => {
        const isExpanded = expandedId === entry.id;
        const isRetrying = retryingId === entry.id;
        const statusColor = STATUS_COLORS[entry.status] || "#6b7280";

        return (
          <div key={entry.id}>
            {/* Collapsed row */}
            <div
              className="webhook-tab__row"
              onClick={() => setExpandedId(isExpanded ? null : entry.id)}
            >
              <ChevronRight
                size={12}
                style={{
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "13px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "200px",
                }}
              >
                {entry.event_type}
              </span>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#fff",
                  background: statusColor,
                  whiteSpace: "nowrap",
                }}
              >
                {entry.status}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--theme-elevation-500)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatRelativeTime(entry.createdAt)}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--theme-elevation-600)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginLeft: "auto",
                }}
              >
                {entry.to}
              </span>
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="webhook-tab__detail">
                <div className="webhook-tab__detail-row">
                  <span className="webhook-tab__detail-label">Betreff:</span>
                  <span className="webhook-tab__detail-value">
                    {entry.subject}
                  </span>
                </div>
                <div className="webhook-tab__detail-row">
                  <span className="webhook-tab__detail-label">Empfaenger:</span>
                  <span className="webhook-tab__detail-value">{entry.to}</span>
                </div>
                <div className="webhook-tab__detail-row">
                  <span className="webhook-tab__detail-label">Versuche:</span>
                  <span className="webhook-tab__detail-value">
                    {entry.attempts}/{entry.max_attempts}
                  </span>
                </div>
                {entry.idempotency_key && (
                  <div className="webhook-tab__detail-row">
                    <span className="webhook-tab__detail-label">
                      Idempotency-Key:
                    </span>
                    <span
                      className="webhook-tab__detail-value"
                      style={{
                        fontFamily: "monospace",
                        fontSize: "11px",
                        maxWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.idempotency_key}
                    </span>
                  </div>
                )}

                {/* Error log */}
                {entry.error_log && (
                  <div className="webhook-tab__error-log">
                    {entry.error_log}
                  </div>
                )}

                {/* Retry button */}
                {(entry.status === "failed" || entry.status === "dead") && (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetry(entry.id);
                    }}
                    disabled={isRetrying}
                    style={{
                      marginTop: "8px",
                      opacity: isRetrying ? 0.6 : 1,
                    }}
                  >
                    {isRetrying ? "Wird wiederholt..." : "Erneut versuchen"}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
