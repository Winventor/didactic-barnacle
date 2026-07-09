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
import type { HistoricalValue, ForecastScenario } from "@/types";

interface HistoricalChartProps {
  historical: HistoricalValue[];
  scenarios?: ForecastScenario[];
  unit?: string;
}

export function HistoricalForecastChart({ historical, scenarios, unit = "FTE" }: HistoricalChartProps) {
  const sorted = [...historical].sort((a, b) => a.year - b.year);
  const realistic = scenarios?.find((s) => s.type === "realistisch");
  const conservative = scenarios?.find((s) => s.type === "conservatief");
  const optimistic = scenarios?.find((s) => s.type === "optimistisch");

  const chartData = [
    ...sorted.map((h) => ({
      year: h.year,
      historisch: h.value,
      conservatief: null as number | null,
      realistisch: null as number | null,
      optimistisch: null as number | null,
    })),
    ...(realistic?.values.map((v, i) => ({
      year: v.year,
      historisch: i === 0 ? sorted[sorted.length - 1]?.value : null,
      conservatief: conservative?.values[i]?.value ?? null,
      realistisch: v.value,
      optimistisch: optimistic?.values[i]?.value ?? null,
    })) ?? []),
  ];

  const uniqueYears = [...new Map(chartData.map((d) => [d.year, d])).values()].sort(
    (a, b) => a.year - b.year
  );

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={uniqueYears} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} className="text-muted-foreground" />
          <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
          <Tooltip
            formatter={(value) => {
              const num = typeof value === "number" ? value : null;
              return num !== null ? [`${num.toLocaleString("nl-NL")} ${unit}`, ""] : ["—", ""];
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
          />
          <Line type="monotone" dataKey="conservatief" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="Conservatief" connectNulls />
          <Line type="monotone" dataKey="realistisch" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Realistisch" connectNulls />
          <Line type="monotone" dataKey="optimistisch" stroke="#22c55e" strokeDasharray="5 5" dot={false} name="Optimistisch" connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
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
