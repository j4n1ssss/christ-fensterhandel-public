"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PasswortResetFormProps {
  token: string;
}

export function PasswortResetForm({ token }: PasswortResetFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validatePassword(value: string): string | null {
    if (value.length < 8)
      return "Das Passwort muss mindestens 8 Zeichen lang sein.";
    return null;
  }

  function validateConfirm(value: string): string | null {
    if (value !== password) return "Die Passwörter stimmen nicht überein.";
    return null;
  }

  function handlePasswordBlur() {
    setPasswordError(validatePassword(password));
  }

  function handleConfirmBlur() {
    if (confirmPassword) {
      setConfirmError(validateConfirm(confirmPassword));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const pwErr = validatePassword(password);
    const cfErr = validateConfirm(confirmPassword);

    if (pwErr) {
      setPasswordError(pwErr);
      return;
    }
    if (cfErr) {
      setConfirmError(cfErr);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 400 || res.status === 403) {
          setTokenExpired(true);
          return;
        }
        setError(
          data?.message ||
            "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        );
        return;
      }

      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => router.push("/kunden/login"), 3000);
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        Ihr Passwort wurde erfolgreich geändert. Sie werden in 3 Sekunden
        weitergeleitet...
      </div>
    );
  }

  if (tokenExpired) {
    return (
      <div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Dieser Link ist abgelaufen oder ungültig. Bitte fordern Sie einen
          neuen Link an.
        </div>
        <Link
          href="/kunden/passwort-vergessen"
          className="mt-2 inline-block text-sm text-primary underline"
        >
          Neuen Link anfordern
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
            htmlFor="password"
            className="mb-1.5 block text-sm font-normal text-foreground"
          >
            Neues Passwort
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(null);
            }}
            onBlur={handlePasswordBlur}
            className={inputClassName}
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "password-error" : undefined}
          />
          {passwordError && (
            <p id="password-error" className="mt-1 text-xs text-red-600">
              {passwordError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1.5 block text-sm font-normal text-foreground"
          >
            Passwort bestätigen
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmError) setConfirmError(null);
            }}
            onBlur={handleConfirmBlur}
            className={inputClassName}
            aria-invalid={!!confirmError}
            aria-describedby={confirmError ? "confirm-error" : undefined}
          />
          {confirmError && (
            <p id="confirm-error" className="mt-1 text-xs text-red-600">
              {confirmError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-normal text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Wird gespeichert..." : "Passwort ändern"}
        </button>
      </form>
    </div>
  );
}
