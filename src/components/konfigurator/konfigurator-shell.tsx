"use client";

import React, { useEffect } from "react";
import { StepSidebar } from "./step-sidebar";
import { StepContent } from "./step-content";
import { PreviewPanel } from "./preview-panel";
import { MobileStepHeader } from "./ui/mobile-step-header";
import { StepNavigation } from "./ui/step-navigation";
import { trackEvent } from "@/lib/tracking/pirsch";

/**
 * 3-column responsive layout for the configurator.
 *
 * - Desktop (lg+): Sidebar | Content | Preview — flex row
 * - Tablet (md):   Content full width, Preview below
 * - Mobile (sm):   MobileStepHeader on top, Content, Preview, sticky footer nav
 *
 * Tokenized surfaces: bg-white page, border-black-200 dividers —
 * konsistent mit dem Marketing-Idiom (weisser Grund, schmale schwarze Linien).
 */
export function KonfiguratorShell() {
  useEffect(() => {
    trackEvent("Konfigurator gestartet");
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      {/* Mobile: Step header (visible < lg) */}
      <MobileStepHeader />

      {/* Desktop: Left sidebar (visible lg+) */}
      <StepSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Step content */}
        <StepContent />

        {/* Right column: Navigation + Preview */}
        <div className="flex w-full shrink-0 flex-col border-t border-black-200 bg-white md:w-fit md:border-l md:border-t-0">
          {/* Step navigation — sticky footer on mobile, above preview on desktop */}
          <StepNavigation />

          {/* Preview panel */}
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
