import type { DataProvenance } from "@/types";
import { Database, Radio, FlaskConical } from "lucide-react";

const MODE_CONFIG = {
  live: {
    label: "Live data",
    icon: Radio,
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  mixed: {
    label: "Live + model",
    icon: Database,
    className: "bg-blue-50 text-blue-800 border-blue-200",
  },
  synthetic: {
    label: "Modeldata",
    icon: FlaskConical,
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
};

export function DataProvenanceBanner({ provenance }: { provenance: DataProvenance }) {
  const config = MODE_CONFIG[provenance.mode];
  const Icon = config.icon;
  const fetchedAt = new Date(provenance.fetchedAt).toLocaleString("nl-NL");

  return (
    <section className={`rounded-xl border p-4 ${config.className}`}>
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Databron: {config.label}
            {provenance.liveSourceIds.length > 0 && (
              <span className="font-normal"> — {provenance.liveSourceIds.join(", ")}</span>
            )}
          </p>
          <p className="text-xs opacity-80">Opgehaald: {fetchedAt}</p>
          <ul className="text-xs opacity-90 space-y-0.5 mt-2">
            {provenance.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
