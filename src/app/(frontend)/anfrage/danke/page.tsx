import React, { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { DankeContent } from "@/components/anfrage/danke-content";

export const metadata = {
  title: "Anfrage gesendet | Muster Fenster",
};

/**
 * Thank you page nach erfolgreichem Anfrage-Submit.
 * Suspense-wrapped für useSearchParams-Kompatibilität mit Next.js Static Generation.
 */
export default function DankePage() {
  return (
    <Suspense
      fallback={
        <Container size="sm">
          <div className="py-24 text-center md:py-32">
            <div className="animate-pulse space-y-6">
              <div className="mx-auto size-16 rounded-full bg-black-100" />
              <div className="mx-auto h-10 w-64 bg-black-100" />
              <div className="mx-auto h-24 w-full border border-black-100 bg-black-50" />
            </div>
          </div>
        </Container>
      }
    >
      <DankeContent />
    </Suspense>
  );
}
