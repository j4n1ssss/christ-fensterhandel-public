"use client";

import { useState } from "react";
import { toast } from "@payloadcms/ui";
import { formatCents } from "@/lib/format-currency";

interface RefundModalProps {
  anfrageId: string;
  gesamtpreisCents: number;
  refundedAmountCents: number;
  version: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function RefundModal({
  anfrageId,
  gesamtpreisCents,
  refundedAmountCents,
  version,
  onClose,
  onSuccess,
}: RefundModalProps) {
  const remainingCents = gesamtpreisCents - refundedAmountCents;
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const partialAmountCents = Math.round(parseFloat(partialAmount || "0") * 100);
  const effectiveAmountCents =
    refundType === "full" ? remainingCents : partialAmountCents;

  const isValid =
    reason.trim().length > 0 &&
    effectiveAmountCents > 0 &&
    effectiveAmountCents <= remainingCents;

  const handleSubmit = async () => {
    if (!isValid) return;

    // Double confirmation (per CONTEXT: window.confirm after modal)
    const confirmText = `${formatCents(effectiveAmountCents)} wirklich rückerstatten? NICHT rückgängig machbar!`;
    if (!window.confirm(confirmText)) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/stripe/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          anfrage_id: anfrageId,
          amount_cents:
            refundType === "partial" ? partialAmountCents : undefined,
          reason: reason.trim(),
          version,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(
          `Rückerstattung fehlgeschlagen: ${data.error || "Unbekannter Fehler"}`,
        );
        return;
      }

      toast.success("Rückerstattung eingeleitet");
      onSuccess();
    } catch {
      toast.error("Rückerstattung fehlgeschlagen: Verbindungsfehler");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="refund-modal__overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="refund-modal__dialog"
        role="dialog"
        aria-labelledby="refund-modal-title"
        aria-modal="true"
      >
        <h2 id="refund-modal-title" className="refund-modal__title">
          Rückerstattung
        </h2>

        {/* Already refunded info */}
        {refundedAmountCents > 0 && (
          <div className="error-message" style={{ marginBottom: "16px" }}>
            Bereits erstattet: {formatCents(refundedAmountCents)} &mdash;
            Verbleibend: {formatCents(remainingCents)}
          </div>
        )}

        {/* Radio group */}
        <div className="refund-modal__radio-group">
          <label className="refund-modal__radio-label">
            <input
              type="radio"
              name="refund-type"
              value="full"
              checked={refundType === "full"}
              onChange={() => setRefundType("full")}
            />
            Volle Rückerstattung ({formatCents(remainingCents)})
          </label>
          <label className="refund-modal__radio-label">
            <input
              type="radio"
              name="refund-type"
              value="partial"
              checked={refundType === "partial"}
              onChange={() => setRefundType("partial")}
            />
            Teilweise Rückerstattung
          </label>
        </div>

        {/* Partial amount input */}
        {refundType === "partial" && (
          <div style={{ marginBottom: "16px" }}>
            <label
              className="text-label"
              style={{ display: "block", marginBottom: "4px" }}
            >
              Erstattungsbetrag (EUR)
            </label>
            <input
              type="number"
              className="form-input"
              value={partialAmount}
              onChange={(e) => setPartialAmount(e.target.value)}
              min="0.01"
              max={(remainingCents / 100).toFixed(2)}
              step="0.01"
              placeholder="0,00"
              style={{ width: "100%" }}
            />
            {partialAmountCents > remainingCents && (
              <span
                className="text-caption"
                style={{
                  color: "#ef4444",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Betrag übersteigt verbleibenden Betrag (
                {formatCents(remainingCents)})
              </span>
            )}
          </div>
        )}

        {/* Reason textarea */}
        <div style={{ marginBottom: "16px" }}>
          <label
            className="text-label"
            style={{ display: "block", marginBottom: "4px" }}
          >
            Begründung
          </label>
          <textarea
            className="form-textarea"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Grund für die Rückerstattung..."
            style={{ width: "100%", minHeight: "80px" }}
            required
          />
        </div>

        {/* Actions */}
        <div
          className="btn-row"
          style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
        >
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Erstattung verwerfen
          </button>
          <button
            type="button"
            className="btn-destructive"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
          >
            {submitting ? "Wird verarbeitet..." : "Rückerstatten"}
          </button>
        </div>
      </div>
    </div>
  );
}
