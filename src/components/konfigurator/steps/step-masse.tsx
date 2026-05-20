"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { StepContainer } from "@/components/konfigurator/ui/step-container";
import { StepHeader } from "@/components/konfigurator/ui/step-header";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionKicker } from "@/components/ui/section-kicker";

/**
 * Step 7: Maße-Eingabe.
 * React Hook Form + Zod mit dynamischen Min/Max aus dem gewählten Profil.
 * Zeigt live die berechnete Fläche in m2.
 */
export function StepMasse() {
  const cmsData = useKonfiguratorStore((s) => s.cmsData);
  const profil = useKonfiguratorStore((s) => s.profil);
  const masse = useKonfiguratorStore((s) => s.masse);
  const setSelection = useKonfiguratorStore((s) => s.setSelection);
  const completeStep = useKonfiguratorStore((s) => s.completeStep);
  const setStep = useKonfiguratorStore((s) => s.setStep);

  const selectedProfil =
    cmsData?.profile.find((p) => p.id === profil) ?? undefined;
  const masseConstraints = selectedProfil?.masse;

  const minBreite = masseConstraints?.min_breite_mm ?? 300;
  const maxBreite = masseConstraints?.max_breite_mm ?? 3000;
  const minHoehe = masseConstraints?.min_hoehe_mm ?? 300;
  const maxHoehe = masseConstraints?.max_hoehe_mm ?? 3000;

  const masseSchema = z.object({
    breite: z
      .number({ error: "Breite ist erforderlich" })
      .int("Breite muss eine ganze Zahl sein")
      .min(minBreite, `Breite muss mindestens ${minBreite} mm sein`)
      .max(maxBreite, `Breite darf maximal ${maxBreite} mm sein`),
    hoehe: z
      .number({ error: "Höhe ist erforderlich" })
      .int("Höhe muss eine ganze Zahl sein")
      .min(minHoehe, `Höhe muss mindestens ${minHoehe} mm sein`)
      .max(maxHoehe, `Höhe darf maximal ${maxHoehe} mm sein`),
  });

  type MasseFormValues = z.infer<typeof masseSchema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MasseFormValues>({
    resolver: zodResolver(masseSchema),
    defaultValues: {
      breite: masse?.breite ?? undefined,
      hoehe: masse?.hoehe ?? undefined,
    },
  });

  const watchBreite = watch("breite");
  const watchHoehe = watch("hoehe");

  const fläche =
    watchBreite && watchHoehe
      ? ((watchBreite * watchHoehe) / 1_000_000).toFixed(2)
      : null;

  const onSubmit = (data: MasseFormValues) => {
    setSelection("masse", { breite: data.breite, hoehe: data.hoehe });
    completeStep(7);
    setStep(8);
  };

  return (
    <StepContainer contentClassName="max-w-[var(--container-xl)]">
      <StepHeader
        kicker="Schritt 7 — Maße"
        title="Maße eingeben"
        description="Breite und Höhe in Millimetern. Die erlaubten Werte ergeben sich aus dem gewählten Profil — die Fläche wird live berechnet."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="breite">Breite (mm)</Label>
            <Input
              id="breite"
              type="number"
              step={1}
              placeholder={`${minBreite}-${maxBreite}`}
              aria-invalid={Boolean(errors.breite)}
              {...register("breite", { valueAsNumber: true })}
            />
            <FieldError>{errors.breite?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor="hoehe">Höhe (mm)</Label>
            <Input
              id="hoehe"
              type="number"
              step={1}
              placeholder={`${minHoehe}-${maxHoehe}`}
              aria-invalid={Boolean(errors.hoehe)}
              {...register("hoehe", { valueAsNumber: true })}
            />
            <FieldError>{errors.hoehe?.message}</FieldError>
          </div>
        </div>

        {/* Fläche live */}
        {fläche ? (
          <div className="mt-6 flex items-baseline justify-between rounded-md border border-black-200 bg-black-50 px-4 py-3">
            <SectionKicker as="span">Fläche</SectionKicker>
            <span className="font-heading text-lg font-medium tabular-nums text-black-950">
              {fläche} m&sup2;
            </span>
          </div>
        ) : null}

        {/* Constraints info */}
        <p className="mt-3 font-mono text-xs text-black-500">
          Erlaubter Bereich: {minBreite}&ndash;{maxBreite} mm breit ·{" "}
          {minHoehe}&ndash;{maxHoehe} mm hoch
        </p>

        {/* Submit */}
        <Button type="submit" variant="primary" size="normal" className="mt-8">
          Weiter zu Farben
        </Button>
      </form>
    </StepContainer>
  );
}
