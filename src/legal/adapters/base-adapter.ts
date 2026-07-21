import type {
  LegalSourceAdapter,
  LegalSearchQuery,
  LegalSearchResult,
  LegalDocument,
  SourceHealth,
} from "../types";
import { fetchWithTimeout } from "../utils/retry";
import { fetchLegal } from "../utils/browser-fetch";
import { getCached, setCache } from "../utils/cache";

export abstract class BaseAdapter implements LegalSourceAdapter {
  abstract id: string;
  abstract name: string;
  abstract jurisdiction: LegalSourceAdapter["jurisdiction"];

  protected timeoutMs = 15000;
  protected rateLimitMs = 2000;
  private lastRequestAt = 0;

  abstract search(query: LegalSearchQuery): Promise<LegalSearchResult[]>;
  abstract fetchDocument(identifier: string): Promise<LegalDocument>;
  abstract normalize(raw: unknown): LegalDocument;

  async healthCheck(): Promise<SourceHealth> {
    const start = Date.now();
    try {
      await this.search({ text: "test", limit: 1 });
      return {
        adapterId: this.id,
        status: "HEALTHY",
        latencyMs: Date.now() - start,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        adapterId: this.id,
        status: "UNAVAILABLE",
        latencyMs: Date.now() - start,
        lastChecked: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Onbekende fout",
      };
    }
  }

  protected async rateLimitedFetch(
    url: string,
    options?: RequestInit & { timeoutMs?: number }
  ): Promise<Response> {
    const now = Date.now();
    const wait = this.rateLimitMs - (now - this.lastRequestAt);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastRequestAt = Date.now();

    if (url.includes("data.rechtspraak.nl") || url.includes("uitspraken.rechtspraak.nl")) {
      return fetchLegal(url, { timeoutMs: this.timeoutMs, ...options });
    }

    return fetchWithTimeout(url, { timeoutMs: this.timeoutMs, ...options });
  }

  protected cacheKey(prefix: string, key: string): string {
    return `${this.id}:${prefix}:${key}`;
  }

  protected async cachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs = 3600000
  ): Promise<T> {
    const cacheKey = this.cacheKey("fetch", key);
    const cached = getCached<T>(cacheKey);
    if (cached) return cached;
    const result = await fetcher();
    setCache(cacheKey, result, ttlMs);
    return result;
  }
}

export function buildOfficialUrl(
  type: "bwb" | "ecli" | "eurlex" | "hudoc" | "cvdr",
  id: string
): string {
  switch (type) {
    case "bwb":
      return `https://wetten.overheid.nl/${id}/`;
    case "ecli":
      return `https://uitspraken.rechtspraak.nl/details?id=${encodeURIComponent(id)}`;
    case "eurlex":
      return `https://eur-lex.europa.eu/legal-content/NL/TXT/?uri=CELEX:${id}`;
    case "hudoc":
      return `https://hudoc.echr.coe.int/eng#{"itemid":["${id}"]}`;
    case "cvdr":
      return `https://lokaleregelgeving.overheid.nl/${id}`;
    default:
      return id;
  }
}
