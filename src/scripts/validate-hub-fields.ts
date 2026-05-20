// --- Import + re-export shared constants (defined in @/lib/hub-fields to avoid server-only import chains) ---

import { REQUIRED_HUB_FIELDS, OPTIONAL_HUB_FIELDS } from "@/lib/hub-fields";
export { REQUIRED_HUB_FIELDS, OPTIONAL_HUB_FIELDS };

export interface ValidationResult {
  valid: boolean;
  profileName: string;
  errors: { field: string; count: number }[];
  warnings: { field: string; count: number }[];
  details: {
    field: string;
    count: number;
    status: "ok" | "error" | "warning";
  }[];
}

function fieldCount(value: unknown): number {
  if (!Array.isArray(value)) return 0;
  return value.length;
}

export function validateProfile(
  profile: Record<string, unknown>,
): ValidationResult {
  const profileName =
    (profile.name_technisch as string) || (profile.id as string) || "unknown";
  const errors: { field: string; count: number }[] = [];
  const warnings: { field: string; count: number }[] = [];
  const details: {
    field: string;
    count: number;
    status: "ok" | "error" | "warning";
  }[] = [];

  for (const field of REQUIRED_HUB_FIELDS) {
    const count = fieldCount(profile[field]);
    if (count === 0) {
      errors.push({ field, count });
      details.push({ field, count, status: "error" });
    } else {
      details.push({ field, count, status: "ok" });
    }
  }

  for (const field of OPTIONAL_HUB_FIELDS) {
    const count = fieldCount(profile[field]);
    if (count === 0) {
      warnings.push({ field, count });
      details.push({ field, count, status: "warning" });
    } else {
      details.push({ field, count, status: "ok" });
    }
  }

  return {
    valid: errors.length === 0,
    profileName,
    errors,
    warnings,
    details,
  };
}

// --- Validation Script ---
// Standalone script: tsx src/scripts/validate-hub-fields.ts

const PAGE_SIZE = 100;

async function main() {
  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");

  console.log("=== Validate Hub Fields ===\n");

  const payload = await getPayload({ config });

  let page = 1;
  let hasMore = true;
  let totalProfiles = 0;
  let validProfiles = 0;
  let invalidProfiles = 0;
  const allResults: ValidationResult[] = [];

  while (hasMore) {
    const result = await payload.find({
      collection: "profile",
      where: { aktiv: { equals: true } },
      limit: PAGE_SIZE,
      page,
      depth: 0,
    });

    for (const profile of result.docs) {
      totalProfiles++;
      const validation = validateProfile(
        profile as unknown as Record<string, unknown>,
      );
      allResults.push(validation);

      console.log(`${validation.profileName}:`);
      for (const detail of validation.details) {
        const icon =
          detail.status === "ok"
            ? "OK"
            : detail.status === "error"
              ? "FEHLER"
              : "WARNUNG";
        console.log(`  ${detail.field}: ${detail.count} Eintraege  ${icon}`);
      }

      if (validation.valid) {
        validProfiles++;
      } else {
        invalidProfiles++;
      }
      console.log("");
    }

    hasMore = result.hasNextPage;
    page++;
  }

  // Summary
  console.log("=== ERGEBNIS ===");
  console.log(`${validProfiles} von ${totalProfiles} Profile vollstaendig`);
  if (invalidProfiles > 0) {
    console.log(`${invalidProfiles} Profile mit fehlenden Pflicht-Feldern:`);
    for (const r of allResults.filter((r) => !r.valid)) {
      console.log(
        `  ${r.profileName}: ${r.errors.map((e) => e.field).join(", ")}`,
      );
    }
  }

  process.exit(invalidProfiles > 0 ? 1 : 0);
}

const isDirectExecution =
  typeof process !== "undefined" &&
  process.argv[1] &&
  process.argv[1].includes("validate-hub-fields");

if (isDirectExecution) {
  main().catch((error) => {
    console.error("\n[FEHLER] Validierung abgebrochen:", error);
    process.exit(1);
  });
}
