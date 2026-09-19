import type {
  Forecast,
  ForecastModel,
  ForecastScenario,
  HistoricalValue,
  ScenarioType,
  ModelSelectionResult,
  ForecastModelType,
} from "@/types";
import {
  linearRegression,
  polynomialRegression,
  holtLinearTrend,
  cagr,
  movingAverage,
  standardDeviation,
  generateScenarios,
  rmse,
  interpolateQuarterly,
  type DataPoint,
} from "@/lib/statistics";
import { mockForecastModels } from "@/data/mock";

export interface ForecastRequest {
  indicatorId: string;
  regionId: string;
  occupationId?: string;
  historicalData: HistoricalValue[];
  model?: ForecastModel;
  horizonYears?: number;
  autoSelectModel?: boolean;
}

export interface ForecastResult {
  forecast: Forecast;
  scenarios: ForecastScenario[];
  model: ForecastModel;
  modelMetrics: {
    rSquared?: number;
    cagr?: number;
    residualStdDev: number;
    rmse: number;
    historicalPeriod: { start: number; end: number };
    dataPoints: number;
  };
  historicalFit: { year: number; actual: number; fitted: number }[];
  chartSeries: { period: string; year: number; value: number; kind: "historisch" | "model-fit" }[];
  modelSelection?: ModelSelectionResult;
}

const SCENARIO_ASSUMPTIONS: Record<ScenarioType, string[]> = {
  conservatief: [
    "Vertraagde economische groei of versnelde automatisering",
    "Beperkte investeringen in arbeidsmarkt",
    "Stabiel tot licht dalend arbeidsaanbod",
    "Geen extra overheidsinterventies",
  ],
  realistisch: [
    "Voortzetting van de gekozen trend op basis van historische meetpunten",
    "Geen structurele breuk met het recente verleden",
    "Macro-economische omgeving vergelijkbaar met basisperiode",
    "Datakwaliteit en definities blijven gelijk",
  ],
  optimistisch: [
    "Versnelde economische groei of extra arbeidsmarktinterventies",
    "Verhoogde arbeidsmarktparticipatie",
    "Succesvolle sectorale investeringen",
    "Gunstiger demografische ontwikkeling",
  ],
};

const SCENARIO_MULTIPLIERS = {
  conservatief: 0.92,
  realistisch: 1.0,
  optimistisch: 1.08,
};

const ENABLED_MODEL_TYPES: ForecastModelType[] = [
  "linear_regression",
  "polynomial_regression",
  "holt",
  "moving_average",
  "cagr",
];

interface InternalModelFit {
  model: ForecastModel;
  fitted: number[];
  forecast: number[];
  rSquared: number;
  rmse: number;
  residualStdDev: number;
  cagr?: number;
}

export class ForecastEngine {
  private static instance: ForecastEngine;

  static getInstance(): ForecastEngine {
    if (!ForecastEngine.instance) {
      ForecastEngine.instance = new ForecastEngine();
    }
    return ForecastEngine.instance;
  }

  selectBestModel(
    historicalData: HistoricalValue[],
    indicatorId?: string
  ): { model: ForecastModel; selection: ModelSelectionResult } {
    const sorted = [...historicalData].sort((a, b) => a.year - b.year);
    const years = sorted.map((d) => d.year);
    const values = sorted.map((d) => d.value);
    const candidates: InternalModelFit[] = [];

    for (const type of ENABLED_MODEL_TYPES) {
      const model = mockForecastModels.find((m) => m.type === type && m.enabled);
      if (!model) continue;
      try {
        const fit = this.fitModel(model, years, values, 5);
        candidates.push(fit);
      } catch {
        /* skip */
      }
    }

    if (candidates.length === 0) {
      const fallback = mockForecastModels.find((m) => m.type === "linear_regression")!;
      return {
        model: fallback,
        selection: {
          selectedModelId: fallback.id,
          selectedModelName: fallback.name,
          reason: "Fallback naar lineaire regressie (onvoldoende data voor modelvergelijking).",
          dataPoints: values.length,
          candidates: [],
        },
      };
    }

    const preferSmooth = indicatorId === "ind-werkeloosheid" || indicatorId === "ind-verzuim";
    const ranked = [...candidates].sort((a, b) => {
      const scoreA = a.rmse * (preferSmooth && a.model.type === "polynomial_regression" ? 0.95 : 1);
      const scoreB = b.rmse * (preferSmooth && b.model.type === "polynomial_regression" ? 0.95 : 1);
      return scoreA - scoreB;
    });

    const best = ranked[0];
    const runnerUp = ranked[1];
    const improvement =
      runnerUp && runnerUp.rmse > 0
        ? (((runnerUp.rmse - best.rmse) / runnerUp.rmse) * 100).toFixed(1)
        : null;

    const reason = improvement
      ? `${best.model.name} gekozen op basis van laagste RMSE (${best.rmse.toFixed(2)}), ${improvement}% beter dan ${runnerUp.model.name}. R² = ${best.rSquared.toFixed(3)} over ${values.length} meetpunten.`
      : `${best.model.name} gekozen (R² = ${best.rSquared.toFixed(3)}, RMSE = ${best.rmse.toFixed(2)}, ${values.length} meetpunten).`;

    return {
      model: best.model,
      selection: {
        selectedModelId: best.model.id,
        selectedModelName: best.model.name,
        reason,
        dataPoints: values.length,
        candidates: ranked.map((c) => ({
          modelId: c.model.id,
          modelName: c.model.name,
          modelType: c.model.type,
          rmse: Math.round(c.rmse * 100) / 100,
          rSquared: Math.round(c.rSquared * 1000) / 1000,
          selected: c.model.id === best.model.id,
        })),
      },
    };
  }

  generate(request: ForecastRequest): ForecastResult {
    const horizon = request.horizonYears ?? 5;
    const sorted = [...request.historicalData].sort((a, b) => a.year - b.year);
    const years = sorted.map((d) => d.year);
    const values = sorted.map((d) => d.value);

    let model = request.model;
    let modelSelection: ModelSelectionResult | undefined;

    if (request.autoSelectModel !== false && !request.model) {
      const selected = this.selectBestModel(request.historicalData, request.indicatorId);
      model = selected.model;
      modelSelection = selected.selection;
    } else if (!model) {
      model = mockForecastModels.find((m) => m.type === "linear_regression" && m.enabled)!;
    }

    const fit = this.fitModel(model, years, values, horizon);

    const historicalFit = years.map((y, i) => ({
      year: y,
      actual: values[i],
      fitted: fit.fitted[i],
    }));

    const quarterlyHistorical = interpolateQuarterly(
      historicalFit.map((h) => ({ year: h.year, value: h.actual }))
    ).map((p) => ({ ...p, kind: "historisch" as const }));

    const quarterlyFit = interpolateQuarterly(
      historicalFit.map((h) => ({ year: h.year, value: h.fitted }))
    ).map((p) => ({ ...p, kind: "model-fit" as const }));

    const chartSeries = [...quarterlyHistorical, ...quarterlyFit];

    const scenarioValues = generateScenarios(fit.forecast, SCENARIO_MULTIPLIERS);
    const forecastId = `fc-${request.regionId}-${request.indicatorId}-${Date.now()}`;
    const endYear = years[years.length - 1];
    const unit = this.unitForIndicator(request.indicatorId);

    const scenarios: ForecastScenario[] = (
      ["conservatief", "realistisch", "optimistisch"] as ScenarioType[]
    ).map((type) => {
      const vals = scenarioValues[type];
      const uncertainty = fit.residualStdDev / (Math.abs(values[values.length - 1]) || 1);

      return {
        id: `${forecastId}-${type}`,
        forecastId,
        type,
        assumptions: SCENARIO_ASSUMPTIONS[type],
        uncertaintyMargin: Math.round(uncertainty * 1000) / 10,
        explanation: this.scenarioExplanation(type, vals, endYear, horizon, unit),
        values: vals.map((v, i) => ({
          year: endYear + i + 1,
          value: Math.round(v * (unit === "%" ? 10 : 1)) / (unit === "%" ? 10 : 1),
        })),
      };
    });

    const forecast: Forecast = {
      id: forecastId,
      indicatorId: request.indicatorId,
      regionId: request.regionId,
      occupationId: request.occupationId,
      modelId: model.id,
      historicalPeriod: { start: years[0], end: endYear },
      horizonYears: horizon,
      createdAt: new Date().toISOString(),
      scenarioIds: scenarios.map((s) => s.id),
    };

    return {
      forecast,
      scenarios,
      model,
      modelMetrics: {
        rSquared: fit.rSquared,
        cagr: fit.cagr,
        residualStdDev: fit.residualStdDev,
        rmse: fit.rmse,
        historicalPeriod: { start: years[0], end: endYear },
        dataPoints: values.length,
      },
      historicalFit,
      chartSeries,
      modelSelection,
    };
  }

  private fitModel(
    model: ForecastModel,
    years: number[],
    values: number[],
    horizon: number
  ): InternalModelFit {
    const endYear = years[years.length - 1];
    let fitted: number[] = [];
    let baseForecast: number[] = [];
    let rSquared = 0;
    let cagrRate: number | undefined;
    let residuals: number[] = [];

    switch (model.type) {
      case "linear_regression":
      case "trend_extrapolation": {
        const points: DataPoint[] = years.map((y, i) => ({ x: y, y: values[i] }));
        const reg = linearRegression(points);
        rSquared = reg.rSquared;
        fitted = years.map((y) => reg.predict(y));
        residuals = reg.residuals;
        baseForecast = Array.from({ length: horizon }, (_, i) => reg.predict(endYear + i + 1));
        break;
      }
      case "polynomial_regression": {
        const points: DataPoint[] = years.map((y, i) => ({ x: y, y: values[i] }));
        const poly = polynomialRegression(points);
        rSquared = poly.rSquared;
        fitted = years.map((y) => poly.predict(y));
        residuals = poly.residuals;
        baseForecast = Array.from({ length: horizon }, (_, i) => poly.predict(endYear + i + 1));
        break;
      }
      case "holt": {
        const holt = holtLinearTrend(values);
        rSquared = holt.rSquared;
        fitted = holt.fitted;
        residuals = holt.residuals;
        baseForecast = Array.from({ length: horizon }, (_, i) => holt.predict(i + 1));
        break;
      }
      case "moving_average": {
        const ma = movingAverage(values, Math.min(3, values.length));
        const lastMA = ma[ma.length - 1];
        const prevMA = ma[ma.length - 2] ?? lastMA;
        const annualChange = lastMA - prevMA;
        fitted = ma;
        residuals = values.map((v, i) => v - ma[i]);
        rSquared = 0.7;
        baseForecast = Array.from({ length: horizon }, (_, i) => lastMA + annualChange * (i + 1));
        break;
      }
      case "cagr":
      case "scenario_analysis": {
        cagrRate = cagr(values[0], values[values.length - 1], years.length - 1);
        const lastValue = values[values.length - 1];
        fitted = years.map((_, i) => values[0] * Math.pow(1 + cagrRate!, i));
        residuals = values.map((v, i) => v - fitted[i]);
        rSquared = 0.65;
        baseForecast = Array.from({ length: horizon }, (_, i) =>
          lastValue * Math.pow(1 + cagrRate!, i + 1)
        );
        break;
      }
      default:
        throw new Error(`Model type ${model.type} not implemented`);
    }

    const modelRmse = rmse(values, fitted);
    return {
      model,
      fitted,
      forecast: baseForecast,
      rSquared,
      rmse: modelRmse,
      residualStdDev: standardDeviation(residuals),
      cagr: cagrRate,
    };
  }

  private unitForIndicator(indicatorId: string): string {
    if (indicatorId.includes("werkeloosheid") || indicatorId.includes("verzuim") || indicatorId.includes("scholing")) {
      return "%";
    }
    return "FTE";
  }

  private scenarioExplanation(
    type: ScenarioType,
    values: number[],
    endYear: number,
    horizon: number,
    unit: string
  ): string {
    const start = values[0];
    const end = values[values.length - 1];
    const growth = start !== 0 ? (((end - start) / start) * 100).toFixed(1) : "0";
    const labels: Record<ScenarioType, string> = {
      conservatief: "conservatief",
      realistisch: "realistisch",
      optimistisch: "optimistisch",
    };
    const suffix = unit === "%" ? "%" : ` ${unit}`;
    return `Het ${labels[type]} scenario: van ${start.toLocaleString("nl-NL")}${suffix} naar ${end.toLocaleString("nl-NL")}${suffix} (${growth}% verandering) over ${horizon} jaar (${endYear + 1}–${endYear + horizon}).`;
  }
}

export const forecastEngine = ForecastEngine.getInstance();
