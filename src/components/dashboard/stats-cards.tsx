"use client";

import {
  FileText,
  Layers,
  Gavel,
  ClipboardCheck,
  Building2,
  MapPin,
  Droplets,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types/policy-document";

interface StatsCardsProps {
  stats: DashboardStats;
}

const cards = [
  { key: "total" as const, label: "Totaal documenten", icon: FileText, color: "text-blue-600" },
  { key: "beleidsvorming" as const, label: "Beleidsvorming", icon: Layers, color: "text-emerald-600" },
  { key: "besluitvorming" as const, label: "Besluitvorming", icon: Gavel, color: "text-amber-600" },
  { key: "uitvoering" as const, label: "Uitvoering", icon: ClipboardCheck, color: "text-purple-600" },
  { key: "gemeenten" as const, label: "Gemeenten", icon: Building2, color: "text-slate-600" },
  { key: "provincies" as const, label: "Provincies", icon: MapPin, color: "text-orange-600" },
  { key: "waterschappen" as const, label: "Waterschappen", icon: Droplets, color: "text-cyan-600" },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      {cards.map(({ key, label, icon: Icon, color }) => (
        <Card
          key={key}
          className="transition-shadow hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats[key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
