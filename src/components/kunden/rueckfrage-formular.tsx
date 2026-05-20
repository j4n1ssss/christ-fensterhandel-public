"use client";

import { useState, useRef } from "react";
import { Loader2, Paperclip, X } from "lucide-react";
import {
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  MAX_RUECKFRAGE_FILES,
} from "@/lib/upload-constants";
import { trackEvent } from "@/lib/tracking/pirsch";

interface RueckfrageFormularProps {
  anfrageId: string;
  isGuest?: boolean;
}

type FormState = "collapsed" | "expanded" | "submitting" | "submitted";

/**
 * Inline answer form for responding to a Rueckfrage.
 *
 * Follows the AngebotAnnahmeButton inline-expand pattern:
 * Collapsed (button) -> Expanded (form) -> Submitting (loading) -> Submitted (success)
 *
 * Supports file upload (max 3 files, 10MB each, images + PDF).
 * In guest mode (isGuest=true), the form starts expanded without a collapse option.
 */
export function RueckfrageFormular({
  anfrageId,
  isGuest = false,
}: RueckfrageFormularProps) {
  const [state, setState] = useState<FormState>(
    isGuest ? "expanded" : "collapsed",
  );
  const [nachricht, setNachricht] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    nachricht?: string;
    dateien?: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validateFiles(newFiles: File[]): string | null {
    if (newFiles.length > MAX_RUECKFRAGE_FILES) {
      return "Maximal 3 Dateien erlaubt.";
    }
    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return "Datei zu groß. Maximale Dateigröße ist 10 MB.";
      }
      if (
        !ALLOWED_FILE_TYPES.includes(
          file.type as (typeof ALLOWED_FILE_TYPES)[number],
        )
      ) {
        return "Nur Bilder (JPEG, PNG, WebP, HEIC) und PDF-Dateien erlaubt.";
      }
    }
    return null;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    const combined = [...files, ...selected];

    const fileError = validateFiles(combined);
    if (fileError) {
      setFieldErrors((prev) => ({ ...prev, dateien: fileError }));
      return;
    }

    setFieldErrors((prev) => ({ ...prev, dateien: undefined }));
    setFiles(combined);

    // Reset input so re-selecting the same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFieldErrors((prev) => ({ ...prev, dateien: undefined }));
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleSubmit() {
    // Client-side validation
    const errors: { nachricht?: string; dateien?: string } = {};

    if (nachricht.trim().length < 10) {
      errors.nachricht = "Mindestens 10 Zeichen erforderlich";
    }

    const fileError = validateFiles(files);
    if (fileError) {
      errors.dateien = fileError;
    }

    if (errors.nachricht || errors.dateien) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError(null);
    setState("submitting");

    try {
      const formData = new FormData();
      formData.append("anfrageId", anfrageId);
      formData.append("nachricht", nachricht.trim());
      files.forEach((f) => formData.append("dateien", f));

      const res = await fetch("/api/kunden/antwort", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Übermittlung fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.",
        );
        setState("expanded");
        return;
      }

      setState("submitted");
      trackEvent("Rückfrage abgeschickt", {
        anhang_anzahl: files.length,
        gast: isGuest ? "ja" : "nein",
      });
    } catch {
      setError(
        "Übermittlung fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.",
      );
      setState("expanded");
    }
  }

  // --- Collapsed state: show CTA button ---
  if (state === "collapsed") {
    return (
      <button
        type="button"
        onClick={() => setState("expanded")}
        className="rounded-lg bg-primary px-4 py-3 text-sm font-normal text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Jetzt antworten
      </button>
    );
  }

  // --- Submitted state: success message ---
  if (state === "submitted") {
    return (
      <div
        className="rounded-xl border border-cyan-200 bg-cyan-50 p-4"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm text-cyan-800">
          Ihre Antwort wurde erfolgreich übermittelt. Wir melden uns bei Ihnen.
        </p>
      </div>
    );
  }

  const isSubmitting = state === "submitting";
  const nachrichtId = `rueckfrage-nachricht-${anfrageId}`;
  const nachrichtErrorId = `${nachrichtId}-error`;
  const dateienErrorId = `rueckfrage-dateien-${anfrageId}-error`;

  // --- Expanded / Submitting state: form ---
  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 mt-3 ${isSubmitting ? "cursor-wait opacity-50" : ""}`}
      aria-live="polite"
    >
      {/* Textarea */}
      <label
        htmlFor={nachrichtId}
        className="block text-sm font-normal text-foreground"
      >
        Ihre Antwort
      </label>
      <textarea
        id={nachrichtId}
        value={nachricht}
        onChange={(e) => {
          setNachricht(e.target.value);
          if (e.target.value.trim().length >= 10) {
            setFieldErrors((prev) => ({ ...prev, nachricht: undefined }));
          }
        }}
        onBlur={() => {
          if (nachricht.trim().length > 0 && nachricht.trim().length < 10) {
            setFieldErrors((prev) => ({
              ...prev,
              nachricht: "Mindestens 10 Zeichen erforderlich",
            }));
          }
        }}
        placeholder="Schreiben Sie hier Ihre Antwort..."
        required
        minLength={10}
        disabled={isSubmitting}
        aria-invalid={!!fieldErrors.nachricht}
        aria-describedby={fieldErrors.nachricht ? nachrichtErrorId : undefined}
        className="mt-1 min-h-24 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
      />
      {fieldErrors.nachricht && (
        <p id={nachrichtErrorId} className="mt-1 text-xs text-red-600">
          {fieldErrors.nachricht}
        </p>
      )}

      {/* File upload section */}
      <p className="mt-4 text-sm font-normal text-foreground">
        Dateien anhängen (optional)
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Bis zu 3 Dateien, max. 10 MB pro Datei (Bilder oder PDF)
      </p>

      <label
        className={`mt-2 flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-border p-4 text-center transition-colors hover:border-primary/50 ${isSubmitting ? "pointer-events-none" : ""}`}
      >
        <Paperclip className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Dateien auswählen
        </span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_FILE_TYPES.join(",")}
          onChange={handleFileChange}
          disabled={isSubmitting}
          className="hidden"
        />
      </label>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 text-xs">
                ({formatFileSize(file.size)})
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={isSubmitting}
                aria-label={`${file.name} entfernen`}
                className="shrink-0"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
              </button>
            </div>
          ))}
        </div>
      )}

      {fieldErrors.dateien && (
        <p id={dateienErrorId} className="mt-1 text-xs text-red-600">
          {fieldErrors.dateien}
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
            "Antwort absenden"
          )}
        </button>
        {!isGuest && (
          <button
            type="button"
            onClick={() => {
              setState("collapsed");
              setNachricht("");
              setFiles([]);
              setError(null);
              setFieldErrors({});
            }}
            disabled={isSubmitting}
            className="text-sm text-muted-foreground underline cursor-pointer"
          >
            Formular schließen
          </button>
        )}
      </div>
    </div>
  );
}
