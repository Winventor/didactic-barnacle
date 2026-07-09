import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResults } from "@/components/search/search-results";
import { executeSearch } from "@/lib/db";
import type { AudienceType } from "@/types";

interface PageProps {
  searchParams: Promise<{ q?: string; audience?: string }>;
}

const VALID_AUDIENCES: AudienceType[] = [
  "beleidsmakers",
  "werkgevers",
  "loopbaanprofessionals",
  "onderzoekers",
];

export default async function TesZoekenPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q ?? "Voorspel de ontwikkeling van zorgpersoneel in Drenthe.";
  const audience = VALID_AUDIENCES.includes(params.audience as AudienceType)
    ? (params.audience as AudienceType)
    : "beleidsmakers";

  const result = executeSearch(query, { audience });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="border-b border-border/40 bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <Suspense>
            <SearchBar defaultValue={query} audience={audience} />
          </Suspense>
        </div>
      </div>
      <SearchResults result={result} />
    </div>
  );
}
