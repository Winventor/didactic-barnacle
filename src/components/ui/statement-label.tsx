import type { AIStatementLabel } from "@/types";
import { cn } from "@/lib/utils";

const LABEL_STYLES: Record<AIStatementLabel, string> = {
  Feit: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "Statistische uitkomst": "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Interpretatie: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Hypothese: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  Adviesrichting: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function StatementLabel({ label }: { label: AIStatementLabel }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium shrink-0",
        LABEL_STYLES[label]
      )}
    >
      {label}
    </span>
  );
}
