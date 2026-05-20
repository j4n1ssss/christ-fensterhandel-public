import type { CMSData, KonfiguratorSelections } from "./types";
import type {
  Profile,
  Fluegelanzahl,
  Oeffnungsarten,
  Fensterform,
  Farben,
  Dichtungsfarben,
  Verglasungen,
  Schallschutz,
  Sicherheitsglas,
  Glasdekore,
  Sprossen,
  Extra,
  Zusatzlichter,
} from "@/payload-types";

/** Feature flag: when true, Steps 4-6 and 8-9 use Hub fields from Profile.
 *  When false, legacy chain-filter code runs. No mixing. */
export const USE_HUB = false;

/**
 * Extract ID from a Payload relationship field value.
 * Payload can return either a string ID or a populated object.
 */
function extractId(value: string | { id: string }): string {
  return typeof value === "string" ? value : value.id;
}

/**
 * Get filtered items from a Profile Hub field.
 * Returns the intersection of Hub IDs with cmsData collection items.
 * Returns null if profil is undefined, field is null/empty (= category hidden).
 */
export function getHubField<T extends { id: string }>(
  profil: Profile | undefined,
  field: keyof Profile,
  cmsData: CMSData,
  collection: keyof CMSData,
): T[] | null {
  if (!profil) return null;
  const hubValue = profil[field];
  if (!Array.isArray(hubValue) || hubValue.length === 0) return null;
  const hubIds = new Set(
    hubValue.map((v: string | { id: string }) =>
      typeof v === "string" ? v : v.id,
    ),
  );
  const items = cmsData[collection] as unknown as T[];
  return items.filter((item) => hubIds.has(item.id));
}

/**
 * Get filtered options for a given step based on CMS relationship data
 * and previous selections.
 *
 * All CMS data is loaded upfront. This function filters client-side
 * using the relationship fields defined in the CMS collections.
 *
 * When USE_HUB is true, Steps 4-6 and 8-9 use Hub fields from the
 * selected Profile instead of chain-filter logic.
 */
export function getFilteredOptions(
  step: number,
  cmsData: CMSData,
  selections: KonfiguratorSelections,
): unknown {
  const selectedProfil = cmsData.profile.find(
    (p) => p.id === selections.profil,
  );

  switch (step) {
    case 1:
      // Produkttyp: no Hub filtering. erlaubte_produkttypen exists as a Hub field on Profile
      // but is NOT used here because Step 1 runs BEFORE profile selection (Step 3).
      // The field serves admin organization purposes only.
      // See: .planning/v1.1-MILESTONE-AUDIT.md (INT-01)
      return cmsData.produkttypen;

    case 2: {
      // Material filtered by Produkttyp.erlaubte_materialien
      if (!selections.produkttyp) return cmsData.materialien;
      const produkttyp = cmsData.produkttypen.find(
        (p) => p.id === selections.produkttyp,
      );
      if (!produkttyp?.erlaubte_materialien?.length) return [];
      const erlaubteMaterialIds =
        produkttyp.erlaubte_materialien.map(extractId);
      return cmsData.materialien.filter((m) =>
        erlaubteMaterialIds.includes(m.id),
      );
    }

    case 3: {
      // Profil filtered by Material.erlaubte_profile
      if (!selections.material) return cmsData.profile;
      const material = cmsData.materialien.find(
        (m) => m.id === selections.material,
      );
      if (!material?.erlaubte_profile?.length) return [];
      const erlaubteProfileIds = material.erlaubte_profile.map(extractId);
      return cmsData.profile.filter((p) => erlaubteProfileIds.includes(p.id));
    }

    case 4: {
      if (USE_HUB) {
        return {
          fluegelanzahl:
            getHubField<Fluegelanzahl>(
              selectedProfil,
              "erlaubte_fluegelanzahl",
              cmsData,
              "fluegelanzahl",
            ) ?? [],
          zusatzlichter: getHubField<Zusatzlichter>(
            selectedProfil,
            "erlaubte_zusatzlichter",
            cmsData,
            "zusatzlichter",
          ),
        };
      }
      // Legacy: filter by fuer_produkttypen
      if (!selections.produkttyp) return cmsData.fluegelanzahl;
      return cmsData.fluegelanzahl.filter((f) =>
        f.fuer_produkttypen?.some(
          (pt) => extractId(pt) === selections.produkttyp,
        ),
      );
    }

    case 5: {
      if (USE_HUB) {
        return (
          getHubField<Oeffnungsarten>(
            selectedProfil,
            "erlaubte_oeffnungsarten",
            cmsData,
            "oeffnungsarten",
          ) ?? []
        );
      }
      // Legacy: filter by fuer_fenster/fuer_balkontuer
      if (!selections.produkttyp) return cmsData.oeffnungsarten;
      const pt = cmsData.produkttypen.find(
        (p) => p.id === selections.produkttyp,
      );
      if (!pt) return cmsData.oeffnungsarten;

      const isBalkontuer = pt.slug === "balkontuer";
      return cmsData.oeffnungsarten.filter((oa) =>
        isBalkontuer ? oa.fuer_balkontuer : oa.fuer_fenster,
      );
    }

    case 6: {
      if (USE_HUB) {
        return (
          getHubField<Fensterform>(
            selectedProfil,
            "erlaubte_fensterformen",
            cmsData,
            "fensterformen",
          ) ?? []
        );
      }
      // Legacy: filter by erlaubte_fluegelanzahl AND erlaubte_oeffnungsarten
      const { fluegelanzahl, oeffnungsarten } = selections;
      return cmsData.fensterformen.filter((ff) => {
        // Check fluegelanzahl is allowed
        const fluegelOk =
          !fluegelanzahl ||
          !ff.erlaubte_fluegelanzahl?.length ||
          ff.erlaubte_fluegelanzahl.some((f) => extractId(f) === fluegelanzahl);

        // Check all selected oeffnungsarten are allowed
        const selectedOaIds = oeffnungsarten
          .map((w) => w.oeffnungsart)
          .filter(Boolean) as string[];
        const oeffnungOk =
          selectedOaIds.length === 0 ||
          !ff.erlaubte_oeffnungsarten?.length ||
          selectedOaIds.every((oaId) =>
            ff.erlaubte_oeffnungsarten!.some((oa) => extractId(oa) === oaId),
          );

        return fluegelOk && oeffnungOk;
      });
    }

    case 7: {
      // Return masse constraints from selected profil
      if (!selections.profil) return null;
      const profil = cmsData.profile.find((p) => p.id === selections.profil);
      return profil?.masse || null;
    }

    case 8: {
      if (USE_HUB) {
        const hubFarben =
          getHubField<Farben>(
            selectedProfil,
            "erlaubte_farben",
            cmsData,
            "farben",
          ) ?? [];
        const hubDichtung = getHubField<Dichtungsfarben>(
          selectedProfil,
          "erlaubte_dichtungsfarben",
          cmsData,
          "dichtungsfarben",
        );
        return {
          aussen: hubFarben.filter((f) => f.fuer_aussen),
          innen: hubFarben.filter((f) => f.fuer_innen),
          dichtungsfarben: hubDichtung ?? [],
        };
      }
      // Legacy chain code (preserved)
      if (!selections.material) {
        return {
          aussen: cmsData.farben.filter((f) => f.fuer_aussen),
          innen: cmsData.farben.filter((f) => f.fuer_innen),
          dichtungsfarben: cmsData.dichtungsfarben,
        };
      }
      const materialFarben = cmsData.farben.filter((f) =>
        f.erlaubte_materialien?.some(
          (m) => extractId(m) === selections.material,
        ),
      );
      return {
        aussen: materialFarben.filter((f) => f.fuer_aussen),
        innen: materialFarben.filter((f) => f.fuer_innen),
        dichtungsfarben: cmsData.dichtungsfarben,
      };
    }

    case 9: {
      if (USE_HUB) {
        return {
          verglasungen:
            getHubField<Verglasungen>(
              selectedProfil,
              "erlaubte_verglasungen",
              cmsData,
              "verglasungen",
            ) ?? [],
          schallschutz: getHubField<Schallschutz>(
            selectedProfil,
            "erlaubte_schallschutz",
            cmsData,
            "schallschutz",
          ),
          sicherheitsglas: getHubField<Sicherheitsglas>(
            selectedProfil,
            "erlaubte_sicherheitsglas",
            cmsData,
            "sicherheitsglas",
          ),
          glasdekore: getHubField<Glasdekore>(
            selectedProfil,
            "erlaubte_glasdekore",
            cmsData,
            "glasdekore",
          ),
          sprossen: getHubField<Sprossen>(
            selectedProfil,
            "erlaubte_sprossen",
            cmsData,
            "sprossen",
          ),
          extras: getHubField<Extra>(
            selectedProfil,
            "erlaubte_extras",
            cmsData,
            "extras",
          ),
        };
      }
      // Legacy: no filtering
      return {
        verglasungen: cmsData.verglasungen,
        schallschutz: cmsData.schallschutz,
        sicherheitsglas: cmsData.sicherheitsglas,
        glasdekore: cmsData.glasdekore,
        sprossen: cmsData.sprossen,
        extras: cmsData.extras,
      };
    }

    case 10:
      // Summary: no filtering
      return null;

    default:
      return null;
  }
}
