"use client";

import React, { useState } from "react";
import { getNextStatuses, COMMENT_REQUIRED } from "@/lib/status-transitions";
import { getStatusColor, getStatusLabel } from "@/lib/status-config";

interface StatusWorkflowProps {
  anfrageId: string;
  currentStatus: string;
  onStatusChanged?: () => void;
  version?: number;
}

export function StatusWorkflow({
  anfrageId,
  currentStatus,
  onStatusChanged,
  version,
}: StatusWorkflowProps) {
  const [showCommentFor, setShowCommentFor] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStatuses = getNextStatuses(currentStatus);

  const handleStatusClick = (targetStatus: string) => {
    setError(null);
    if (COMMENT_REQUIRED.includes(targetStatus)) {
      setShowCommentFor(targetStatus);
      setComment("");
    } else {
      submitStatusChange(targetStatus, "");
    }
  };

  const submitStatusChange = async (
    targetStatus: string,
    statusComment: string,
  ) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/anfragen/${anfrageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: targetStatus,
          _status_kommentar: statusComment || undefined,
          version,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg =
          (data.errors && data.errors[0]?.message) ||
          data.message ||
          "Fehler beim Statuswechsel";
        setError(errMsg);
        return;
      }

      setShowCommentFor(null);
      setComment("");
      if (onStatusChanged) {
        onStatusChanged();
      } else {
        window.location.reload();
      }
    } catch {
      setError("Netzwerkfehler beim Statuswechsel");
    } finally {
      setSaving(false);
    }
  };

  if (nextStatuses.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 500,
          marginBottom: "8px",
          color: "var(--theme-elevation-500)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Status ändern
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {nextStatuses.map((status) => {
          const color = getStatusColor(status);
          return (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusClick(status)}
              disabled={saving}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: `1px solid ${color}60`,
                background: `${color}12`,
                color,
                fontSize: "13px",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1,
                transition: "all 0.15s",
              }}
            >
              &rarr; {getStatusLabel(status)}
            </button>
          );
        })}
      </div>

      {error && (
        <div
          style={{
            marginTop: "8px",
            padding: "8px 12px",
            borderRadius: "4px",
            background: "#ef444418",
            color: "#ef4444",
            fontSize: "12px",
          }}
        >
          {error}
        </div>
      )}

      {/* Comment Modal (inline) */}
      {showCommentFor && (
        <div
          style={{
            marginTop: "12px",
            padding: "16px",
            border: `1px solid ${getStatusColor(showCommentFor)}40`,
            borderRadius: "8px",
            background: "var(--theme-elevation-50)",
          }}
        >
          <div
            style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}
          >
            Kommentar für &quot;
            {getStatusLabel(showCommentFor)}&quot;
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Bitte Grund angeben..."
            rows={3}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "1px solid var(--theme-elevation-300)",
              borderRadius: "4px",
              fontSize: "13px",
              background: "var(--theme-input-bg, var(--theme-bg))",
              color: "var(--theme-elevation-800)",
              resize: "vertical",
            }}
          />
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "10px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={() => setShowCommentFor(null)}
              style={{
                padding: "6px 12px",
                border: "1px solid var(--theme-elevation-300)",
                borderRadius: "4px",
                background: "transparent",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={() => submitStatusChange(showCommentFor, comment)}
              disabled={saving || !comment.trim()}
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: "4px",
                background: getStatusColor(showCommentFor),
                color: "#fff",
                cursor: saving || !comment.trim() ? "not-allowed" : "pointer",
                fontSize: "12px",
                fontWeight: 600,
                opacity: saving || !comment.trim() ? 0.5 : 1,
              }}
            >
              {saving ? "Wird gespeichert..." : "Status ändern"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatusWorkflow;
