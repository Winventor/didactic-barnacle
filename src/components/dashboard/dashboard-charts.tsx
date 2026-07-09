"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartDataPoint } from "@/lib/stats/compute-stats";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#9333ea",
  "#dc2626",
  "#0891b2",
  "#4f46e5",
  "#ea580c",
  "#0d9488",
  "#be185d",
];

interface ChartCardProps {
  title: string;
  data: ChartDataPoint[];
  type?: "bar" | "pie";
}

export function ChartCard({ title, data, type = "bar" }: ChartCardProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Geen gegevens beschikbaar
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === "pie" ? (
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) =>
                    `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : (
              <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardChartsProps {
  perYear: ChartDataPoint[];
  perGovernmentLevel: ChartDataPoint[];
  perOrganisation: ChartDataPoint[];
  perPolicyLayer: ChartDataPoint[];
  perTheme: ChartDataPoint[];
}

export function DashboardCharts({
  perYear,
  perGovernmentLevel,
  perOrganisation,
  perPolicyLayer,
  perTheme,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <ChartCard title="Documenten per jaar" data={perYear} />
      <ChartCard title="Documenten per bestuurslaag" data={perGovernmentLevel} type="pie" />
      <ChartCard title="Documenten per organisatie" data={perOrganisation} />
      <ChartCard title="Documenten per beleidslaag" data={perPolicyLayer} type="pie" />
      <ChartCard title="Documenten per thema" data={perTheme} />
    </div>
  );
}
