"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { useAuth, toast } from "@payloadcms/ui";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  ZAHLUNGS_PANEL_VISIBLE_STATUSES,
  REFUND_ALLOWED_STATUSES,
  getStripeDashboardUrl,
} from "@/lib/stripe-helpers";
import { formatCents, formatNettoBrutto } from "@/lib/format-currency";
import { RefundModal } from "./refund-modal";

interface ZahlungsPanelProps {
  anfrageId: string;
  status: string;
  doc: Record<string, any>;
  onStatusChanged: () => void;
}

export function ZahlungsPanel({
  anfrageId,
  status,
  doc,
  onStatusChanged,
}: ZahlungsPanelProps) {
  const { user } = useAuth();
  const userRole = (user as any)?.rolle || "";
  const [showDetails, setShowDetails] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Visibility gate
  if (
    !(ZAHLUNGS_PANEL_VISIBLE_STATUSES as readonly string[]).includes(status)
  ) {
    return null;
  }

  const paymentStatus = doc.stripe_payment_status || "offen";
  const badgeColor = PAYMENT_STATUS_COLORS[paymentStatus] || "#6b7280";
  const badgeLabel = PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus;

  const checkoutUrl = doc.stripe_checkout_url || null;
  const expiresAt = doc.stripe_expires_at
    ? new Date(doc.stripe_expires_at).toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const betrag = doc.gesamtpreis
    ? formatNettoBrutto(doc.gesamtpreis)
    : "\u2013";
  const refundedAmount = doc.stripe_refunded_amount_cents || 0;
  const canRefund =
    userRole === "admin" &&
    (REFUND_ALLOWED_STATUSES as readonly string[]).includes(status);
  const isExpired = paymentStatus === "abgelaufen";

  // Copy URL to clipboard
  const handleCopyUrl = async () => {
    if (!checkoutUrl) return;
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      toast.success("Zahlungslink kopiert");
    } catch {
      toast.error("Kopieren fehlgeschlagen");
    }
  };

  // Regenerate expired link via dedicated admin endpoint
  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/stripe/regenerate/${anfrageId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(
          `Link-Erstellung fehlgeschlagen: ${data.error || "Unbekannter Fehler"}`,
        );
        return;
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Neuer Zahlungslink erstellt und E-Mail gequeued");
        onStatusChanged(); // Reload doc to get new URL
      } else {
        toast.error("Link-Erstellung fehlgeschlagen");
      }
    } catch {
      toast.error("Link-Erstellung fehlgeschlagen: Verbindungsfehler");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <>
      <div className="zahlungs-panel">
        {/* Header */}
        <div className="zahlungs-panel__header">
          <span className="text-heading">Zahlung</span>
          <span
            className="status-badge"
            role="status"
            style={{
              background: `${badgeColor}18`,
              color: badgeColor,
              border: `1px solid ${badgeColor}40`,
            }}
          >
            {badgeLabel}
          </span>
        </div>

        {/* Content rows */}
        <div className="zahlungs-panel__rows">
          {/* Zahlungslink */}
          {checkoutUrl && (
            <div className="zahlungs-panel__row">
              <span className="detail-field__label">Zahlungslink</span>
              <div className="zahlungs-panel__url">
                <span className="zahlungs-panel__url-text">{checkoutUrl}</span>
                <button
                  type="button"
                  className="zahlungs-panel__copy-btn"
                  onClick={handleCopyUrl}
                  aria-label="Zahlungslink kopieren"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Ablaufdatum */}
          {expiresAt && (
            <div className="zahlungs-panel__row">
              <span className="detail-field__label">Gültig bis</span>
              <span className="detail-field__value">{expiresAt}</span>
            </div>
          )}

          {/* Betrag */}
          <div className="zahlungs-panel__row">
            <span className="detail-field__label">Betrag</span>
            <span className="detail-field__value">{betrag}</span>
          </div>

          {/* Already refunded info */}
          {refundedAmount > 0 && (
            <div className="zahlungs-panel__refunded-info">
              Bereits erstattet: {formatCents(refundedAmount)}
            </div>
          )}
        </div>

        {/* Collapsible details */}
        <div>
          <button
            type="button"
            className="zahlungs-panel__toggle"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
            aria-controls="zahlungs-panel-details"
          >
            <span className={`zahlungs-panel__toggle-arrow${showDetails ? " zahlungs-panel__toggle-arrow--open" : ""}`}>
              &#9654;
            </span>
            {showDetails ? "Details ausblenden" : "Details anzeigen"}
          </button>

          {showDetails && (
            <div
              id="zahlungs-panel-details"
              className="zahlungs-panel__details"
            >
              <div className="zahlungs-panel__rows">
                {doc.stripe_session_id && (
                  <div className="zahlungs-panel__row">
                    <span className="detail-field__label">Session-ID</span>
                    <span className="zahlungs-panel__detail-value--mono">
                      {doc.stripe_session_id}
                    </span>
                  </div>
                )}
                {doc.stripe_payment_intent_id && (
                  <div className="zahlungs-panel__row">
                    <span className="detail-field__label">Payment-Intent</span>
                    <span className="zahlungs-panel__detail-value--mono">
                      {doc.stripe_payment_intent_id}
                    </span>
                  </div>
                )}
                {doc.stripe_customer_id && (
                  <div className="zahlungs-panel__row">
                    <span className="detail-field__label">Stripe Customer</span>
                    <a
                      href={getStripeDashboardUrl(
                        "customers",
                        doc.stripe_customer_id,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-email"
                    >
                      {doc.stripe_customer_id}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="zahlungs-panel__actions">
          {isExpired && (
            <button
              type="button"
              className="btn-primary"
              style={{ background: "#3b82f6" }}
              onClick={handleRegenerate}
              disabled={regenerating}
              aria-label="Neuen Zahlungslink erstellen"
            >
              {regenerating ? "Wird erstellt..." : "Neuen Link erstellen"}
            </button>
          )}
          {canRefund && (
            <button
              type="button"
              className="btn-destructive"
              onClick={() => setShowRefundModal(true)}
            >
              Rueckerstatten
            </button>
          )}
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <RefundModal
          anfrageId={anfrageId}
          gesamtpreisCents={doc.gesamtpreis || 0}
          refundedAmountCents={refundedAmount}
          version={doc.version || 0}
          onClose={() => setShowRefundModal(false)}
          onSuccess={() => {
            setShowRefundModal(false);
            onStatusChanged();
          }}
        />
      )}
    </>
  );
}
