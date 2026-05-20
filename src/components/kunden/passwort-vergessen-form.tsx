"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function PasswortVergessenForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validateEmail(value: string): string | null {
    if (!value.trim()) return "Bitte geben Sie Ihre E-Mail-Adresse ein.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    return null;
  }

  function handleBlur() {
    setEmailError(validateEmail(email));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // ALWAYS show success regardless of response (anti-leak pattern)
      setSuccess(true);
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div>
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir Ihnen
          einen Link gesendet. Bitte prüfen Sie Ihren Posteingang.
        </div>
        <Link
          href="/kunden/login"
          className="mt-4 inline-block text-sm text-muted-foreground underline"
        >
          Zurück zum Login
        </Link>
      </div>
    );
  }

  const inputClassName =
    "w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div aria-live="polite">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-normal text-foreground"
          >
            E-Mail-Adresse
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            onBlur={handleBlur}
            className={inputClassName}
            placeholder="ihre@email.de"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError && (
            <p id="email-error" className="mt-1 text-xs text-red-600">
              {emailError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-normal text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Wird gesendet..." : "Link anfordern"}
        </button>
      </form>

      <Link
        href="/kunden/login"
        className="mt-4 inline-block text-sm text-muted-foreground underline"
      >
        Zurueck zum Login
      </Link>
    </div>
  );
}
