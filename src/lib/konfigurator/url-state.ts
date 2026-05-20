"use client";

import { useEffect, useRef } from "react";
import {
  createParser,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { useKonfiguratorStore } from "./store";
import type { CMSData, KonfiguratorSelections, WingOpening } from "./types";

// ---------------------------------------------------------------------------
// Custom parser: WingOpening[] <-> "dreh-kipp:links|kipp:rechts|fest"
// Pipe separates wings, colon separates oeffnungsart-slug and griffSeite.
// If griffSeite is null, only the slug is present (no colon).
// ---------------------------------------------------------------------------
const parseAsOeffnungsarten = createParser<WingOpening[]>({
  parse(value: string) {
    if (!value) return null;
    const wings = value.split("|");
    return wings.map((wing, index) => {
      const parts = wing.split(":");
      const slug = parts[0] || null;
      const griffSeite =
        parts[1] === "links" || parts[1] === "rechts" ? parts[1] : null;
      return {
        wingIndex: index,
        oeffnungsart: slug, // slug stored temporarily, resolved to ID later
        griffSeite,
      };
    });
  },
  serialize(value: WingOpening[]) {
    if (!value || value.length === 0) return "";
    return value
      .map((w) => {
        if (!w.oeffnungsart) return "";
        return w.griffSeite
          ? `${w.oeffnungsart}:${w.griffSeite}`
          : w.oeffnungsart;
      })
      .join("|");
  },
  eq(a: WingOpening[], b: WingOpening[]) {
    if (a.length !== b.length) return false;
    return a.every(
      (w, i) =>
        w.oeffnungsart === b[i].oeffnungsart &&
        w.griffSeite === b[i].griffSeite,
    );
  },
});

// ---------------------------------------------------------------------------
// URL parsers for ALL selection fields
// ---------------------------------------------------------------------------
export const konfiguratorParsers = {
  step: parseAsInteger.withDefault(1),
  produkttyp: parseAsString,
  material: parseAsString,
  profil: parseAsString,
  fluegelanzahl: parseAsString,
  zusatzlichter: parseAsArrayOf(parseAsString, ","),
  oeffnungsarten: parseAsOeffnungsarten,
  fensterform: parseAsString,
  breite: parseAsInteger,
  hoehe: parseAsInteger,
  "farbe-aussen": parseAsString,
  "farbe-innen": parseAsString,
  dichtungsfarbe: parseAsString,
  "gleich-wie-aussen": parseAsBoolean,
  verglasung: parseAsString,
  schallschutz: parseAsString,
  sicherheitsglas: parseAsString,
  glasdekor: parseAsString,
  sprossen: parseAsString,
  extras: parseAsArrayOf(parseAsString, ","),
};

// ---------------------------------------------------------------------------
// Slug <-> ID resolution helpers
// ---------------------------------------------------------------------------

/** Generic type for any CMS collection item with id + slug */
interface HasIdAndSlug {
  id: string;
  slug: string;
}

/**
 * Resolve a slug to a CMS item ID within a collection.
 * Returns null if the slug is not found (e.g. deleted item).
 */
export function slugToId(
  cmsData: CMSData,
  collectionKey: keyof CMSData,
  slug: string,
): string | null {
  const items = cmsData[collectionKey] as HasIdAndSlug[];
  const found = items.find((item) => item.slug === slug);
  return found?.id ?? null;
}

/**
 * Resolve a CMS item ID to its slug within a collection.
 * Returns null if the ID is not found.
 */
export function idToSlug(
  cmsData: CMSData,
  collectionKey: keyof CMSData,
  id: string,
): string | null {
  const items = cmsData[collectionKey] as HasIdAndSlug[];
  const found = items.find((item) => item.id === id);
  return found?.slug ?? null;
}

// ---------------------------------------------------------------------------
// Field mapping: URL param key <-> Store key <-> CMS collection
// ---------------------------------------------------------------------------

/** Single-value slug fields (store value is CMS ID string | null) */
const SLUG_FIELDS: Array<{
  urlKey: string;
  storeKey: keyof KonfiguratorSelections;
  collection: keyof CMSData;
}> = [
  { urlKey: "produkttyp", storeKey: "produkttyp", collection: "produkttypen" },
  { urlKey: "material", storeKey: "material", collection: "materialien" },
  { urlKey: "profil", storeKey: "profil", collection: "profile" },
  {
    urlKey: "fluegelanzahl",
    storeKey: "fluegelanzahl",
    collection: "fluegelanzahl",
  },
  {
    urlKey: "fensterform",
    storeKey: "fensterform",
    collection: "fensterformen",
  },
  { urlKey: "farbe-aussen", storeKey: "farbeAussen", collection: "farben" },
  { urlKey: "farbe-innen", storeKey: "farbeInnen", collection: "farben" },
  {
    urlKey: "dichtungsfarbe",
    storeKey: "dichtungsfarbe",
    collection: "dichtungsfarben",
  },
  {
    urlKey: "verglasung",
    storeKey: "verglasung",
    collection: "verglasungen",
  },
  {
    urlKey: "schallschutz",
    storeKey: "schallschutz",
    collection: "schallschutz",
  },
  {
    urlKey: "sicherheitsglas",
    storeKey: "sicherheitsglas",
    collection: "sicherheitsglas",
  },
  { urlKey: "glasdekor", storeKey: "glasdekor", collection: "glasdekore" },
  { urlKey: "sprossen", storeKey: "sprossen", collection: "sprossen" },
];

/** Array slug fields (store value is string[] of CMS IDs) */
const SLUG_ARRAY_FIELDS: Array<{
  urlKey: string;
  storeKey: keyof KonfiguratorSelections;
  collection: keyof CMSData;
}> = [
  {
    urlKey: "zusatzlichter",
    storeKey: "zusatzlichter",
    collection: "zusatzlichter",
  },
  { urlKey: "extras", storeKey: "extras", collection: "extras" },
];

// ---------------------------------------------------------------------------
// useKonfiguratorUrlState -- bidirectional sync hook
// ---------------------------------------------------------------------------

/**
 * Bidirectional URL <-> Zustand store sync for the Konfigurator.
 *
 * Phase A (Store -> URL): Runs on every store change (after CMS data loads).
 *   Converts IDs to slugs and updates URL params.
 *
 * Phase B (URL -> Store): Runs ONCE after CMS data loads when URL has
 *   selection params. Resolves slugs to IDs and seeds the store.
 *
 * Infinite-loop protection: `isUrlSeeding` ref prevents Store->URL effect
 * from firing while URL->Store seeding is in progress.
 */
export function useKonfiguratorUrlState() {
  const [urlState, setUrlState] = useQueryStates(konfiguratorParsers);
  const store = useKonfiguratorStore();

  const isUrlSeeding = useRef(false);
  const hasSeededFromUrl = useRef(false);

  // ------------------------------------------------------------------
  // Phase B: URL -> Store (runs once after CMS data loads)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!store.cmsData) return;
    if (hasSeededFromUrl.current) return;

    // Check if URL has any selection params (beyond just step)
    const hasUrlSelections =
      urlState.produkttyp !== null ||
      urlState.material !== null ||
      urlState.profil !== null ||
      urlState.fluegelanzahl !== null ||
      (urlState.zusatzlichter !== null && urlState.zusatzlichter.length > 0) ||
      urlState.oeffnungsarten !== null ||
      urlState.fensterform !== null ||
      urlState.breite !== null ||
      urlState.hoehe !== null ||
      urlState["farbe-aussen"] !== null ||
      urlState["farbe-innen"] !== null ||
      urlState.dichtungsfarbe !== null ||
      urlState["gleich-wie-aussen"] !== null ||
      urlState.verglasung !== null ||
      urlState.schallschutz !== null ||
      urlState.sicherheitsglas !== null ||
      urlState.glasdekor !== null ||
      urlState.sprossen !== null ||
      (urlState.extras !== null && urlState.extras.length > 0);

    if (!hasUrlSelections) {
      hasSeededFromUrl.current = true;
      return;
    }

    const cmsData = store.cmsData;

    isUrlSeeding.current = true;
    hasSeededFromUrl.current = true;

    // Seed single-value slug fields
    for (const field of SLUG_FIELDS) {
      const urlSlug = urlState[field.urlKey as keyof typeof urlState] as
        | string
        | null;
      if (urlSlug) {
        const id = slugToId(cmsData, field.collection, urlSlug);
        if (id) {
          store.setSelection(field.storeKey, id);
        }
      }
    }

    // Seed array slug fields
    for (const field of SLUG_ARRAY_FIELDS) {
      const urlSlugs = urlState[field.urlKey as keyof typeof urlState] as
        | string[]
        | null;
      if (urlSlugs && urlSlugs.length > 0) {
        const ids = urlSlugs
          .map((slug) => slugToId(cmsData, field.collection, slug))
          .filter((id): id is string => id !== null);
        if (ids.length > 0) {
          store.setSelection(field.storeKey, ids);
        }
      }
    }

    // Seed oeffnungsarten (WingOpening[] with slug -> ID resolution)
    if (urlState.oeffnungsarten) {
      const resolvedWings: WingOpening[] = urlState.oeffnungsarten.map(
        (wing) => ({
          wingIndex: wing.wingIndex,
          oeffnungsart: wing.oeffnungsart
            ? slugToId(cmsData, "oeffnungsarten", wing.oeffnungsart)
            : null,
          griffSeite: wing.griffSeite,
        }),
      );
      store.setSelection("oeffnungsarten", resolvedWings);
    }

    // Seed masse (direct numbers, no slug resolution)
    if (urlState.breite !== null && urlState.hoehe !== null) {
      store.setSelection("masse", {
        breite: urlState.breite,
        hoehe: urlState.hoehe,
      });
    }

    // Seed gleichWieAussen (direct boolean, treat null as false)
    if (urlState["gleich-wie-aussen"] !== null) {
      store.setSelection("gleichWieAussen", urlState["gleich-wie-aussen"]);
    }

    // Seed step
    if (urlState.step && urlState.step !== 1) {
      store.setStep(urlState.step);
    }

    // Allow Store->URL sync after seeding completes
    // Use microtask to ensure all store updates have propagated
    queueMicrotask(() => {
      isUrlSeeding.current = false;
    });

    // Only depend on cmsData becoming available (not urlState, which changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.cmsData]);

  // ------------------------------------------------------------------
  // Phase A: Store -> URL (runs on every relevant store change)
  // ------------------------------------------------------------------
  useEffect(() => {
    // Skip during URL->Store seeding to prevent infinite loops
    if (isUrlSeeding.current) return;
    // Wait for CMS data before we can resolve IDs to slugs
    if (!store.cmsData) return;

    const cmsData = store.cmsData;

    // Build complete URL state from store
    const newUrlState: Record<string, unknown> = {
      step: store.currentStep,
    };

    // Single-value slug fields: ID -> slug
    for (const field of SLUG_FIELDS) {
      const id = store[field.storeKey as keyof typeof store] as string | null;
      newUrlState[field.urlKey] = id
        ? idToSlug(cmsData, field.collection, id)
        : null;
    }

    // Array slug fields: IDs -> slugs
    for (const field of SLUG_ARRAY_FIELDS) {
      const ids = store[field.storeKey as keyof typeof store] as string[];
      if (ids && ids.length > 0) {
        const slugs = ids
          .map((id) => idToSlug(cmsData, field.collection, id))
          .filter((slug): slug is string => slug !== null);
        newUrlState[field.urlKey] = slugs.length > 0 ? slugs : null;
      } else {
        newUrlState[field.urlKey] = null;
      }
    }

    // Oeffnungsarten: WingOpening[] with ID -> slug resolution
    if (store.oeffnungsarten && store.oeffnungsarten.length > 0) {
      const serializedWings: WingOpening[] = store.oeffnungsarten.map((w) => ({
        wingIndex: w.wingIndex,
        oeffnungsart: w.oeffnungsart
          ? idToSlug(cmsData, "oeffnungsarten", w.oeffnungsart)
          : null,
        griffSeite: w.griffSeite,
      }));
      // Only set if at least one wing has a valid oeffnungsart
      const hasValid = serializedWings.some((w) => w.oeffnungsart !== null);
      newUrlState["oeffnungsarten"] = hasValid ? serializedWings : null;
    } else {
      newUrlState["oeffnungsarten"] = null;
    }

    // Masse: direct numbers
    newUrlState["breite"] = store.masse?.breite ?? null;
    newUrlState["hoehe"] = store.masse?.hoehe ?? null;

    // gleichWieAussen: direct boolean (only set if true, omit false to keep URL clean)
    newUrlState["gleich-wie-aussen"] = store.gleichWieAussen || null;

    setUrlState(newUrlState);
  }, [
    store.cmsData,
    store.currentStep,
    store.produkttyp,
    store.material,
    store.profil,
    store.fluegelanzahl,
    store.zusatzlichter,
    store.oeffnungsarten,
    store.fensterform,
    store.masse,
    store.farbeAussen,
    store.farbeInnen,
    store.dichtungsfarbe,
    store.gleichWieAussen,
    store.verglasung,
    store.schallschutz,
    store.sicherheitsglas,
    store.glasdekor,
    store.sprossen,
    store.extras,
    setUrlState,
  ]);

  return { urlState, setUrlState };
}
