"use client";

import { useState, useRef } from "react";
import { Loader2, AlertTriangle, Paperclip, X } from "lucide-react";
import {
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  MAX_REKLAMATION_FILES,
} from "@/lib/upload-constants";
import { trackEvent } from "@/lib/tracking/pirsch";

interface ReklamationFormularProps {
  anfrageId: string;
  isGuest?: boolean;
  onSuccess?: () => void;
}

type FormState = "collapsed" | "expanded" | "submitting" | "submitted";

/**
 * Inline complaint form for submitting a Reklamation with photo upload.
 *
 * Follows the RueckfrageFormular inline-expand pattern:
 * Collapsed (button) -> Expanded (form) -> Submitting (loading) -> Submitted (success)
 *
 * Supports file upload (max 5 files, 10MB each, images + PDF).
 * In guest mode (isGuest=true), the form starts expanded without a collapse option.
 */
export function ReklamationFormular({
  anfrageId,
  isGuest = false,
  onSuccess,
}: ReklamationFormularProps) {
  const [state, setState] = useState<FormState>(
    isGuest ? "expanded" : "collapsed",
  );
  const [beschreibung, setBeschreibung] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    beschreibung?: string;
    fotos?: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validateFiles(newFiles: File[]): string | null {
    if (newFiles.length > MAX_REKLAMATION_FILES) {
      return "Maximal 5 Dateien erlaubt.";
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
      setFieldErrors((prev) => ({ ...prev, fotos: fileError }));
      return;
    }

    setFieldErrors((prev) => ({ ...prev, fotos: undefined }));
    setFiles(combined);

    // Reset input so re-selecting the same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFieldErrors((prev) => ({ ...prev, fotos: undefined }));
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleSubmit() {
    // Client-side validation
    const errors: { beschreibung?: string; fotos?: string } = {};

    if (beschreibung.trim().length < 20) {
      errors.beschreibung = "Mindestens 20 Zeichen erforderlich";
    }

    const fileError = validateFiles(files);
    if (fileError) {
      errors.fotos = fileError;
    }

    if (errors.beschreibung || errors.fotos) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError(null);
    setState("submitting");

    try {
      const formData = new FormData();
      formData.append("anfrageId", anfrageId);
      formData.append("beschreibung", beschreibung.trim());
      files.forEach((f) => formData.append("fotos", f));

      const res = await fetch("/api/kunden/reklamation", {
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
      trackEvent("Reklamation abgeschickt", {
        foto_anzahl: files.length,
        gast: isGuest ? "ja" : "nein",
      });

      // Call onSuccess after short delay to let user see the success message
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
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
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-normal text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <AlertTriangle className="h-4 w-4" />
        Reklamation melden
      </button>
    );
  }

  // --- Submitted state: success message ---
  if (state === "submitted") {
    return (
      <div
        className="rounded-xl border border-green-200 bg-green-50 p-4"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm text-green-800">
          Ihre Reklamation wurde erfolgreich eingereicht. Wir werden sie
          prüfen.
        </p>
      </div>
    );
  }

  const isSubmitting = state === "submitting";
  const beschreibungId = `reklamation-beschreibung-${anfrageId}`;
  const beschreibungErrorId = `${beschreibungId}-error`;
  const fotosErrorId = `reklamation-fotos-${anfrageId}-error`;

  // --- Expanded / Submitting state: form ---
  return (
    <div
      className={`rounded-xl border border-border bg-card p-6 mt-4 ${isSubmitting ? "cursor-wait opacity-50" : ""}`}
      aria-live="polite"
    >
      <h3 className="text-sm font-bold text-foreground mb-4">
        Reklamation einreichen
      </h3>

      {/* Beschreibung */}
      <label
        htmlFor={beschreibungId}
        className="block text-sm font-normal text-foreground"
      >
        Beschreibung des Problems
      </label>
      <textarea
        id={beschreibungId}
        value={beschreibung}
        onChange={(e) => {
          setBeschreibung(e.target.value);
          if (e.target.value.trim().length >= 20) {
            setFieldErrors((prev) => ({ ...prev, beschreibung: undefined }));
          }
        }}
        onBlur={() => {
          if (
            beschreibung.trim().length > 0 &&
            beschreibung.trim().length < 20
          ) {
            setFieldErrors((prev) => ({
              ...prev,
              beschreibung: "Mindestens 20 Zeichen erforderlich",
            }));
          }
        }}
        placeholder="Beschreiben Sie das Problem so genau wie möglich. Mindestens 20 Zeichen."
        required
        minLength={20}
        disabled={isSubmitting}
        aria-invalid={!!fieldErrors.beschreibung}
        aria-describedby={
          fieldErrors.beschreibung ? beschreibungErrorId : undefined
        }
        className="mt-1 min-h-24 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
      />
      {fieldErrors.beschreibung && (
        <p id={beschreibungErrorId} className="mt-1 text-xs text-red-600">
          {fieldErrors.beschreibung}
        </p>
      )}

      {/* File upload section */}
      <p className="mt-4 text-sm font-normal text-foreground">
        Fotos anhängen (optional)
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Bis zu 5 Fotos, max. 10 MB pro Datei (Bilder oder PDF)
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

      {/* File list with thumbnails */}
      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-16 h-16 object-cover rounded-md border border-border"
                />
              ) : (
                <span className="truncate">{file.name}</span>
              )}
              {file.type.startsWith("image/") && (
                <span className="truncate">{file.name}</span>
              )}
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

      {fieldErrors.fotos && (
        <p id={fotosErrorId} className="mt-1 text-xs text-red-600">
          {fieldErrors.fotos}
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
            "Reklamation einreichen"
          )}
        </button>
        {!isGuest && (
          <button
            type="button"
            onClick={() => {
              setState("collapsed");
              setBeschreibung("");
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
