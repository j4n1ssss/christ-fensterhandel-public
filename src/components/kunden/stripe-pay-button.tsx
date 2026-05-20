"use client";

import { useState } from "react";
import { formatCents } from "@/lib/format-currency";
import { CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/lib/tracking/pirsch";

interface StripePayButtonProps {
  anfrageId: string;
  gesamtpreis: number | null | undefined;
  status: string;
  stripePaymentStatus?: string | null;
  stripeExpiresAt?: string | null;
  stripeRefundedAmountCents?: number | null;
  gutschriftUrl?: string | null;
}

/** Statuses where the "bezahlt" confirmation should show */
const BEZAHLT_STATUSES = [
  "bezahlt",
  "an_hersteller",
  "hersteller_bestaetigt",
  "in_produktion",
  "versandbereit",
  "geliefert",
  "abgeschlossen",
];

/** Statuses where the refund notice should show */
const REFUND_STATUSES = [
  "rueckerstattung_ausstehend",
  "rueckerstattung_abgeschlossen",
];

/**
 * Payment button / status display for the Kunden Dashboard.
 *
 * - At "zahlungslink_versendet": CTA button that redirects to Stripe via /api/stripe/redirect.
 * - At "bezahlt" and post-bezahlt: Green confirmation "Zahlung erhalten".
 * - At refund statuses: Neutral refund notice with optional Gutschrift download.
 * - Otherwise: renders nothing.
 */
export function StripePayButton({
  anfrageId,
  gesamtpreis,
  status,
  stripePaymentStatus,
  stripeExpiresAt,
  stripeRefundedAmountCents,
  gutschriftUrl,
}: StripePayButtonProps) {
  const [loading, setLoading] = useState(false);

  // --- State: zahlungslink_versendet (pay button) ---
  if (status === "zahlungslink_versendet") {
    const expiryText = stripeExpiresAt
      ? `Gültig bis ${new Date(stripeExpiresAt).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`
      : null;

    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">
          Betrag: {formatCents(gesamtpreis ?? 0)}
        </p>
        {expiryText && (
          <p className="mt-1 text-sm text-green-700">{expiryText}</p>
        )}
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            trackEvent("Zahlung gestartet");
            window.location.href = `/api/stripe/redirect/${anfrageId}`;
          }}
          disabled={loading}
          className={`mt-3 inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors ${
            loading
              ? "bg-green-400 cursor-wait"
              : "bg-green-600 hover:bg-green-700 cursor-pointer"
          }`}
        >
          {loading
            ? "Weiterleitung zu Stripe..."
            : `Jetzt bezahlen (${formatCents(gesamtpreis ?? 0)})`}
        </button>
      </div>
    );
  }

  // --- State: bezahlt / post-bezahlt (confirmation) ---
  if (BEZAHLT_STATUSES.includes(status)) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Zahlung erhalten
          </span>
        </div>
      </div>
    );
  }

  // --- State: refund (notice + optional Gutschrift download) ---
  if (REFUND_STATUSES.includes(status)) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Ihre Zahlung wurde zurückerstattet.
        </p>
        {gutschriftUrl && (
          <a
            href={gutschriftUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-primary underline"
          >
            Gutschrift herunterladen
          </a>
        )}
      </div>
    );
  }

  // --- Otherwise: don't render ---
  return null;
}
