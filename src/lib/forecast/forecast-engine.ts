import type {
  Forecast,
  ForecastModel,
  ForecastScenario,
  HistoricalValue,
  ScenarioType,
} from "@/types";
import {
  linearRegression,
  cagr,
  movingAverage,
  standardDeviation,
  generateScenarios,
  type DataPoint,
} from "@/lib/statistics";

export interface ForecastRequest {
  indicatorId: string;
  regionId: string;
  occupationId?: string;
  historicalData: HistoricalValue[];
  model: ForecastModel;
  horizonYears?: number;
}

export interface ForecastResult {
  forecast: Forecast;
  scenarios: ForecastScenario[];
  modelMetrics: {
    rSquared?: number;
    cagr?: number;
    residualStdDev: number;
    historicalPeriod: { start: number; end: number };
  };
  historicalFit: { year: number; actual: number; fitted: number }[];
}

const SCENARIO_ASSUMPTIONS: Record<ScenarioType, string[]> = {
  conservatief: [
    "Vertraagde vergrijzingseffecten door beperkte migratie",
    "Beperkte investeringen in zorgcapaciteit",
    "Stabiel tot licht dalend arbeidsaanbod",
    "Geen extra overheidsinvesteringen",
  ],
  realistisch: [
    "Voortzetting historische trend (CBS/UWV-data 2015–2024)",
    "Verwachte vergrijzing conform CPB-basisscenario",
    "Huidig vacatureniveau blijft stabiel",
    "Gematigde groei zorgvraag",
  ],
  optimistisch: [
    "Versnelde investeringen in zorg en welzijn",
    "Verhoogde arbeidsmarktparticipatie 55+",
    "Succesvolle internationalisering van zorgpersoneel",
    "Technologische productiviteitswinst compenseert deels personeelstekort",
  ],
};

const SCENARIO_MULTIPLIERS = {
  conservatief: 0.92,
  realistisch: 1.0,
  optimistisch: 1.08,
};

export class ForecastEngine {
  private static instance: ForecastEngine;

  static getInstance(): ForecastEngine {
    if (!ForecastEngine.instance) {
      ForecastEngine.instance = new ForecastEngine();
    }
    return ForecastEngine.instance;
  }

  generate(request: ForecastRequest): ForecastResult {
    const horizon = request.horizonYears ?? 5;
    const sorted = [...request.historicalData].sort((a, b) => a.year - b.year);
    const years = sorted.map((d) => d.year);
    const values = sorted.map((d) => d.value);

    const startYear = years[0];
    const endYear = years[years.length - 1];

    let baseForecast: number[];
    let historicalFit: { year: number; actual: number; fitted: number }[];
    let rSquared: number | undefined;
    let cagrRate: number | undefined;
    let residualStdDev: number;

    switch (request.model.type) {
      case "linear_regression":
      case "trend_extrapolation": {
        const points: DataPoint[] = years.map((y, i) => ({ x: y, y: values[i] }));
        const reg = linearRegression(points);
        rSquared = reg.rSquared;
        historicalFit = years.map((y, i) => ({
          year: y,
          actual: values[i],
          fitted: reg.predict(y),
        }));
        baseForecast = Array.from({ length: horizon }, (_, i) =>
          reg.predict(endYear + i + 1)
        );
        residualStdDev = standardDeviation(reg.residuals);
        break;
      }
      case "moving_average": {
        const ma = movingAverage(values, 3);
        const lastMA = ma[ma.length - 1];
        const prevMA = ma[ma.length - 2] ?? lastMA;
        const annualChange = lastMA - prevMA;
        historicalFit = years.map((y, i) => ({
          year: y,
          actual: values[i],
          fitted: ma[i],
        }));
        baseForecast = Array.from({ length: horizon }, (_, i) => lastMA + annualChange * (i + 1));
        residualStdDev = standardDeviation(values.map((v, i) => v - ma[i]));
        break;
      }
      case "cagr":
      case "scenario_analysis": {
        cagrRate = cagr(values[0], values[values.length - 1], years.length - 1);
        const lastValue = values[values.length - 1];
        baseForecast = Array.from({ length: horizon }, (_, i) =>
          lastValue * Math.pow(1 + cagrRate!, i + 1)
        );
        historicalFit = years.map((y, i) => ({
          year: y,
          actual: values[i],
          fitted: values[0] * Math.pow(1 + cagrRate!, i),
        }));
        residualStdDev = standardDeviation(
          values.map((v, i) => v - values[0] * Math.pow(1 + cagrRate!, i))
        );
        break;
      }
      default:
        throw new Error(`Model type ${request.model.type} not yet implemented`);
    }

    const scenarioValues = generateScenarios(baseForecast, SCENARIO_MULTIPLIERS);
    const forecastId = `fc-${request.regionId}-${request.indicatorId}-${Date.now()}`;

    const scenarios: ForecastScenario[] = (
      ["conservatief", "realistisch", "optimistisch"] as ScenarioType[]
    ).map((type) => {
      const scenarioId = `${forecastId}-${type}`;
      const vals = scenarioValues[type];
      const uncertainty = residualStdDev / (values[values.length - 1] || 1);

      return {
        id: scenarioId,
        forecastId,
        type,
        assumptions: SCENARIO_ASSUMPTIONS[type],
        uncertaintyMargin: Math.round(uncertainty * 1000) / 10,
        explanation: this.scenarioExplanation(type, vals, endYear, horizon),
        values: vals.map((v, i) => ({ year: endYear + i + 1, value: Math.round(v) })),
      };
    });

    const forecast: Forecast = {
      id: forecastId,
      indicatorId: request.indicatorId,
      regionId: request.regionId,
      occupationId: request.occupationId,
      modelId: request.model.id,
      historicalPeriod: { start: startYear, end: endYear },
      horizonYears: horizon,
      createdAt: new Date().toISOString(),
      scenarioIds: scenarios.map((s) => s.id),
    };

    return {
      forecast,
      scenarios,
      modelMetrics: {
        rSquared,
        cagr: cagrRate,
        residualStdDev,
        historicalPeriod: { start: startYear, end: endYear },
      },
      historicalFit,
    };
  }

  private scenarioExplanation(
    type: ScenarioType,
    values: number[],
    endYear: number,
    horizon: number
  ): string {
    const start = values[0];
    const end = values[values.length - 1];
    const growth = (((end - start) / start) * 100).toFixed(1);
    const labels: Record<ScenarioType, string> = {
      conservatief: "conservatief (laagste groei)",
      realistisch: "realistisch (meest waarschijnlijk)",
      optimistisch: "optimistisch (hoogste groei)",
    };
    return `Het ${labels[type]} scenario voorspelt een groei van ${growth}% over ${horizon} jaar (${endYear + 1}–${endYear + horizon}), van ${Math.round(start).toLocaleString("nl-NL")} naar ${Math.round(end).toLocaleString("nl-NL")} FTE.`;
  }
}

export const forecastEngine = ForecastEngine.getInstance();
