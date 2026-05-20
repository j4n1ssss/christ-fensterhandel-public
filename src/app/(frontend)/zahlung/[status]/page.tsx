"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/tracking/pirsch";

type PaymentPhase = "polling" | "success" | "timeout";

export default function ZahlungStatusPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const status = params.status as string; // erfolgreich | abgebrochen | fehler
  const sessionId = searchParams.get("session_id");

  // Check if user is logged in (simple API check)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [anfrageId, setAnfrageId] = useState<string | null>(null);
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>("polling");

  // Check login status
  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => {
        if (res.ok) setIsLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  // Pirsch: Status-basierte Events. "erfolgreich" wird erst gefeuert, wenn das
  // Polling den Webhook-bestätigten Status bekommt — das vermeidet False-Positives.
  useEffect(() => {
    if (status === "abgebrochen") {
      trackEvent("Zahlung abgebrochen");
    }
  }, [status]);

  useEffect(() => {
    if (paymentPhase === "success") {
      trackEvent("Zahlung erfolgreich");
    }
  }, [paymentPhase]);

  // Polling for erfolgreich variant
  useEffect(() => {
    if (status !== "erfolgreich" || !sessionId) return;

    let pollCount = 0;
    const maxPolls = 15; // 15 * 2s = 30s

    const interval = setInterval(async () => {
      pollCount++;

      try {
        const res = await fetch(
          `/api/stripe/payment-status?session_id=${encodeURIComponent(sessionId)}`,
        );
        if (!res.ok) return;

        const data = await res.json();
        setAnfrageId(data.anfrage_id || null);

        if (data.status === "bezahlt") {
          setPaymentPhase("success");
          clearInterval(interval);
          return;
        }
      } catch {
        // Silently retry
      }

      if (pollCount >= maxPolls) {
        setPaymentPhase("timeout");
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status, sessionId]);

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
      <div className="w-full max-w-[480px]">
        {status === "erfolgreich" && (
          <ErfolgreichVariant
            phase={paymentPhase}
            isLoggedIn={isLoggedIn}
            anfrageId={anfrageId}
          />
        )}
        {status === "abgebrochen" && (
          <AbgebrochenVariant
            isLoggedIn={isLoggedIn}
            anfrageId={anfrageId}
            sessionId={sessionId}
          />
        )}
        {status === "fehler" && <FehlerVariant />}
        {!["erfolgreich", "abgebrochen", "fehler"].includes(status) && (
          <FehlerVariant />
        )}
      </div>
    </div>
  );
}

function ErfolgreichVariant({
  phase,
  isLoggedIn,
  anfrageId,
}: {
  phase: PaymentPhase;
  isLoggedIn: boolean;
  anfrageId: string | null;
}) {
  // Phase 1: Polling (spinner)
  if (phase === "polling") {
    return (
      <div
        className="flex flex-col items-center gap-4 py-12"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-lg font-semibold text-foreground">
          Zahlung wird verarbeitet...
        </p>
        <p className="text-sm text-muted-foreground">
          Bitte warten Sie einen Moment.
        </p>
      </div>
    );
  }

  // Phase 2: Success (bezahlt confirmed)
  if (phase === "success") {
    return (
      <div
        className="rounded-xl border border-green-200 bg-green-50 p-6"
        role="alert"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <h1 className="text-xl font-bold text-green-800">
            Zahlung erfolgreich!
          </h1>
          <p className="text-sm text-green-700">
            Ihre Rechnung wird erstellt und per E-Mail zugesendet.
          </p>
          {isLoggedIn && anfrageId ? (
            <Link
              href={`/kunden/dashboard/${anfrageId}`}
              className="mt-2 inline-flex items-center rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              Zurück zum Dashboard
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sie erhalten Ihre Rechnung in Kürze per E-Mail.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Phase 3: Timeout (30s reached)
  return (
    <div
      className="rounded-xl border border-blue-200 bg-blue-50 p-6"
      role="alert"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Info className="h-12 w-12 text-blue-600" />
        <h1 className="text-xl font-bold text-blue-800">
          Zahlung eingegangen!
        </h1>
        <p className="text-sm text-blue-700">
          Die Verarbeitung kann einen Moment dauern. Ihre Rechnung erhalten Sie
          per E-Mail.
        </p>
        {isLoggedIn && anfrageId && (
          <Link
            href={`/kunden/dashboard/${anfrageId}`}
            className="mt-2 inline-flex items-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Zurück zum Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}

function AbgebrochenVariant({
  isLoggedIn,
  anfrageId,
  sessionId,
}: {
  isLoggedIn: boolean;
  anfrageId: string | null;
  sessionId: string | null;
}) {
  // Try to get anfrageId from session if not already known
  const [resolvedAnfrageId, setResolvedAnfrageId] = useState(anfrageId);

  useEffect(() => {
    if (resolvedAnfrageId || !sessionId) return;
    fetch(
      `/api/stripe/payment-status?session_id=${encodeURIComponent(sessionId)}`,
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.anfrage_id) setResolvedAnfrageId(data.anfrage_id);
      })
      .catch(() => {});
  }, [sessionId, resolvedAnfrageId]);

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <XCircle className="h-12 w-12 text-orange-600" />
        <h1 className="text-xl font-bold text-orange-800">
          Zahlung abgebrochen
        </h1>
        {isLoggedIn && resolvedAnfrageId ? (
          <>
            <p className="text-sm text-orange-700">
              Sie können die Zahlung jederzeit erneut starten.
            </p>
            <a
              href={`/api/stripe/redirect/${resolvedAnfrageId}`}
              className="mt-2 inline-flex items-center rounded-lg bg-orange-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
            >
              Erneut bezahlen
            </a>
          </>
        ) : (
          <p className="text-sm text-orange-700">
            Nutzen Sie den Zahlungslink in Ihrer E-Mail, um die Zahlung erneut
            zu starten.
          </p>
        )}
      </div>
    </div>
  );
}

function FehlerVariant() {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-red-600" />
        <h1 className="text-xl font-bold text-red-800">
          Zahlung fehlgeschlagen
        </h1>
        <p className="text-sm text-red-700">
          Diese Zahlungsseite ist nicht mehr gültig. Bitte kontaktieren Sie uns
          für Hilfe.
        </p>
        <p className="text-sm text-muted-foreground">
          Muster Fenster &mdash; Kontaktieren Sie uns für Unterstützung.
        </p>
      </div>
    </div>
  );
}
