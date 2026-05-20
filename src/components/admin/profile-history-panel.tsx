"use client";

import React, { useEffect, useState } from "react";
import { useDocumentInfo } from "@payloadcms/ui";
import { ChevronDown } from "lucide-react";
import type { DiffEntry } from "@/lib/diff-utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ResolvedEditor {
  id: string;
  vorname?: string;
  nachname?: string;
  email: string;
}

interface EditHistoryEntry {
  id: string;
  collection: string;
  doc_id: string;
  event: string; // 'create' | 'update' | 'save_no_changes'
  diff: DiffEntry[] | null;
  editor: ResolvedEditor | string | null;
  timestamp: string; // ISO date
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_VISIBLE_FIELD_BADGES = 3;

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const EVENT_STYLES: Record<
  string,
  { background: string; color: string; label: string }
> = {
  update: {
    background: "rgba(59, 130, 246, 0.12)",
    color: "#3b82f6",
    label: "update",
  },
  create: {
    background: "rgba(34, 197, 94, 0.12)",
    color: "#22c55e",
    label: "create",
  },
  save_no_changes: {
    background: "rgba(107, 114, 128, 0.12)",
    color: "#6b7280",
    label: "keine Änderungen",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEditorName(editor: ResolvedEditor | string | null): string {
  if (!editor) return "";
  if (typeof editor === "string") return editor;
  const parts = [editor.vorname, editor.nachname].filter(Boolean);
  const name = parts.join(" ");
  return name ? `${name} (${editor.email})` : editor.email;
}

/**
 * Format a diff value for display.
 * - Relationship arrays: comma-separated labels
 * - Single relationship: label string
 * - Null/undefined: "(leer)" in italic
 * - Primitive values: String(value)
 */
function formatDiffValue(value: unknown): { text: string; isNull: boolean } {
  if (value === null || value === undefined) {
    return { text: "(leer)", isNull: true };
  }

  // Relationship array: [{ id, label }, ...]
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { text: "(leer)", isNull: true };
    }
    // Check if array items have label property (resolved relationship)
    if (
      typeof value[0] === "object" &&
      value[0] !== null &&
      "label" in value[0]
    ) {
      const labels = value.map(
        (item: { id: string; label: string }) => item.label,
      );
      return { text: labels.join(", "), isNull: false };
    }
    // Plain array of strings/numbers
    return { text: value.map(String).join(", "), isNull: false };
  }

  // Single relationship object: { id, label }
  if (typeof value === "object" && value !== null && "label" in value) {
    return {
      text: (value as { label: string }).label,
      isNull: false,
    };
  }

  return { text: String(value), isNull: false };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EventBadge({ event }: { event: string }) {
  const style = EVENT_STYLES[event] ?? EVENT_STYLES.update;
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        background: style.background,
        color: style.color,
        whiteSpace: "nowrap",
      }}
    >
      {style.label}
    </span>
  );
}

function FieldBadge({ field }: { field: string }) {
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        background: "var(--theme-elevation-100)",
        color: "var(--theme-elevation-700)",
      }}
    >
      {field}
    </span>
  );
}

function DiffValue({ value, type }: { value: unknown; type: "from" | "to" }) {
  const formatted = formatDiffValue(value);
  const isFrom = type === "from";

  return (
    <div
      style={{
        padding: "4px 8px",
        borderLeft: `3px solid ${isFrom ? "#ef4444" : "#22c55e"}`,
        background: isFrom
          ? "rgba(239, 68, 68, 0.08)"
          : "rgba(34, 197, 94, 0.08)",
        fontSize: 12,
        color: isFrom ? "#dc2626" : "#16a34a",
        marginTop: isFrom ? 0 : 4,
      }}
    >
      <span style={{ fontWeight: 600 }}>{isFrom ? "- " : "+ "}</span>
      {formatted.isNull ? (
        <span style={{ fontStyle: "italic" }}>{formatted.text}</span>
      ) : (
        formatted.text
      )}
    </div>
  );
}

function DiffDetail({ diff }: { diff: DiffEntry[] }) {
  return (
    <div
      style={{
        padding: "8px 16px 16px 16px",
        background: "var(--theme-elevation-50)",
      }}
    >
      {diff.map((entry, index) => (
        <div
          key={entry.field}
          style={{
            marginBottom: index < diff.length - 1 ? 12 : 0,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--theme-elevation-700)",
              marginBottom: 4,
            }}
          >
            {entry.field}
          </div>
          <DiffValue value={entry.from} type="from" />
          <DiffValue value={entry.to} type="to" />
        </div>
      ))}
    </div>
  );
}

function HistoryEntry({ entry }: { entry: EditHistoryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasDiff =
    entry.diff !== null && Array.isArray(entry.diff) && entry.diff.length > 0;
  const isCreate = entry.event === "create";
  const isNoChanges = entry.event === "save_no_changes";
  const fields = hasDiff ? entry.diff!.map((d) => d.field) : [];
  const visibleFields = fields.slice(0, MAX_VISIBLE_FIELD_BADGES);
  const overflowCount = fields.length - MAX_VISIBLE_FIELD_BADGES;

  const formattedTimestamp = dateFormatter.format(new Date(entry.timestamp));
  const editorDisplay = formatEditorName(entry.editor);

  return (
    <div>
      {/* Collapsed row */}
      <div
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--theme-elevation-200)",
          cursor: "pointer",
          background: isHovered ? "var(--theme-elevation-50)" : "transparent",
        }}
      >
        {/* Top row: event badge + timestamp + editor + chevron */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <EventBadge event={entry.event} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 400,
              color: "var(--theme-elevation-500)",
            }}
          >
            {formattedTimestamp}
            {editorDisplay && ` \u2014 ${editorDisplay}`}
          </span>
          <ChevronDown
            size={14}
            style={{
              marginLeft: "auto",
              color: "var(--theme-elevation-400)",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.15s ease",
              flexShrink: 0,
            }}
          />
        </div>

        {/* Field badges row */}
        {isCreate && (
          <div
            style={{
              marginTop: 4,
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
            }}
          >
            <FieldBadge field="Erstellt" />
          </div>
        )}
        {!isCreate && !isNoChanges && visibleFields.length > 0 && (
          <div
            style={{
              marginTop: 4,
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
            }}
          >
            {visibleFields.map((field) => (
              <FieldBadge key={field} field={field} />
            ))}
            {overflowCount > 0 && (
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "var(--theme-elevation-100)",
                  color: "var(--theme-elevation-700)",
                }}
              >
                +{overflowCount} weitere
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && hasDiff && <DiffDetail diff={entry.diff!} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * ProfileHistoryPanel -- Document view tab at /profile/{id}/history.
 *
 * Fetches the last 50 edit_history entries for the current profile document
 * from the REST API and displays them with expand/collapse diffs.
 */
export function ProfileHistoryPanel() {
  const { id } = useDocumentInfo();
  const [entries, setEntries] = useState<EditHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchHistory() {
      try {
        const params = new URLSearchParams({
          "where[collection][equals]": "profile",
          "where[doc_id][equals]": String(id),
          sort: "-timestamp",
          limit: "50",
          depth: "1",
        });

        const response = await fetch(`/api/edit_history?${params.toString()}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setEntries(data.docs ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Panel-level states
  if (loading) {
    return (
      <div
        style={{
          padding: 16,
          fontSize: 13,
          color: "var(--theme-elevation-500)",
        }}
      >
        Lade Historie...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 16,
          fontSize: 13,
          color: "var(--theme-elevation-500)",
        }}
      >
        Historie konnte nicht geladen werden.
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div
        style={{
          padding: 16,
          fontSize: 13,
          color: "var(--theme-elevation-500)",
        }}
      >
        Noch keine Änderungen protokolliert.
      </div>
    );
  }

  return (
    <div>
      {entries.map((entry) => (
        <HistoryEntry key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
