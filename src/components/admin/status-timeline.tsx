"use client";

import React, { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { getStatusColor, getStatusLabel } from "@/lib/status-config";

interface HistoryEntry {
  id: string;
  von_status: string;
  zu_status: string;
  geaendert_von?: { email?: string } | string | null;
  zeitpunkt: string;
  kommentar?: string | null;
}

export function StatusTimeline({ anfrageId }: { anfrageId: string }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!anfrageId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `/api/status_historie?where[anfrage][equals]=${anfrageId}&sort=-zeitpunkt&limit=50`,
          { credentials: "include" },
        );
        if (res.ok) {
          const data = await res.json();
          setEntries(data.docs || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [anfrageId]);

  if (loading) {
    return (
      <div
        style={{
          padding: "16px",
          color: "var(--theme-elevation-500)",
          fontSize: "13px",
        }}
      >
        Lade Status-Historie...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div
        style={{
          padding: "16px",
          color: "var(--theme-elevation-500)",
          fontSize: "13px",
        }}
      >
        Noch keine Statusänderungen.
      </div>
    );
  }

  return (
    <div style={{ position: "relative", paddingLeft: "24px" }}>
      {/* Vertical line */}
      <div
        style={{
          position: "absolute",
          left: "7px",
          top: "8px",
          bottom: "8px",
          width: "2px",
          background: "var(--theme-elevation-200)",
        }}
      />

      {entries.map((entry) => {
        const color = getStatusColor(entry.zu_status);
        const userEmail =
          typeof entry.geaendert_von === "object" && entry.geaendert_von
            ? entry.geaendert_von.email
            : null;
        const isEmailEntry = entry.kommentar?.startsWith("[E-Mail gesendet]");
        const emailKommentar = isEmailEntry
          ? entry.kommentar!.replace("[E-Mail gesendet] ", "")
          : entry.kommentar;
        const dotColor = isEmailEntry ? "#3b82f6" : color;

        return (
          <div
            key={entry.id}
            style={{
              position: "relative",
              paddingBottom: "20px",
              paddingLeft: "8px",
            }}
          >
            {/* Dot */}
            <div
              style={{
                position: "absolute",
                left: "-20px",
                top: "4px",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: dotColor,
                border: "2px solid var(--theme-elevation-50)",
                boxShadow: `0 0 0 2px ${dotColor}40`,
              }}
            />

            <div style={{ fontSize: "13px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                  fontSize: isEmailEntry ? "11px" : undefined,
                  color: isEmailEntry
                    ? "var(--theme-elevation-400)"
                    : undefined,
                }}
              >
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    background: `${getStatusColor(entry.von_status)}18`,
                    color: getStatusColor(entry.von_status),
                  }}
                >
                  {getStatusLabel(entry.von_status)}
                </span>
                <span style={{ color: "var(--theme-elevation-400)" }}>
                  &rarr;
                </span>
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    background: `${color}18`,
                    color,
                  }}
                >
                  {getStatusLabel(entry.zu_status)}
                </span>
              </div>

              <div
                style={{
                  marginTop: "4px",
                  fontSize: "11px",
                  color: "var(--theme-elevation-500)",
                }}
              >
                {new Date(entry.zeitpunkt).toLocaleString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {userEmail && (
                  <span style={{ marginLeft: "8px" }}>von {userEmail}</span>
                )}
              </div>

              {entry.kommentar && (
                <div
                  style={{
                    marginTop: "6px",
                    padding: "6px 10px",
                    background: isEmailEntry
                      ? "var(--theme-elevation-50)"
                      : "var(--theme-elevation-100)",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: isEmailEntry
                      ? "var(--theme-elevation-600)"
                      : "var(--theme-elevation-700)",
                    fontStyle: "italic",
                    borderLeft: `3px solid ${isEmailEntry ? "#3b82f6" : color}`,
                  }}
                >
                  {isEmailEntry && (
                    <Mail
                      size={14}
                      style={{
                        display: "inline",
                        marginRight: "4px",
                        verticalAlign: "middle",
                        color: "#3b82f6",
                      }}
                    />
                  )}
                  {isEmailEntry ? emailKommentar : entry.kommentar}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatusTimeline;
