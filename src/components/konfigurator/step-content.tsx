'use client'

import React from 'react'
import { STEPS } from '@/lib/konfigurator/step-config'
import { useKonfiguratorStore } from '@/lib/konfigurator/store'
import { StepProdukttyp } from './steps/step-produkttyp'
import { StepMaterial } from './steps/step-material'
import { StepProfil } from './steps/step-profil'
import { StepFluegel } from './steps/step-fluegel'
import { StepOeffnungsart } from './steps/step-oeffnungsart'
import { StepForm } from './steps/step-form'
import { StepMasse } from './steps/step-masse'
import { StepFarben } from './steps/step-farben'
import { StepVerglasungExtras } from './steps/step-verglasung-extras'
import { StepZusammenfassung } from './steps/step-zusammenfassung'

/**
 * Map step IDs to their components.
 * All 10 steps are mapped.
 */
const STEP_COMPONENTS: Record<number, React.ComponentType> = {
  1: StepProdukttyp,
  2: StepMaterial,
  3: StepProfil,
  4: StepFluegel,
  5: StepOeffnungsart,
  6: StepForm,
  7: StepMasse,
  8: StepFarben,
  9: StepVerglasungExtras,
  10: StepZusammenfassung,
}

/**
 * Renders the active step's content.
 * Implemented steps get their real component, others show placeholder.
 */
export function StepContent() {
  const currentStep = useKonfiguratorStore((s) => s.currentStep)
  const stepConfig = STEPS.find((s) => s.id === currentStep)

  if (!stepConfig) {
    return (
      <div className="flex-1 p-8 text-center text-sm text-black-500">
        Unbekannter Step
      </div>
    )
  }

  const StepComponent = STEP_COMPONENTS[currentStep]

  if (StepComponent) {
    return <StepComponent />
  }

  return (
    <div className="flex-1 overflow-y-auto px-[var(--page-padding-inline)] py-8 md:py-10 lg:py-12">
      <div className="mx-auto w-full max-w-[var(--layout-sm)]">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
          Schritt {stepConfig.id}
        </p>
        <h2 className="mt-3 font-heading text-2xl font-medium leading-[1.1] tracking-tight text-black-950 md:text-3xl">
          {stepConfig.name}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-black-600 md:text-base">
          Dieser Schritt wird in einem späteren Plan implementiert.
        </p>
        <div className="mt-8 flex h-48 items-center justify-center rounded-md border border-dashed border-black-200 bg-black-50">
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-black-500">
            Placeholder · {stepConfig.name}
          </span>
        </div>
      </div>
    </div>
  )
}
