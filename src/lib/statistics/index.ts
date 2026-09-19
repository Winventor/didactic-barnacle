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

export interface PolynomialRegressionResult {
  coefficients: [number, number, number];
  rSquared: number;
  predict: (x: number) => number;
  residuals: number[];
}

export interface HoltResult {
  level: number;
  trend: number;
  rSquared: number;
  predict: (stepsAhead: number) => number;
  fitted: number[];
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

  const denom = n * sumX2 - sumX * sumX;
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  const intercept = (sumY - slope * sumX) / n;

  const predictions = points.map((p) => slope * p.x + intercept);
  const residuals = points.map((p, i) => p.y - predictions[i]);
  const rSquared = computeRSquared(
    points.map((p) => p.y),
    predictions
  );

  return {
    slope,
    intercept,
    rSquared,
    predict: (x: number) => slope * x + intercept,
    residuals,
  };
}

/** Polynomiale regressie graad 2: y = ax² + bx + c */
export function polynomialRegression(points: DataPoint[]): PolynomialRegressionResult {
  const n = points.length;
  if (n < 3) {
    const lin = linearRegression(points);
    return {
      coefficients: [0, lin.slope, lin.intercept],
      rSquared: lin.rSquared,
      predict: lin.predict,
      residuals: lin.residuals,
    };
  }

  let s0 = n;
  let s1 = 0;
  let s2 = 0;
  let s3 = 0;
  let s4 = 0;
  let t0 = 0;
  let t1 = 0;
  let t2 = 0;

  for (const p of points) {
    const x = p.x;
    const y = p.y;
    const x2 = x * x;
    s1 += x;
    s2 += x2;
    s3 += x2 * x;
    s4 += x2 * x2;
    t0 += y;
    t1 += x * y;
    t2 += x2 * y;
  }

  const det =
    s0 * (s2 * s4 - s3 * s3) -
    s1 * (s1 * s4 - s3 * s2) +
    s2 * (s1 * s3 - s2 * s2);

  const c =
    det !== 0
      ? (t0 * (s2 * s4 - s3 * s3) - t1 * (s1 * s4 - s3 * s2) + t2 * (s1 * s3 - s2 * s2)) / det
      : t0 / n;
  const b =
    det !== 0
      ? (s0 * (t1 * s4 - t2 * s3) - s1 * (t0 * s4 - t2 * s2) + s2 * (t0 * s3 - t1 * s2)) / det
      : 0;
  const a =
    det !== 0
      ? (s0 * (s2 * t2 - s3 * t1) - s1 * (s1 * t2 - s3 * t0) + s2 * (s1 * t1 - s2 * t0)) / det
      : 0;

  const predict = (x: number) => a * x * x + b * x + c;
  const predictions = points.map((p) => predict(p.x));
  const residuals = points.map((p, i) => p.y - predictions[i]);
  const rSquared = computeRSquared(
    points.map((p) => p.y),
    predictions
  );

  return { coefficients: [a, b, c], rSquared, predict, residuals };
}

/** Holt dubbele exponentiële smoothing (lineaire trend) */
export function holtLinearTrend(values: number[], alpha = 0.4, beta = 0.2): HoltResult {
  if (values.length < 2) {
    return {
      level: values[0] ?? 0,
      trend: 0,
      rSquared: 0,
      predict: () => values[0] ?? 0,
      fitted: values,
      residuals: [],
    };
  }

  let level = values[0];
  let trend = values[1] - values[0];
  const fitted: number[] = [level];

  for (let i = 1; i < values.length; i++) {
    const prevLevel = level;
    level = alpha * values[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    fitted.push(level);
  }

  const residuals = values.map((v, i) => v - fitted[i]);
  const rSquared = computeRSquared(values, fitted);

  return {
    level,
    trend,
    rSquared,
    predict: (stepsAhead: number) => level + trend * stepsAhead,
    fitted,
    residuals,
  };
}

function computeRSquared(actual: number[], predicted: number[]): number {
  const n = actual.length;
  if (n < 2) return 0;
  const mean = actual.reduce((a, b) => a + b, 0) / n;
  const ssTot = actual.reduce((s, v) => s + (v - mean) ** 2, 0);
  const ssRes = actual.reduce((s, v, i) => s + (v - predicted[i]) ** 2, 0);
  return ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
}

export function rmse(actual: number[], predicted: number[]): number {
  if (actual.length === 0) return Infinity;
  const mse = actual.reduce((s, v, i) => s + (v - predicted[i]) ** 2, 0) / actual.length;
  return Math.sqrt(mse);
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

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
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

/** Interpoleer jaarlijkse punten naar kwartalen voor rijkere grafieken */
export function interpolateQuarterly(
  points: { year: number; value: number }[]
): { period: string; year: number; value: number }[] {
  const sorted = [...points].sort((a, b) => a.year - b.year);
  const result: { period: string; year: number; value: number }[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    result.push({
      period: `${current.year}`,
      year: current.year,
      value: current.value,
    });

    const next = sorted[i + 1];
    if (!next) continue;

    for (let q = 1; q <= 3; q++) {
      const t = q / 4;
      const value = current.value + (next.value - current.value) * t;
      const fracYear = current.year + q / 4;
      result.push({
        period: `${current.year} Q${q}`,
        year: fracYear,
        value: Math.round(value * 100) / 100,
      });
    }
  }

  return result;
}
