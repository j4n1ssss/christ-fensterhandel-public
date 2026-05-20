"use client";

import React, { useState, useEffect } from "react";
import { getStatusColor, getStatusLabel } from "@/lib/status-config";
import {
  getWaitingDays,
  getUrgencyLevel,
  URGENCY_COLORS,
  isTerminalStatus,
  isCompletedStatus,
} from "@/lib/detail-view-helpers";
import { formatCents, formatNettoBrutto } from "@/lib/format-currency";

interface DashboardStats {
  stats: {
    neueHeute: number;
    offeneGesamt: number;
    bestaetigteMonat: number;
    umsatzCents: number;
    dringend: number;
  };
  statusDistribution: Array<{
    status: string;
    count: number;
    color: string;
    label: string;
  }>;
  letzte10: Array<{
    id: string;
    anfrage_nummer: string;
    kontaktdaten: any;
    status: string;
    gesamtpreis: number;
    createdAt: string;
    last_status_change_at: string;
    statusColor: string;
    statusLabel: string;
  }>;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
  });
}

/** Stat card config — accentColor maps to --stat-accent CSS var */
const STAT_CARDS = [
  { key: "neueHeute", label: "Neue heute", accent: "var(--admin-color-primary)" },
  { key: "offeneGesamt", label: "Offene gesamt", accent: "var(--admin-color-warning)" },
  { key: "bestaetigteMonat", label: "Bestätigt (Monat)", accent: "var(--admin-color-success)" },
  { key: "umsatzCents", label: "Umsatz netto", accent: "#10b981" },
  { key: "dringend", label: "Dringend", accent: "var(--admin-color-destructive)" },
] as const;

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/dashboard-stats", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Fetch failed");
        const json = await res.json();
        setData(json);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading">Wird geladen...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard__error">
          Dashboard-Daten konnten nicht geladen werden.
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const totalDistribution = data?.statusDistribution?.reduce((sum, s) => sum + s.count, 0) ?? 0;

  return (
    <div className="dashboard">
      {/* Greeting */}
      <h2 className="dashboard__greeting">Dashboard</h2>

      {/* Stat Cards */}
      <div className="dashboard__stats">
        {STAT_CARDS.map((card, i) => {
          let value: string | number = "--";
          if (stats) {
            if (card.key === "umsatzCents") {
              value = formatCents(stats.umsatzCents ?? 0);
            } else {
              value = stats[card.key as keyof typeof stats] ?? 0;
            }
          }

          return (
            <div
              key={card.key}
              className="dashboard__stat"
              style={{
                "--stat-accent": card.accent,
                animationDelay: `${i * 60}ms`,
              } as React.CSSProperties}
            >
              <div className="dashboard__stat-label">{card.label}</div>
              <div className="dashboard__stat-value">
                {value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Distribution */}
      {data?.statusDistribution && data.statusDistribution.length > 0 && (
        <div className="dashboard__section" style={{ animationDelay: "0.35s" }}>
          <div className="dashboard__section-title">Status-Verteilung</div>
          <div className="dashboard__status-bar-container">
            {/* Proportional Bar */}
            <div className="dashboard__status-bar">
              {data.statusDistribution.map((s) => (
                <div
                  key={s.status}
                  className="dashboard__status-bar-segment"
                  style={{
                    flex: totalDistribution > 0 ? s.count / totalDistribution : 0,
                    background: s.color,
                  }}
                  title={`${s.label}: ${s.count}`}
                />
              ))}
            </div>
            {/* Legend */}
            <div className="dashboard__status-legend">
              {data.statusDistribution.map((s) => (
                <div key={s.status} className="dashboard__status-legend-item">
                  <span
                    className="dashboard__status-legend-dot"
                    style={{ background: s.color }}
                  />
                  {s.label}
                  <span className="dashboard__status-legend-count">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Letzte 10 Anfragen */}
      <div className="dashboard__section" style={{ animationDelay: "0.4s" }}>
        <div className="dashboard__section-title">Letzte Anfragen</div>
        <div className="dashboard__table-container">
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Nr.</th>
                <th>Kunde</th>
                <th>Status</th>
                <th>Wartezeit</th>
                <th>Preis</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              {data?.letzte10?.map((doc) => {
                const wartezeitRef = doc.last_status_change_at || doc.createdAt;
                const days = getWaitingDays(wartezeitRef);
                const urgency = getUrgencyLevel(days);
                const showUrgency =
                  urgency !== "normal" &&
                  !isTerminalStatus(doc.status) &&
                  !isCompletedStatus(doc.status);
                const urgencyColor = URGENCY_COLORS[urgency];

                return (
                  <tr key={doc.id}>
                    <td>
                      <a
                        href={`/admin/collections/anfragen/${doc.id}`}
                        className="dashboard__table-link"
                      >
                        {doc.anfrage_nummer}
                      </a>
                    </td>
                    <td>{doc.kontaktdaten?.nachname || "\u2014"}</td>
                    <td>
                      <span
                        className="dashboard__table-badge"
                        style={{
                          background: `${doc.statusColor}18`,
                          color: doc.statusColor,
                        }}
                      >
                        {doc.statusLabel}
                      </span>
                    </td>
                    <td>
                      {showUrgency ? (
                        <span
                          className="dashboard__table-urgency"
                          style={{
                            color: urgencyColor,
                            background: `${urgencyColor}15`,
                          }}
                        >
                          {urgency === "critical"
                            ? `${days} Tage`
                            : `${days} ${days === 1 ? "Tag" : "Tage"}`}
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <span className="dashboard__table-price">
                        {doc.gesamtpreis ? formatCents(doc.gesamtpreis) : "\u2014"}
                      </span>
                    </td>
                    <td>
                      <span className="dashboard__table-date">
                        {formatShortDate(doc.createdAt)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {(!data?.letzte10 || data.letzte10.length === 0) && (
                <tr>
                  <td colSpan={6} className="dashboard__table-empty">
                    Noch keine Anfragen vorhanden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
