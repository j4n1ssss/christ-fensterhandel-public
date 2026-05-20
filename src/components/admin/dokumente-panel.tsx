"use client";

import React, { useEffect, useState, useCallback } from "react";
import { formatCents } from "@/lib/format-currency";

interface Dokument {
  id: string;
  typ: "angebot" | "rechnung" | "gutschrift";
  nummer: string;
  version?: number;
  createdAt: string;
  filename: string;
  betrag_brutto_cents?: number;
  status?: string;
}

interface DokumentePanelProps {
  anfrageId: string;
  anfrageNummer: string;
  userRole: string;
  onOpenAngebotsModal?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  angebot: "ANG",
  rechnung: "RE",
  gutschrift: "GS",
};

const ANGEBOT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  entwurf: { bg: "#f3f4f6", text: "#6b7280" },
  versendet: { bg: "#dbeafe", text: "#1d4ed8" },
};

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function DokumentePanel({
  anfrageId,
  anfrageNummer,
  userRole,
  onOpenAngebotsModal,
}: DokumentePanelProps) {
  const [dokumente, setDokumente] = useState<Dokument[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDokumente = useCallback(async () => {
    try {
      const [angeboteRes, rechnungenRes] = await Promise.all([
        fetch(
          `/api/angebote?where[anfrage][equals]=${anfrageId}&sort=-createdAt&limit=50&depth=1`,
          { credentials: "include" },
        ),
        fetch(
          `/api/rechnungen?where[anfrage][equals]=${anfrageId}&sort=-createdAt&limit=50&depth=1`,
          { credentials: "include" },
        ),
      ]);

      const angeboteData = angeboteRes.ok
        ? await angeboteRes.json()
        : { docs: [] };
      const rechnungenData = rechnungenRes.ok
        ? await rechnungenRes.json()
        : { docs: [] };

      const allDocs: Dokument[] = [
        ...(angeboteData.docs || []).map((a: any) => ({
          id: a.id,
          typ: "angebot" as const,
          nummer: a.nummer || "",
          version: a.version,
          createdAt: a.createdAt,
          filename:
            a.pdf?.filename || `Angebot_${anfrageNummer}_V${a.version}.pdf`,
          betrag_brutto_cents: a.betrag_brutto_cents,
          status: a.status,
        })),
        ...(rechnungenData.docs || []).map((r: any) => ({
          id: r.id,
          typ: r.typ as "rechnung" | "gutschrift",
          nummer: r.nummer || "",
          createdAt: r.createdAt,
          filename:
            r.pdf?.filename ||
            `${r.typ === "gutschrift" ? "Gutschrift" : "Rechnung"}_${anfrageNummer}.pdf`,
        })),
      ];

      // Sort newest first
      allDocs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setDokumente(allDocs);
    } catch {
      // ignore fetch errors
    } finally {
      setLoading(false);
    }
  }, [anfrageId, anfrageNummer]);

  useEffect(() => {
    loadDokumente();
  }, [loadDokumente]);

  const getDownloadUrl = (dok: Dokument): string => {
    return `/api/pdf/${dok.typ}/${anfrageId}?id=${dok.id}`;
  };

  const getDisplayFilename = (dok: Dokument): string => {
    if (dok.typ === "angebot") {
      return `Angebot ${anfrageNummer} V${dok.version || 1}`;
    }
    if (dok.typ === "gutschrift") {
      return `Gutschrift ${anfrageNummer}`;
    }
    return `Rechnung ${anfrageNummer}`;
  };

  const hasAngebote = dokumente.some((d) => d.typ === "angebot");
  const isStaff = userRole === "admin" || userRole === "mitarbeiter";

  return (
    <div className="dokumente-panel">
      <div className="dokumente-panel__header">
        <span className="text-heading">Dokumente</span>
        {isStaff && !hasAngebote && onOpenAngebotsModal && (
          <button
            type="button"
            className="btn-dokument-create"
            onClick={onOpenAngebotsModal}
          >
            Angebot erstellen
          </button>
        )}
      </div>

      {loading ? (
        <div className="dokumente-panel__empty">Lade Dokumente...</div>
      ) : dokumente.length === 0 ? (
        <div className="dokumente-panel__empty">
          Noch keine Dokumente vorhanden.
        </div>
      ) : (
        <div className="dokumente-list">
          {dokumente.map((dok) => (
            <div key={`${dok.typ}-${dok.id}`} className="dokument-row">
              {/* Row 1: Badge + Filename */}
              <div className="dokument-row__primary">
                <span className="dokument-row__type-badge">
                  {TYPE_LABELS[dok.typ] || dok.typ}
                </span>
                <span className="dokument-row__filename">
                  {getDisplayFilename(dok)}
                </span>
              </div>
              {/* Row 2: Betrag + Status + Datum | Download */}
              <div className="dokument-row__secondary">
                <div className="dokument-row__secondary-left">
                  {dok.typ === "angebot" && dok.betrag_brutto_cents != null && (
                    <span className="dokument-row__betrag">
                      {formatCents(dok.betrag_brutto_cents)}
                    </span>
                  )}
                  {dok.typ === "angebot" && dok.status && (
                    <span
                      className="status-badge"
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        background:
                          ANGEBOT_STATUS_COLORS[dok.status]?.bg || "#f3f4f6",
                        color:
                          ANGEBOT_STATUS_COLORS[dok.status]?.text || "#6b7280",
                      }}
                    >
                      {dok.status === "versendet"
                        ? "Versendet"
                        : dok.status === "entwurf"
                          ? "Entwurf"
                          : dok.status}
                    </span>
                  )}
                  <span className="dokument-row__meta">
                    {formatDate(dok.createdAt)}
                  </span>
                </div>
                <a
                  href={getDownloadUrl(dok)}
                  className="dokument-row__download"
                  download
                >
                  Herunterladen
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* "+ Neues Angebot erstellen" button below list */}
      {!loading && isStaff && hasAngebote && onOpenAngebotsModal && (
        <div style={{ marginTop: "16px" }}>
          <button
            type="button"
            className="btn-dokument-create"
            onClick={onOpenAngebotsModal}
          >
            + Neues Angebot erstellen
          </button>
        </div>
      )}
    </div>
  );
}
