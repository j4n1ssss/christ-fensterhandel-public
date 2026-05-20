"use client";

import React from "react";
import { getStatusColor, getStatusLabel } from "@/lib/status-config";
import {
  getWaitingDays,
  getUrgencyLevel,
  getProduktZusammenfassung,
  URGENCY_COLORS,
  isTerminalStatus,
  isCompletedStatus,
} from "@/lib/detail-view-helpers";
import { formatCents } from "@/lib/format-currency";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/stripe-helpers";

interface AttentionBarProps {
  anfrageNummer: string;
  status: string;
  createdAt: string;
  lastStatusChangeAt: string | null;
  gesamtpreis: number | null;
  produkte: Array<{ produkttyp?: string; stueckzahl?: number }>;
  stripePaymentStatus?: string | null;
  stripeCheckoutUrl?: string | null;
}

export function AttentionBar({
  anfrageNummer,
  status,
  createdAt,
  lastStatusChangeAt,
  gesamtpreis,
  produkte,
  stripePaymentStatus,
}: AttentionBarProps) {
  const statusColor = getStatusColor(status);
  const wartezeitRef = lastStatusChangeAt || createdAt;
  const days = getWaitingDays(wartezeitRef);
  const urgency = getUrgencyLevel(days);
  const urgencyColor = URGENCY_COLORS[urgency];
  const zusammenfassung = getProduktZusammenfassung(produkte);
  const isTerminal = isTerminalStatus(status);
  const isCompleted = isCompletedStatus(status);
  const eingangsDatum = new Date(createdAt).toLocaleDateString("de-DE");

  const urgencyModifier =
    urgency !== "normal" ? ` attention-bar--${urgency}` : "";

  return (
    <div className={`attention-bar${urgencyModifier}`}>
      {/* Row 1: ANF-Nr + Badges */}
      <div className="attention-bar__row-primary">
        <div className="attention-bar__id-group">
          <span className="attention-bar__id">{anfrageNummer}</span>
        </div>

        <div className="attention-bar__badges">
          <span
            className="status-badge"
            style={{
              background: `${statusColor}18`,
              color: statusColor,
            }}
          >
            {getStatusLabel(status)}
          </span>

          {stripePaymentStatus && (
            <span
              className="status-badge"
              role="status"
              style={{
                background: `${PAYMENT_STATUS_COLORS[stripePaymentStatus] || "#6b7280"}18`,
                color:
                  PAYMENT_STATUS_COLORS[stripePaymentStatus] || "#6b7280",
              }}
            >
              {PAYMENT_STATUS_LABELS[stripePaymentStatus] ||
                stripePaymentStatus}
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Meta info */}
      <div className="attention-bar__row-meta">
        <div className="attention-bar__meta-left">
          <span>vom {eingangsDatum}</span>

          {/* Urgency badge: only for non-terminal, non-completed, non-normal urgency */}
          {urgency !== "normal" && !isTerminal && !isCompleted && (
            <>
              <span className="attention-bar__meta-separator">&middot;</span>
              <span
                className="urgency-badge"
                style={{
                  color: urgencyColor,
                  background: `${urgencyColor}1f`,
                }}
              >
                {`${days} ${days === 1 ? "Tag" : "Tage"}`}
              </span>
            </>
          )}

          {/* Terminal/completed statuses: show completion date */}
          {(isTerminal || isCompleted) && lastStatusChangeAt && (
            <>
              <span className="attention-bar__meta-separator">&middot;</span>
              <span>
                {new Date(lastStatusChangeAt).toLocaleDateString("de-DE")}
              </span>
            </>
          )}
        </div>

        <div className="attention-bar__meta-right">
          <span className="text-body-muted">{zusammenfassung}</span>

          <span className="attention-bar__price">
            {gesamtpreis ? formatCents(gesamtpreis) : "\u2014"}
            {gesamtpreis ? (
              <span className="attention-bar__price-suffix"> netto</span>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
}
