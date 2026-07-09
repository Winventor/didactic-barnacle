import type {
  AIExplanation,
  AIStatementLabel,
  AudienceType,
  DataMode,
  ForecastScenario,
  HistoricalValue,
  Region,
  Occupation,
  Indicator,
} from "@/types";
import type { QueryResultMode } from "@/lib/search/semantic-search";

export interface AIExplanationContext {
  queryId: string;
  query: string;
  audience: AudienceType;
  region?: Region;
  occupation?: Occupation;
  indicator?: Indicator;
  historicalData: HistoricalValue[];
  scenarios: ForecastScenario[];
  modelName: string;
  rSquared?: number;
  sourceNames: string[];
  resultMode?: QueryResultMode;
  dataMode?: DataMode;
  analysisScope?: "beroep" | "regio";
}

const AUDIENCE_TONE: Record<AudienceType, string> = {
  beleidsmakers: "beleidsrelevante",
  werkgevers: "praktisch HR-gerichte",
  loopbaanprofessionals: "loopbaangerichte",
  onderzoekers: "wetenschappelijk onderbouwde",
};

function formatValue(value: number, unit?: string): string {
  if (unit === "%") return `${value.toLocaleString("nl-NL")}%`;
  return `${value.toLocaleString("nl-NL")} ${unit ?? ""}`.trim();
}

export function generateAIExplanations(ctx: AIExplanationContext): AIExplanation[] {
  const explanations: AIExplanation[] = [];
  let idx = 0;
  const unit = ctx.indicator?.unit ?? "FTE";
  const subject =
    ctx.analysisScope === "regio" || !ctx.occupation
      ? ctx.indicator?.name ?? "Arbeidsmarktindicator"
      : ctx.occupation.name;
  const region = ctx.region?.name ?? "de geselecteerde regio";

  const add = (label: AIStatementLabel, text: string, sourceIds: string[] = []) => {
    explanations.push({
      id: `ai-${ctx.queryId}-${idx++}`,
      queryId: ctx.queryId,
      label,
      text,
      sourceIds,
    });
  };

  const dataLabel =
    ctx.dataMode === "live"
      ? "live CBS-data"
      : ctx.dataMode === "mixed"
        ? "live CBS-data gecombineerd met regionale modellering"
        : "modelgebaseerde tijdreeksen";

  add(
    "Feit",
    `Deze analyse richt zich op ${subject} in ${region} (${dataLabel}).` +
      (ctx.occupation ? "" : " Geen specifiek beroep geselecteerd — dit is een regionale arbeidsmarktindicator."),
    ctx.indicator?.id === "ind-werkeloosheid" ? ["src-cbs", "src-uwv"] : ["src-cbs"]
  );

  const sorted = [...ctx.historicalData].sort((a, b) => a.year - b.year);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const changePct =
    first && last ? (((last.value - first.value) / first.value) * 100).toFixed(1) : "—";

  add(
    "Feit",
    `${subject} in ${region} wijzigde van ${formatValue(first?.value ?? 0, unit)} (${first?.year}) naar ${formatValue(last?.value ?? 0, unit)} (${last?.year}).`,
    ctx.indicator?.id === "ind-werkeloosheid" ? ["src-cbs", "src-uwv"] : ["src-cbs"]
  );

  add(
    "Statistische uitkomst",
    `Het ${ctx.modelName}-model schat een historische verandering van ${changePct}% over ${Math.max(sorted.length - 1, 0)} jaar.` +
      (ctx.rSquared !== undefined ? ` R² = ${ctx.rSquared.toFixed(3)}.` : ""),
    ["src-cbs"]
  );

  const realistic = ctx.scenarios.find((s) => s.type === "realistisch");
  if (realistic) {
    const endVal = realistic.values[realistic.values.length - 1];
    add(
      "Statistische uitkomst",
      `Realistisch scenario: ${formatValue(endVal.value, unit)} in ${endVal.year} (onzekerheid ±${realistic.uncertaintyMargin}%).`,
      ctx.indicator?.id === "ind-werkeloosheid" ? ["src-cbs", "src-uwv"] : ["src-cbs"]
    );
  }

  if (ctx.indicator?.id === "ind-werkeloosheid") {
    add(
      "Interpretatie",
      `Werkloosheid in ${region} wordt beïnvloed door regionale economische structuur, seizoenspatronen en landelijke conjunctuur. Gemeentelijke schattingen zijn gebaseerd op CBS-landelijke reeksen met regionale calibratie.`,
      ["src-cbs", "src-uwv"]
    );
    add(
      "Hypothese",
      `Een stijgende werkloosheidstrend in ${region} kan samenhangen met mismatch op de arbeidsmarkt of afnemende vraag in dominante sectoren.`,
      ["src-uwv"]
    );
  } else if (ctx.occupation) {
    add(
      "Hypothese",
      `De trend voor ${ctx.occupation.name} in ${region} kan samenhangen met sectorale vraagontwikkeling en regionale demografie.`,
      ["src-uwv", "src-cbs"]
    );
  } else {
    add(
      "Interpretatie",
      `De analyse betreft de regionale arbeidsmarkt in ${region}, niet één specifiek beroep.`,
      ["src-cbs"]
    );
  }

  add(
    "Adviesrichting",
    `Voor ${AUDIENCE_TONE[ctx.audience]} besluitvorming: combineer deze indicator met aanvullende UWV- en CBS-data op gemeenteniveau.`,
    ["src-uwv", "src-cbs"]
  );

  add(
    "Feit",
    `Gebruikte bronnen: ${ctx.sourceNames.join(", ")}.`,
    ctx.sourceNames.map((n) =>
      n.includes("UWV") ? "src-uwv" : n.includes("CBS") ? "src-cbs" : "src-scp"
    )
  );

  return explanations;
}

export function generateNeutralSummary(ctx: AIExplanationContext): string {
  const region = ctx.region?.name ?? "de geselecteerde regio";
  const indicator = ctx.indicator?.name ?? "de indicator";
  const unit = ctx.indicator?.unit ?? "";
  const realistic = ctx.scenarios.find((s) => s.type === "realistisch");
  const endYear = realistic?.values[realistic.values.length - 1]?.year ?? new Date().getFullYear() + 5;
  const endValue = realistic?.values[realistic.values.length - 1]?.value;

  if (ctx.indicator?.id === "ind-werkeloosheid") {
    return `Prognose voor ${indicator.toLowerCase()} in ${region}: op basis van CBS-werkloosheidscijfers (nationaal, live) en regionale calibratie voor ${region}. Het ${ctx.modelName}-model projecteert voor het realistische scenario circa ${formatValue(endValue ?? 0, unit)} in ${endYear}. Dit is een regionale arbeidsmarktprognose — geen beroepsspecifieke analyse.`;
  }

  if (ctx.analysisScope === "regio" || !ctx.occupation) {
    return `Prognose voor ${indicator.toLowerCase()} in ${region}. Het statistische ${ctx.modelName}-model projecteert voor het realistische scenario circa ${formatValue(endValue ?? 0, unit)} in ${endYear}. Regionale analyse zonder specifiek beroep.`;
  }

  return `Prognose voor ${ctx.occupation.name} in ${region} (${indicator.toLowerCase()}). Het ${ctx.modelName}-model projecteert circa ${formatValue(endValue ?? 0, unit)} in ${endYear}. Gebaseerd op klassieke trendextrapolatie met bronverwijzing.`;
}
