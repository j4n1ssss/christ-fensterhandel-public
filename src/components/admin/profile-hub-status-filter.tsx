"use client";

import { useListQuery } from "@payloadcms/ui";
import { REQUIRED_HUB_FIELDS } from "@/lib/hub-fields";
import { useCallback, useState } from "react";
import type { Where } from "payload";

/**
 * Filter toggle for the Profile list view.
 * When active, shows only profiles with incomplete Hub fields.
 * Registered via admin.components.beforeListTable in profile.ts.
 */
export function ProfileHubStatusFilter() {
  const { handleWhereChange } = useListQuery();
  const [isFiltered, setIsFiltered] = useState(false);

  const toggleFilter = useCallback(async () => {
    if (isFiltered) {
      // Remove filter -- show all profiles
      await handleWhereChange?.({} as Where);
      setIsFiltered(false);
    } else {
      // Build OR clause: any required hub field empty/missing = incomplete
      const orClauses = REQUIRED_HUB_FIELDS.map((field) => ({
        [field]: { exists: false },
      }));
      const where: Where = { or: orClauses };
      await handleWhereChange?.(where);
      setIsFiltered(true);
    }
  }, [isFiltered, handleWhereChange]);

  return (
    <div style={{ padding: "0 0 8px 0" }}>
      <button
        onClick={toggleFilter}
        type="button"
        style={{
          padding: "4px 12px",
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 500,
          border: "1px solid var(--theme-elevation-250)",
          backgroundColor: isFiltered ? "#fed7aa" : "transparent",
          color: isFiltered ? "#9a3412" : "var(--theme-elevation-800)",
          cursor: "pointer",
        }}
      >
        {isFiltered
          ? "Filter aktiv: Nur unvollstaendige"
          : "Nur unvollstaendige anzeigen"}
      </button>
    </div>
  );
}
