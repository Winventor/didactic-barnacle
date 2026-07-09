import type { SearchResult } from "@/types";
import { getRegionById, getOccupationById, getIndicatorById } from "@/lib/db";

export function generateResearchReport(result: SearchResult): string {
  const region = getRegionById(result.forecast.regionId);
  const occupation = result.forecast.occupationId
    ? getOccupationById(result.forecast.occupationId)
    : undefined;
  const indicator = getIndicatorById(result.forecast.indicatorId);
  const realistic = result.scenarios.find((s) => s.type === "realistisch");
  const now = new Date().toISOString().split("T")[0];

  const lines: string[] = [
    `# TES Labour Intelligence — Onderzoeksrapport`,
    ``,
    `**Datum:** ${now}`,
    `**Onderzoeksvraag:** ${result.query.query}`,
    `**Doelgroep:** ${result.query.audience}`,
    ``,
    `---`,
    ``,
    `## Samenvatting`,
    ``,
    result.summary,
    ``,
    `## Onderzoekscontext`,
    ``,
    `- **Regio:** ${region?.name ?? "—"}`,
    `- **Beroep:** ${occupation?.name ?? "—"}`,
    `- **Indicator:** ${indicator?.name ?? "—"} (${indicator?.unit ?? ""})`,
    `- **Geëxtraheerde entiteiten:** ${result.query.entities.map((e) => `${e.type}: ${e.value}`).join(", ")}`,
    ``,
    `## Datasets`,
    ``,
    ...result.explainability.datasets.map(
      (d) => `- **${d.name}** — ${d.description} (update: ${d.lastUpdate})`
    ),
    ``,
    `## Historische ontwikkeling`,
    ``,
    `| Jaar | Waarde (${indicator?.unit ?? ""}) |`,
    `|------|------|`,
    ...[...result.historicalData]
      .sort((a, b) => a.year - b.year)
      .map((h) => `| ${h.year} | ${h.value.toLocaleString("nl-NL")} |`),
    ``,
    `## Prognoses`,
    ``,
    `**Model:** ${result.explainability.model.name}`,
    `**Historische periode:** ${result.explainability.historicalPeriod.start}–${result.explainability.historicalPeriod.end}`,
  ];

  for (const scenario of result.scenarios) {
    const end = scenario.values[scenario.values.length - 1];
    lines.push(
      ``,
      `### Scenario: ${scenario.type.charAt(0).toUpperCase() + scenario.type.slice(1)}`,
      ``,
      `- **Eindwaarde (${end.year}):** ${end.value.toLocaleString("nl-NL")} ${indicator?.unit ?? ""}`,
      `- **Onzekerheidsmarge:** ±${scenario.uncertaintyMargin}%`,
      `- **Aannames:**`,
      ...scenario.assumptions.map((a) => `  - ${a}`),
      `- **Toelichting:** ${scenario.explanation}`
    );
  }

  lines.push(
    ``,
    `## TES-analyse`,
    ``,
    `> Voorlopige TES-interpretatie op basis van beschikbare indicatoren.`,
    ``
  );

  for (const tes of result.tesInterpretations) {
    lines.push(`- **${tes.componentId.replace("tes-", "").replace(/-/g, " ")}** [${tes.signal}]: ${tes.narrative}`);
  }

  lines.push(
    ``,
    `## AI-uitleg`,
    ``
  );

  for (const ai of result.aiExplanations) {
    lines.push(`- **[${ai.label}]** ${ai.text}`);
  }

  lines.push(
    ``,
    `## Explainability`,
    ``,
    `### Gebruikte modellen`,
    `- ${result.explainability.model.name} (${result.explainability.model.type})`,
    ``,
    `### Invloed variabelen`,
    `| Variabele | Invloed | Toelichting |`,
    `|-----------|---------|-------------|`,
    ...result.explainability.variableInfluence.map(
      (v) => `| ${v.variable} | ${(v.influence * 100).toFixed(0)}% | ${v.description} |`
    ),
    ``,
    `### Onzekerheidsmarge`,
    `±${realistic?.uncertaintyMargin ?? "—"}% (realistisch scenario)`,
    ``,
    `## Bronnen`,
    ``
  );

  for (const source of result.sources) {
    lines.push(`- **${source.name}** (${source.owner}) — ${source.license}, sync: ${source.lastSync}`);
  }

  lines.push(
    ``,
    `## Beperkingen`,
    ``
  );

  for (const lim of result.explainability.limitations) {
    lines.push(`- ${lim}`);
  }

  lines.push(
    ``,
    `## Vervolgvragen`,
    ``
  );

  const openQuestions = result.evidence.filter((e) => e.type === "onderzoeksvraag");
  for (const q of openQuestions) {
    lines.push(`- ${q.content}`);
  }

  lines.push(
    ``,
    `---`,
    ``,
    `*Gegenereerd door TES Labour Intelligence Platform v1.0. Prognoses door statistische modellen; AI legt uit, TES interpreteert.*`
  );

  return lines.join("\n");
}
