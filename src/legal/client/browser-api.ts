/**
 * Browser-compatible API for the juridisch platform.
 * Used on GitHub Pages (static export) where Next.js API routes are unavailable.
 * Live official APIs may be blocked by CORS; adapters fall back to official search URLs.
 */

import { definitionService } from "../services/definition-service";
import { caseAnalysisService } from "../services/case-analysis-service";
import { claimGeneratorService } from "../services/claim-generator-service";
import { searchOrchestrator } from "../services/search-orchestrator";
import { exportService } from "../services/export-service";
import { SOURCE_REGISTRY } from "../config/source-registry";
import { apiBaseUrl, isStaticHost } from "../utils/browser-fetch";
import { isEcli } from "../utils/rechtspraak-search";
import type {
  CaseAnalysisResult,
  ClaimDraft,
  ClaimDocumentType,
  DefinitionResult,
  LegalSearchResult,
  SourceHealth,
} from "../types";

async function fetchServerApi<T>(path: string): Promise<T | null> {
  if (typeof window === "undefined") return null;
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function searchDefinitions(term: string): Promise<DefinitionResult> {
  const fromApi = await fetchServerApi<DefinitionResult>(
    `/api/juridisch/definitions?term=${encodeURIComponent(term)}`
  );
  if (fromApi) return fromApi;
  return definitionService.search(term);
}

export async function analyzeCase(input: {
  narrative: string;
  municipality?: string;
  province?: string;
}): Promise<CaseAnalysisResult> {
  return caseAnalysisService.analyze(input);
}

export async function generateClaim(input: {
  narrative: string;
  municipality?: string;
  documentType: ClaimDocumentType;
  tone: "FORMEEL" | "GEMATIGD" | "BEWIJSVEILIG";
  desiredOutcome: string;
}): Promise<ClaimDraft> {
  return claimGeneratorService.generate(
    { narrative: input.narrative, municipality: input.municipality },
    {
      documentType: input.documentType,
      tone: input.tone,
      desiredOutcome: input.desiredOutcome,
    }
  );
}

export async function searchSources(input: {
  q: string;
  adapter?: string;
  limit?: number;
}): Promise<{ query: string; count: number; results: LegalSearchResult[] }> {
  const params = new URLSearchParams({
    q: input.q,
    limit: String(input.limit ?? 20),
  });
  if (input.adapter) params.set("adapter", input.adapter);

  const fromApi = await fetchServerApi<{
    query: string;
    count: number;
    results: LegalSearchResult[];
  }>(`/api/juridisch/search?${params.toString()}`);

  if (fromApi) return fromApi;

  const query = isEcli(input.q)
    ? { identifier: input.q.trim(), limit: input.limit ?? 20 }
    : { text: input.q, limit: input.limit ?? 20 };

  const results = input.adapter
    ? await searchOrchestrator.searchAll(query, [input.adapter])
    : await searchOrchestrator.searchByPriority(query);

  return { query: input.q, count: results.length, results };
}

export async function getSourcesHealth(): Promise<{
  sources: typeof SOURCE_REGISTRY;
  health: SourceHealth[];
  checkedAt: string;
}> {
  let health: SourceHealth[] = [];
  try {
    health = await Promise.race([
      searchOrchestrator.healthCheckAll(),
      new Promise<SourceHealth[]>((resolve) =>
        setTimeout(
          () =>
            resolve(
              SOURCE_REGISTRY.map((s) => ({
                adapterId: s.id,
                status: "DEGRADED" as const,
                lastChecked: new Date().toISOString(),
                message: "Timeout – open de officiële bron via de link",
              }))
            ),
          8000
        )
      ),
    ]);
  } catch {
    health = SOURCE_REGISTRY.map((s) => ({
      adapterId: s.id,
      status: "DEGRADED" as const,
      lastChecked: new Date().toISOString(),
      message: isStaticHost()
        ? "Live check via static hosting beperkt (CORS) – gebruik server-deploy of API-base URL"
        : "Live check niet beschikbaar",
    }));
  }

  return {
    sources: SOURCE_REGISTRY,
    health,
    checkedAt: new Date().toISOString(),
  };
}

export function analysisToMarkdown(analysis: CaseAnalysisResult): string {
  return exportService.caseAnalysisToMarkdown(analysis);
}

export function claimToMarkdown(claim: ClaimDraft): string {
  return exportService.claimToMarkdown(claim);
}

export function downloadTextFile(filename: string, content: string, mime = "text/markdown"): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Prefer client-side API on static hosts; try server API when available. */
export { isStaticHost };
