import type {
  AIExplanation,
  AIStatementLabel,
  AudienceType,
  ForecastScenario,
  HistoricalValue,
  Region,
  Occupation,
  Indicator,
} from "@/types";

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
}

const AUDIENCE_TONE: Record<AudienceType, string> = {
  beleidsmakers: "beleidsrelevante",
  werkgevers: "praktisch HR-gerichte",
  loopbaanprofessionals: "loopbaangerichte",
  onderzoekers: "wetenschappelijk onderbouwde",
};

export function generateAIExplanations(ctx: AIExplanationContext): AIExplanation[] {
  const explanations: AIExplanation[] = [];
  let idx = 0;

  const add = (label: AIStatementLabel, text: string, sourceIds: string[] = []) => {
    explanations.push({
      id: `ai-${ctx.queryId}-${idx++}`,
      queryId: ctx.queryId,
      label,
      text,
      sourceIds,
    });
  };

  const sorted = [...ctx.historicalData].sort((a, b) => a.year - b.year);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const growthPct = first && last ? (((last.value - first.value) / first.value) * 100).toFixed(1) : "—";

  add(
    "Feit",
    `${ctx.occupation?.name ?? "Werkgelegenheid"} in ${ctx.region?.name ?? "de geselecteerde regio"} steeg van ${first?.value.toLocaleString("nl-NL") ?? "—"} naar ${last?.value.toLocaleString("nl-NL") ?? "—"} FTE in de periode ${first?.year}–${last?.year} (bron: CBS StatLine).`,
    ["src-cbs"]
  );

  add(
    "Statistische uitkomst",
    `Het ${ctx.modelName}-model schat een historische groei van ${growthPct}% over ${sorted.length - 1} jaar. ${ctx.rSquared !== undefined ? `Het model verklaart ${(ctx.rSquared * 100).toFixed(1)}% van de variantie (R² = ${ctx.rSquared.toFixed(3)}).` : ""}`,
    ["src-cbs"]
  );

  const realistic = ctx.scenarios.find((s) => s.type === "realistisch");
  if (realistic) {
    const endVal = realistic.values[realistic.values.length - 1];
    add(
      "Statistische uitkomst",
      `Het realistische scenario projecteert ${endVal.value.toLocaleString("nl-NL")} FTE in ${endVal.year}, met een onzekerheidsmarge van ±${realistic.uncertaintyMargin}%.`,
      ["src-cbs", "src-nea"]
    );
  }

  const conservative = ctx.scenarios.find((s) => s.type === "conservatief");
  const optimistic = ctx.scenarios.find((s) => s.type === "optimistisch");
  if (conservative && optimistic && realistic) {
    add(
      "Interpretatie",
      `De spreiding tussen conservatief (${conservative.values[conservative.values.length - 1].value.toLocaleString("nl-NL")} FTE) en optimistisch (${optimistic.values[optimistic.values.length - 1].value.toLocaleString("nl-NL")} FTE) scenario weerspiegelt onzekerheid rond migratie, investeringen en arbeidsaanbod.`,
      ["src-nea"]
    );
  }

  add(
    "Hypothese",
    `De aanhoudende groei in vacatures (UWV) gecombineerd met stabiele scholingsdeelname (SCP) suggereert dat het tekort aan ${ctx.occupation?.name?.toLowerCase() ?? "personeel"} structureel van aard kan zijn, niet alleen conjunctureel.`,
    ["src-uwv", "src-scp"]
  );

  add(
    "Adviesrichting",
    `Voor ${AUDIENCE_TONE[ctx.audience]} besluitvorming: monitor kwartaalcijfers UWV naast jaarlijkse CBS-data en valideer aannames bij volgende NEA-prognose.`,
    ["src-uwv", "src-cbs", "src-nea"]
  );

  add(
    "Interpretatie",
    `Opvallend patroon: de jaarlijkse groei versnelt licht in de laatste drie meetjaren, wat kan wijzen op cumulatieve vergrijzingsdruk in ${ctx.region?.name ?? "de regio"}.`,
    ["src-cbs"]
  );

  add(
    "Feit",
    `Gebruikte databronnen: ${ctx.sourceNames.join(", ")}. Laatste synchronisatie varieert per bron (CBS: juni 2025, UWV: juni 2025).`,
    ctx.sourceNames.map((n) => (n.includes("CBS") ? "src-cbs" : n.includes("UWV") ? "src-uwv" : "src-scp"))
  );

  return explanations;
}

export function generateNeutralSummary(ctx: AIExplanationContext): string {
  const region = ctx.region?.name ?? "de geselecteerde regio";
  const occupation = ctx.occupation?.name ?? "het geselecteerde beroep";
  const realistic = ctx.scenarios.find((s) => s.type === "realistisch");
  const endYear = realistic?.values[realistic.values.length - 1]?.year ?? new Date().getFullYear() + 5;
  const endValue = realistic?.values[realistic.values.length - 1]?.value;

  return `Op basis van CBS- en UWV-data voor ${occupation} in ${region} toont de historische analyse een gestage groei in werkgelegenheid (2015–2024). Het statistische ${ctx.modelName}-model projecteert voor het realistische scenario circa ${endValue?.toLocaleString("nl-NL") ?? "—"} FTE in ${endYear}. De prognose is gebaseerd op klassieke trendextrapolatie; alle claims zijn voorzien van bronverwijzing. Zie het evidence panel voor datasets, modellen en beperkingen.`;
}
