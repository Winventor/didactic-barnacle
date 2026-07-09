/** Classical statistical methods for forecasting */

export interface DataPoint {
  x: number;
  y: number;
}

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  predict: (x: number) => number;
  residuals: number[];
}

export function linearRegression(points: DataPoint[]): LinearRegressionResult {
  const n = points.length;
  if (n < 2) {
    return { slope: 0, intercept: points[0]?.y ?? 0, rSquared: 0, predict: () => 0, residuals: [] };
  }

  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const sumY2 = points.reduce((s, p) => s + p.y * p.y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predictions = points.map((p) => slope * p.x + intercept);
  const residuals = points.map((p, i) => p.y - predictions[i]);

  const meanY = sumY / n;
  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0);
  const ssRes = residuals.reduce((s, r) => s + r * r, 0);
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  return {
    slope,
    intercept,
    rSquared,
    predict: (x: number) => slope * x + intercept,
    residuals,
  };
}

export function movingAverage(values: number[], window: number): number[] {
  if (window <= 0 || values.length === 0) return [];
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

export function cagr(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || years <= 0) return 0;
  return Math.pow(endValue / startValue, 1 / years) - 1;
}

export function extrapolateTrend(
  lastValue: number,
  annualGrowthRate: number,
  years: number
): number[] {
  const result: number[] = [];
  for (let i = 1; i <= years; i++) {
    result.push(lastValue * Math.pow(1 + annualGrowthRate, i));
  }
  return result;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function confidenceInterval(
  value: number,
  stdDev: number,
  confidence: number = 0.95
): { lower: number; upper: number } {
  const z = confidence === 0.95 ? 1.96 : 1.645;
  return { lower: value - z * stdDev, upper: value + z * stdDev };
}

export interface ScenarioMultipliers {
  conservatief: number;
  realistisch: number;
  optimistisch: number;
}

export function generateScenarios(
  baseForecast: number[],
  multipliers: ScenarioMultipliers
): Record<"conservatief" | "realistisch" | "optimistisch", number[]> {
  return {
    conservatief: baseForecast.map((v) => v * multipliers.conservatief),
    realistisch: baseForecast.map((v) => v * multipliers.realistisch),
    optimistisch: baseForecast.map((v) => v * multipliers.optimistisch),
  };
}
