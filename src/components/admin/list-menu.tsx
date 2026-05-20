"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  QUICK_ACTIONS,
  STATUS_COLORS,
  type StatusKey,
} from "@/lib/status-config";
import { COMMENT_REQUIRED } from "@/lib/status-transitions";
import { isTerminalStatus, isCompletedStatus } from "@/lib/detail-view-helpers";

interface ListMenuProps {
  anfrageId: string;
  currentStatus: string;
  onActionComplete: () => void;
}

export function ListMenu({
  anfrageId,
  currentStatus,
  onActionComplete,
}: ListMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Outside-click + Escape handler
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const actions = QUICK_ACTIONS[currentStatus as StatusKey] || [];
  const terminal = isTerminalStatus(currentStatus);
  const completed = isCompletedStatus(currentStatus);
  const showActions = !terminal && !completed && actions.length > 0;

  function navigateToDetail() {
    window.location.href = `/admin/collections/anfragen/${anfrageId}`;
  }

  async function handleQuickAction(targetStatus: string) {
    setOpen(false);

    // Stornierung requires detail view (needs stornierung_grund field)
    if (targetStatus === "storniert") {
      navigateToDetail();
      return;
    }

    // COMMENT_REQUIRED statuses redirect to detail view
    if (COMMENT_REQUIRED.includes(targetStatus)) {
      navigateToDetail();
      return;
    }

    // Direct status change via API
    try {
      const res = await fetch(`/api/anfragen/${anfrageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: targetStatus }),
      });

      if (!res.ok) {
        alert(
          "Fehler beim Statuswechsel — bitte Seite neu laden und erneut versuchen.",
        );
        return;
      }

      onActionComplete();
    } catch {
      alert(
        "Fehler beim Statuswechsel — bitte Seite neu laden und erneut versuchen.",
      );
    }
  }

  return (
    <div className="list-menu" ref={ref}>
      <button
        type="button"
        className="list-menu__trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        ...
      </button>

      {open && (
        <div className="list-menu__dropdown">
          {showActions && (
            <>
              {actions.slice(0, 1).map((action) => {
                const isCommentRequired =
                  COMMENT_REQUIRED.includes(action.target) ||
                  action.target === "storniert";
                const label = isCommentRequired
                  ? `${action.label} (Details öffnen)`
                  : action.label;

                return (
                  <button
                    key={action.target}
                    type="button"
                    className="list-menu__item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAction(action.target);
                    }}
                  >
                    <span
                      className="list-menu__dot"
                      style={{
                        background:
                          STATUS_COLORS[action.target as StatusKey] ||
                          "#6b7280",
                      }}
                    />
                    {label}
                  </button>
                );
              })}
              <div className="list-menu__separator" />
            </>
          )}

          <button
            type="button"
            className="list-menu__item"
            onClick={(e) => {
              e.stopPropagation();
              navigateToDetail();
            }}
          >
            Details öffnen
          </button>
        </div>
      )}
    </div>
  );
}
