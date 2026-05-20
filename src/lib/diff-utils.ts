/**
 * Diff utility library for computing field-level changes between
 * Payload CMS documents (Profile collection).
 *
 * Pure functions for diff computation + async relationship label resolution.
 */

export interface DiffEntry {
  field: string;
  from: unknown;
  to: unknown;
}

/**
 * Fields excluded from diff computation.
 * These are system fields that change on every save and are not meaningful changes.
 */
export const EXCLUDED_FIELDS = new Set([
  "updatedAt",
  "createdAt",
  "id",
  "last_edited_by",
]);

/**
 * Relationship fields on the Profile collection that need label resolution.
 * Maps field name to the target collection slug and its title field.
 */
export const RELATIONSHIP_FIELDS: Record<
  string,
  { collection: string; titleField: string }
> = {
  material: { collection: "materialien", titleField: "name" },
  erlaubte_produkttypen: { collection: "produkttypen", titleField: "name" },
  erlaubte_fensterformen: { collection: "fensterformen", titleField: "name" },
  erlaubte_fluegelanzahl: { collection: "fluegelanzahl", titleField: "name" },
  erlaubte_oeffnungsarten: { collection: "oeffnungsarten", titleField: "name" },
  erlaubte_zusatzlichter: { collection: "zusatzlichter", titleField: "name" },
  erlaubte_farben: { collection: "farben", titleField: "name" },
  erlaubte_dichtungsfarben: {
    collection: "dichtungsfarben",
    titleField: "name",
  },
  erlaubte_verglasungen: { collection: "verglasungen", titleField: "name" },
  erlaubte_schallschutz: { collection: "schallschutz", titleField: "name" },
  erlaubte_sicherheitsglas: {
    collection: "sicherheitsglas",
    titleField: "name",
  },
  erlaubte_glasdekore: { collection: "glasdekore", titleField: "name" },
  erlaubte_sprossen: { collection: "sprossen", titleField: "name" },
  erlaubte_extras: { collection: "extras", titleField: "name" },
};

/**
 * Fields that are Payload "group" type on the Profile collection.
 * These need sub-key comparison with dot-path notation.
 */
export const GROUP_FIELDS = new Set(["technische_daten", "masse"]);

/**
 * The hasMany relationship fields (all erlaubte_* fields).
 * material is a single relationship (not hasMany).
 */
const HAS_MANY_RELATIONSHIP_FIELDS = new Set(
  Object.keys(RELATIONSHIP_FIELDS).filter((key) => key !== "material"),
);

/**
 * Normalize a value to null if it is null, undefined, or missing.
 */
function normalizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  return value;
}

/**
 * Normalize a hasMany relationship value to a sorted string array.
 * Treats null, undefined, and empty arrays as equivalent.
 */
function normalizeHasManyValue(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return [...value].sort();
  return [];
}

/**
 * Compare two group field objects and return diff entries with dot-path notation.
 */
function compareGroupField(
  fieldName: string,
  prevGroup: Record<string, unknown> | null | undefined,
  nextGroup: Record<string, unknown> | null | undefined,
): DiffEntry[] {
  const diffs: DiffEntry[] = [];
  const prev = prevGroup || {};
  const next = nextGroup || {};
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);

  for (const subKey of allKeys) {
    if (EXCLUDED_FIELDS.has(subKey)) continue;
    const prevVal = normalizeValue(prev[subKey]);
    const nextVal = normalizeValue(next[subKey]);
    if (JSON.stringify(prevVal) !== JSON.stringify(nextVal)) {
      diffs.push({
        field: `${fieldName}.${subKey}`,
        from: prevVal,
        to: nextVal,
      });
    }
  }

  return diffs;
}

/**
 * Compute the diff between two document states.
 * Returns an array of DiffEntry objects for all changed fields.
 *
 * This is a synchronous pure function -- no async, no Payload dependency.
 *
 * @param previousDoc - The document state before the change
 * @param doc - The document state after the change
 * @returns Array of field-level changes
 */
export function computeDiff(
  previousDoc: Record<string, unknown>,
  doc: Record<string, unknown>,
): DiffEntry[] {
  const diffs: DiffEntry[] = [];
  const allKeys = new Set([...Object.keys(previousDoc), ...Object.keys(doc)]);

  for (const key of allKeys) {
    // Skip excluded fields
    if (EXCLUDED_FIELDS.has(key)) continue;

    // Handle group fields with dot-path notation
    if (GROUP_FIELDS.has(key)) {
      const prevGroup = previousDoc[key] as
        | Record<string, unknown>
        | null
        | undefined;
      const nextGroup = doc[key] as Record<string, unknown> | null | undefined;
      diffs.push(...compareGroupField(key, prevGroup, nextGroup));
      continue;
    }

    // Handle hasMany relationship fields (array comparison with sorting)
    if (HAS_MANY_RELATIONSHIP_FIELDS.has(key)) {
      const prevArr = normalizeHasManyValue(previousDoc[key]);
      const nextArr = normalizeHasManyValue(doc[key]);
      if (JSON.stringify(prevArr) !== JSON.stringify(nextArr)) {
        // Store the original arrays (unsorted) for the diff output
        const fromVal = previousDoc[key];
        const toVal = doc[key];
        diffs.push({
          field: key,
          from: Array.isArray(fromVal) ? fromVal : fromVal ? [fromVal] : [],
          to: Array.isArray(toVal) ? toVal : toVal ? [toVal] : [],
        });
      }
      continue;
    }

    // Handle all other fields (text, number, select, checkbox, textarea, upload, single relationship)
    const prevVal = normalizeValue(previousDoc[key]);
    const nextVal = normalizeValue(doc[key]);
    if (JSON.stringify(prevVal) !== JSON.stringify(nextVal)) {
      diffs.push({ field: key, from: prevVal, to: nextVal });
    }
  }

  return diffs;
}

/**
 * Resolve relationship IDs to { id, label } objects in diff entries.
 *
 * For each DiffEntry whose field is a known relationship field:
 * - Collects all unique IDs from from/to values
 * - Fetches labels from the target collection
 * - Replaces raw IDs with { id, label } objects
 *
 * Non-relationship entries pass through unchanged.
 * Failed lookups gracefully degrade to keeping raw IDs.
 *
 * @param diff - Array of DiffEntry objects from computeDiff
 * @param payload - Payload instance (or mock) with a find method
 * @returns Updated diff array with resolved relationship labels
 */
export async function resolveRelationshipLabels(
  diff: DiffEntry[],
  payload: {
    find: (
      args: Record<string, unknown>,
    ) => Promise<{ docs: Record<string, unknown>[] }>;
  },
): Promise<DiffEntry[]> {
  const resolved: DiffEntry[] = [];

  for (const entry of diff) {
    const relConfig = RELATIONSHIP_FIELDS[entry.field];

    // Pass through non-relationship fields unchanged
    if (!relConfig) {
      resolved.push(entry);
      continue;
    }

    const { collection, titleField } = relConfig;
    const isSingle = entry.field === "material";

    try {
      // Collect all unique IDs from both from and to
      const allIds: string[] = [];

      if (isSingle) {
        if (typeof entry.from === "string") allIds.push(entry.from);
        if (typeof entry.to === "string") allIds.push(entry.to);
      } else {
        if (Array.isArray(entry.from)) {
          allIds.push(...(entry.from as string[]));
        }
        if (Array.isArray(entry.to)) {
          allIds.push(...(entry.to as string[]));
        }
      }

      const uniqueIds = [...new Set(allIds)];

      if (uniqueIds.length === 0) {
        resolved.push(entry);
        continue;
      }

      // Fetch labels from the collection
      const { docs } = await payload.find({
        collection,
        where: { id: { in: uniqueIds } },
        select: { [titleField]: true },
        limit: uniqueIds.length,
        depth: 0,
        pagination: false,
      });

      // Build ID-to-label map
      const labelMap = new Map<string, string>();
      for (const doc of docs) {
        const id = doc.id as string;
        const label = (doc[titleField] as string) ?? id;
        labelMap.set(id, label);
      }

      // Helper to resolve a single ID
      const resolveId = (id: string) => ({
        id,
        label: labelMap.get(id) ?? id,
      });

      // Resolve from/to values
      let resolvedFrom: unknown;
      let resolvedTo: unknown;

      if (isSingle) {
        resolvedFrom =
          typeof entry.from === "string" ? resolveId(entry.from) : null;
        resolvedTo = typeof entry.to === "string" ? resolveId(entry.to) : null;
      } else {
        resolvedFrom = Array.isArray(entry.from)
          ? (entry.from as string[]).map(resolveId)
          : entry.from;
        resolvedTo = Array.isArray(entry.to)
          ? (entry.to as string[]).map(resolveId)
          : entry.to;
      }

      resolved.push({
        field: entry.field,
        from: resolvedFrom,
        to: resolvedTo,
      });
    } catch {
      // Graceful degradation: keep raw IDs if resolution fails
      resolved.push(entry);
    }
  }

  return resolved;
}
