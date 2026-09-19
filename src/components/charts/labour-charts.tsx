"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
} from "recharts";
import type { HistoricalValue, ForecastScenario, ChartSeriesPoint } from "@/types";

interface HistoricalChartProps {
  historical: HistoricalValue[];
  scenarios?: ForecastScenario[];
  chartSeries?: ChartSeriesPoint[];
  unit?: string;
}

function buildChartData(
  historical: HistoricalValue[],
  scenarios: ForecastScenario[] | undefined,
  chartSeries?: ChartSeriesPoint[]
) {
  const sorted = [...historical].sort((a, b) => a.year - b.year);
  const realistic = scenarios?.find((s) => s.type === "realistisch");
  const conservative = scenarios?.find((s) => s.type === "conservatief");
  const optimistic = scenarios?.find((s) => s.type === "optimistisch");

  if (chartSeries && chartSeries.length > 0) {
    const byYear = new Map<
      number,
      {
        year: number;
        period: string;
        historisch: number | null;
        modelFit: number | null;
        conservatief: number | null;
        realistisch: number | null;
        optimistisch: number | null;
      }
    >();

    for (const point of chartSeries) {
      const existing = byYear.get(point.year) ?? {
        year: point.year,
        period: point.period,
        historisch: null,
        modelFit: null,
        conservatief: null,
        realistisch: null,
        optimistisch: null,
      };
      if (point.kind === "historisch") {
        existing.historisch = point.value;
      } else {
        existing.modelFit = point.value;
      }
      existing.period = point.period;
      byYear.set(point.year, existing);
    }

    realistic?.values.forEach((v, i) => {
      const row = byYear.get(v.year) ?? {
        year: v.year,
        period: String(v.year),
        historisch: null,
        modelFit: null,
        conservatief: null,
        realistisch: null,
        optimistisch: null,
      };
      if (i === 0 && sorted.length > 0) {
        row.historisch = sorted[sorted.length - 1]?.value ?? null;
      }
      row.conservatief = conservative?.values[i]?.value ?? null;
      row.realistisch = v.value;
      row.optimistisch = optimistic?.values[i]?.value ?? null;
      byYear.set(v.year, row);
    });

    return [...byYear.values()].sort((a, b) => a.year - b.year);
  }

  const chartData = [
    ...sorted.map((h) => ({
      year: h.year,
      period: String(h.year),
      historisch: h.value,
      modelFit: null as number | null,
      conservatief: null as number | null,
      realistisch: null as number | null,
      optimistisch: null as number | null,
    })),
    ...(realistic?.values.map((v, i) => ({
      year: v.year,
      period: String(v.year),
      historisch: i === 0 ? sorted[sorted.length - 1]?.value : null,
      modelFit: null as number | null,
      conservatief: conservative?.values[i]?.value ?? null,
      realistisch: v.value,
      optimistisch: optimistic?.values[i]?.value ?? null,
    })) ?? []),
  ];

  return [...new Map(chartData.map((d) => [d.year, d])).values()].sort((a, b) => a.year - b.year);
}

export function HistoricalForecastChart({
  historical,
  scenarios,
  chartSeries,
  unit = "FTE",
}: HistoricalChartProps) {
  const chartData = buildChartData(historical, scenarios, chartSeries);
  const hasModelFit = chartSeries?.some((p) => p.kind === "model-fit");
  const dataPointCount = historical.length;

  return (
    <div className="space-y-2">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
              tickFormatter={(y: number) => (Number.isInteger(y) ? String(y) : "")}
            />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              labelFormatter={(_, payload) => {
                const period = payload?.[0]?.payload?.period;
                return period ? String(period) : "";
              }}
              formatter={(value, name) => {
                const num = typeof value === "number" ? value : null;
                const label = typeof name === "string" ? name : "";
                return num !== null ? [`${num.toLocaleString("nl-NL")} ${unit}`, label] : ["—", label];
              }}
              contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="historisch"
              fill="hsl(var(--muted))"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              name="Historisch"
              connectNulls={false}
              dot={chartSeries ? { r: 2 } : false}
            />
            {hasModelFit && (
              <Line
                type="monotone"
                dataKey="modelFit"
                stroke="#6366f1"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                name="Model-fit"
                connectNulls
              />
            )}
            <Line type="monotone" dataKey="conservatief" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="Conservatief" connectNulls />
            <Line type="monotone" dataKey="realistisch" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Realistisch" connectNulls />
            <Line type="monotone" dataKey="optimistisch" stroke="#22c55e" strokeDasharray="5 5" dot={false} name="Optimistisch" connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {chartSeries && chartSeries.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {dataPointCount} jaarlijkse meetpunten ({chartSeries.filter((p) => p.kind === "historisch").length} kwartaalpunten geïnterpoleerd) · 2010–2024
        </p>
      )}
    </div>
  );
}

interface RegionalChartProps {
  data: { name: string; value: number }[];
  unit?: string;
}

export function RegionalBarChart({ data, unit = "FTE" }: RegionalChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 60, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
          <Tooltip formatter={(v) => [`${Number(v).toLocaleString("nl-NL")} ${unit}`, ""]} />
          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={0} dot={false} />
          <Area type="monotone" dataKey="value" fill="hsl(var(--primary))" fillOpacity={0.15} stroke="hsl(var(--primary))" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

interface RadarChartProps {
  data: { component: string; score: number }[];
}

export function TESRadarChart({ data }: RadarChartProps) {
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.component} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{d.component}</span>
            <span className="text-muted-foreground">{d.score}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-foreground/70 transition-all"
              style={{ width: `${d.score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ScenarioChartProps {
  scenario: ForecastScenario;
  unit?: string;
}

export function ScenarioLineChart({ scenario, unit = "FTE" }: ScenarioChartProps) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={scenario.values} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
          <Tooltip formatter={(v) => [`${Number(v).toLocaleString("nl-NL")} ${unit}`, scenario.type]} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={
              scenario.type === "conservatief"
                ? "#94a3b8"
                : scenario.type === "optimistisch"
                  ? "#22c55e"
                  : "hsl(var(--primary))"
            }
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
