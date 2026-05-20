import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ErrorAlert — Block-Fehlermeldung mit Icon, Titel und Body.
 *
 * Nutzt die neue Error-Token-Skala (error-50 / 200 / 600 / 700).
 * Für Inline-Feldfehler siehe `FieldError` in `ui/input.tsx`.
 */

interface ErrorAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optionaler fetter Titel über dem Body. */
  title?: string;
  /** Body-Text oder beliebige Kinder. */
  children: React.ReactNode;
}

export function ErrorAlert({
  title,
  children,
  className,
  ...props
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-md border border-error-200 bg-error-50 px-4 py-3",
        className,
      )}
      {...props}
    >
      <AlertCircle
        className="mt-0.5 size-4 shrink-0 text-error-600"
        aria-hidden
      />
      <div className="flex-1 space-y-1 text-sm">
        {title ? (
          <p className="font-medium text-error-800">{title}</p>
        ) : null}
        <div className="text-error-700">{children}</div>
      </div>
    </div>
  );
}
