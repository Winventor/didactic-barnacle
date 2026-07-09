"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResults } from "@/components/search/search-results";
import { executeSearchAsync } from "@/lib/db";
import type { AudienceType, SearchResult } from "@/types";

const VALID_AUDIENCES: AudienceType[] = [
  "beleidsmakers",
  "werkgevers",
  "loopbaanprofessionals",
  "onderzoekers",
];

const DEFAULT_QUERY = "Voorspel de ontwikkeling van zorgpersoneel in Drenthe.";

export function TesZoekenClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? DEFAULT_QUERY;
  const audienceParam = searchParams.get("audience");
  const audience = VALID_AUDIENCES.includes(audienceParam as AudienceType)
    ? (audienceParam as AudienceType)
    : "beleidsmakers";

  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    executeSearchAsync(query, { audience })
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Zoekopdracht mislukt");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, audience]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="border-b border-border/40 bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <SearchBar defaultValue={query} audience={audience} />
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Live data ophalen bij CBS en prognose berekenen…</p>
        </div>
      )}

      {error && !loading && (
        <div className="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {result && !loading && <SearchResults result={result} />}
    </div>
  );
}
