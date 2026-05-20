"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart/store";
import { Container } from "@/components/layout/container";
import { FlowHeader } from "@/components/ui/flow-header";
import { CheckoutStepIndicator } from "@/components/ui/checkout-step-indicator";
import { ContactForm } from "@/components/anfrage/contact-form";

interface AnfragePageClientProps {
  agbLink: string;
}

const CHECKOUT_STEPS = [
  { label: "Warenkorb" },
  { label: "Kontaktdaten" },
  { label: "Zusammenfassung" },
];

/**
 * Client-side Anfrage page — Schritt 2 von 3.
 * Rehydrates cart, redirects on empty cart, rendert Kontaktformular.
 */
export default function AnfragePageClient({ agbLink }: AnfragePageClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const items = useCartStore((s) => s.items);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace("/warenkorb");
    }
  }, [mounted, items.length, router]);

  if (!mounted || items.length === 0) {
    return (
      <Container size="md">
        <div className="py-20 md:py-28 lg:py-32">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-48 bg-black-100" />
            <div className="h-10 w-72 bg-black-100" />
            <div className="h-72 border border-black-100 bg-black-50" />
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
          currentStep={1}
          className="mb-10"
        />

        <FlowHeader
          kicker="Anfrage"
          kickerTone="brand"
          title="Kontaktdaten."
          description="Deine Angaben bleiben bei uns. Wir prüfen deine Konfiguration, erstellen ein unverbindliches Angebot und melden uns per E-Mail oder Telefon zurück."
          size="compact"
        />

        <ContactForm agbLink={agbLink} />
      </div>
    </Container>
  );
}
