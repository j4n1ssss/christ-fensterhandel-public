"use client";

import { type CustomerPhase } from "@/lib/status-config";

const PHASES: CustomerPhase[] = [
  "Anfrage",
  "Angebot",
  "Zahlung",
  "Produktion",
  "Lieferung",
];

export function ProgressStepper({
  currentPhase,
  completed = false,
  mini = false,
}: {
  currentPhase: CustomerPhase | null;
  completed?: boolean;
  mini?: boolean;
}) {
  if (currentPhase === null) return null;

  const currentIndex = PHASES.indexOf(currentPhase);

  if (mini) {
    return (
      <div
        className="inline-flex items-center gap-1"
        aria-label={`Fortschritt: ${currentPhase}`}
      >
        {PHASES.map((phase, i) => {
          const isCompleted = completed ? i <= currentIndex : i < currentIndex;
          const isActive = !completed && i === currentIndex;

          let dotClass = "w-2 h-2 rounded-full";
          if (isCompleted) {
            dotClass += " bg-emerald-500";
          } else if (isActive) {
            dotClass += " bg-primary ring-2 ring-primary/20";
          } else {
            dotClass += " bg-gray-300";
          }

          return <div key={phase} className={dotClass} aria-hidden="true" />;
        })}
      </div>
    );
  }

  return (
    <div role="list" className="flex w-full items-center">
      {PHASES.map((phase, i) => {
        const isCompleted = completed ? i <= currentIndex : i < currentIndex;
        const isActive = !completed && i === currentIndex;
        const isUpcoming = !completed && i > currentIndex;

        const stateLabel = isCompleted
          ? "erledigt"
          : isActive
            ? "aktuell"
            : "ausstehend";

        let dotClass = "rounded-full";
        if (isCompleted) {
          dotClass += " w-3 h-3 bg-emerald-500";
        } else if (isActive) {
          dotClass +=
            " w-4 h-4 bg-primary ring-4 ring-primary/20 animate-pulse-slow";
        } else {
          dotClass += " w-3 h-3 bg-gray-300";
        }

        let labelClass = "mt-2 text-xs sm:text-xs text-[10px]";
        if (isCompleted) {
          labelClass = "mt-2 text-[10px] sm:text-xs text-emerald-700";
        } else if (isActive) {
          labelClass =
            "mt-2 text-[10px] sm:text-xs text-foreground font-semibold";
        } else {
          labelClass = "mt-2 text-[10px] sm:text-xs text-gray-400";
        }

        return (
          <div key={phase} className="contents">
            {i > 0 && (
              <div
                className={`h-0.5 flex-1 ${isUpcoming || isActive ? "bg-gray-300" : "bg-emerald-500"}`}
              />
            )}
            <div
              role="listitem"
              className="flex flex-col items-center"
              {...(isActive ? { "aria-current": "step" as const } : {})}
            >
              <div
                className={dotClass}
                aria-label={`${phase} - ${stateLabel}`}
              />
              <span className={labelClass}>{phase}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProgressStepperMini({
  currentPhase,
  completed = false,
}: {
  currentPhase: CustomerPhase | null;
  completed?: boolean;
}) {
  return (
    <ProgressStepper currentPhase={currentPhase} completed={completed} mini />
  );
}
