"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getStatusColor, getStatusLabel } from "@/lib/status-config";
import {
  URGENCY_COLORS,
  isTerminalStatus,
  isCompletedStatus,
  getProduktZusammenfassung,
} from "@/lib/detail-view-helpers";
import type { UrgencyLevel } from "@/lib/detail-view-helpers";
import {
  getScoreColor,
  formatRelativeTime,
  getSmartDefaultTab,
  getLetzeAktion,
} from "@/lib/list-view-helpers";
import { formatCents } from "@/lib/format-currency";
import { ListMenu } from "@/components/admin/list-menu";

const PAGE_SIZE = 25;

const TAB_LABELS: Record<string, string> = {
  alle: "Alle",
  offen: "Offen",
  rueckfrage: "Rückfrage",
  in_produktion: "In Produktion",
  abgeschlossen: "Abgeschlossen",
};

const EMPTY_MESSAGES: Record<string, string> = {
  alle: "Noch keine Anfragen vorhanden.",
  offen: "Keine offenen Anfragen -- alles erledigt.",
  rueckfrage: "Keine Rückfragen offen -- alle beantwortet.",
  in_produktion: "Keine Anfragen in Produktion.",
  abgeschlossen: "Noch keine abgeschlossenen Anfragen.",
};

type SortKey =
  | "attention_score"
  | "anfrage_nummer"
  | "nachname"
  | "wartezeit"
  | "preis"
  | "erstellt";

interface ApiResponse {
  docs: any[];
  totalDocs: number;
  totalPages: number;
  page: number;
  tabCounts: Record<string, number>;
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
  });
}

export default function AnfragenListView() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");

  const router = useRouter();
  const pathname = usePathname();

  const searchQuery = useRef("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  let searchParams: ReturnType<typeof useSearchParams> | null = null;
  try {
    searchParams = useSearchParams();
  } catch {
    // SSR fallback
  }

  const urlTab = searchParams?.get("tab") ?? null;
  const urlPage = searchParams?.get("page") ?? null;
  const urlSort = searchParams?.get("sort") ?? null;
  const urlDir = searchParams?.get("dir") ?? null;
  const urlQ = searchParams?.get("q") ?? null;

  const activeTab =
    urlTab !== null
      ? urlTab
      : apiData?.tabCounts
        ? getSmartDefaultTab(apiData.tabCounts)
        : "alle";
  const page = urlPage ? Math.max(1, parseInt(urlPage, 10) || 1) : 1;
  const sortKey: SortKey = (urlSort as SortKey) || "attention_score";
  const sortDir: "asc" | "desc" = urlDir === "asc" ? "asc" : "desc";

  useEffect(() => {
    if (urlQ) {
      setSearchInput(urlQ);
      searchQuery.current = urlQ;
    }
  }, []);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set(key, value);
    if (key !== "page") {
      params.set("page", "1");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleSortClick(key: SortKey) {
    if (key === sortKey) {
      setParam("dir", sortDir === "desc" ? "asc" : "desc");
    } else {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("sort", key);
      params.set("dir", "desc");
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        tab: activeTab,
        sort: sortKey,
        dir: sortDir,
      });
      if (searchQuery.current) params.set("q", searchQuery.current);

      const res = await fetch(`/api/admin/anfragen-list?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setApiData(data);
    } catch {
      setError("Fehler beim Laden der Anfragen. Bitte Seite neu laden.");
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, sortKey, sortDir]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const newQ = searchInput.trim();
      if (newQ !== searchQuery.current) {
        searchQuery.current = newQ;
        const params = new URLSearchParams(searchParams?.toString() || "");
        if (newQ) {
          params.set("q", newQ);
        } else {
          params.delete("q");
        }
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`);
      }
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchInput]);

  function getSortIndicator(key: SortKey): string {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  }

  function navigateToDoc(docId: string) {
    window.location.href = `/admin/collections/anfragen/${docId}`;
  }

  // Error state
  if (error && !apiData) {
    return (
      <div className="admin-content">
        <div className="list-error-state">{error}</div>
      </div>
    );
  }

  const tabCounts = apiData?.tabCounts ?? {};
  const currentDocs = apiData?.docs ?? [];
  const totalPages = apiData?.totalPages ?? 1;
  const currentPage = apiData?.page ?? page;
  const emptyMessage =
    EMPTY_MESSAGES[activeTab] || "Noch keine Anfragen vorhanden.";

  return (
    <div className="admin-content">
      {/* Header: Tabs + Search */}
      <div className="list-header">
        <div className="list-tabs" role="tablist">
          {Object.keys(TAB_LABELS).map((tabKey) => {
            const active = activeTab === tabKey;
            const count = tabCounts[tabKey] ?? 0;
            return (
              <button
                key={tabKey}
                type="button"
                className={`list-tab__trigger${active ? " list-tab__trigger--active" : ""}`}
                role="tab"
                aria-selected={active}
                onClick={() => setParam("tab", tabKey)}
              >
                {TAB_LABELS[tabKey]} ({count})
              </button>
            );
          })}
        </div>
        <div className="list-search">
          <input
            className="list-search__input"
            placeholder="Suche nach Nr., Name, E-Mail..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="list-table__container">
        <table className="list-table">
          <thead>
            <tr className="list-table__header">
              <th
                className="list-table__header-cell list-table__header-cell--sortable"
                onClick={() => handleSortClick("anfrage_nummer")}
              >
                Nr.{getSortIndicator("anfrage_nummer")}
              </th>
              <th
                className="list-table__header-cell list-table__header-cell--sortable"
                onClick={() => handleSortClick("nachname")}
              >
                Kunde{getSortIndicator("nachname")}
              </th>
              <th className="list-table__header-cell">Status</th>
              <th
                className="list-table__header-cell list-table__header-cell--sortable"
                onClick={() => handleSortClick("wartezeit")}
              >
                Wartezeit{getSortIndicator("wartezeit")}
              </th>
              <th className="list-table__header-cell">Produkte</th>
              <th
                className="list-table__header-cell list-table__header-cell--right list-table__header-cell--sortable"
                onClick={() => handleSortClick("preis")}
              >
                Preis{getSortIndicator("preis")}
              </th>
              <th className="list-table__header-cell">Letzte Aktion</th>
              <th
                className="list-table__header-cell list-table__header-cell--right list-table__header-cell--sortable"
                onClick={() => handleSortClick("erstellt")}
              >
                Erstellt{getSortIndicator("erstellt")}
              </th>
              <th className="list-table__header-cell list-table__header-cell--center">
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="list-empty-state">
                  Lade Anfragen...
                </td>
              </tr>
            ) : currentDocs.length === 0 ? (
              <tr>
                <td colSpan={9} className="list-empty-state">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentDocs.map((doc: any) => {
                const terminal = isTerminalStatus(doc.status);
                const completed = isCompletedStatus(doc.status);
                const terminalOrCompleted = terminal || completed;

                const urgencyLevel = doc._urgencyLevel as UrgencyLevel;
                const waitingDays = doc._waitingDays as number;

                let urgencyClass = "";
                if (!terminalOrCompleted) {
                  if (urgencyLevel === "warn") urgencyClass = " list-table__row--warn";
                  else if (urgencyLevel === "urgent") urgencyClass = " list-table__row--urgent";
                  else if (urgencyLevel === "critical") urgencyClass = " list-table__row--critical";
                }

                const terminalClass = terminalOrCompleted ? " list-table__row--terminal" : "";
                const statusColor = getStatusColor(doc.status);

                // Wartezeit badge
                let wartezeitContent: React.ReactNode = null;
                if (!terminalOrCompleted && urgencyLevel !== "normal") {
                  const urgencyColor = URGENCY_COLORS[urgencyLevel];
                  const wartezeitText = `${waitingDays} ${waitingDays === 1 ? "Tag" : "Tage"}`;
                  wartezeitContent = (
                    <span
                      className="dashboard__table-urgency"
                      style={{
                        color: urgencyColor,
                        background: `${urgencyColor}15`,
                      }}
                    >
                      {wartezeitText}
                    </span>
                  );
                }

                return (
                  <tr
                    key={doc.id}
                    className={`list-table__row${urgencyClass}${terminalClass}`}
                    onClick={() => navigateToDoc(doc.id)}
                  >
                    <td className="list-table__cell list-table__cell--bold">
                      {doc.anfrage_nummer}
                    </td>
                    <td className="list-table__cell">
                      {doc.kontaktdaten?.nachname || "\u2014"}
                    </td>
                    <td className="list-table__cell">
                      <span
                        className="dashboard__table-badge"
                        style={{
                          background: `${statusColor}18`,
                          color: statusColor,
                        }}
                      >
                        {getStatusLabel(doc.status)}
                      </span>
                    </td>
                    <td className="list-table__cell">{wartezeitContent}</td>
                    <td className="list-table__cell list-table__cell--muted">
                      {getProduktZusammenfassung(doc.produkte || [])}
                    </td>
                    <td className="list-table__cell list-table__cell--right list-table__cell--price">
                      {doc.gesamtpreis ? formatCents(doc.gesamtpreis) : "\u2014"}
                    </td>
                    <td className="list-table__cell list-table__cell--muted">
                      {getLetzeAktion(doc.status, doc.last_status_change_at)}
                    </td>
                    <td className="list-table__cell list-table__cell--right list-table__cell--date">
                      {formatShortDate(doc.createdAt)}
                    </td>
                    <td className="list-table__cell list-table__cell--center">
                      <ListMenu
                        anfrageId={doc.id}
                        currentStatus={doc.status}
                        onActionComplete={fetchData}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="list-pagination">
          <span className="list-pagination__info">
            Seite {currentPage} von {totalPages}
          </span>
          <div className="list-pagination__controls">
            <button
              type="button"
              className="list-pagination__btn"
              disabled={currentPage <= 1}
              onClick={() => setParam("page", String(currentPage - 1))}
            >
              Zur\u00fcck
            </button>
            {(() => {
              const pages: (number | "...")[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (currentPage > 3) pages.push("...");
                for (
                  let i = Math.max(2, currentPage - 1);
                  i <= Math.min(totalPages - 1, currentPage + 1);
                  i++
                ) {
                  pages.push(i);
                }
                if (currentPage < totalPages - 2) pages.push("...");
                pages.push(totalPages);
              }
              return pages.map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="list-pagination__ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`list-pagination__btn${p === currentPage ? " list-pagination__btn--active" : ""}`}
                    onClick={() => setParam("page", String(p))}
                  >
                    {p}
                  </button>
                ),
              );
            })()}
            <button
              type="button"
              className="list-pagination__btn"
              disabled={currentPage >= totalPages}
              onClick={() => setParam("page", String(currentPage + 1))}
            >
              Weiter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
