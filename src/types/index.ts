/** TES Labour Intelligence Platform — core domain types */

export type AudienceType =
  | "beleidsmakers"
  | "werkgevers"
  | "loopbaanprofessionals"
  | "onderzoekers";

export type EvidenceLevel =
  | "hoog"
  | "gemiddeld"
  | "beperkt"
  | "voorlopig";

export type AIStatementLabel =
  | "Feit"
  | "Statistische uitkomst"
  | "Interpretatie"
  | "Hypothese"
  | "Adviesrichting";

export type ScenarioType = "conservatief" | "realistisch" | "optimistisch";

export type ForecastModelType =
  | "linear_regression"
  | "moving_average"
  | "trend_extrapolation"
  | "cagr"
  | "scenario_analysis"
  | "arima"
  | "prophet"
  | "bayesian"
  | "random_forest"
  | "xgboost"
  | "neural_network";

export type SearchEntityType =
  | "beroep"
  | "sector"
  | "gemeente"
  | "provincie"
  | "arbeidsmarktregio"
  | "opleiding"
  | "competentie"
  | "arbeidsmarkt"
  | "leiderschap"
  | "duurzame_inzetbaarheid";

export interface Source {
  id: string;
  name: string;
  owner: string;
  apiUrl: string;
  updateFrequency: string;
  license: string;
  lastSync: string;
  reliability: number;
  tesComponents: string[];
  description?: string;
}

export interface Dataset {
  id: string;
  sourceId: string;
  name: string;
  description: string;
  lastUpdate: string;
  indicatorIds: string[];
  regionIds: string[];
  occupationIds: string[];
}

export interface Region {
  id: string;
  name: string;
  type: "provincie" | "gemeente" | "arbeidsmarktregio";
  parentId?: string;
  provinceCode?: string;
}

export interface Occupation {
  id: string;
  name: string;
  escoCode?: string;
  sectorId: string;
  synonyms: string[];
}

export interface Sector {
  id: string;
  name: string;
  description: string;
}

export interface Indicator {
  id: string;
  name: string;
  unit: string;
  description: string;
  tesComponentId?: string;
}

export interface HistoricalValue {
  id: string;
  indicatorId: string;
  regionId: string;
  occupationId?: string;
  year: number;
  value: number;
  sourceId: string;
}

export interface ForecastModel {
  id: string;
  name: string;
  type: ForecastModelType;
  description: string;
  enabled: boolean;
  parameters?: Record<string, unknown>;
}

export interface ForecastScenario {
  id: string;
  forecastId: string;
  type: ScenarioType;
  assumptions: string[];
  uncertaintyMargin: number;
  explanation: string;
  values: { year: number; value: number }[];
}

export interface Forecast {
  id: string;
  indicatorId: string;
  regionId: string;
  occupationId?: string;
  modelId: string;
  historicalPeriod: { start: number; end: number };
  horizonYears: number;
  createdAt: string;
  scenarioIds: string[];
}

export interface TESComponent {
  id: string;
  name: string;
  description: string;
  slug: string;
}

export interface TESInterpretation {
  id: string;
  queryId: string;
  componentId: string;
  indicatorId?: string;
  signal: "positief" | "negatief" | "neutraal";
  narrative: string;
  evidenceLevel: EvidenceLevel;
}

export interface EvidenceItem {
  id: string;
  queryId: string;
  type: "bron" | "dataset" | "model" | "aanname" | "beperking" | "onderzoeksvraag";
  title: string;
  content: string;
  sourceId?: string;
  evidenceLevel: EvidenceLevel;
}

export interface UserQuery {
  id: string;
  query: string;
  audience: AudienceType;
  createdAt: string;
  entities: SearchEntity[];
}

export interface SearchEntity {
  type: SearchEntityType;
  value: string;
  matchedId?: string;
  confidence: number;
}

export interface AIExplanation {
  id: string;
  queryId: string;
  label: AIStatementLabel;
  text: string;
  sourceIds: string[];
}

export interface ExplainabilityDetail {
  datasets: Dataset[];
  indicators: Indicator[];
  model: ForecastModel;
  historicalPeriod: { start: number; end: number };
  variableInfluence: { variable: string; influence: number; description: string }[];
  uncertaintyMargin: number;
  limitations: string[];
}

export interface SearchResult {
  query: UserQuery;
  resultMode: "forecast" | "shortage_ranking" | "sector_growth";
  summary: string;
  historicalData: HistoricalValue[];
  forecast: Forecast;
  scenarios: ForecastScenario[];
  tesInterpretations: TESInterpretation[];
  aiExplanations: AIExplanation[];
  evidence: EvidenceItem[];
  explainability: ExplainabilityDetail;
  sources: Source[];
  dataProvenance: DataProvenance;
  occupationRanking?: OccupationRankingItem[];
  sectorRanking?: SectorRankingItem[];
}

export type DataMode = "live" | "mixed" | "synthetic";

export interface DataProvenance {
  mode: DataMode;
  fetchedAt: string;
  liveSourceIds: string[];
  notes: string[];
}

export interface OccupationRankingItem {
  occupationId: string;
  occupationName: string;
  shortageScore: number;
  vacancyTrend: number;
  employmentFte: number;
}

export interface SectorRankingItem {
  sectorId: string;
  sectorName: string;
  projectedGrowthPct: number;
  employmentFte: number;
}

export interface Connector {
  id: string;
  name: string;
  owner: string;
  api: string;
  updateFrequency: string;
  license: string;
  lastSync: string;
  reliability: number;
  tesComponents: string[];
  status: "active" | "mock" | "planned";
}
