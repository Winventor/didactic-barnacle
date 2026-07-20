import { ALL_ADAPTERS } from "../adapters";
import type { LegalSearchQuery, LegalSearchResult, SourceHealth } from "../types";

export class SearchOrchestrator {
  async searchAll(
    query: LegalSearchQuery,
    adapterIds?: string[]
  ): Promise<LegalSearchResult[]> {
    const adapters = adapterIds
      ? ALL_ADAPTERS.filter((a) => adapterIds.includes(a.id))
      : ALL_ADAPTERS;

    const results = await Promise.allSettled(
      adapters.map((adapter) => adapter.search(query))
    );

    const merged: LegalSearchResult[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        merged.push(...result.value);
      }
    }

    return merged
      .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
      .slice(0, query.limit ?? 30);
  }

  async searchByPriority(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    const priorityGroups = [
      ["bwb-sru"],
      ["local-regulations"],
      ["treaties"],
      ["eur-lex", "cellar"],
      ["rechtspraak", "council-of-state"],
      ["curia"],
      ["hudoc"],
      ["official-gazette"],
    ];

    const allResults: LegalSearchResult[] = [];
    for (const group of priorityGroups) {
      const groupResults = await this.searchAll({ ...query, limit: 5 }, group);
      allResults.push(...groupResults);
    }

    return allResults.slice(0, query.limit ?? 30);
  }

  async healthCheckAll(): Promise<SourceHealth[]> {
    const results = await Promise.allSettled(ALL_ADAPTERS.map((a) => a.healthCheck()));
    return results.map((r, i) =>
      r.status === "fulfilled"
        ? r.value
        : {
            adapterId: ALL_ADAPTERS[i].id,
            status: "UNAVAILABLE" as const,
            lastChecked: new Date().toISOString(),
            message: "Health check mislukt",
          }
    );
  }
}

export const searchOrchestrator = new SearchOrchestrator();
