"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "@payloadcms/ui";
import { EVENT_MATRIX } from "@/lib/email/event-matrix";

interface EmailSendModalProps {
  anfrageId: string;
  anfrageNummer: string;
  kundenEmail: string;
  kundenName: string;
  onClose: () => void;
  onSent: () => void;
}

const MANUAL_TEMPLATES = [
  { slug: "anfrage-bestaetigung", label: "Anfrage-Bestätigung" },
  { slug: "status-update", label: "Status-Update" },
  { slug: "angebot-versendet", label: "Angebot versendet" },
  { slug: "zahlungslink", label: "Zahlungslink" },
  { slug: "zahlung-bestaetigung", label: "Zahlung-Bestätigung" },
  { slug: "stornierung", label: "Stornierung" },
  { slug: "rueckfrage", label: "Rückfrage" },
  { slug: "reklamation", label: "Reklamation" },
  { slug: "rueckerstattung", label: "Rückerstattung" },
  { slug: "freitext", label: "Freitext (ohne Template)" },
];

/**
 * Lookup the default subject from EVENT_MATRIX for a given template slug.
 * EVENT_MATRIX keys use underscores while template slugs use hyphens,
 * so we iterate the matrix to find the event whose templates.kunde matches.
 */
function getSubjectForTemplate(
  templateSlug: string,
  anfrageNummer: string,
): string {
  if (templateSlug === "freitext") return "";

  for (const [, config] of Object.entries(EVENT_MATRIX)) {
    if (config.templates?.kunde === templateSlug) {
      const subjectTemplate = config.betreff?.kunde;
      if (subjectTemplate) {
        return subjectTemplate.replace("#{anfrage_nummer}", anfrageNummer);
      }
    }
  }
  return "";
}

export function EmailSendModal({
  anfrageId,
  anfrageNummer,
  kundenEmail,
  kundenName,
  onClose,
  onSent,
}: EmailSendModalProps) {
  const [templateSlug, setTemplateSlug] = useState("");
  const [subject, setSubject] = useState("");
  const [freitext, setFreitext] = useState("");
  const [empfaenger, setEmpfaenger] = useState(kundenEmail);
  const [recipientMode, setRecipientMode] = useState<
    "default" | "replace" | "additional"
  >("default");
  const [altEmpfaenger, setAltEmpfaenger] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save previous focus and set up initial focus
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;

    setTimeout(() => {
      if (dialogRef.current) {
        const first = dialogRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        first?.focus();
      }
    }, 0);

    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  // Focus trap and Escape handler
  useEffect(() => {
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
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Auto-fill subject when template changes
  const handleTemplateChange = (slug: string) => {
    setTemplateSlug(slug);
    setSubject(getSubjectForTemplate(slug, anfrageNummer));
    setPreviewHtml("");
  };

  // Load preview
  const handlePreview = async () => {
    if (!templateSlug) return;
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/admin/email-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          anfrageId,
          templateSlug,
          freitext: freitext || undefined,
          subject: subject || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewHtml(data.html || "");
      } else {
        toast.error("Vorschau konnte nicht geladen werden");
      }
    } catch {
      toast.error("Vorschau konnte nicht geladen werden");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Submit
  const handleSubmit = async () => {
    setError(null);

    if (!templateSlug) {
      setError("Bitte ein Template wählen");
      return;
    }
    if (!subject.trim()) {
      setError("Betreff ist erforderlich");
      return;
    }

    let to: string;
    let mode: "replace" | "additional";

    if (recipientMode === "default") {
      to = kundenEmail;
      mode = "replace";
    } else if (recipientMode === "replace") {
      to = altEmpfaenger;
      mode = "replace";
    } else {
      to = altEmpfaenger;
      mode = "additional";
    }

    if (!to.trim()) {
      setError("Empfänger-E-Mail ist erforderlich");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          anfrageId,
          templateSlug,
          subject: subject.trim(),
          freitext: freitext.trim() || undefined,
          to,
          mode,
        }),
      });

      if (res.ok) {
        toast.success("E-Mail wurde in die Queue eingereiht");
        onSent();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(
          data.error ||
            "E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
        );
      }
    } catch {
      setError(
        "E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="email-modal__overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="email-modal__dialog"
        role="dialog"
        aria-labelledby="email-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="email-modal__header">
          <h2 id="email-modal-title" className="email-modal__title">
            E-Mail senden
          </h2>
          <button
            type="button"
            className="email-modal__close"
            onClick={onClose}
            aria-label="Modal schließen"
          >
            &#10005;
          </button>
        </div>

        {/* Body */}
        <div className="email-modal__body">
          {error && <div className="email-modal__error">{error}</div>}

          {/* Template dropdown */}
          <div className="email-modal__section">
            <label className="text-label" htmlFor="email-template-select">
              Template
            </label>
            <select
              id="email-template-select"
              className="form-select"
              value={templateSlug}
              onChange={(e) => handleTemplateChange(e.target.value)}
              disabled={submitting}
            >
              <option value="">Template wählen...</option>
              {MANUAL_TEMPLATES.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="email-modal__section">
            <label className="text-label" htmlFor="email-subject-input">
              Betreff
            </label>
            <input
              id="email-subject-input"
              className="form-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={submitting}
              placeholder="E-Mail-Betreff eingeben..."
            />
          </div>

          {/* Freitext */}
          <div className="email-modal__section">
            <label className="text-label" htmlFor="email-freitext-textarea">
              Freitext (optional)
            </label>
            <textarea
              id="email-freitext-textarea"
              className="form-textarea"
              rows={4}
              value={freitext}
              onChange={(e) => setFreitext(e.target.value)}
              disabled={submitting}
              placeholder="Optionaler Text, der in die E-Mail eingefügt wird..."
            />
          </div>

          {/* Empfänger */}
          <div className="email-modal__section">
            <label className="text-label" htmlFor="email-empfaenger-input">
              Empfänger
            </label>
            <input
              id="email-empfaenger-input"
              className="form-input"
              type="email"
              value={empfaenger}
              onChange={(e) => setEmpfaenger(e.target.value)}
              disabled={submitting || recipientMode === "default"}
            />
          </div>

          {/* Recipient mode radio group */}
          <div className="email-modal__radio-group">
            <label className="email-modal__radio-label">
              <input
                type="radio"
                name="recipientMode"
                value="default"
                checked={recipientMode === "default"}
                onChange={() => {
                  setRecipientMode("default");
                  setEmpfaenger(kundenEmail);
                }}
              />
              An Kunden-E-Mail ({kundenEmail})
            </label>
            <label className="email-modal__radio-label">
              <input
                type="radio"
                name="recipientMode"
                value="replace"
                checked={recipientMode === "replace"}
                onChange={() => setRecipientMode("replace")}
              />
              Statt Kunde (andere E-Mail)
            </label>
            <label className="email-modal__radio-label">
              <input
                type="radio"
                name="recipientMode"
                value="additional"
                checked={recipientMode === "additional"}
                onChange={() => setRecipientMode("additional")}
              />
              Zusätzlich zu Kunde
            </label>
          </div>

          {/* Alt-Empfänger input */}
          {recipientMode !== "default" && (
            <div className="email-modal__section">
              <label
                className="text-label"
                htmlFor="email-alt-empfaenger-input"
              >
                {recipientMode === "replace"
                  ? "Ersatz-Empfänger"
                  : "Zusätzlicher Empfänger"}
              </label>
              <input
                id="email-alt-empfaenger-input"
                className="form-input"
                type="email"
                value={altEmpfaenger}
                onChange={(e) => setAltEmpfaenger(e.target.value)}
                disabled={submitting}
                placeholder="E-Mail-Adresse eingeben..."
              />
            </div>
          )}

          {/* Preview button */}
          <button
            type="button"
            className="btn-ghost"
            onClick={handlePreview}
            disabled={!templateSlug || previewLoading}
            style={{
              marginTop: "8px",
              opacity: !templateSlug || previewLoading ? 0.6 : 1,
            }}
          >
            {previewLoading ? "Lade Vorschau..." : "Vorschau laden"}
          </button>

          {/* Preview iframe */}
          {previewHtml && (
            <iframe
              className="email-modal__preview-frame"
              srcDoc={previewHtml}
              title="E-Mail Vorschau"
              sandbox="allow-same-origin"
            />
          )}
        </div>

        {/* Footer */}
        <div className="email-modal__footer">
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Abbrechen
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ background: "#3b82f6" }}
            onClick={handleSubmit}
            disabled={submitting || !templateSlug}
          >
            {submitting ? "Wird gesendet..." : "E-Mail senden"}
          </button>
        </div>
      </div>
    </div>
  );
}
