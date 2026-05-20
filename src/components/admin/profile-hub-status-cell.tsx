"use client";

import { REQUIRED_HUB_FIELDS } from "@/lib/hub-fields";
import { Tooltip } from "@/components/admin/tooltip";

interface CellProps {
  cellData?: unknown;
  rowData?: Record<string, unknown>;
}

export function ProfileHubStatusCell({ rowData }: CellProps) {
  const missingFields = REQUIRED_HUB_FIELDS.filter((field) => {
    const value = rowData?.[field];
    return !Array.isArray(value) || value.length === 0;
  });

  const isComplete = missingFields.length === 0;

  const badge = (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: isComplete ? "#dcfce7" : "#fed7aa",
        color: isComplete ? "#166534" : "#9a3412",
      }}
    >
      {isComplete ? "Vollständig" : "Unvollständig"}
    </span>
  );

  const tooltipText = isComplete
    ? "Alle Pflicht-Hub-Felder befüllt"
    : `Fehlend: ${missingFields.join(", ")}`;

  return <Tooltip content={tooltipText}>{badge}</Tooltip>;
}
