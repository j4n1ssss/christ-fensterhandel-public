"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@payloadcms/ui";
import { calcNetFromGross, calcGrossFromNet, calcTax } from "@/lib/tax";
import { formatCents } from "@/lib/format-currency";

interface AngebotsModalProps {
  open: boolean;
  onClose: () => void;
  anfrageId: string;
  anfrageNummer: string;
  produkte: any[];
  gesamtpreis: number; // current anfrage.gesamtpreis in cents (netto)
  onSuccess: () => void;
  lastAngebotBrutto?: number;
  nextVersion?: number;
}

interface EinzelpreisEntry {
  positionsIndex: number;
  bruttoCents: number;
}

export function AngebotsModal({
  open,
  onClose,
  anfrageId,
  anfrageNummer,
  produkte,
  gesamtpreis,
  onSuccess,
  lastAngebotBrutto,
  nextVersion = 1,
}: AngebotsModalProps) {
  const [bruttoCents, setBruttoCents] = useState<number>(0);
  const [einzelpreise, setEinzelpreise] = useState<EinzelpreisEntry[]>([]);
  const [einzelpreiseOpen, setEinzelpreiseOpen] = useState(false);
  const [begruendung, setBegruendung] = useState("");
  const [gueltigkeitTage, setGueltigkeitTage] = useState(30);
  const [freitext, setFreitext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEditSource, setLastEditSource] = useState<"gesamt" | "einzel">(
    "gesamt",
  );
  const [settingsDefaults, setSettingsDefaults] = useState<{
    gueltigkeitTage: number;
    mwstSatz: number;
  }>({ gueltigkeitTage: 30, mwstSatz: 19 });

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Fetch Settings Global on open
  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    fetch("/api/globals/settings", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const tage = data.angebots_gueltigkeit_tage || 30;
        const satz = data.mwst_satz || 19;
        setSettingsDefaults({ gueltigkeitTage: tage, mwstSatz: satz });
        setGueltigkeitTage(tage);

        // Pre-fill price
        if (lastAngebotBrutto && nextVersion > 1) {
          setBruttoCents(lastAngebotBrutto);
        } else {
          const nettoSum = produkte.reduce(
            (sum: number, p: any) =>
              sum + (p.einzelpreis || 0) * (p.stueckzahl || 1),
            0,
          );
          const bruttoCalc = calcGrossFromNet(nettoSum, satz);
          setBruttoCents(bruttoCalc);
        }
      })
      .catch(() => {
        // Fallback: use defaults
        if (lastAngebotBrutto && nextVersion > 1) {
          setBruttoCents(lastAngebotBrutto);
        } else {
          const nettoSum = produkte.reduce(
            (sum: number, p: any) =>
              sum + (p.einzelpreis || 0) * (p.stueckzahl || 1),
            0,
          );
          setBruttoCents(calcGrossFromNet(nettoSum, 19));
        }
      });

    // Reset form state on open
    setEinzelpreise([]);
    setEinzelpreiseOpen(false);
    setBegruendung("");
    setFreitext("");
    setError(null);
    setLastEditSource("gesamt");
  }, [open, lastAngebotBrutto, nextVersion, produkte]);

  // Focus trap and Escape handler
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Focus first focusable element in dialog
    setTimeout(() => {
      if (dialogRef.current) {
        const first = dialogRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        first?.focus();
      }
    }, 0);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  // Derived values
  const mwstSatz = settingsDefaults.mwstSatz;
  const nettoCents = calcNetFromGross(bruttoCents, mwstSatz);
  const mwstCents = bruttoCents - nettoCents;

  // Standard price calculation for price-changed detection
  const standardNettoSum = produkte.reduce(
    (sum: number, p: any) => sum + (p.einzelpreis || 0) * (p.stueckzahl || 1),
    0,
  );
  const standardBrutto = calcGrossFromNet(standardNettoSum, mwstSatz);
  const isPriceChanged = bruttoCents !== standardBrutto;

  // Gueltigkeit computed date
  const gueltigBisDate = new Date(Date.now() + gueltigkeitTage * 86400000);
  const gueltigBisFormatted = gueltigBisDate.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Einzelpreis helpers
  const getEinzelpreisBrutto = useCallback(
    (index: number, produkt: any): number => {
      const found = einzelpreise.find((e) => e.positionsIndex === index);
      if (found) return found.bruttoCents;
      // Default: calculated from netto
      const nettoPerUnit = produkt.einzelpreis || 0;
      return calcGrossFromNet(nettoPerUnit, mwstSatz);
    },
    [einzelpreise, mwstSatz],
  );

  const handleEinzelpreisChange = (index: number, newBruttoCents: number) => {
    setEinzelpreise((prev) => {
      const existing = prev.filter((e) => e.positionsIndex !== index);
      return [
        ...existing,
        { positionsIndex: index, bruttoCents: newBruttoCents },
      ];
    });
    setLastEditSource("einzel");

    // Recalculate gesamtpreis from all positions
    setTimeout(() => {
      let total = 0;
      produkte.forEach((p: any, i: number) => {
        const qty = p.stueckzahl || 1;
        if (i === index) {
          total += newBruttoCents * qty;
        } else {
          const found = einzelpreise.find((e) => e.positionsIndex === i);
          if (found) {
            total += found.bruttoCents * qty;
          } else {
            total += calcGrossFromNet(p.einzelpreis || 0, mwstSatz) * qty;
          }
        }
      });
      setBruttoCents(total);
    }, 0);
  };

  const handleGesamtpreisChange = (eurValue: number) => {
    const cents = Math.round(eurValue * 100);
    setBruttoCents(cents);
    setLastEditSource("gesamt");
  };

  // Submit handler
  const handleSubmit = async () => {
    if (isPriceChanged && !begruendung.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/angebot/erstellen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          anfrageId,
          bruttoCents,
          gueltigkeitTage,
          freitext: freitext.trim() || undefined,
          begruendung: isPriceChanged ? begruendung.trim() : undefined,
          einzelpreise: einzelpreise.length > 0 ? einzelpreise : undefined,
        }),
      });
      if (res.ok) {
        toast.success("Angebot erstellt und versendet");
        onSuccess();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(
          data.error ||
            "Angebot konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
        );
      }
    } catch {
      setError(
        "Angebot konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Click on overlay closes modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const canSubmit =
    !submitting && bruttoCents > 0 && (!isPriceChanged || begruendung.trim());

  if (!open) return null;

  const titleText =
    nextVersion > 1 ? `Angebot V${nextVersion} erstellen` : "Angebot erstellen";

  return (
    <div
      className="angebots-modal__overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="angebots-modal__dialog"
        role="dialog"
        aria-labelledby="angebots-modal-title"
        aria-modal="true"
      >
        {/* Sticky Header */}
        <div className="angebots-modal__header">
          <h2
            id="angebots-modal-title"
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "var(--theme-elevation-1000)",
              margin: 0,
            }}
          >
            {titleText}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Modal schließen"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: "var(--theme-elevation-600)",
              padding: "4px",
              lineHeight: 1,
            }}
          >
            &#10005;
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="angebots-modal__body">
          {/* Error display */}
          {error && <div className="angebots-modal__error">{error}</div>}

          {/* Section 1: Positionen (read-only) */}
          <div className="angebots-modal__section">
            <div className="text-label" style={{ marginBottom: "8px" }}>
              Positionen
            </div>
            {produkte.map((p: any, i: number) => {
              const qty = p.stueckzahl || 1;
              let identity = p.produkttyp || "Produkt";
              if (p.material) identity += ` \u2014 ${p.material}`;
              return (
                <div key={p.id || i} className="angebots-modal__position-row">
                  <div>
                    <span className="text-body" style={{ fontWeight: 500 }}>
                      {qty > 1 ? `${qty}x ` : ""}
                      {identity}
                    </span>
                    <div style={{ marginTop: "2px" }}>
                      {p.masse_breite && p.masse_hoehe && (
                        <span className="text-caption">
                          {p.masse_breite} x {p.masse_hoehe} mm
                        </span>
                      )}
                      {p.farbe_aussen && (
                        <span className="text-caption">
                          {" "}
                          | {p.farbe_aussen}
                        </span>
                      )}
                      {p.verglasung && (
                        <span className="text-caption"> | {p.verglasung}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-body">
                    {formatCents(
                      calcGrossFromNet((p.einzelpreis || 0) * qty, mwstSatz),
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Section 2: Gesamtpreis */}
          <div className="angebots-modal__section">
            <label className="text-label" htmlFor="angebots-brutto-input">
              Angebotspreis (brutto)
            </label>
            <input
              id="angebots-brutto-input"
              className="form-input"
              type="number"
              step="0.01"
              min="0.01"
              value={(bruttoCents / 100).toFixed(2)}
              onChange={(e) =>
                handleGesamtpreisChange(parseFloat(e.target.value) || 0)
              }
              disabled={submitting}
              inputMode="decimal"
              aria-label="Angebotspreis brutto in Euro"
              style={{ marginTop: "4px" }}
            />
            <div className="text-body-muted angebots-modal__price-info">
              Netto: {formatCents(nettoCents)} | MwSt ({mwstSatz}%):{" "}
              {formatCents(mwstCents)}
            </div>
          </div>

          {/* Section 3: Einzelpreise (collapsible) */}
          <div className="angebots-modal__section">
            <button
              type="button"
              className="angebots-modal__toggle"
              onClick={() => setEinzelpreiseOpen(!einzelpreiseOpen)}
              aria-expanded={einzelpreiseOpen}
            >
              <span
                style={{
                  display: "inline-block",
                  transform: einzelpreiseOpen
                    ? "rotate(90deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                  fontSize: "12px",
                }}
              >
                &#9654;
              </span>
              <span className="text-caption">Einzelpreise anpassen</span>
            </button>
            {einzelpreiseOpen && (
              <div style={{ marginTop: "8px" }}>
                {produkte.map((p: any, i: number) => {
                  const qty = p.stueckzahl || 1;
                  const label = `${p.produkttyp || "Position " + (i + 1)}${qty > 1 ? ` x${qty}` : ""}`;
                  const epBrutto = getEinzelpreisBrutto(i, p);
                  const epNetto = calcNetFromGross(epBrutto, mwstSatz);
                  const epMwst = epBrutto - epNetto;
                  return (
                    <div key={p.id || i} style={{ marginBottom: "12px" }}>
                      <label className="text-label" htmlFor={`ep-input-${i}`}>
                        {label} (brutto pro Stk.)
                      </label>
                      <input
                        id={`ep-input-${i}`}
                        className="form-input"
                        type="number"
                        step="0.01"
                        min="0"
                        value={(epBrutto / 100).toFixed(2)}
                        onChange={(e) => {
                          const cents = Math.round(
                            (parseFloat(e.target.value) || 0) * 100,
                          );
                          handleEinzelpreisChange(i, cents);
                        }}
                        disabled={submitting}
                        inputMode="decimal"
                        aria-label={`Einzelpreis brutto für ${label}`}
                        style={{ marginTop: "4px" }}
                      />
                      <div
                        className="text-caption"
                        style={{ marginTop: "2px" }}
                      >
                        Netto: {formatCents(epNetto)} | MwSt:{" "}
                        {formatCents(epMwst)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Begruendung (conditional) */}
          {isPriceChanged && (
            <div className="angebots-modal__section">
              <label className="text-label" htmlFor="angebots-begruendung">
                Begründung für Preisanpassung{" "}
                <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                id="angebots-begruendung"
                className="form-textarea"
                value={begruendung}
                onChange={(e) => setBegruendung(e.target.value)}
                placeholder="Warum weicht der Preis ab?"
                rows={3}
                disabled={submitting}
                aria-required="true"
                style={{ marginTop: "4px", minHeight: "80px" }}
              />
            </div>
          )}

          {/* Section 5: Gueltigkeit */}
          <div className="angebots-modal__section">
            <label className="text-label" htmlFor="angebots-gueltigkeit">
              Gültigkeitsdauer
            </label>
            <select
              id="angebots-gueltigkeit"
              className="form-select"
              value={gueltigkeitTage}
              onChange={(e) => setGueltigkeitTage(Number(e.target.value))}
              disabled={submitting}
              style={{ marginTop: "4px" }}
            >
              <option value={14}>14 Tage</option>
              <option value={30}>30 Tage</option>
              <option value={60}>60 Tage</option>
              <option value={90}>90 Tage</option>
            </select>
            <div className="text-caption" style={{ marginTop: "4px" }}>
              Gültig bis: {gueltigBisFormatted}
            </div>
          </div>

          {/* Section 6: Freitext */}
          <div className="angebots-modal__section">
            <label className="text-label" htmlFor="angebots-freitext">
              Individuelle Hinweise (optional)
            </label>
            <textarea
              id="angebots-freitext"
              className="form-textarea"
              value={freitext}
              onChange={(e) => setFreitext(e.target.value)}
              placeholder="Optionale Anmerkungen zum Angebot..."
              rows={3}
              disabled={submitting}
              style={{ marginTop: "4px", minHeight: "80px" }}
            />
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="angebots-modal__footer">
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Erstellung abbrechen
          </button>
          <button
            type="button"
            className="btn-dokument-create"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            style={{
              opacity: canSubmit ? 1 : 0.6,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {submitting ? "Wird erstellt..." : "Angebot erstellen und senden"}
          </button>
        </div>
      </div>
    </div>
  );
}
