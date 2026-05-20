import type { StatusHistorie } from "@/payload-types";
import {
  STATUS_TAILWIND,
  STATUS_CUSTOMER_TEXT,
  type StatusKey,
} from "@/lib/status-config";

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

interface StatusTimelineProps {
  entries: StatusHistorie[];
}

/**
 * Vertical timeline showing status changes for an Anfrage.
 * Most recent entries at the top (reverse chronological).
 * Does NOT show geaendert_von (who changed the status).
 */
export function StatusTimeline({ entries }: StatusTimelineProps) {
  // Sort reverse chronological (most recent first)
  const sorted = [...entries].sort(
    (a, b) => new Date(b.zeitpunkt).getTime() - new Date(a.zeitpunkt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Noch keine Status-Änderungen vorhanden.
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      {sorted.map((entry, index) => {
        const colors =
          STATUS_TAILWIND[entry.zu_status as keyof typeof STATUS_TAILWIND] ||
          STATUS_TAILWIND.neu;
        const isLast = index === sorted.length - 1;

        return (
          <div key={entry.id} className="relative flex gap-4 pb-6">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-[9px] top-5 h-full w-0.5 bg-border" />
            )}

            {/* Timeline dot */}
            <div
              className={`relative z-10 mt-1 h-[18px] w-[18px] shrink-0 rounded-full border-2 border-background ${colors.dot}`}
            />

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                >
                  {STATUS_CUSTOMER_TEXT[entry.zu_status as StatusKey] ??
                    entry.zu_status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(entry.zeitpunkt)}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {STATUS_CUSTOMER_TEXT[entry.von_status as StatusKey] ??
                  entry.von_status}
                {" → "}
                {STATUS_CUSTOMER_TEXT[entry.zu_status as StatusKey] ??
                  entry.zu_status}
              </p>
              {entry.kommentar && (
                <p className="mt-1 rounded-md bg-muted/50 px-3 py-2 text-sm text-foreground">
                  {entry.kommentar}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Compact status badge for use in lists */
export function StatusBadge({ status }: { status: string }) {
  const colors =
    STATUS_TAILWIND[status as keyof typeof STATUS_TAILWIND] ||
    STATUS_TAILWIND.neu;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {STATUS_CUSTOMER_TEXT[status as StatusKey] ?? status}
    </span>
  );
}
