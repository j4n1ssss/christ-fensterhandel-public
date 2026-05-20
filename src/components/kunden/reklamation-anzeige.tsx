interface ReklamationAnzeigeProps {
  reklamation: {
    id: string;
    beschreibung: string;
    status: "offen" | "in_bearbeitung" | "geloest";
    loesung?: string | null;
    fotos?: Array<{ id: string; url?: string; filename?: string }>;
  };
}

const STATUS_CONFIG = {
  offen: {
    border: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-800",
    message: "Ihre Reklamation wird geprüft.",
  },
  in_bearbeitung: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-800",
    message: "Ihre Reklamation wird bearbeitet.",
  },
  geloest: {
    border: "border-green-200",
    bg: "bg-green-50",
    text: "text-green-800",
    message: "Ihre Reklamation wurde gelöst.",
  },
} as const;

/**
 * Server component that displays a single Reklamation's status.
 *
 * Color-coded container:
 * - offen: red
 * - in_bearbeitung: amber
 * - geloest: green (includes loesung text if provided)
 *
 * Shows beschreibung preview and photo thumbnails.
 */
export function ReklamationAnzeige({ reklamation }: ReklamationAnzeigeProps) {
  const config = STATUS_CONFIG[reklamation.status];
  const beschreibungPreview =
    reklamation.beschreibung.length > 200
      ? `${reklamation.beschreibung.slice(0, 200)}...`
      : reklamation.beschreibung;

  return (
    <div className={`rounded-xl border ${config.bg} ${config.border} p-6 mt-4`}>
      <h3 className="text-sm font-bold text-foreground">Ihre Reklamation</h3>

      {/* Status message */}
      <p className={`mt-2 text-sm ${config.text}`}>{config.message}</p>

      {/* Loesung (only when geloest and loesung is provided) */}
      {reklamation.status === "geloest" && reklamation.loesung && (
        <>
          <p className="text-sm font-bold text-foreground mt-3">
            Unsere Maßnahme:
          </p>
          <p className={`text-sm ${STATUS_CONFIG.geloest.text}`}>
            {reklamation.loesung}
          </p>
        </>
      )}

      {/* Beschreibung preview */}
      <p className="text-sm text-muted-foreground mt-3">
        {beschreibungPreview}
      </p>

      {/* Photo thumbnails */}
      {reklamation.fotos && reklamation.fotos.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {reklamation.fotos.map((foto) =>
            foto.url ? (
              <a
                key={foto.id}
                href={foto.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={foto.url}
                  alt="Reklamation Foto"
                  className="w-16 h-16 object-cover rounded-md border border-border"
                />
              </a>
            ) : (
              <span
                key={foto.id}
                className="inline-flex items-center rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
              >
                {foto.filename || "Foto"}
              </span>
            ),
          )}
        </div>
      )}
    </div>
  );
}
