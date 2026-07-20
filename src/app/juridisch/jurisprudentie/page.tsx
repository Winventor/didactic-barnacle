"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SourceCard } from "@/components/juridisch/source-card";
import { searchSources } from "@/legal/client/browser-api";
import type { LegalSearchResult } from "@/legal/types";
import { Search, Loader2 } from "lucide-react";

export default function JurisprudentiePage() {
  const [query, setQuery] = useState("");
  const [ecli, setEcli] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LegalSearchResult[]>([]);

  async function handleSearch(adapter?: string) {
    setLoading(true);
    try {
      const q = ecli || query;
      const data = await searchSources({ q, adapter, limit: 20 });
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Jurisprudentie zoeken</h1>
        <p className="text-muted-foreground">NL, EU (CURIA) en EHRM (HUDOC) via officiële bronnen</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex gap-2">
          <Input placeholder="Zoekterm..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button onClick={() => handleSearch("rechtspraak")} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex gap-2">
          <Input placeholder="ECLI (bijv. ECLI:NL:HR:2024:123)" value={ecli} onChange={(e) => setEcli(e.target.value)} />
          <Button variant="outline" onClick={() => handleSearch("rechtspraak")}>ECLI</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => handleSearch("rechtspraak")}>Nederland (Rechtspraak.nl)</Button>
        <Button variant="outline" size="sm" onClick={() => handleSearch("curia")}>EU (CURIA)</Button>
        <Button variant="outline" size="sm" onClick={() => handleSearch("hudoc")}>EHRM (HUDOC)</Button>
        <Button variant="outline" size="sm" onClick={() => handleSearch("council-of-state")}>Raad van State</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {results.map((r) => <SourceCard key={r.id} source={r} />)}
      </div>
    </div>
  );
}
