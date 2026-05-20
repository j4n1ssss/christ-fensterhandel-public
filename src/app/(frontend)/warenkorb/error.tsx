"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionKicker } from "@/components/ui/section-kicker";
import { Button } from "@/components/ui/button";

export default function WarenkorbError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container size="sm">
      <div className="py-20 text-center md:py-28 lg:py-32">
        <SectionKicker tone="brand" className="flex justify-center">
          Warenkorb
        </SectionKicker>
        <h1 className="mt-5 font-heading text-3xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-4xl">
          Etwas ist schiefgegangen.
        </h1>
        <p className="mx-auto mt-4 max-w-[var(--container-lg)] text-sm leading-relaxed text-black-600 md:text-base">
          Dein Warenkorb konnte nicht geladen werden. Du kannst es erneut
          versuchen oder zur Startseite zurückkehren.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button type="button" variant="primary" size="normal" onClick={reset}>
            Erneut versuchen
          </Button>
          <Button asChild variant="alternate" size="normal">
            <Link href="/">Zur Startseite</Link>
          </Button>
        </div>

        {process.env.NODE_ENV !== "production" ? (
          <pre className="mx-auto mt-10 max-w-[var(--container-xl)] overflow-auto rounded-md border border-black-200 bg-black-50 p-4 text-left font-mono text-xs text-black-600">
            {error.message}
          </pre>
        ) : null}
      </div>
    </Container>
  );
}
