"use client";

import React, { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart/store";
import { Container } from "@/components/layout/container";
import { CartItemCard } from "@/components/cart/cart-item-card";
import { CartSummary } from "@/components/cart/cart-summary";
import { CartEmpty } from "@/components/cart/cart-empty";
import { DiscountInput } from "@/components/cart/discount-input";

export default function WarenkorbPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const items = useCartStore((s) => s.items);

  // Skeleton während Hydration — gleiche Metriken wie finale Page.
  if (!mounted) {
    return (
      <Container size="xl">
        <div className="py-20 md:py-28 lg:py-32">
          <CartHeader eyebrow="Warenkorb" />
          <div className="mt-12 grid animate-pulse gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <div className="h-36 border border-black-100 bg-black-50" />
              <div className="h-36 border border-black-100 bg-black-50" />
            </div>
            <div className="h-96 border border-black-100 bg-black-50" />
          </div>
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container size="xl">
        <div className="py-20 md:py-28 lg:py-32">
          <CartHeader eyebrow="Warenkorb" />
          <div className="mt-12">
            <CartEmpty />
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <div className="py-20 md:py-28 lg:py-32">
        <CartHeader
          eyebrow="Warenkorb"
          count={items.length}
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12 xl:grid-cols-[1fr_420px]">
          {/* Linke Spalte: Produkte + Rabatt */}
          <div className="space-y-4">
            {items.map((item) => (
              <CartItemCard key={item.id} item={item} />
            ))}

            <div className="border border-black-200 bg-white p-5 md:p-6">
              <DiscountInput />
            </div>
          </div>

          {/* Rechte Spalte: Summary sticky */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CartSummary />
          </div>
        </div>
      </div>
    </Container>
  );
}

function CartHeader({
  eyebrow,
  count,
}: {
  eyebrow: string;
  count?: number;
}) {
  return (
    <div className="flex flex-col gap-6 border-b border-black-200 pb-10 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl">
          Deine Auswahl.
        </h1>
      </div>
      {typeof count === "number" && count > 0 && (
        <p className="font-mono text-sm text-black-600">
          <span className="tabular-nums text-black-950">{count}</span>{" "}
          {count === 1 ? "Konfiguration" : "Konfigurationen"}
        </p>
      )}
    </div>
  );
}
