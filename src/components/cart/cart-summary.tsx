"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { formatEUR, calculateMwSt } from "@/lib/cart/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartSummary() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const discountResult = useCartStore((s) => s.discountResult);
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.previewPrice * item.quantity,
        0,
      ),
    [items],
  );

  let discountAmount = 0;
  if (discountResult?.valid) {
    if (discountResult.typ === "prozent") {
      discountAmount =
        Math.round(subtotal * (discountResult.wert / 100) * 100) / 100;
    } else {
      discountAmount = discountResult.wert;
    }
  }

  const nettoAfterDiscount = subtotal - discountAmount;
  const { mwst, brutto } = calculateMwSt(nettoAfterDiscount);

  const handleNeueKonfiguration = () => {
    useKonfiguratorStore.getState().resetAll();
    router.push("/konfigurator/fenster");
  };

  return (
    <aside
      aria-label="Zusammenfassung"
      className="border border-black-200 bg-white p-6"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
        Zusammenfassung
      </p>

      <dl className="mt-5 space-y-0">
        {/* Netto-Subtotal */}
        <div className="flex items-baseline justify-between border-b border-black-100 py-3">
          <dt className="text-sm text-black-600">Zwischensumme (netto)</dt>
          <dd
            className={cn(
              "text-sm tabular-nums",
              discountResult?.valid
                ? "text-black-400 line-through"
                : "text-black-900",
            )}
          >
            {formatEUR(subtotal)}
          </dd>
        </div>

        {/* Discount */}
        {discountResult?.valid && (
          <>
            <div className="flex items-baseline justify-between border-b border-black-100 py-3">
              <dt className="text-sm text-brand-700">
                Rabatt ({discountResult.code})
              </dt>
              <dd className="text-sm tabular-nums text-brand-700">
                −{formatEUR(discountAmount)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-black-100 py-3">
              <dt className="text-sm text-black-600">Nach Rabatt</dt>
              <dd className="text-sm tabular-nums text-black-900">
                {formatEUR(nettoAfterDiscount)}
              </dd>
            </div>
          </>
        )}

        {/* MwSt */}
        <div className="flex items-baseline justify-between border-b border-black-100 py-3">
          <dt className="text-sm text-black-600">
            zzgl. 19&nbsp;% MwSt
          </dt>
          <dd className="text-sm tabular-nums text-black-900">
            {formatEUR(mwst)}
          </dd>
        </div>

        {/* Brutto */}
        <div className="mt-4 border-t-2 border-black-950 pt-5">
          <div className="flex items-baseline justify-between">
            <dt className="font-heading text-base font-medium text-black-950">
              Gesamt (brutto)
            </dt>
            <dd className="font-heading text-3xl font-medium tabular-nums tracking-tight text-black-950">
              {formatEUR(brutto)}
            </dd>
          </div>
        </div>
      </dl>

      <p className="mt-4 font-mono text-[11px] leading-relaxed text-black-500">
        * Unverbindliche Preisvorschau. Der endgültige Preis wird mit der
        Anfrage berechnet.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/anfrage"
          className={cn(
            buttonVariants({ variant: "primary", size: "normal" }),
            "w-full",
          )}
        >
          Weiter zur Anfrage
          <ArrowRight aria-hidden />
        </Link>

        <button
          type="button"
          onClick={handleNeueKonfiguration}
          className={cn(
            buttonVariants({ variant: "alternate", size: "normal" }),
            "w-full",
          )}
        >
          Weitere Konfiguration
        </button>
      </div>
    </aside>
  );
}
