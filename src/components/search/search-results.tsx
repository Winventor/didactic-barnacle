"use client";

import { useState } from "react";
import { Download, HelpCircle, MapPin, TrendingUp } from "lucide-react";
import type { SearchResult } from "@/types";
import { Button } from "@/components/ui/button";
import { StatementLabel } from "@/components/ui/statement-label";
import {
  HistoricalForecastChart,
  ScenarioLineChart,
  TESRadarChart,
} from "@/components/charts/labour-charts";
import { EvidencePanel, ExplainabilityPanel } from "@/components/evidence/evidence-panel";
import { DataProvenanceBanner } from "@/components/search/data-provenance-banner";
import { getTESRadarData } from "@/lib/tes/interpretation-layer";
import { getRegionById, getOccupationById, getIndicatorById, getRegionalComparison } from "@/lib/db";
import { generateResearchReport } from "@/lib/export/report-generator";
import { mockTESComponents } from "@/data/mock";

interface SearchResultsProps {
  result: SearchResult;
}

export function SearchResults({ result }: SearchResultsProps) {
  const [showExplainability, setShowExplainability] = useState(false);
  const region = getRegionById(result.forecast.regionId);
  const occupation = result.forecast.occupationId
    ? getOccupationById(result.forecast.occupationId)
    : undefined;
  const indicator = getIndicatorById(result.forecast.indicatorId);
  const radarData = getTESRadarData(result.tesInterpretations);

  const regionalComparison =
    result.resultMode === "forecast" && result.forecast.occupationId
      ? getRegionalComparison(result.forecast.occupationId, result.forecast.indicatorId)
      : [];

  const handleDownloadReport = () => {
    const markdown = generateResearchReport(result);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tes-rapport-${result.query.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Onderzoeksresultaat
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{result.query.query}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.query.entities.map((e) => (
            <span
              key={`${e.type}-${e.value}`}
              className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
            >
              {e.type}: {e.value}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10 min-w-0">
          {/* Summary */}
          <section className="rounded-xl border border-border/60 p-6">
            <h2 className="text-sm font-semibold mb-3">Samenvatting</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Neutrale AI-samenvatting — geen meningen. Alle claims voorzien van bron.
            </p>
          </section>

          {/* Data provenance */}
          <DataProvenanceBanner provenance={result.dataProvenance} />

          {/* Shortage ranking */}
          {result.resultMode === "shortage_ranking" && result.occupationRanking && (
            <section className="rounded-xl border border-border/60 p-6">
              <h2 className="text-sm font-semibold mb-4">Beroepen met hoogste tekortkans</h2>
              <div className="space-y-3">
                {result.occupationRanking.map((item, i) => (
                  <div
                    key={item.occupationId}
                    className="flex items-center gap-4 rounded-lg border border-border/40 p-4"
                  >
                    <span className="text-lg font-semibold text-muted-foreground w-6">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.occupationName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.employmentFte.toLocaleString("nl-NL")} FTE · vacaturetrend +{item.vacancyTrend}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{item.shortageScore}</p>
                      <p className="text-xs text-muted-foreground">tekortscore</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sector growth ranking */}
          {result.resultMode === "sector_growth" && result.sectorRanking && (
            <section className="rounded-xl border border-border/60 p-6">
              <h2 className="text-sm font-semibold mb-4">Sectorgroei (5-jaars trend)</h2>
              <div className="space-y-3">
                {result.sectorRanking.map((item, i) => (
                  <div
                    key={item.sectorId}
                    className="flex items-center gap-4 rounded-lg border border-border/40 p-4"
                  >
                    <span className="text-lg font-semibold text-muted-foreground w-6">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.sectorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.employmentFte.toLocaleString("nl-NL")} FTE totaal
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-700">+{item.projectedGrowthPct}%</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Historical — forecast mode */}
          {result.resultMode === "forecast" && (
            <>
              <section className="rounded-xl border border-border/60 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">Historische ontwikkeling &amp; prognose</h2>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {occupation?.name ?? "Alle beroepen"} — {region?.name} — {indicator?.name} ({indicator?.unit})
                </p>
                <HistoricalForecastChart
                  historical={result.historicalData}
                  scenarios={result.scenarios}
                  unit={indicator?.unit}
                />
              </section>

              {regionalComparison.length > 0 && (
                <section className="rounded-xl border border-border/60 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Regionale verschillen</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {regionalComparison.map(({ region: r, data }) => {
                      const latest = [...data].sort((a, b) => b.year - a.year)[0];
                      const isActive = r.id === result.forecast.regionId;
                      return (
                        <div
                          key={r.id}
                          className={`rounded-lg p-4 border ${isActive ? "border-foreground/30 bg-muted/50" : "border-border/40"}`}
                        >
                          <p className="text-sm font-medium">{r.name}</p>
                          <p className="text-2xl font-semibold mt-1">
                            {latest?.value.toLocaleString("nl-NL")}
                          </p>
                          <p className="text-xs text-muted-foreground">{indicator?.unit} ({latest?.year})</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6">
                    <NetherlandsMapHighlight activeProvince={region?.provinceCode} />
                  </div>
                </section>
              )}

              {result.scenarios.length > 0 && (
                <section className="rounded-xl border border-border/60 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold">Scenario&apos;s (5 jaar)</h2>
                    <Button variant="outline" size="sm" onClick={() => setShowExplainability(true)}>
                      <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                      Waarom deze voorspelling?
                    </Button>
                  </div>
                  <div className="grid gap-6 md:grid-cols-3">
                    {result.scenarios.map((scenario) => (
                      <div key={scenario.id} className="rounded-lg border border-border/40 p-4">
                        <p className="text-sm font-medium capitalize mb-1">{scenario.type}</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Onzekerheid: ±{scenario.uncertaintyMargin}%
                        </p>
                        <ScenarioLineChart scenario={scenario} unit={indicator?.unit} />
                        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                          {scenario.explanation}
                        </p>
                        <details className="mt-3">
                          <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                            Aannames
                          </summary>
                          <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                            {scenario.assumptions.map((a) => (
                              <li key={a}>• {a}</li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* TES */}
          <section className="rounded-xl border border-border/60 p-6">
            <h2 className="text-sm font-semibold mb-2">TES-analyse</h2>
            <p className="text-xs text-muted-foreground italic mb-5">
              Voorlopige TES-interpretatie op basis van beschikbare indicatoren.
            </p>
            <div className="grid gap-8 md:grid-cols-2">
              <TESRadarChart data={radarData} />
              <div className="space-y-4">
                {result.tesInterpretations.map((tes) => {
                  const comp = mockTESComponents.find((c) => c.id === tes.componentId);
                  return (
                    <div key={tes.id} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{comp?.name}</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            tes.signal === "positief"
                              ? "bg-emerald-50 text-emerald-700"
                              : tes.signal === "negatief"
                                ? "bg-red-50 text-red-700"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {tes.signal}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tes.narrative}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* AI Explanations */}
          <section className="rounded-xl border border-border/60 p-6">
            <h2 className="text-sm font-semibold mb-4">AI-uitleg</h2>
            <div className="space-y-4">
              {result.aiExplanations.map((ai) => (
                <div key={ai.id} className="flex gap-3">
                  <StatementLabel label={ai.label} />
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{ai.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Report */}
          <div className="flex justify-center pt-4">
            <Button onClick={handleDownloadReport} size="lg" className="rounded-xl">
              <Download className="h-4 w-4 mr-2" />
              Genereer onderzoeksrapport
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <EvidencePanel evidence={result.evidence} explainability={result.explainability} />
        </div>
      </div>

      <ExplainabilityPanel
        explainability={result.explainability}
        open={showExplainability}
        onClose={() => setShowExplainability(false)}
      />
    </div>
  );
}

function NetherlandsMapHighlight({ activeProvince }: { activeProvince?: string }) {
  const provinces: { code: string; name: string; x: number; y: number }[] = [
    { code: "DR", name: "Drenthe", x: 72, y: 28 },
    { code: "NB", name: "Noord-Brabant", x: 48, y: 68 },
    { code: "UT", name: "Utrecht", x: 52, y: 48 },
  ];

  return (
    <div className="rounded-lg bg-muted/30 p-4">
      <p className="text-xs text-muted-foreground mb-3">Nederland — provincies in dataset</p>
      <svg viewBox="0 0 100 80" className="w-full max-w-xs mx-auto">
        <rect x="30" y="15" width="45" height="55" rx="4" fill="hsl(var(--muted))" stroke="hsl(var(--border))" />
        {provinces.map((p) => (
          <g key={p.code}>
            <circle
              cx={p.x}
              cy={p.y}
              r={p.code === activeProvince ? 8 : 5}
              fill={p.code === activeProvince ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"}
              opacity={p.code === activeProvince ? 1 : 0.4}
            />
            <text x={p.x} y={p.y + 14} textAnchor="middle" fontSize="6" fill="hsl(var(--muted-foreground))">
              {p.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
