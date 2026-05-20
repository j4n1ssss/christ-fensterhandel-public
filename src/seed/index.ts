// Production guard: prevent accidental seeding in production
if (process.env.NODE_ENV === "production") {
  console.error(
    "FATAL: Seed-Script darf nicht in Production ausgefuehrt werden!",
  );
  process.exit(1);
}

const _dbUrl = process.env.DATABASE_URL || "";
if (_dbUrl && !_dbUrl.includes("localhost") && !_dbUrl.includes("127.0.0.1")) {
  console.warn(
    "WARNUNG: DATABASE_URL zeigt nicht auf localhost. Sind Sie sicher? (Ctrl+C zum Abbrechen, 5 Sekunden Wartezeit...)",
  );
}

import type { BasePayload } from "payload";
import { getPayload } from "payload";
import config from "@payload-config";
import { clearAllCollections, findBySlug, findMultipleBySlugs } from "./utils";

import { produkttypenData } from "./data/produkttypen";
import { materialienData } from "./data/materialien";
import { profileData } from "./data/profile";
import { fluegelanzahlData } from "./data/fluegelanzahl";
import { oeffnungsartenData } from "./data/oeffnungsarten";
import { fensterformenData } from "./data/fensterformen";
import { zusatzlichterData } from "./data/zusatzlichter";
import { farbenData } from "./data/farben";
import { dichtungsfarbenData } from "./data/dichtungsfarben";
import { verglasungenData } from "./data/verglasungen";
import { schallschutzData } from "./data/schallschutz";
import { sicherheitsglasData } from "./data/sicherheitsglas";
import { glasdekoreData } from "./data/glasdekore";
import { sprossenData } from "./data/sprossen";
import { extrasData } from "./data/extras";
import { preisregelnData } from "./data/preisregeln";

async function seedCollection(
  payload: BasePayload,
  collection: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[],
): Promise<void> {
  console.log(`\nSeeding ${collection} (${data.length} items)...`);
  for (const item of data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.create({ collection: collection as any, data: item });
  }
  console.log(`  Done: ${data.length} items created`);
}

// Top-level await required for `npx payload run`
const payload = await getPayload({ config });

console.log("=== Muster Fenster Seed Script ===\n");
console.log("Clearing all collections...");
await clearAllCollections(payload);

// ============================================================
// Phase 1: No dependencies
// ============================================================
console.log("\n--- Phase 1: Base collections (no dependencies) ---");

await seedCollection(payload, "produkttypen", produkttypenData);
await seedCollection(payload, "materialien", materialienData);
await seedCollection(payload, "dichtungsfarben", dichtungsfarbenData);

// ============================================================
// Phase 1.5: Set reverse relationships on base collections
// ============================================================
console.log(
  "\n--- Phase 1.5: Setting relationships on Produkttypen + Materialien ---",
);

// Produkttypen → erlaubte_materialien (both allow all materials)
const allMaterialIds = await findMultipleBySlugs(payload, "materialien", [
  "kunststoff",
  "holz",
  "aluminium",
  "kunststoff-aluminium",
]);
const fensterId = await findBySlug(payload, "produkttypen", "fenster");
const balkontuerIdPT = await findBySlug(payload, "produkttypen", "balkontuer");

await payload.update({
  collection: "produkttypen",
  id: fensterId,
  data: { erlaubte_materialien: allMaterialIds },
});
await payload.update({
  collection: "produkttypen",
  id: balkontuerIdPT,
  data: { erlaubte_materialien: allMaterialIds },
});
console.log("  Produkttypen → erlaubte_materialien gesetzt");

// Materialien → erlaubte_profile (Kunststoff gets all profiles after they're created)
// This is done after Phase 2 profile seeding below

// ============================================================
// Phase 2: Depends on Phase 1
// ============================================================
console.log("\n--- Phase 2: Collections with Phase 1 dependencies ---");

// Profile (needs materialien)
console.log(`\nSeeding profile (${profileData.length} items)...`);
for (const item of profileData) {
  const materialId = await findBySlug(
    payload,
    "materialien",
    item.material_slug,
  );
  const { material_slug, ...rest } = item;
  await payload.create({
    collection: "profile",
    data: { ...rest, material: materialId },
  });
}
console.log(`  Done: ${profileData.length} items created`);

// Set Materialien → erlaubte_profile (all Kunststoff profiles)
const allProfileIds = await findMultipleBySlugs(payload, "profile", [
  "iglo-5",
  "iglo-energy",
  "iglo-energy-classic",
  "iglo-light",
]);
const kunststoffId = await findBySlug(payload, "materialien", "kunststoff");
await payload.update({
  collection: "materialien",
  id: kunststoffId,
  data: { erlaubte_profile: allProfileIds },
});
console.log("  Kunststoff → erlaubte_profile gesetzt");

// Farben (needs materialien)
console.log(`\nSeeding farben (${farbenData.length} items)...`);
for (const item of farbenData) {
  const materialIds = await findMultipleBySlugs(
    payload,
    "materialien",
    item.erlaubte_materialien_slugs,
  );
  const { erlaubte_materialien_slugs, ...rest } = item;
  await payload.create({
    collection: "farben",
    data: { ...rest, erlaubte_materialien: materialIds },
  });
}
console.log(`  Done: ${farbenData.length} items created`);

// Fluegelanzahl (needs produkttypen)
console.log(`\nSeeding fluegelanzahl (${fluegelanzahlData.length} items)...`);
for (const item of fluegelanzahlData) {
  const produkttypIds = await findMultipleBySlugs(
    payload,
    "produkttypen",
    item.fuer_produkttypen_slugs,
  );
  const { fuer_produkttypen_slugs, ...rest } = item;
  await payload.create({
    collection: "fluegelanzahl",
    data: { ...rest, fuer_produkttypen: produkttypIds },
  });
}
console.log(`  Done: ${fluegelanzahlData.length} items created`);

// Oeffnungsarten (no slug deps)
await seedCollection(payload, "oeffnungsarten", oeffnungsartenData);

// Simple collections (no deps)
await seedCollection(payload, "verglasungen", verglasungenData);
await seedCollection(payload, "schallschutz", schallschutzData);
await seedCollection(payload, "sicherheitsglas", sicherheitsglasData);
await seedCollection(payload, "glasdekore", glasdekoreData);
await seedCollection(payload, "sprossen", sprossenData);
await seedCollection(payload, "extras", extrasData);

// ============================================================
// Phase 3: Depends on Phase 1 + 2
// ============================================================
console.log("\n--- Phase 3: Collections with Phase 1+2 dependencies ---");

// Fensterformen (needs fluegelanzahl, oeffnungsarten)
console.log(`\nSeeding fensterformen (${fensterformenData.length} items)...`);
for (const item of fensterformenData) {
  const fluegelIds = await findMultipleBySlugs(
    payload,
    "fluegelanzahl",
    item.erlaubte_fluegelanzahl_slugs,
  );
  const oeffnungsIds = await findMultipleBySlugs(
    payload,
    "oeffnungsarten",
    item.erlaubte_oeffnungsarten_slugs,
  );
  const {
    erlaubte_fluegelanzahl_slugs,
    erlaubte_oeffnungsarten_slugs,
    ...rest
  } = item;
  await payload.create({
    collection: "fensterformen",
    data: {
      ...rest,
      erlaubte_fluegelanzahl: fluegelIds,
      erlaubte_oeffnungsarten: oeffnungsIds,
    },
  });
}
console.log(`  Done: ${fensterformenData.length} items created`);

// Zusatzlichter (needs fluegelanzahl)
console.log(`\nSeeding zusatzlichter (${zusatzlichterData.length} items)...`);
for (const item of zusatzlichterData) {
  const fluegelIds = await findMultipleBySlugs(
    payload,
    "fluegelanzahl",
    item.kombinierbar_mit_slugs,
  );
  const { kombinierbar_mit_slugs, ...rest } = item;
  await payload.create({
    collection: "zusatzlichter",
    data: { ...rest, kombinierbar_mit: fluegelIds },
  });
}
console.log(`  Done: ${zusatzlichterData.length} items created`);

// Preisregeln (needs produkttypen, materialien, profile)
console.log(`\nSeeding preisregeln (${preisregelnData.length} items)...`);
for (const item of preisregelnData) {
  const produkttypId = await findBySlug(
    payload,
    "produkttypen",
    item.produkttyp_slug,
  );
  const materialId = await findBySlug(
    payload,
    "materialien",
    item.material_slug,
  );
  const profilId = await findBySlug(payload, "profile", item.profil_slug);
  const { produkttyp_slug, material_slug, profil_slug, ...rest } = item;
  await payload.create({
    collection: "preisregeln",
    data: {
      ...rest,
      produkttyp: produkttypId,
      material: materialId,
      profil: profilId,
    },
  });
}
console.log(`  Done: ${preisregelnData.length} items created`);

console.log("\n=== Seed complete! ===");
console.log("Summary:");
console.log(`  Produkttypen: ${produkttypenData.length}`);
console.log(`  Materialien: ${materialienData.length}`);
console.log(`  Profile: ${profileData.length}`);
console.log(`  Fluegelanzahl: ${fluegelanzahlData.length}`);
console.log(`  Oeffnungsarten: ${oeffnungsartenData.length}`);
console.log(`  Fensterformen: ${fensterformenData.length}`);
console.log(`  Zusatzlichter: ${zusatzlichterData.length}`);
console.log(`  Farben: ${farbenData.length}`);
console.log(`  Dichtungsfarben: ${dichtungsfarbenData.length}`);
console.log(`  Verglasungen: ${verglasungenData.length}`);
console.log(`  Schallschutz: ${schallschutzData.length}`);
console.log(`  Sicherheitsglas: ${sicherheitsglasData.length}`);
console.log(`  Glasdekore: ${glasdekoreData.length}`);
console.log(`  Sprossen: ${sprossenData.length}`);
console.log(`  Extras: ${extrasData.length}`);
console.log(`  Preisregeln: ${preisregelnData.length}`);

process.exit(0);
