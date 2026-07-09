"use client";

import { useState } from "react";
import {
  Database,
  FileText,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";
import type { EvidenceItem, ExplainabilityDetail } from "@/types";
import { cn } from "@/lib/utils";

interface EvidencePanelProps {
  evidence: EvidenceItem[];
  explainability: ExplainabilityDetail;
  className?: string;
}

export function EvidencePanel({ evidence, explainability, className }: EvidencePanelProps) {
  const [expanded, setExpanded] = useState(true);

  const byType = {
    bron: evidence.filter((e) => e.type === "bron"),
    dataset: evidence.filter((e) => e.type === "dataset"),
    model: evidence.filter((e) => e.type === "model"),
    aanname: evidence.filter((e) => e.type === "aanname"),
    beperking: evidence.filter((e) => e.type === "beperking"),
    onderzoeksvraag: evidence.filter((e) => e.type === "onderzoeksvraag"),
  };

  return (
    <aside
      className={cn(
        "rounded-xl border border-border/60 bg-muted/30 overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Evidence Panel</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-background border">
            Bewijsniveau: gemiddeld
          </span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-border/40">
          <EvidenceSection icon={Database} title="Databronnen" items={byType.bron} />
          <EvidenceSection icon={FileText} title="Datasets" items={byType.dataset} />
          <EvidenceSection icon={FileText} title="Modellen" items={byType.model} />
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Laatste updates
            </p>
            <ul className="text-sm space-y-1">
              {explainability.datasets.map((d) => (
                <li key={d.id} className="text-muted-foreground">
                  {d.name}: <span className="text-foreground">{d.lastUpdate}</span>
                </li>
              ))}
            </ul>
          </div>
          <EvidenceSection icon={AlertTriangle} title="Aannames" items={byType.aanname} />
          <EvidenceSection icon={AlertTriangle} title="Beperkingen" items={byType.beperking} />
          <EvidenceSection icon={HelpCircle} title="Open onderzoeksvragen" items={byType.onderzoeksvraag} />
        </div>
      )}
    </aside>
  );
}

function EvidenceSection({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: EvidenceItem[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="text-sm">
            <p className="font-medium">{item.title}</p>
            <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">{item.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ExplainabilityModalProps {
  explainability: ExplainabilityDetail;
  open: boolean;
  onClose: () => void;
}

export function ExplainabilityPanel({ explainability, open, onClose }: ExplainabilityModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-background border rounded-2xl shadow-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Waarom deze voorspelling?</h2>
          <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
            Sluiten
          </button>
        </div>
        <div className="px-6 py-5 space-y-6">
          <section>
            <h3 className="text-sm font-medium mb-2">Gebruikte datasets</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              {explainability.datasets.map((d) => (
                <li key={d.id}>• {d.name}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="text-sm font-medium mb-2">Gebruikte indicatoren</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              {explainability.indicators.map((i) => (
                <li key={i.id}>• {i.name} ({i.unit})</li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="text-sm font-medium mb-2">Gekozen model</h3>
            <p className="text-sm text-muted-foreground">
              {explainability.model.name} — {explainability.model.description}
            </p>
          </section>
          <section>
            <h3 className="text-sm font-medium mb-2">Historische periode</h3>
            <p className="text-sm text-muted-foreground">
              {explainability.historicalPeriod.start} – {explainability.historicalPeriod.end}
            </p>
          </section>
          <section>
            <h3 className="text-sm font-medium mb-2">Invloed van variabelen</h3>
            <div className="space-y-2">
              {explainability.variableInfluence.map((v) => (
                <div key={v.variable} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm">{v.variable}</p>
                    <p className="text-xs text-muted-foreground">{v.description}</p>
                  </div>
                  <div className="w-24">
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${v.influence * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {(v.influence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-sm font-medium mb-2">Onzekerheidsmarge</h3>
            <p className="text-sm text-muted-foreground">±{explainability.uncertaintyMargin}%</p>
          </section>
          <section>
            <h3 className="text-sm font-medium mb-2">Beperkingen</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              {explainability.limitations.map((l, i) => (
                <li key={i}>• {l}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
