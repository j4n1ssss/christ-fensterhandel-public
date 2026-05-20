"use client";

import { useState } from "react";
import { formatCents } from "@/lib/format-currency";
import { trackRevenue, trackEvent } from "@/lib/tracking/pirsch";

interface AngebotAnnahmeProps {
  anfrageId: string;
  betragBruttoCents: number;
  mwstCents: number;
  mwstSatz: number;
  agbLink: string;
  disabled?: boolean;
}

/**
 * "Angebot annehmen und zahlen" CTA button with inline confirm section (IC-03).
 *
 * Confirm section includes: Betrag summary, Widerrufs-Hinweis (Paragraph 312g),
 * AGB checkbox (dynamic link from Settings), and Stripe redirect.
 *
 * Used on both public /angebot/[anfrageId] page and Kunden-Dashboard.
 */
export function AngebotAnnahmeButton({
  anfrageId,
  betragBruttoCents,
  mwstCents,
  mwstSatz,
  agbLink,
  disabled = false,
}: AngebotAnnahmeProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [agbChecked, setAgbChecked] = useState(false);
  const [agbError, setAgbError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (!agbChecked) {
      setAgbError(true);
      return;
    }
    setAgbError(false);
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/angebot/annehmen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anfrageId, agb_akzeptiert: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Annahme fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.",
        );
        setSubmitting(false);
        return;
      }

      trackRevenue("Angebot angenommen", betragBruttoCents);

      if (data.checkout_url) {
        trackEvent("Zahlung gestartet");
        window.location.href = data.checkout_url;
      }
    } catch {
      setError(
        "Annahme fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.",
      );
      setSubmitting(false);
    }
  }

  // --- CTA button (before confirm) ---
  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={disabled}
        aria-disabled={disabled}
        className={`mt-4 inline-flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-white ${
          disabled
            ? "bg-gray-400 opacity-50 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        Angebot annehmen und zahlen
      </button>
    );
  }

  // --- Inline confirm section (IC-03) ---
  return (
    <div
      className="mt-4 rounded-xl border border-border bg-card p-6"
      role="region"
      aria-live="polite"
    >
      {/* Betrag summary */}
      <p className="text-base font-semibold text-foreground">
        Betrag: {formatCents(betragBruttoCents)}
      </p>
      <p className="text-sm text-muted-foreground">
        inkl. {mwstSatz}% MwSt ({formatCents(mwstCents)})
      </p>

      {/* Widerrufs-Hinweis */}
      <p className="mt-4 text-xs text-muted-foreground">
        Maßanfertigungen sind vom Widerrufsrecht ausgenommen (Paragraph 312g
        Abs. 2 Nr. 1 BGB). Mit der Bestellung erklären Sie sich damit
        einverstanden, dass die Ware nach Ihren individuellen Vorgaben
        angefertigt wird.
      </p>

      {/* AGB Checkbox */}
      <label className="mt-4 flex items-start gap-2">
        <input
          type="checkbox"
          checked={agbChecked}
          onChange={(e) => {
            setAgbChecked(e.target.checked);
            if (e.target.checked) setAgbError(false);
          }}
          aria-required="true"
          aria-invalid={agbError}
          aria-describedby={agbError ? "agb-error" : undefined}
          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <span className="text-sm text-muted-foreground">
          Ich akzeptiere die{" "}
          <a
            href={agbLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            AGB
          </a>{" "}
          und bestätige die Bestellung.
        </span>
      </label>
      {agbError && (
        <p id="agb-error" className="mt-1 ml-8 text-xs text-red-600">
          AGB müssen akzeptiert werden
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleAccept}
          disabled={submitting}
          className={`inline-flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-white ${
            submitting
              ? "bg-green-400 cursor-wait"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {submitting
            ? "Weiterleitung zu Stripe..."
            : "Verbindlich bestellen und zahlen"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowConfirm(false);
            setAgbChecked(false);
            setAgbError(false);
            setError(null);
          }}
          className="text-sm text-muted-foreground underline cursor-pointer"
        >
          Annahme abbrechen
        </button>
      </div>
    </div>
  );
}
