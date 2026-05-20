"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Minus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "@/lib/cart/store";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { formatEUR } from "@/lib/cart/format";
import { WindowSVG } from "@/components/konfigurator/preview/window-svg";
import type { CartItem } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { updateQuantity, removeItem, setEditingItemId } = useCartStore(
    useShallow((s) => ({
      updateQuantity: s.updateQuantity,
      removeItem: s.removeItem,
      setEditingItemId: s.setEditingItemId,
    })),
  );

  const handleEdit = () => {
    const konfStore = useKonfiguratorStore.getState();
    const sel = item.selections;

    konfStore.setSelection("produkttyp", sel.produkttyp);
    konfStore.setSelection("material", sel.material);
    konfStore.setSelection("profil", sel.profil);
    konfStore.setSelection("fluegelanzahl", sel.fluegelanzahl);
    konfStore.setSelection("zusatzlichter", sel.zusatzlichter);
    konfStore.setSelection("oeffnungsarten", sel.oeffnungsarten);
    konfStore.setSelection("fensterform", sel.fensterform);
    konfStore.setSelection("masse", sel.masse);
    konfStore.setSelection("farbeAussen", sel.farbeAussen);
    konfStore.setSelection("farbeInnen", sel.farbeInnen);
    konfStore.setSelection("dichtungsfarbe", sel.dichtungsfarbe);
    konfStore.setSelection("gleichWieAussen", sel.gleichWieAussen);
    konfStore.setSelection("verglasung", sel.verglasung);
    konfStore.setSelection("schallschutz", sel.schallschutz);
    konfStore.setSelection("sicherheitsglas", sel.sicherheitsglas);
    konfStore.setSelection("glasdekor", sel.glasdekor);
    konfStore.setSelection("sprossen", sel.sprossen);
    konfStore.setSelection("extras", sel.extras);

    for (let i = 1; i <= 9; i++) {
      konfStore.completeStep(i);
    }
    konfStore.setStep(1);
    setEditingItemId(item.id);
    router.push("/konfigurator/fenster");
  };

  const handleDelete = () => {
    removeItem(item.id);
    setShowDeleteConfirm(false);
  };

  const r = item.resolvedNames;

  return (
    <article className="border border-black-200 bg-white p-5 md:p-6">
      <div className="flex gap-5">
        {/* Mini-Preview */}
        <div className="flex size-20 shrink-0 items-center justify-center border border-black-100 bg-black-50 p-1.5">
          <WindowSVG
            wingCount={parseInt(r.fluegelanzahl) || 1}
            masseMm={r.masse}
            width={60}
            height={72}
          />
        </div>

        {/* Infos */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
                {r.produkttyp}
              </p>
              <h3 className="mt-1 truncate font-heading text-lg font-medium tracking-tight text-black-950 md:text-xl">
                {r.profil}
              </h3>
              <p className="mt-1 font-mono text-xs text-black-500">
                {r.masse
                  ? `${r.masse.breite} × ${r.masse.hoehe} mm`
                  : "Maße nicht gesetzt"}
                {" · "}
                {r.farbeAussen}
              </p>
            </div>
            <span className="shrink-0 font-heading text-xl tracking-tight tabular-nums text-black-950">
              {formatEUR(item.previewPrice)}
              <span className="ml-0.5 align-super text-[10px] text-black-500">
                *
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="mt-3 inline-flex items-center gap-1.5 self-start font-mono text-[11px] uppercase tracking-[0.15em] text-black-500 transition-colors hover:text-black-950"
            aria-expanded={detailsOpen}
          >
            <ChevronDown
              className={cn(
                "size-3 transition-transform duration-200",
                detailsOpen && "rotate-180",
              )}
              aria-hidden
            />
            {detailsOpen ? "Details ausblenden" : "Details anzeigen"}
          </button>

          {detailsOpen && (
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 border-t border-black-100 pt-4 text-xs">
              <DetailRow label="Material" value={r.material} />
              <DetailRow label="Flügelanzahl" value={r.fluegelanzahl} />
              <DetailRow label="Fensterform" value={r.fensterform} />
              <DetailRow label="Innenfarbe" value={r.farbeInnen} />
              <DetailRow label="Dichtung" value={r.dichtungsfarbe} />
              <DetailRow label="Verglasung" value={r.verglasung} />
              {r.schallschutz && (
                <DetailRow label="Schallschutz" value={r.schallschutz} />
              )}
              {r.sicherheitsglas && (
                <DetailRow label="Sicherheitsglas" value={r.sicherheitsglas} />
              )}
              {r.glasdekor && <DetailRow label="Glasdekor" value={r.glasdekor} />}
              {r.sprossen && <DetailRow label="Sprossen" value={r.sprossen} />}
              {r.extras.length > 0 && (
                <DetailRow label="Extras" value={r.extras.join(", ")} />
              )}
            </dl>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black-100 pt-4">
        {/* Mengen-Stepper */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={cn(
                "inline-flex size-8 items-center justify-center border border-black-300 text-black-700 transition-colors",
                item.quantity <= 1
                  ? "cursor-not-allowed opacity-40"
                  : "hover:border-black-900 hover:bg-black-900 hover:text-white",
              )}
              aria-label="Menge reduzieren"
            >
              <Minus className="size-3.5" aria-hidden />
            </button>
            <span className="inline-flex h-8 min-w-[2.5rem] items-center justify-center border-y border-black-300 px-2 text-sm tabular-nums text-black-950">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="inline-flex size-8 items-center justify-center border border-black-300 text-black-700 transition-colors hover:border-black-900 hover:bg-black-900 hover:text-white"
              aria-label="Menge erhöhen"
            >
              <Plus className="size-3.5" aria-hidden />
            </button>
          </div>

          {item.quantity > 1 && (
            <span className="font-mono text-xs text-black-500">
              Summe:{" "}
              <span className="tabular-nums text-black-950">
                {formatEUR(item.previewPrice * item.quantity)}
              </span>
            </span>
          )}
        </div>

        {/* Edit / Delete */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-black-600 transition-colors hover:bg-black-50 hover:text-black-950"
          >
            <Pencil className="size-3" aria-hidden />
            Bearbeiten
          </button>

          {showDeleteConfirm ? (
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center rounded-md bg-error-600 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-white transition-colors hover:bg-error-700"
              >
                Ja, löschen
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="inline-flex items-center rounded-md border border-black-300 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-black-700 transition-colors hover:bg-black-50"
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-black-500 transition-colors hover:bg-error-50 hover:text-error-700"
            >
              <Trash2 className="size-3" aria-hidden />
              Löschen
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="font-mono uppercase tracking-[0.15em] text-black-500">
        {label}
      </dt>
      <dd className="text-black-900">{value}</dd>
    </>
  );
}
