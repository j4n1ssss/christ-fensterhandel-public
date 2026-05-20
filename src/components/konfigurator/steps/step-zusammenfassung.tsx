"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus, ShoppingCart } from "lucide-react";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { useCartStore } from "@/lib/cart/store";
import { calculatePreviewPrice } from "@/lib/konfigurator/price-calculator";
import type { CMSData, KonfiguratorSelections } from "@/lib/konfigurator/types";
import type { CartItem, ResolvedNames } from "@/lib/cart/types";
import { clearSavedConfig } from "@/lib/konfigurator/persistence";
import { StepContainer } from "@/components/konfigurator/ui/step-container";
import { StepHeader } from "@/components/konfigurator/ui/step-header";
import { SectionKicker } from "@/components/ui/section-kicker";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

/** Resolve CMS item name by ID. Profile nutzen name_einfach. */
function resolveName(
  id: string | null,
  collection: Array<{ id: string; name?: string; name_einfach?: string }>,
): string {
  if (!id) return "—";
  const item = collection.find((c) => c.id === id);
  if (!item) return "—";
  return (
    (item as { name_einfach?: string }).name_einfach || item.name || "—"
  );
}

function resolveProfilName(
  id: string | null,
  profiles: CMSData["profile"],
): string {
  if (!id) return "—";
  const item = profiles.find((p) => p.id === id);
  if (!item) return "—";
  return `${item.name_einfach} (${item.name_technisch})`;
}

function resolveNames(
  ids: string[],
  collection: Array<{ id: string; name?: string }>,
): string {
  if (ids.length === 0) return "Keine";
  return ids
    .map((id) => {
      const item = collection.find((c) => c.id === id);
      return item?.name || "—";
    })
    .join(", ");
}

function findFarbCode(
  id: string | null,
  farben: Array<{ id: string; farb_code?: string | null }>,
): string | null {
  if (!id) return null;
  const item = farben.find((c) => c.id === id);
  return item?.farb_code || null;
}

function findAufpreis(
  id: string | null,
  collection: Array<{ id: string; aufpreis?: number | null }>,
): number {
  if (!id) return 0;
  const item = collection.find((c) => c.id === id);
  return item?.aufpreis ?? 0;
}

function ColorDot({ farbCode }: { farbCode: string | null }) {
  if (!farbCode) return null;
  return (
    <span
      className="ml-2 inline-block size-4 rounded-sm border border-black-300"
      style={{ backgroundColor: farbCode }}
      aria-hidden
    />
  );
}

function matchId(
  fieldValue: string | { id: string } | null | undefined,
  selectionId: string | null,
): boolean {
  if (!fieldValue || !selectionId) return false;
  const id = typeof fieldValue === "string" ? fieldValue : fieldValue.id;
  return id === selectionId;
}

/**
 * Row einer Konfigurations-Liste.
 * Label links in black-600, Wert rechts in black-900.
 */
function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-black-100 py-3 last:border-0">
      <dt className="text-sm text-black-600">{label}</dt>
      <dd className="flex items-center text-right text-sm font-medium text-black-900">
        {children}
      </dd>
    </div>
  );
}

/**
 * Step 10: Zusammenfassung.
 * Zeigt die komplette Konfiguration und die Preisvorschau,
 * Actions: Konfiguration ändern / In den Warenkorb.
 * Nach Add: Success-Modal via Portal (Modal-Primitive).
 */
export function StepZusammenfassung() {
  const router = useRouter();
  const store = useKonfiguratorStore();
  const [addedToCart, setAddedToCart] = useState(false);

  if (!store.cmsData) return null;

  const selections: KonfiguratorSelections = {
    produkttyp: store.produkttyp,
    material: store.material,
    profil: store.profil,
    fluegelanzahl: store.fluegelanzahl,
    zusatzlichter: store.zusatzlichter,
    oeffnungsarten: store.oeffnungsarten,
    fensterform: store.fensterform,
    masse: store.masse,
    farbeAussen: store.farbeAussen,
    farbeInnen: store.farbeInnen,
    dichtungsfarbe: store.dichtungsfarbe,
    gleichWieAussen: store.gleichWieAussen,
    verglasung: store.verglasung,
    schallschutz: store.schallschutz,
    sicherheitsglas: store.sicherheitsglas,
    glasdekor: store.glasdekor,
    sprossen: store.sprossen,
    extras: store.extras,
  };

  const cms = store.cmsData;

  const fläche = selections.masse
    ? (selections.masse.breite * selections.masse.hoehe) / 1_000_000
    : 0;
  const flaecheRounded = Math.round(fläche * 100) / 100;

  const regel = cms.preisregeln.find(
    (r) =>
      matchId(r.produkttyp, selections.produkttyp) &&
      matchId(r.material, selections.material) &&
      matchId(r.profil, selections.profil),
  );
  const grundpreisProM2 = regel?.grundpreis_pro_m2 ?? 0;
  const basePrice = Math.round(fläche * grundpreisProM2 * 100) / 100;

  const totalPrice = calculatePreviewPrice(selections, cms);

  const aufpreise: Array<{ label: string; value: number }> = [];

  const verglasungAufpreis = findAufpreis(
    selections.verglasung,
    cms.verglasungen,
  );
  if (verglasungAufpreis > 0)
    aufpreise.push({ label: "Verglasung", value: verglasungAufpreis });

  const schallschutzAufpreis = findAufpreis(
    selections.schallschutz,
    cms.schallschutz,
  );
  if (schallschutzAufpreis > 0)
    aufpreise.push({ label: "Schallschutz", value: schallschutzAufpreis });

  const sicherheitsglasAufpreis = findAufpreis(
    selections.sicherheitsglas,
    cms.sicherheitsglas,
  );
  if (sicherheitsglasAufpreis > 0)
    aufpreise.push({
      label: "Sicherheitsglas",
      value: sicherheitsglasAufpreis,
    });

  const glasdekorAufpreis = findAufpreis(selections.glasdekor, cms.glasdekore);
  if (glasdekorAufpreis > 0)
    aufpreise.push({ label: "Glasdekor", value: glasdekorAufpreis });

  const sprossenAufpreis = findAufpreis(selections.sprossen, cms.sprossen);
  if (sprossenAufpreis > 0)
    aufpreise.push({ label: "Sprossen", value: sprossenAufpreis });

  const farbeAussenAufpreis = findAufpreis(selections.farbeAussen, cms.farben);
  if (farbeAussenAufpreis > 0)
    aufpreise.push({ label: "Außenfarbe", value: farbeAussenAufpreis });

  const farbeInnenAufpreis = findAufpreis(selections.farbeInnen, cms.farben);
  if (farbeInnenAufpreis > 0)
    aufpreise.push({ label: "Innenfarbe", value: farbeInnenAufpreis });

  for (const extraId of selections.extras) {
    const extra = cms.extras.find((e) => e.id === extraId);
    const ap = extra?.aufpreis ?? 0;
    if (ap > 0)
      aufpreise.push({ label: `Extra: ${extra?.name || "—"}`, value: ap });
  }

  const aussenFarbCode = findFarbCode(selections.farbeAussen, cms.farben);
  const innenFarbCode = selections.gleichWieAussen
    ? aussenFarbCode
    : findFarbCode(selections.farbeInnen, cms.farben);
  const dichtungFarbCode = findFarbCode(
    selections.dichtungsfarbe,
    cms.dichtungsfarben,
  );

  const innenFarbeName = selections.gleichWieAussen
    ? "Gleich wie Außen"
    : resolveName(selections.farbeInnen, cms.farben);

  const addToCart = () => {
    if (!cms) return;

    const resolvedNames: ResolvedNames = {
      produkttyp: resolveName(selections.produkttyp, cms.produkttypen),
      material: resolveName(selections.material, cms.materialien),
      profil: resolveProfilName(selections.profil, cms.profile),
      fluegelanzahl: resolveName(
        selections.fluegelanzahl,
        cms.fluegelanzahl,
      ),
      fensterform: resolveName(selections.fensterform, cms.fensterformen),
      farbeAussen: resolveName(selections.farbeAussen, cms.farben),
      farbeInnen: selections.gleichWieAussen
        ? "Gleich wie Außen"
        : resolveName(selections.farbeInnen, cms.farben),
      dichtungsfarbe: resolveName(
        selections.dichtungsfarbe,
        cms.dichtungsfarben,
      ),
      verglasung: resolveName(selections.verglasung, cms.verglasungen),
      schallschutz: resolveName(selections.schallschutz, cms.schallschutz),
      sicherheitsglas: resolveName(
        selections.sicherheitsglas,
        cms.sicherheitsglas,
      ),
      glasdekor: resolveName(selections.glasdekor, cms.glasdekore),
      sprossen: resolveName(selections.sprossen, cms.sprossen),
      extras: selections.extras.map(
        (id) => cms.extras.find((e) => e.id === id)?.name || "—",
      ),
      masse: selections.masse,
    };

    const cartItem: CartItem = {
      id: crypto.randomUUID(),
      selections: { ...selections },
      resolvedNames,
      previewPrice: totalPrice,
      quantity: 1,
      addedAt: new Date().toISOString(),
    };

    const cartStore = useCartStore.getState();
    const editingId = cartStore.editingCartItemId;

    if (editingId) {
      cartStore.updateItem(editingId, { ...cartItem, id: editingId });
      cartStore.setEditingItemId(null);
      clearSavedConfig();
      router.push("/warenkorb");
    } else {
      cartStore.addItem(cartItem);
      setAddedToCart(true);
    }
  };

  const cardClass =
    "rounded-xl border border-black-200 bg-white p-6 md:p-8";
  const sectionHeading =
    "font-heading text-xl font-medium tracking-tight text-black-950 md:text-2xl";

  return (
    <StepContainer contentClassName="max-w-[var(--container-xxl)]">
      <StepHeader
        kicker="Schritt 10 — Zusammenfassung"
        title="Zusammenfassung"
        description="Prüfe deine Konfiguration und die Preisvorschau, bevor du sie in den Warenkorb legst."
      />

      <div className="space-y-6">
        {/* Section 1: Ihre Konfiguration */}
        <section className={cardClass}>
          <SectionKicker tone="brand" className="mb-2">
            Konfiguration
          </SectionKicker>
          <h3 className={sectionHeading}>Deine Auswahl</h3>

          <dl className="mt-6">
            <SummaryRow label="Produkttyp">
              {resolveName(selections.produkttyp, cms.produkttypen)}
            </SummaryRow>

            <SummaryRow label="Material">
              {resolveName(selections.material, cms.materialien)}
            </SummaryRow>

            <SummaryRow label="Profil">
              {resolveProfilName(selections.profil, cms.profile)}
            </SummaryRow>

            <SummaryRow label="Flügelanzahl">
              {resolveName(selections.fluegelanzahl, cms.fluegelanzahl)}
            </SummaryRow>

            <SummaryRow label="Zusatzlichter">
              {resolveNames(selections.zusatzlichter, cms.zusatzlichter)}
            </SummaryRow>

            {selections.oeffnungsarten.length > 0 ? (
              selections.oeffnungsarten.map((wing) => (
                <SummaryRow
                  key={wing.wingIndex}
                  label={`Flügel ${wing.wingIndex + 1}`}
                >
                  {resolveName(wing.oeffnungsart, cms.oeffnungsarten)}
                  {wing.griffSeite ? (
                    <span className="ml-1.5 text-xs text-black-500">
                      · Griff {wing.griffSeite}
                    </span>
                  ) : null}
                </SummaryRow>
              ))
            ) : (
              <SummaryRow label="Öffnungsarten">{"—"}</SummaryRow>
            )}

            <SummaryRow label="Fensterform">
              {resolveName(selections.fensterform, cms.fensterformen)}
            </SummaryRow>

            <SummaryRow label="Maße">
              {selections.masse ? (
                <span className="font-mono tabular-nums">
                  {selections.masse.breite} x {selections.masse.hoehe} mm
                  <span className="ml-2 text-black-500">
                    ({flaecheRounded} m&sup2;)
                  </span>
                </span>
              ) : (
                "—"
              )}
            </SummaryRow>

            <SummaryRow label="Außenfarbe">
              {resolveName(selections.farbeAussen, cms.farben)}
              <ColorDot farbCode={aussenFarbCode} />
            </SummaryRow>

            <SummaryRow label="Innenfarbe">
              {innenFarbeName}
              <ColorDot farbCode={innenFarbCode} />
            </SummaryRow>

            <SummaryRow label="Dichtungsfarbe">
              {resolveName(selections.dichtungsfarbe, cms.dichtungsfarben)}
              <ColorDot farbCode={dichtungFarbCode} />
            </SummaryRow>

            <SummaryRow label="Verglasung">
              {resolveName(selections.verglasung, cms.verglasungen)}
            </SummaryRow>

            <SummaryRow label="Schallschutz">
              {resolveName(selections.schallschutz, cms.schallschutz) ||
                "Keiner"}
            </SummaryRow>

            <SummaryRow label="Sicherheitsglas">
              {resolveName(selections.sicherheitsglas, cms.sicherheitsglas) ||
                "Keines"}
            </SummaryRow>

            <SummaryRow label="Glasdekor">
              {resolveName(selections.glasdekor, cms.glasdekore) || "Keines"}
            </SummaryRow>

            <SummaryRow label="Sprossen">
              {resolveName(selections.sprossen, cms.sprossen) || "Keine"}
            </SummaryRow>

            <SummaryRow label="Extras">
              {resolveNames(selections.extras, cms.extras)}
            </SummaryRow>
          </dl>
        </section>

        {/* Section 2: Preisvorschau */}
        <section className={cardClass}>
          <SectionKicker tone="brand" className="mb-2">
            Preis
          </SectionKicker>
          <h3 className={sectionHeading}>Preisvorschau</h3>

          <dl className="mt-6 space-y-0">
            <div className="flex items-baseline justify-between border-b border-black-100 py-3">
              <dt className="text-sm text-black-600">
                Grundpreis
                <span className="ml-2 font-mono text-xs text-black-500 tabular-nums">
                  {flaecheRounded} m&sup2; &times;{" "}
                  {grundpreisProM2.toFixed(2)} EUR/m&sup2;
                </span>
              </dt>
              <dd className="font-mono text-sm font-medium tabular-nums text-black-900">
                {basePrice.toFixed(2)} EUR
              </dd>
            </div>

            {aufpreise.map((ap, i) => (
              <div
                key={i}
                className="flex items-baseline justify-between border-b border-black-100 py-3 last:border-0"
              >
                <dt className="text-sm text-black-600">{ap.label}</dt>
                <dd className="font-mono text-sm font-medium tabular-nums text-black-900">
                  +{ap.value.toFixed(2)} EUR
                </dd>
              </div>
            ))}
          </dl>

          {/* Total */}
          <div className="mt-6 flex items-baseline justify-between rounded-md bg-brand-50 px-5 py-4">
            <span className="font-heading text-base font-medium text-black-950">
              Gesamt
            </span>
            <span className="font-heading text-3xl font-medium tabular-nums tracking-tight text-brand-800">
              {totalPrice.toFixed(2)} EUR
            </span>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-black-500">
            Preise sind unverbindlich. Der endgültige Preis steht im Angebot.
          </p>
        </section>

        {/* Section 3: Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="alternate"
            size="normal"
            onClick={() => store.setStep(1)}
          >
            Konfiguration ändern
          </Button>

          <Button
            type="button"
            variant="primary"
            size="normal"
            onClick={addToCart}
            trailingIcon={<ShoppingCart aria-hidden />}
          >
            In den Warenkorb
          </Button>
        </div>
      </div>

      {/* Success modal (Portal-based) */}
      <Modal
        open={addedToCart}
        onClose={() => setAddedToCart(false)}
        size="sm"
        ariaLabel="Produkt zum Warenkorb hinzugefügt"
        showClose={false}
      >
        <div className="p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-success-100">
              <CheckCircle2
                className="size-7 text-success-700"
                aria-hidden
              />
            </div>
            <SectionKicker tone="brand" className="mb-2">
              Hinzugefügt
            </SectionKicker>
            <h3 className="font-heading text-xl font-medium tracking-tight text-black-950 md:text-2xl">
              Dein Fenster liegt im Warenkorb
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-black-600">
              Du kannst jetzt weitere Fenster konfigurieren oder direkt zur
              Anfrage weitergehen.
            </p>

            <div className="mt-6 flex w-full flex-col gap-2.5">
              <Button
                type="button"
                variant="primary"
                size="normal"
                className="w-full"
                onClick={() => {
                  clearSavedConfig();
                  router.push("/warenkorb");
                }}
                trailingIcon={<ShoppingCart aria-hidden />}
              >
                Zum Warenkorb
              </Button>
              <Button
                type="button"
                variant="alternate"
                size="normal"
                className="w-full"
                onClick={() => {
                  store.resetAll();
                  setAddedToCart(false);
                  router.push("/konfigurator/fenster");
                }}
                leadingIcon={<Plus aria-hidden />}
              >
                Weiteres Fenster konfigurieren
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </StepContainer>
  );
}
