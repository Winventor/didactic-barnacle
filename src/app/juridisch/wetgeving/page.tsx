"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SourceCard } from "@/components/juridisch/source-card";
import { searchSources } from "@/legal/client/browser-api";
import type { LegalSearchResult } from "@/legal/types";
import { Search, Loader2 } from "lucide-react";

export default function WetgevingPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LegalSearchResult[]>([]);

  async function handleSearch(adapter: string) {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchSources({ q: query, adapter, limit: 15 });
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wetgeving zoeken</h1>
        <p className="text-muted-foreground">Nationale, lokale en EU-wetgeving</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Bijv. artikel 6:162 BW, belaging, APV..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch("bwb-sru")}
        />
        <Button onClick={() => handleSearch("bwb-sru")} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => handleSearch("bwb-sru")}>Nationaal (BWB)</Button>
        <Button variant="outline" size="sm" onClick={() => handleSearch("local-regulations")}>Lokaal (CVDR)</Button>
        <Button variant="outline" size="sm" onClick={() => handleSearch("eur-lex")}>EU (EUR-Lex)</Button>
        <Button variant="outline" size="sm" onClick={() => handleSearch("treaties")}>Verdragen</Button>
        <Button variant="outline" size="sm" onClick={() => handleSearch("official-gazette")}>Officiële bekendmakingen</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {results.map((r) => <SourceCard key={r.id} source={r} />)}
      </div>
    </div>
  );
}
