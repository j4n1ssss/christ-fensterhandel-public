import type { BasePayload } from "payload";
import type { KonfiguratorSelections } from "@/lib/konfigurator/types";
import type {
  Preisregeln as PreisregelDoc,
  Produkttypen,
  Materialien,
  Profile,
} from "@/payload-types";

export interface PriceCalcOptions {
  cache?: Map<string, Array<Record<string, unknown>>>;
}

/**
 * Generic helpers for Payload relationship fields (string | object with id).
 */
type Relation<T extends { id: string }> = string | T | null | undefined;

function getRelationId<T extends { id: string }>(
  v: Relation<T>,
): string | null {
  if (!v) return null;
  return typeof v === "string" ? v : v.id;
}

function matchId<T extends { id: string }>(
  fieldValue: Relation<T>,
  selectionId: string | null,
): boolean {
  const id = getRelationId(fieldValue);
  return !!id && !!selectionId && id === selectionId;
}

/**
 * Find an item's aufpreis by ID in a collection array.
 */
function findAufpreis(
  docs: Array<{ id: string; aufpreis?: number | null }>,
  selectedId: string | null,
): number {
  if (!selectedId) return 0;
  const item = docs.find((d) => d.id === selectedId);
  return item?.aufpreis ?? 0;
}

/**
 * Fetch docs from a Payload collection, returning an array of documents.
 */
async function fetchCollection(
  payload: BasePayload,
  collection: string,
  opts?: PriceCalcOptions,
): Promise<Array<{ id: string; aufpreis?: number | null }>> {
  const cache = opts?.cache;
  if (cache && cache.has(collection)) {
    return cache.get(collection) as Array<{
      id: string;
      aufpreis?: number | null;
    }>;
  }
  const result = await payload.find({
    collection: collection as any,
    limit: 500,
  });
  const docs =
    (result.docs as Array<{ id: string; aufpreis?: number | null }>) || [];
  if (cache) cache.set(collection, docs);
  return docs;
}

/**
 * Server-side price calculation using Payload Local API.
 *
 * Mirrors the client-side calculatePreviewPrice formula but reads CMS data
 * directly from the database via Payload, making it tamper-proof.
 *
 * CMS stores all prices in EUR (grundpreis_pro_m2, aufpreise).
 * This function calculates in EUR first, then converts to cents at the end.
 *
 * @returns Price in integer cents (e.g. 92500 = 925.00 EUR).
 *          Returns 0 if no matching Preisregel or missing required selections.
 */
export async function calculateServerPrice(
  selections: KonfiguratorSelections,
  payload: BasePayload,
  opts?: PriceCalcOptions,
): Promise<number> {
  // Need at least produkttyp, material, profil, and masse
  if (
    !selections.produkttyp ||
    !selections.material ||
    !selections.profil ||
    !selections.masse
  ) {
    return 0;
  }

  // Query active preisregeln
  const preisregelnResult = await payload.find({
    collection: "preisregeln" as any,
    where: { aktiv: { equals: true } },
    limit: 100,
  });

  const preisregeln = preisregelnResult.docs as PreisregelDoc[];

  // Find matching Preisregel
  const regel = preisregeln.find(
    (r) =>
      matchId<Produkttypen>(r.produkttyp, selections.produkttyp) &&
      matchId<Materialien>(r.material, selections.material) &&
      matchId<Profile>(r.profil, selections.profil),
  );

  if (!regel) return 0;

  // Calculate area in m2
  const flaeche =
    (selections.masse.breite * selections.masse.hoehe) / 1_000_000;

  // CMS stores grundpreis_pro_m2 in EUR — calculate in EUR first
  let preisEur = flaeche * regel.grundpreis_pro_m2;

  // Add aufpreise from selected options (all stored in EUR in CMS)
  if (selections.verglasung) {
    const docs = await fetchCollection(payload, "verglasungen", opts);
    preisEur += findAufpreis(docs, selections.verglasung);
  }

  if (selections.schallschutz) {
    const docs = await fetchCollection(payload, "schallschutz", opts);
    preisEur += findAufpreis(docs, selections.schallschutz);
  }

  if (selections.sicherheitsglas) {
    const docs = await fetchCollection(payload, "sicherheitsglas", opts);
    preisEur += findAufpreis(docs, selections.sicherheitsglas);
  }

  if (selections.glasdekor) {
    const docs = await fetchCollection(payload, "glasdekore", opts);
    preisEur += findAufpreis(docs, selections.glasdekor);
  }

  if (selections.sprossen) {
    const docs = await fetchCollection(payload, "sprossen", opts);
    preisEur += findAufpreis(docs, selections.sprossen);
  }

  // Farben aufpreise
  if (selections.farbeAussen || selections.farbeInnen) {
    const docs = await fetchCollection(payload, "farben", opts);
    preisEur += findAufpreis(docs, selections.farbeAussen);
    preisEur += findAufpreis(docs, selections.farbeInnen);
  }

  // Extras aufpreise (multiple selection)
  if (Array.isArray(selections.extras) && selections.extras.length > 0) {
    const docs = await fetchCollection(payload, "extras", opts);
    for (const extraId of selections.extras) {
      preisEur += findAufpreis(docs, extraId);
    }
  }

  // Convert EUR to cents for storage
  return Math.round(preisEur * 100);
}
