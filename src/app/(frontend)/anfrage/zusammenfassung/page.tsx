"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart/store";
import { Container } from "@/components/layout/container";
import { FlowHeader } from "@/components/ui/flow-header";
import { CheckoutStepIndicator } from "@/components/ui/checkout-step-indicator";
import { AnfrageSummary } from "@/components/anfrage/anfrage-summary";

const CHECKOUT_STEPS = [
  { label: "Warenkorb" },
  { label: "Kontaktdaten" },
  { label: "Zusammenfassung" },
];

/**
 * Anfrage summary + submit page — Schritt 3 von 3.
 * Redirects to /warenkorb if cart is empty.
 * Redirects to /anfrage if no kontaktdaten in sessionStorage.
 */
export default function ZusammenfassungPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasKontaktdaten, setHasKontaktdaten] = useState(false);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);

    const stored = sessionStorage.getItem("kontaktdaten");
    setHasKontaktdaten(!!stored);
  }, []);

  const items = useCartStore((s) => s.items);

  useEffect(() => {
    if (!mounted) return;
    if (items.length === 0) {
      router.replace("/warenkorb");
    } else if (!hasKontaktdaten) {
      router.replace("/anfrage");
    }
  }, [mounted, items.length, hasKontaktdaten, router]);

  if (!mounted || items.length === 0 || !hasKontaktdaten) {
    return (
      <Container size="md">
        <div className="py-20 md:py-28 lg:py-32">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-48 bg-black-100" />
            <div className="h-10 w-80 bg-black-100" />
            <div className="h-96 border border-black-100 bg-black-50" />
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="md">
      <div className="py-20 md:py-28 lg:py-32">
        <CheckoutStepIndicator
          steps={CHECKOUT_STEPS}
          currentStep={2}
          className="mb-10"
        />

        <FlowHeader
          kicker="Anfrage"
          kickerTone="brand"
          title="Zusammenfassung."
          description="Prüfe deine Angaben ein letztes Mal. Sobald du absendest, bekommst du eine Bestätigung per E-Mail und wir melden uns mit einem Angebot."
          size="compact"
        />

        <div className="mt-12">
          <AnfrageSummary />
        </div>
      </div>
    </Container>
  );
}
