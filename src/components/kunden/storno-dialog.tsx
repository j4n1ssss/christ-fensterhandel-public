"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface StornoDialogProps {
  anfrageId: string;
  onSuccess?: () => void;
}

type StornoState = "collapsed" | "expanded" | "submitting" | "submitted";

/**
 * Stornierung confirm dialog with inline expand pattern.
 *
 * Collapsed: discreet text link "Stornierung beantragen"
 * Expanded: confirm section with begruendung textarea + submit/cancel
 * Submitted: component disappears, triggers page reload for status update
 */
export function StornoDialog({ anfrageId, onSuccess }: StornoDialogProps) {
  const [state, setState] = useState<StornoState>("collapsed");
  const [begruendung, setBegruendung] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    begruendung?: string;
  }>({});

  async function handleSubmit() {
    // Client-side validation
    if (begruendung.trim().length < 10) {
      setFieldErrors({
        begruendung: "Mindestens 10 Zeichen erforderlich",
      });
      return;
    }

    setFieldErrors({});
    setError(null);
    setState("submitting");

    try {
      const res = await fetch("/api/kunden/storno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anfrageId, begruendung: begruendung.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Anfrage fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.",
        );
        setState("expanded");
        return;
      }

      setState("submitted");

      // Trigger parent reload to show updated StatusBanner
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch {
      setError(
        "Anfrage fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.",
      );
      setState("expanded");
    }
  }

  // Submitted state: component disappears
  if (state === "submitted") {
    return null;
  }

  // Collapsed state: discreet text link
  if (state === "collapsed") {
    return (
      <button
        type="button"
        onClick={() => setState("expanded")}
        className="text-sm text-muted-foreground underline underline-offset-2 cursor-pointer hover:text-foreground"
      >
        Stornierung beantragen
      </button>
    );
  }

  const isSubmitting = state === "submitting";
  const begruendungId = `storno-begruendung-${anfrageId}`;
  const begruendungErrorId = `${begruendungId}-error`;

  // Expanded / Submitting state: confirm section
  return (
    <div
      className={`rounded-xl border border-border bg-card p-6 mt-4 ${isSubmitting ? "cursor-wait opacity-50" : ""}`}
      aria-live="polite"
    >
      <h3 className="text-sm font-bold text-foreground">Stornierungsanfrage</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Ihre Anfrage wird nicht automatisch storniert. Unser Team prüft Ihre
        Anfrage und meldet sich bei Ihnen.
      </p>

      {/* Begruendung Textarea */}
      <label
        htmlFor={begruendungId}
        className="block text-sm font-normal text-foreground"
      >
        Begründung
      </label>
      <textarea
        id={begruendungId}
        value={begruendung}
        onChange={(e) => {
          setBegruendung(e.target.value);
          if (e.target.value.trim().length >= 10) {
            setFieldErrors({});
          }
        }}
        onBlur={() => {
          if (begruendung.trim().length > 0 && begruendung.trim().length < 10) {
            setFieldErrors({
              begruendung: "Mindestens 10 Zeichen erforderlich",
            });
          }
        }}
        placeholder="Bitte beschreiben Sie den Grund für Ihre Stornierungsanfrage."
        required
        minLength={10}
        disabled={isSubmitting}
        aria-invalid={!!fieldErrors.begruendung}
        aria-describedby={
          fieldErrors.begruendung ? begruendungErrorId : undefined
        }
        className="mt-1 min-h-24 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
      />
      {fieldErrors.begruendung && (
        <p id={begruendungErrorId} className="mt-1 text-xs text-red-600">
          {fieldErrors.begruendung}
        </p>
      )}

      {/* Error banner */}
      {error && (
        <div className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
          className={`inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-normal text-primary-foreground transition-colors ${isSubmitting ? "cursor-wait" : "hover:bg-primary/90"}`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Wird gesendet...
            </>
          ) : (
            "Stornierung beantragen"
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setState("collapsed");
            setBegruendung("");
            setError(null);
            setFieldErrors({});
          }}
          disabled={isSubmitting}
          className="text-sm text-muted-foreground underline cursor-pointer"
        >
          Anfrage behalten
        </button>
      </div>
    </div>
  );
}
