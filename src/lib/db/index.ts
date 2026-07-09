import type {
  AudienceType,
  SearchResult,
  UserQuery,
  Source,
  HistoricalValue,
} from "@/types";
import {
  mockSources,
  mockDatasets,
  mockRegions,
  mockOccupations,
  mockSectors,
  mockIndicators,
  mockForecastModels,
  mockHistoricalValues,
} from "@/data/mock";
import { semanticSearch } from "@/lib/search/semantic-search";
import { forecastEngine } from "@/lib/forecast/forecast-engine";
import { generateAIExplanations, generateNeutralSummary } from "@/lib/ai/explanation-layer";
import { generateTESInterpretations } from "@/lib/tes/interpretation-layer";
import { buildEvidencePanel, buildExplainability } from "@/lib/evidence/evidence-panel";

export interface QueryOptions {
  audience?: AudienceType;
}

class Database {
  private queries: UserQuery[] = [];

  saveQuery(query: UserQuery): void {
    this.queries.push(query);
  }

  getQueries(): UserQuery[] {
    return this.queries;
  }
}

export const db = new Database();

export function getRegionById(id: string) {
  return mockRegions.find((r) => r.id === id);
}

export function getOccupationById(id: string) {
  return mockOccupations.find((o) => o.id === id);
}

export function getIndicatorById(id: string) {
  return mockIndicators.find((i) => i.id === id);
}

export function getHistoricalValues(filters: {
  regionId?: string;
  occupationId?: string;
  indicatorId?: string;
}): HistoricalValue[] {
  return mockHistoricalValues.filter((hv) => {
    if (filters.regionId && hv.regionId !== filters.regionId) return false;
    if (filters.occupationId && hv.occupationId !== filters.occupationId) return false;
    if (filters.indicatorId && hv.indicatorId !== filters.indicatorId) return false;
    return true;
  });
}

export function executeSearch(queryText: string, options: QueryOptions = {}): SearchResult {
  const parsed = semanticSearch(queryText);
  const audience = options.audience ?? "beleidsmakers";
  const queryId = `q-${Date.now()}`;

  const regionId = parsed.regionId ?? "prov-drenthe";
  const occupationId = parsed.occupationId ?? "occ-verpleegkundige";
  const indicatorId = parsed.indicatorId ?? "ind-werkgelegenheid";

  const region = getRegionById(regionId)!;
  const occupation = getOccupationById(occupationId)!;
  const indicator = getIndicatorById(indicatorId)!;

  const historicalData = getHistoricalValues({ regionId, occupationId, indicatorId });
  const allIndicators = getHistoricalValues({ regionId });

  const model = mockForecastModels.find((m) => m.type === "linear_regression" && m.enabled)!;
  const forecastResult = forecastEngine.generate({
    indicatorId,
    regionId,
    occupationId,
    historicalData,
    model,
    horizonYears: 5,
  });

  const relevantDatasets = mockDatasets.filter(
    (d) => d.regionIds.includes(regionId) || d.occupationIds.includes(occupationId)
  );
  const relevantSources: Source[] = mockSources.filter((s) =>
    relevantDatasets.some((d) => d.sourceId === s.id)
  );

  const realistic = forecastResult.scenarios.find((s) => s.type === "realistisch")!;

  const explainability = buildExplainability(
    relevantDatasets,
    [indicator],
    model,
    forecastResult.modelMetrics.historicalPeriod,
    realistic.uncertaintyMargin,
    forecastResult.modelMetrics.rSquared,
    forecastResult.modelMetrics.cagr
  );

  const evidencePanel = buildEvidencePanel(queryId, relevantSources, relevantDatasets, model, explainability);

  const userQuery: UserQuery = {
    id: queryId,
    query: queryText,
    audience,
    createdAt: new Date().toISOString(),
    entities: parsed.entities,
  };
  db.saveQuery(userQuery);

  const aiCtx = {
    queryId,
    query: queryText,
    audience,
    region,
    occupation,
    indicator,
    historicalData,
    scenarios: forecastResult.scenarios,
    modelName: model.name,
    rSquared: forecastResult.modelMetrics.rSquared,
    sourceNames: relevantSources.map((s) => s.name),
  };

  return {
    query: userQuery,
    summary: generateNeutralSummary(aiCtx),
    historicalData,
    forecast: forecastResult.forecast,
    scenarios: forecastResult.scenarios,
    tesInterpretations: generateTESInterpretations({
      queryId,
      historicalData,
      allIndicators,
      regionName: region.name,
    }),
    aiExplanations: generateAIExplanations(aiCtx),
    evidence: evidencePanel.items,
    explainability,
    sources: relevantSources,
  };
}

export function getRegionalComparison(occupationId: string, indicatorId: string) {
  const provinces = ["prov-drenthe", "prov-brabant", "prov-utrecht"];
  return provinces.map((regionId) => ({
    region: getRegionById(regionId)!,
    data: getHistoricalValues({ regionId, occupationId, indicatorId }),
  }));
}

export {
  mockSources,
  mockDatasets,
  mockRegions,
  mockOccupations,
  mockSectors,
  mockIndicators,
  mockForecastModels,
  mockHistoricalValues,
};
