"use client";

import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResults } from "@/components/search/search-results";
import { executeSearch } from "@/lib/db";
import type { AudienceType } from "@/types";

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

  const result = executeSearch(query, { audience });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="border-b border-border/40 bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <SearchBar defaultValue={query} audience={audience} />
        </div>
      </div>
      <SearchResults result={result} />
    </div>
  );
}
