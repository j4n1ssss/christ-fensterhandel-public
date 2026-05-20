import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Empty-State für den Warenkorb.
 * Editorial: bewusst ohne grossen Icon-Kreis, dafür typografisch.
 */
export function CartEmpty() {
  return (
    <div className="border border-dashed border-black-300 bg-black-50 px-6 py-20 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
        Noch leer
      </p>
      <h2 className="mt-4 font-heading text-3xl font-medium tracking-tight text-black-950 md:text-4xl">
        Dein Warenkorb ist leer.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-black-600">
        Starte eine Konfiguration, um dein erstes Produkt hinzuzufügen.
      </p>
      <Link
        href="/konfigurator"
        className={cn(
          buttonVariants({ variant: "primary", size: "normal" }),
          "mt-8",
        )}
      >
        Konfigurator starten
        <ArrowRight aria-hidden />
      </Link>
    </div>
  );
}
