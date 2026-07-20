"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSourcesHealth } from "@/legal/client/browser-api";
import { CheckCircle, AlertCircle, XCircle, Loader2 } from "lucide-react";

interface SourceHealth {
  adapterId: string;
  status: "HEALTHY" | "DEGRADED" | "UNAVAILABLE";
  latencyMs?: number;
  lastChecked: string;
  message?: string;
}

interface SourceConfig {
  id: string;
  name: string;
  jurisdiction: string;
  website: string;
  registrationRequired: boolean;
}

export default function BronnenPage() {
  const [health, setHealth] = useState<SourceHealth[]>([]);
  const [sources, setSources] = useState<SourceConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSourcesHealth()
      .then((data) => {
        setHealth(data.health ?? []);
        setSources(data.sources ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const statusIcon = (status: string) => {
    if (status === "HEALTHY") return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    if (status === "DEGRADED") return <AlertCircle className="h-5 w-5 text-amber-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bronstatus</h1>
        <p className="text-muted-foreground">
          Status van alle aangesloten officiële databronnen. Op GitHub Pages kunnen live checks
          door CORS beperkt zijn; gebruik dan de officiële links.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sources.map((source) => {
          const h = health.find((x) => x.adapterId === source.id);
          return (
            <Card key={source.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{source.name}</CardTitle>
                {h && statusIcon(h.status)}
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="text-muted-foreground">{source.jurisdiction}</p>
                <a href={source.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {source.website}
                </a>
                {source.registrationRequired && (
                  <p className="text-amber-600 text-xs">Registratie vereist</p>
                )}
                {h && (
                  <p className="text-xs text-muted-foreground">
                    Status: {h.status}
                    {h.latencyMs && ` | ${h.latencyMs}ms`}
                    {h.message && ` | ${h.message}`}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
