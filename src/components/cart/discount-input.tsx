"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { formatEUR } from "@/lib/cart/format";
import { Input, Label } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DiscountInput() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discountResult = useCartStore((s) => s.discountResult);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const setDiscount = useCartStore((s) => s.setDiscount);
  const clearDiscount = useCartStore((s) => s.clearDiscount);
  const itemCount = useCartStore((s) => s.items.length);

  const prevItemCount = useRef(itemCount);
  useEffect(() => {
    if (prevItemCount.current !== itemCount && discountResult?.valid) {
      clearDiscount();
      setCode("");
      setError(null);
    }
    prevItemCount.current = itemCount;
  }, [itemCount, discountResult, clearDiscount]);

  const handleValidate = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const subtotal = getSubtotal();
      const response = await fetch("/api/anfrage/validate-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });

      const result = await response.json();

      if (result.valid) {
        setDiscount(result);
        setError(null);
      } else {
        const errorMessages: Record<string, string> = {
          ungueltig: "Code ungültig",
          abgelaufen: "Code abgelaufen",
          aufgebraucht: "Code bereits aufgebraucht",
        };
        if (result.error === "min_bestellwert") {
          setError(
            `Mindestbestellwert von ${formatEUR(result.minWert)} nicht erreicht`,
          );
        } else {
          setError(errorMessages[result.error] || "Code ungültig");
        }
      }
    } catch {
      setError("Validierung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    clearDiscount();
    setCode("");
    setError(null);
  };

  // Success-State
  if (discountResult?.valid) {
    const rabattLabel =
      discountResult.typ === "prozent"
        ? `${discountResult.wert} % Rabatt`
        : `${formatEUR(discountResult.wert)} Rabatt`;

    return (
      <div className="flex items-center justify-between border border-brand-300 bg-brand-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-4 shrink-0 text-brand-700" aria-hidden />
          <div>
            <p className="text-sm font-medium text-brand-900">
              Code „{discountResult.code}“ angewendet
            </p>
            <p className="font-mono text-xs text-brand-700">{rabattLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="font-mono text-[11px] uppercase tracking-[0.15em] text-brand-800 underline-offset-2 transition-colors hover:text-black-950 hover:underline"
        >
          Entfernen
        </button>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor="discount-code">Rabattcode</Label>
      <div className="flex gap-2">
        <Input
          id="discount-code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleValidate()}
          placeholder="Code eingeben"
          disabled={loading}
          className="flex-1"
        />
        <button
          type="button"
          onClick={handleValidate}
          disabled={loading || !code.trim()}
          className={cn(
            buttonVariants({ variant: "secondary", size: "normal" }),
            "shrink-0",
          )}
        >
          {loading ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            "Anwenden"
          )}
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-error-600"
        >
          <X className="size-3" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
