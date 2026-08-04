"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SourceCard } from "@/components/juridisch/source-card";
import { searchSources, isStaticHost } from "@/legal/client/browser-api";
import { buildOfficialSearchUrl, isEcli } from "@/legal/utils/rechtspraak-search";
import type { LegalSearchResult } from "@/legal/types";
import { Search, Loader2, ExternalLink } from "lucide-react";

export default function JurisprudentiePage() {
  const [query, setQuery] = useState("");
  const [ecli, setEcli] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<LegalSearchResult[]>([]);
  const [lastTerm, setLastTerm] = useState("");

  async function handleSearch(adapter?: string) {
    const q = (ecli || query).trim();
    if (!q) {
      setError("Vul een zoekterm of ECLI in.");
      return;
    }

    setLoading(true);
    setError(null);
    setLastTerm(q);

    try {
      const data = await searchSources({ q, adapter, limit: 20 });
      const filtered = (data.results ?? []).filter(
        (r) => r.metadata?.searchScope !== "fallback"
      );
      setResults(filtered.length > 0 ? filtered : data.results ?? []);

      if (filtered.length === 0 && isStaticHost() && adapter === "rechtspraak") {
        setError(
          "Geen live resultaten op static hosting (CORS). Gebruik de officiële zoeklink hieronder of deploy met API-routes (bijv. Render)."
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Zoeken mislukt");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const officialUrl = lastTerm ? buildOfficialSearchUrl(lastTerm) : undefined;
  const showEmbed =
    isStaticHost() &&
    lastTerm &&
    !isEcli(lastTerm) &&
    results.length <= 1 &&
    results[0]?.metadata?.searchScope === "fallback";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Jurisprudentie zoeken</h1>
        <p className="text-muted-foreground">
          Nederlandse uitspraken via Rechtspraak Open Data (metadata + inhoudsindicaties).
          Vrije-tekst zoeken verloopt via metadata; volledige corpus op{" "}
          <a href="https://uitspraken.rechtspraak.nl/" className="underline" target="_blank" rel="noopener noreferrer">
            rechtspraak.nl
          </a>
          .
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex gap-2">
          <Input
            placeholder="Zoekterm (bijv. belaging, proportionaliteit)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch("rechtspraak")}
          />
          <Button onClick={() => handleSearch("rechtspraak")} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="ECLI (bijv. ECLI:NL:HR:2024:123)"
            value={ecli}
            onChange={(e) => setEcli(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch("rechtspraak")}
          />
          <Button variant="outline" onClick={() => handleSearch("rechtspraak")} disabled={loading}>
            ECLI
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => handleSearch("rechtspraak")}>
          Nederland (Rechtspraak.nl)
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleSearch("curia")}>EU (CURIA)</Button>
        <Button variant="outline" size="sm" onClick={() => handleSearch("hudoc")}>EHRM (HUDOC)</Button>
        <Button variant="outline" size="sm" onClick={() => handleSearch("council-of-state")}>
          Raad van State
        </Button>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {officialUrl && (
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          Zoek &quot;{lastTerm}&quot; op rechtspraak.nl (volledige tekst)
        </a>
      )}

      {showEmbed && officialUrl && (
        <div className="rounded-lg border overflow-hidden bg-background">
          <iframe
            title={`Zoekresultaten voor ${lastTerm}`}
            src={officialUrl}
            className="w-full min-h-[70vh] border-0"
            loading="lazy"
          />
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {results.map((r) => (
          <SourceCard key={r.id} source={r} />
        ))}
      </div>
    </div>
  );
}
