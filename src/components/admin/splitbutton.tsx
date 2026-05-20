"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "@payloadcms/ui";
import {
  QUICK_ACTIONS,
  STATUS_COLORS,
  STATUS_LABELS,
  type StatusKey,
} from "@/lib/status-config";
import { COMMENT_REQUIRED } from "@/lib/status-transitions";
import { isTerminalStatus, isCompletedStatus } from "@/lib/detail-view-helpers";

interface SplitbuttonProps {
  anfrageId: string;
  currentStatus: string;
  onStatusChanged: () => void;
  lastStatusChangeAt?: string | null;
  version?: number;
  gesamtpreis?: number | null;
  onOpenAngebotsModal?: () => void;
}

export function Splitbutton({
  anfrageId,
  currentStatus,
  onStatusChanged,
  lastStatusChangeAt,
  version,
  gesamtpreis,
  onOpenAngebotsModal,
}: SplitbuttonProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCommentFor, setShowCommentFor] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stornierungGrund, setStornierungGrund] = useState("");
  const [rueckerstattungBetrag, setRueckerstattungBetrag] =
    useState<string>("");
  const [rueckerstattungStatus, setRueckerstattungStatus] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Outside-click and Escape handler
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [dropdownOpen]);

  const actions = QUICK_ACTIONS[currentStatus as StatusKey] || [];

  function handleActionClick(targetStatus: string) {
    console.log("[Splitbutton] handleActionClick:", targetStatus, {
      gesamtpreis,
      currentStatus,
      saving,
    });
    setDropdownOpen(false);
    setError(null);

    // Intercept "Angebot erstellen" to open modal instead of direct status change
    if (targetStatus === "angebot_versendet" && onOpenAngebotsModal) {
      onOpenAngebotsModal();
      return;
    }

    // Price guard: block zahlungslink_versendet without price (STRP-01)
    if (targetStatus === "zahlungslink_versendet") {
      if (!gesamtpreis || gesamtpreis <= 0) {
        toast.error(
          "Kein Preis vorhanden. Zahlungslink kann nicht erstellt werden.",
        );
        return;
      }
    }

    // Stornierung special rule
    if (targetStatus === "storniert") {
      const confirmed = window.confirm(
        "Stornierung ist endgültig. Fortfahren?",
      );
      if (!confirmed) return;
      setShowCommentFor("storniert");
      return;
    }

    if (COMMENT_REQUIRED.includes(targetStatus)) {
      setShowCommentFor(targetStatus);
      setComment("");
    } else {
      submitStatusChange(targetStatus, "");
    }
  }

  async function submitStatusChange(
    targetStatus: string,
    statusComment: string,
  ) {
    console.log("[Splitbutton] submitStatusChange:", targetStatus);
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> =
        targetStatus === "storniert"
          ? {
              status: "storniert",
              stornierung_grund: stornierungGrund,
              rueckerstattung_betrag: rueckerstattungBetrag
                ? Number(rueckerstattungBetrag)
                : undefined,
              rueckerstattung_status: rueckerstattungStatus || undefined,
              version,
            }
          : {
              status: targetStatus,
              _status_kommentar: statusComment || undefined,
              version,
            };

      const res = await fetch(`/api/anfragen/${anfrageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg =
          (data.errors && data.errors[0]?.message) ||
          data.message ||
          "Fehler beim Statuswechsel — bitte Seite neu laden und erneut versuchen.";
        setError(errMsg);
        return;
      }

      // Success: reset all state
      setShowCommentFor(null);
      setComment("");
      setStornierungGrund("");
      setRueckerstattungBetrag("");
      setRueckerstattungStatus("");
      onStatusChanged();
    } catch {
      setError(
        "Netzwerkfehler — bitte Internetverbindung prüfen und erneut versuchen.",
      );
    } finally {
      setSaving(false);
    }
  }

  // Terminal status: storniert
  if (isTerminalStatus(currentStatus)) {
    return (
      <div className="terminal-info">
        Storniert am{" "}
        {lastStatusChangeAt
          ? new Date(lastStatusChangeAt).toLocaleDateString("de-DE")
          : "unbekannt"}
      </div>
    );
  }

  // Completed status: abgeschlossen
  if (isCompletedStatus(currentStatus)) {
    return (
      <div className="terminal-info">
        Diese Anfrage ist abgeschlossen.
        <br />
        <button
          type="button"
          className="terminal-info__reopen"
          onClick={() => handleActionClick("wieder_geoeffnet")}
        >
          Wieder öffnen
        </button>
      </div>
    );
  }

  if (actions.length === 0) return null;

  const primaryAction = actions[0];
  const secondaryActions = actions.slice(1);
  const primaryColor =
    STATUS_COLORS[primaryAction.target as StatusKey] || "#6b7280";

  return (
    <div>
      <div className="splitbutton" ref={dropdownRef}>
        <button
          type="button"
          className="splitbutton__primary"
          style={{ background: primaryColor }}
          onClick={() => handleActionClick(primaryAction.target)}
          disabled={saving}
        >
          {primaryAction.label}
        </button>
        {secondaryActions.length > 0 && (
          <button
            type="button"
            className="splitbutton__chevron"
            style={{ background: primaryColor, filter: "brightness(0.9)" }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={saving}
          >
            &#9662;
          </button>
        )}
        {dropdownOpen && secondaryActions.length > 0 && (
          <div className="splitbutton__dropdown">
            {secondaryActions.map((action) => (
              <button
                key={action.target}
                type="button"
                className="splitbutton__dropdown-item"
                onClick={() => handleActionClick(action.target)}
              >
                <span
                  className="splitbutton__dropdown-dot"
                  style={{
                    background:
                      STATUS_COLORS[action.target as StatusKey] || "#6b7280",
                  }}
                />
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error display */}
      {error && <div className="error-message">{error}</div>}

      {/* Comment panel (non-stornierung) */}
      {showCommentFor && showCommentFor !== "storniert" && (
        <div
          className="comment-panel"
          style={{
            border: `1px solid ${STATUS_COLORS[showCommentFor as StatusKey] || "#6b7280"}40`,
          }}
        >
          <div className="comment-panel__heading">
            Kommentar für &quot;
            {STATUS_LABELS[showCommentFor as StatusKey] || showCommentFor}
            &quot;
          </div>
          <textarea
            className="form-textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Bitte Grund angeben..."
            rows={3}
          />
          <div className="btn-row">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setShowCommentFor(null)}
            >
              Abbrechen
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => submitStatusChange(showCommentFor, comment)}
              disabled={saving || !comment.trim()}
              style={{
                background:
                  STATUS_COLORS[showCommentFor as StatusKey] || "#6b7280",
                opacity: saving || !comment.trim() ? 0.5 : 1,
              }}
            >
              {saving ? "Wird gespeichert..." : "Status ändern"}
            </button>
          </div>
        </div>
      )}

      {/* Stornierung panel */}
      {showCommentFor === "storniert" && (
        <div
          className="comment-panel"
          style={{ border: "1px solid #ef444440" }}
        >
          <div className="comment-panel__heading--destructive">Stornierung</div>
          <div className="form-group">
            <label className="text-label">Stornierungsgrund *</label>
            <textarea
              className="form-textarea"
              value={stornierungGrund}
              onChange={(e) => setStornierungGrund(e.target.value)}
              placeholder="Grund für die Stornierung..."
              rows={3}
            />
          </div>
          <div className="form-row-grid">
            <div>
              <label className="text-label">Rückerstattungsbetrag</label>
              <input
                className="form-input"
                type="number"
                value={rueckerstattungBetrag}
                onChange={(e) => setRueckerstattungBetrag(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-label">Rückerstattungsstatus</label>
              <select
                className="form-select"
                value={rueckerstattungStatus}
                onChange={(e) => setRueckerstattungStatus(e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                <option value="ausstehend">Ausstehend</option>
                <option value="durchgefuehrt">Durchgeführt</option>
                <option value="abgelehnt">Abgelehnt</option>
              </select>
            </div>
          </div>
          <div className="btn-row">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setShowCommentFor(null);
                setStornierungGrund("");
                setRueckerstattungBetrag("");
                setRueckerstattungStatus("");
              }}
            >
              Abbrechen
            </button>
            <button
              type="button"
              className="btn-destructive"
              onClick={() => submitStatusChange("storniert", "")}
              disabled={saving || !stornierungGrund.trim()}
              style={{
                opacity: saving || !stornierungGrund.trim() ? 0.5 : 1,
              }}
            >
              {saving ? "Wird gespeichert..." : "Stornierung bestätigen"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
