// --- Exported pure functions for testing ---

export function extractId(value: string | { id: string }): string {
  return typeof value === "string" ? value : value.id;
}

export function shouldBackfill(erlaubteFarben: unknown): boolean {
  // Returns true if the field needs backfilling
  // true when: null, undefined, or empty array (length === 0)
  // false when: non-empty array (length > 0)
  if (erlaubteFarben === null || erlaubteFarben === undefined) return true;
  if (Array.isArray(erlaubteFarben) && erlaubteFarben.length === 0) return true;
  return false;
}

export interface FarbeForMatching {
  id: string;
  erlaubte_materialien?: (string | { id: string })[] | null;
  sortOrder?: number | null;
}

export interface ProfileForMatching {
  material?: string | { id: string } | null;
}

export function matchFarbenForProfile(
  profile: ProfileForMatching,
  allFarben: FarbeForMatching[],
): string[] {
  // Returns sorted array of Farbe IDs whose erlaubte_materialien contains the profile's material ID
  // Returns empty array if profile has no material or no Farben match
  if (!profile.material) return [];
  const materialId = extractId(profile.material);

  const matching = allFarben.filter((farbe) => {
    if (
      !Array.isArray(farbe.erlaubte_materialien) ||
      farbe.erlaubte_materialien.length === 0
    )
      return false;
    return farbe.erlaubte_materialien.some((m) => extractId(m) === materialId);
  });

  // Sort by sortOrder ascending (nullish sortOrder treated as Infinity)
  matching.sort(
    (a, b) => (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity),
  );

  return matching.map((f) => f.id);
}

// --- Migration Script ---
// Standalone script: tsx src/migrations/backfill-erlaubte-farben.ts [--dry-run]

const PAGE_SIZE = 100;

async function main() {
  // Dynamic imports — only loaded when script is executed directly (not during Jest tests)
  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");

  const isDryRun = process.argv.includes("--dry-run");
  const prefix = isDryRun ? "[DRY-RUN] " : "";

  console.log(`${prefix}=== Migration: Backfill erlaubte_farben ===\n`);

  const payload = await getPayload({ config });

  // Step 1: Load ALL active Farben once (depth=0 -> erlaubte_materialien as string[])
  const { docs: allFarben } = await payload.find({
    collection: "farben",
    where: { aktiv: { equals: true } },
    limit: 500,
    depth: 0,
  });
  console.log(`${prefix}Farben geladen: ${allFarben.length} aktive Farben\n`);

  // Step 2: Paginate through all Profiles
  let page = 1;
  let hasMore = true;
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalWarnings = 0;
  let totalPages = 0;

  while (hasMore) {
    const result = await payload.find({
      collection: "profile",
      limit: PAGE_SIZE,
      page,
      depth: 0,
    });

    totalPages++;
    console.log(
      `${prefix}--- Seite ${page} (${result.docs.length} Profile) ---`,
    );

    for (const profile of result.docs) {
      totalProcessed++;
      const profileName = profile.name_technisch || profile.id;

      // Check idempotency
      if (!shouldBackfill(profile.erlaubte_farben)) {
        const currentCount = Array.isArray(profile.erlaubte_farben)
          ? profile.erlaubte_farben.length
          : 0;
        console.log(
          `${prefix}  [SKIPPED] ${profileName}: bereits befüllt (${currentCount} Farben)`,
        );
        totalSkipped++;
        continue;
      }

      // Check material exists
      if (!profile.material) {
        console.log(`${prefix}  [WARN] ${profileName}: kein Material gesetzt`);
        totalWarnings++;
        continue;
      }

      // Derive matching Farben
      const farbenIds = matchFarbenForProfile(
        { material: profile.material },
        allFarben as FarbeForMatching[],
      );

      if (farbenIds.length === 0) {
        console.log(
          `${prefix}  [WARN] ${profileName}: 0 passende Farben für Material ${extractId(profile.material as string | { id: string })}`,
        );
        totalWarnings++;
        continue;
      }

      // Update profile (skip in dry-run)
      if (!isDryRun) {
        await payload.update({
          collection: "profile",
          id: profile.id,
          data: { erlaubte_farben: farbenIds },
        });
      }

      console.log(
        `${prefix}  [UPDATED] ${profileName}: ${farbenIds.length} Farben zugeordnet`,
      );
      totalUpdated++;
    }

    hasMore = result.hasNextPage;
    page++;
  }

  // Summary
  console.log(`\n${prefix}=== Summary ===`);
  console.log(`${prefix}Gesamt: ${totalProcessed} Profile`);
  console.log(`${prefix}Befüllt: ${totalUpdated}`);
  console.log(`${prefix}Übersprungen (bereits gesetzt): ${totalSkipped}`);
  console.log(`${prefix}Warnungen: ${totalWarnings}`);
  console.log(`${prefix}Seiten: ${totalPages}`);

  process.exit(0);
}

// Only run when executed directly via tsx (not when imported by Jest)
const isDirectExecution =
  typeof process !== "undefined" &&
  process.argv[1] &&
  process.argv[1].includes("backfill-erlaubte-farben");

if (isDirectExecution) {
  main().catch((error) => {
    console.error("\n[FEHLER] Migration abgebrochen:", error);
    process.exit(1);
  });
}
