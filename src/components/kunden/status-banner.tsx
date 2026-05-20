import { STATUS_CUSTOMER_TEXT, type StatusKey } from "@/lib/status-config";

const TERMINAL_STATUSES = ["storniert", "abgelehnt"] as const;
const WARNING_STATUSES = [
  "rueckfrage",
  "hersteller_problem",
  "reklamation",
  "kundenantwort",
  "stornierung_beantragt",
] as const;
const ERROR_STATUSES = ["zahlungsproblem"] as const;

export function StatusBanner({ status }: { status: string }) {
  const isTerminal = TERMINAL_STATUSES.includes(
    status as (typeof TERMINAL_STATUSES)[number],
  );
  const isWarning = WARNING_STATUSES.includes(
    status as (typeof WARNING_STATUSES)[number],
  );
  const isError =
    ERROR_STATUSES.includes(status as (typeof ERROR_STATUSES)[number]) ||
    isTerminal;

  if (!isTerminal && !isWarning && !isError) return null;

  const text = STATUS_CUSTOMER_TEXT[status as StatusKey] ?? "";

  let colorClasses: string;
  if (isError) {
    colorClasses = "bg-red-50 border-red-200 text-red-800";
  } else if (status === "kundenantwort") {
    colorClasses = "bg-cyan-50 border-cyan-200 text-cyan-800";
  } else if (status === "stornierung_beantragt") {
    colorClasses = "bg-amber-50 border-amber-200 text-amber-800";
  } else {
    colorClasses = "bg-orange-50 border-orange-200 text-orange-800";
  }

  const role = isTerminal ? "alert" : "status";

  return (
    <div role={role} className={`rounded-xl border p-4 ${colorClasses}`}>
      <p className="text-sm font-bold">{text}</p>
    </div>
  );
}
