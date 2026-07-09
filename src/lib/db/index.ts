import type {
  AudienceType,
  SearchResult,
  UserQuery,
  Source,
  OccupationRankingItem,
  SectorRankingItem,
  DataProvenance,
} from "@/types";
import {
  mockSources,
  mockDatasets,
  mockRegions,
  mockOccupations,
  mockSectors,
  mockIndicators,
  mockForecastModels,
} from "@/data/mock";
import { resolveQuery } from "@/lib/search/semantic-search";
import { forecastEngine } from "@/lib/forecast/forecast-engine";
import { generateAIExplanations, generateNeutralSummary } from "@/lib/ai/explanation-layer";
import { generateTESInterpretations } from "@/lib/tes/interpretation-layer";
import { buildEvidencePanel, buildExplainability } from "@/lib/evidence/evidence-panel";
import { fetchLiveLabourContext } from "@/lib/connectors/cbs-connector";
import {
  getHistoricalValuesResolved,
  getRegionalIndicatorValues,
  generateSyntheticSeries,
} from "@/lib/data/history-resolver";

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
}) {
  return getHistoricalValuesResolved({
    regionId: filters.regionId ?? "prov-drenthe",
    occupationId: filters.occupationId,
    indicatorId: filters.indicatorId ?? "ind-werkgelegenheid",
  });
}

function buildOccupationRanking(regionId: string): OccupationRankingItem[] {
  return mockOccupations
    .map((occ) => {
      const vacHistory = generateSyntheticSeries({
        indicatorId: "ind-vacatures",
        regionId,
        occupationId: occ.id,
      });
      const empHistory = generateSyntheticSeries({
        indicatorId: "ind-werkgelegenheid",
        regionId,
        occupationId: occ.id,
      });
      const vacTrend =
        vacHistory[vacHistory.length - 1].value - vacHistory[0].value;
      const emp = empHistory[empHistory.length - 1].value;
      const shortageScore = Math.round((vacTrend / Math.max(emp, 1)) * 1000);

      return {
        occupationId: occ.id,
        occupationName: occ.name,
        shortageScore,
        vacancyTrend: Math.round(vacTrend),
        employmentFte: Math.round(emp),
      };
    })
    .sort((a, b) => b.shortageScore - a.shortageScore);
}

function buildSectorRanking(regionId: string): SectorRankingItem[] {
  return mockSectors
    .map((sector) => {
      const occs = mockOccupations.filter((o) => o.sectorId === sector.id);
      const growthRates = occs.map((occ) => {
        const hist = generateSyntheticSeries({
          indicatorId: "ind-werkgelegenheid",
          regionId,
          occupationId: occ.id,
        });
        const start = hist[0].value;
        const end = hist[hist.length - 1].value;
        return ((end - start) / start) * 100;
      });
      const avgGrowth =
        growthRates.reduce((a, b) => a + b, 0) / Math.max(growthRates.length, 1);
      const emp = occs.reduce((sum, occ) => {
        const h = generateSyntheticSeries({
          indicatorId: "ind-werkgelegenheid",
          regionId,
          occupationId: occ.id,
        });
        return sum + h[h.length - 1].value;
      }, 0);

      return {
        sectorId: sector.id,
        sectorName: sector.name,
        projectedGrowthPct: Math.round(avgGrowth * 10) / 10,
        employmentFte: Math.round(emp),
      };
    })
    .sort((a, b) => b.projectedGrowthPct - a.projectedGrowthPct);
}

function emptyForecast(indicatorId: string, regionId: string) {
  return {
    id: "fc-empty",
    indicatorId,
    regionId,
    modelId: "model-linreg",
    historicalPeriod: { start: 2015, end: 2024 },
    horizonYears: 5,
    createdAt: new Date().toISOString(),
    scenarioIds: [],
  };
}

export async function executeSearchAsync(
  queryText: string,
  options: QueryOptions = {}
): Promise<SearchResult> {
  const resolved = resolveQuery(queryText);
  const audience = options.audience ?? "beleidsmakers";
  const queryId = `q-${Date.now()}`;

  let liveNational: Awaited<ReturnType<typeof fetchLiveLabourContext>>["national"] = [];
  let liveRegional: Awaited<ReturnType<typeof fetchLiveLabourContext>>["regional"] = null;
  let liveUnemployment: Awaited<ReturnType<typeof fetchLiveLabourContext>>["unemploymentNational"] = [];
  const provenanceNotes: string[] = [];
  let dataMode: DataProvenance["mode"] = "synthetic";

  try {
    const live = await fetchLiveLabourContext(resolved.regionId, resolved.provinceId);
    liveNational = live.national;
    liveRegional = live.regional;
    liveUnemployment = live.unemploymentNational;
    if (liveNational.length > 0) {
      dataMode = liveRegional ? "mixed" : "live";
      provenanceNotes.push(
        `Live CBS arbeidsparticipatie (${liveNational.length} jaren, tabel 84799NED).`
      );
      if (liveRegional) {
        provenanceNotes.push(
          `Regionale CBS-calibratie: ${liveRegional.regionLabel} (${liveRegional.labourParticipationPct}%, ${liveRegional.year}).`
        );
      }
    }
    if (liveUnemployment.length > 0 && resolved.indicatorId === "ind-werkeloosheid") {
      dataMode = liveRegional ? "mixed" : "live";
      provenanceNotes.push(
        `Live CBS werkloosheidspercentage (${liveUnemployment.length} jaren, tabel 82809NED).`
      );
      provenanceNotes.push(
        `Gemeentelijke prognose: CBS-landelijk met regionale calibratie voor ${getRegionById(resolved.regionId)?.name ?? resolved.regionId}.`
      );
    }
  } catch {
    provenanceNotes.push("CBS live API niet bereikbaar — fallback naar gesimuleerde tijdreeksen.");
    dataMode = "synthetic";
  }

  if (resolved.analysisScope === "beroep" && resolved.occupationId) {
    provenanceNotes.push(
      "Beroepsspecifieke reeksen zijn modelgebaseerd (geen live UWV-beroepkoppeling in v1)."
    );
  }

  const region = getRegionById(resolved.regionId)!;
  const occupation = resolved.occupationId
    ? getOccupationById(resolved.occupationId)
    : undefined;
  const indicator = getIndicatorById(resolved.indicatorId)!;

  const historicalData = getHistoricalValuesResolved({
    regionId: resolved.regionId,
    occupationId: resolved.occupationId,
    indicatorId: resolved.indicatorId,
    liveNational,
    liveRegional,
    liveUnemployment,
  });

  const allIndicators = getRegionalIndicatorValues(
    resolved.regionId,
    liveNational,
    liveRegional,
    liveUnemployment
  );

  const model = mockForecastModels.find((m) => m.type === "linear_regression" && m.enabled)!;

  let forecastResult;
  if (historicalData.length >= 3) {
    forecastResult = forecastEngine.generate({
      indicatorId: resolved.indicatorId,
      regionId: resolved.regionId,
      occupationId: resolved.occupationId,
      historicalData,
      model,
      horizonYears: 5,
    });
  } else {
    forecastResult = {
      forecast: emptyForecast(resolved.indicatorId, resolved.regionId),
      scenarios: [],
      modelMetrics: {
        residualStdDev: 0,
        historicalPeriod: { start: 2015, end: 2024 },
      },
      historicalFit: [],
    };
  }

  const relevantDatasets = mockDatasets.filter(
    (d) =>
      d.regionIds.includes(resolved.provinceId) ||
      d.regionIds.includes(resolved.regionId) ||
      (resolved.occupationId && d.occupationIds.includes(resolved.occupationId))
  );
  const relevantSources: Source[] = mockSources.filter((s) => {
    if (dataMode !== "synthetic" && s.id === "src-cbs") return true;
    if (resolved.indicatorId === "ind-werkeloosheid" && s.id === "src-uwv") return true;
    return relevantDatasets.some((d) => d.sourceId === s.id);
  });

  const realistic = forecastResult.scenarios.find((s) => s.type === "realistisch");

  const explainability = buildExplainability(
    relevantDatasets,
    [indicator],
    model,
    forecastResult.modelMetrics.historicalPeriod,
    realistic?.uncertaintyMargin ?? 0,
    forecastResult.modelMetrics.rSquared,
    forecastResult.modelMetrics.cagr
  );

  const evidencePanel = buildEvidencePanel(queryId, relevantSources, relevantDatasets, model, explainability);

  const userQuery: UserQuery = {
    id: queryId,
    query: queryText,
    audience,
    createdAt: new Date().toISOString(),
    entities: resolved.entities,
  };
  db.saveQuery(userQuery);

  const occupationRanking =
    resolved.resultMode === "shortage_ranking"
      ? buildOccupationRanking(resolved.regionId)
      : undefined;

  const sectorRanking =
    resolved.resultMode === "sector_growth"
      ? buildSectorRanking(resolved.regionId)
      : undefined;

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
    resultMode: resolved.resultMode,
    dataMode,
    analysisScope: resolved.analysisScope,
  };

  let summary = generateNeutralSummary(aiCtx);
  if (resolved.resultMode === "shortage_ranking" && occupationRanking) {
    const top = occupationRanking.slice(0, 3).map((o) => o.occupationName).join(", ");
    summary = `Op basis van vacaturetrends en werkgelegenheid in ${region.name} tonen de hoogste tekortkansen: ${top}. Ranking berekend met statistisch model op indicator 'openstaande vacatures' vs. FTE (bron: UWV mock + CBS-calibratie waar beschikbaar).`;
  } else if (resolved.resultMode === "sector_growth" && sectorRanking) {
    const top = sectorRanking.slice(0, 3).map((s) => `${s.sectorName} (+${s.projectedGrowthPct}%)`).join(", ");
    summary = `Sectorale groeiprognose voor ${region.name} (5-jaars trendextrapolatie): ${top}. Gebaseerd op beroepsgroep-trends per sector.`;
  }

  const dataProvenance: DataProvenance = {
    mode: dataMode,
    fetchedAt: new Date().toISOString(),
    liveSourceIds:
      dataMode !== "synthetic"
        ? resolved.indicatorId === "ind-werkeloosheid"
          ? ["src-cbs", "src-uwv"]
          : ["src-cbs"]
        : [],
    notes: provenanceNotes,
  };

  return {
    query: userQuery,
    resultMode: resolved.resultMode,
    summary,
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
    dataProvenance,
    occupationRanking,
    sectorRanking,
  };
}

/** Synchronous fallback — geen live data */
export function executeSearch(queryText: string, options: QueryOptions = {}): SearchResult {
  const resolved = resolveQuery(queryText);
  const audience = options.audience ?? "beleidsmakers";
  const queryId = `q-${Date.now()}`;

  const region = getRegionById(resolved.regionId)!;
  const occupation = resolved.occupationId
    ? getOccupationById(resolved.occupationId)
    : undefined;
  const indicator = getIndicatorById(resolved.indicatorId)!;

  const historicalData = getHistoricalValuesResolved({
    regionId: resolved.regionId,
    occupationId: resolved.occupationId,
    indicatorId: resolved.indicatorId,
  });
  const allIndicators = getRegionalIndicatorValues(resolved.regionId);
  const model = mockForecastModels.find((m) => m.type === "linear_regression" && m.enabled)!;
  const forecastResult = forecastEngine.generate({
    indicatorId: resolved.indicatorId,
    regionId: resolved.regionId,
    occupationId: resolved.occupationId,
    historicalData,
    model,
    horizonYears: 5,
  });

  const relevantDatasets = mockDatasets.filter(
    (d) => d.regionIds.includes(resolved.regionId) || (resolved.occupationId && d.occupationIds.includes(resolved.occupationId))
  );
  const relevantSources = mockSources.filter((s) =>
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
    entities: resolved.entities,
  };

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
    resultMode: resolved.resultMode,
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
    dataProvenance: {
      mode: "synthetic",
      fetchedAt: new Date().toISOString(),
      liveSourceIds: [],
      notes: ["Synchronische fallback — geen live CBS-fetch."],
    },
    occupationRanking:
      resolved.resultMode === "shortage_ranking"
        ? buildOccupationRanking(resolved.regionId)
        : undefined,
    sectorRanking:
      resolved.resultMode === "sector_growth"
        ? buildSectorRanking(resolved.regionId)
        : undefined,
  };
}

export function getRegionalComparison(occupationId: string, indicatorId: string) {
  const provinces = ["prov-drenthe", "prov-brabant", "prov-utrecht"];
  return provinces.map((regionId) => ({
    region: getRegionById(regionId)!,
    data: getHistoricalValuesResolved({ regionId, occupationId, indicatorId }),
  }));
}

/** Vergelijk gemeenten binnen een provincie voor een regionale indicator */
export function getMunicipalityComparison(indicatorId: string, provinceId: string) {
  const gemeenten = mockRegions.filter((r) => r.parentId === provinceId);
  return gemeenten.map((region) => ({
    region,
    data: getHistoricalValuesResolved({ regionId: region.id, indicatorId }),
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
};
