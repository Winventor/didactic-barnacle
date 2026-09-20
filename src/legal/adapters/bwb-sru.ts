import { BaseAdapter, buildOfficialUrl } from "./base-adapter";
import { extractTextContent } from "../utils/xml-safe";
import { queryText } from "../utils/query-text";
import {
  buildBwbCql,
  candidateValidityDates,
  CORE_BWB_IDS,
  extractSruRecords,
  parseBwbId,
  parseBwbTitle,
  parseLocatieToestand,
  parseSruXml,
  pickLatestRepositoryUrl,
  repositoryUrlFromBwbId,
} from "../utils/bwb-repository";
import {
  extractFragmentsFromBwbXml,
  extractStatutoryDefinition,
  plainTextFromBwbXml,
  termMatches,
} from "../utils/definition-extractor";
import type { LegalSearchQuery, LegalSearchResult, LegalDocument } from "../types";

interface BwbSearchCandidate {
  bwbId: string;
  title: string;
  repositoryUrl?: string;
}

export class BwbSruAdapter extends BaseAdapter {
  id = "bwb-sru";
  name = "Wetten.overheid.nl (BWB SRU)";
  jurisdiction = "NL_NATIONAAL" as const;

  private readonly sruUrl = "https://zoekservice.overheid.nl/sru/Search";

  async search(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    const cacheKey = JSON.stringify(query);
    return this.cachedFetch(cacheKey, () => this.doSearch(query));
  }

  private async doSearch(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    const text = queryText(query);
    if (!text && !query.identifier) return [];

    const metadataHits = await this.searchMetadata(query);
    const fullTextHits = await this.searchFullText(text, query.limit ?? 10, metadataHits);

    const merged = new Map<string, LegalSearchResult>();
    for (const hit of [...fullTextHits, ...metadataHits]) {
      const key = hit.identifier ?? hit.id;
      if (!merged.has(key) || (hit.relevanceScore ?? 0) > (merged.get(key)?.relevanceScore ?? 0)) {
        merged.set(key, hit);
      }
    }

    const results = [...merged.values()].sort(
      (a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0)
    );

    if (results.length === 0) {
      return this.fallbackSearch(query);
    }

    return results.slice(0, query.limit ?? 10);
  }

  private async searchMetadata(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    const text = queryText(query);
    const cql = buildBwbCql(text, query.identifier);

    const params = new URLSearchParams({
      operation: "searchRetrieve",
      version: "1.2",
      query: cql,
      maximumRecords: String(Math.min(query.limit ?? 15, 25)),
      startRecord: String((query.offset ?? 0) + 1),
      "x-connection": "BWB",
    });

    try {
      const response = await this.rateLimitedFetch(`${this.sruUrl}?${params}`);
      if (!response.ok) return [];
      const xml = await response.text();
      return this.parseMetadataResults(xml, text, 0.35);
    } catch {
      return [];
    }
  }

  private parseMetadataResults(
    xml: string,
    queryText: string,
    baseScore: number
  ): LegalSearchResult[] {
    try {
      const parsed = parseSruXml(xml);
      const records = extractSruRecords(parsed);
      return records.map((record, i) => {
        const bwbId = parseBwbId(record);
        const title = parseBwbTitle(record);
        const repositoryUrl = parseLocatieToestand(record);
        return {
          id: `bwb-${bwbId || i}`,
          adapterId: this.id,
          title,
          snippet: `Gevonden in metadata (titel/afkorting): ${queryText}`,
          jurisdiction: "NL_NATIONAAL" as const,
          sourceType: "WET_IN_FORMELE_ZIN" as const,
          authorityLevel: "PRIMAIR_BINDEND" as const,
          identifier: bwbId,
          officialUrl: bwbId ? buildOfficialUrl("bwb", bwbId) : "https://wetten.overheid.nl/",
          date: extractTextContent(record["dcterms:modified"]) || undefined,
          relevanceScore: baseScore,
          metadata: repositoryUrl ? { repositoryUrl, searchScope: "metadata" } : { searchScope: "metadata" },
        };
      });
    } catch {
      return [];
    }
  }

  private async searchFullText(
    term: string,
    limit: number,
    metadataHits: LegalSearchResult[]
  ): Promise<LegalSearchResult[]> {
    if (!term.trim()) return [];

    const candidates = await this.buildCandidates(term, metadataHits);
    const results: LegalSearchResult[] = [];

    for (const candidate of candidates) {
      if (results.length >= limit) break;
      const hit = await this.searchTermInRegulation(term, candidate);
      if (hit) results.push(hit);
    }

    return results;
  }

  private async buildCandidates(
    term: string,
    metadataHits: LegalSearchResult[]
  ): Promise<BwbSearchCandidate[]> {
    const map = new Map<string, BwbSearchCandidate>();

    for (const hit of metadataHits) {
      if (!hit.identifier) continue;
      const repositoryUrl =
        (hit.metadata?.repositoryUrl as string | undefined) ??
        (await this.resolveRepositoryUrl(hit.identifier));
      map.set(hit.identifier, {
        bwbId: hit.identifier,
        title: hit.title,
        repositoryUrl,
      });
    }

    for (const core of CORE_BWB_IDS) {
      if (!map.has(core.bwbId)) {
        map.set(core.bwbId, {
          bwbId: core.bwbId,
          title: core.title,
          repositoryUrl: await this.resolveRepositoryUrl(core.bwbId),
        });
      }
    }

  if (map.size < 12) {
      const extra = await this.searchMetadata({ text: term, limit: 20 });
      for (const hit of extra) {
        if (!hit.identifier || map.has(hit.identifier)) continue;
        map.set(hit.identifier, {
          bwbId: hit.identifier,
          title: hit.title,
          repositoryUrl:
            (hit.metadata?.repositoryUrl as string | undefined) ??
            (await this.resolveRepositoryUrl(hit.identifier)),
        });
      }
    }

    return [...map.values()].slice(0, 20);
  }

  private async searchTermInRegulation(
    term: string,
    candidate: BwbSearchCandidate
  ): Promise<LegalSearchResult | null> {
    const xml = await this.fetchRepositoryXml(candidate.repositoryUrl, candidate.bwbId);
    if (!xml) return null;

    const plain = plainTextFromBwbXml(xml);
    if (!termMatches(plain, term)) return null;

    const fragments = extractFragmentsFromBwbXml(xml, term);
    const statutory = extractStatutoryDefinition(plain, term);
    const snippet = statutory ?? fragments[0]?.text ?? `Voorkomt in volledige tekst: ${term}`;

    return {
      id: `bwb-ft-${candidate.bwbId}`,
      adapterId: this.id,
      title: candidate.title,
      snippet: snippet.slice(0, 500),
      jurisdiction: "NL_NATIONAAL",
      sourceType: "WET_IN_FORMELE_ZIN",
      authorityLevel: "PRIMAIR_BINDEND",
      identifier: candidate.bwbId,
      officialUrl: buildOfficialUrl("bwb", candidate.bwbId),
      relevanceScore: statutory ? 1 : 0.75,
      metadata: {
        searchScope: "fullText",
        repositoryUrl: candidate.repositoryUrl,
        fragmentCount: fragments.length,
        statutoryDefinition: statutory,
      },
    };
  }

  async resolveRepositoryUrl(bwbId: string): Promise<string | undefined> {
    const cacheKey = `repo-url:${bwbId}`;
    return this.cachedFetch(cacheKey, async () => {
      for (const date of candidateValidityDates()) {
        const cql = `dcterms.identifier=="${bwbId}" and overheidbwb.geldigheidsdatum="${date}"`;
        const params = new URLSearchParams({
          operation: "searchRetrieve",
          version: "1.2",
          query: cql,
          maximumRecords: "1",
          startRecord: "1",
          "x-connection": "BWB",
        });
        try {
          const response = await this.rateLimitedFetch(`${this.sruUrl}?${params}`);
          if (!response.ok) continue;
          const records = extractSruRecords(parseSruXml(await response.text()));
          const url = pickLatestRepositoryUrl(
            records.map((r) => parseLocatieToestand(r)).filter(Boolean) as string[]
          );
          if (url) return url;
        } catch {
          // probeer volgende datum
        }
      }

      const fallback = repositoryUrlFromBwbId(bwbId, new Date().toISOString().split("T")[0]);
      try {
        const head = await this.rateLimitedFetch(fallback, { method: "HEAD" });
        if (head.ok) return fallback;
      } catch {
        // ignore
      }
      return undefined;
    });
  }

  private async fetchRepositoryXml(
    repositoryUrl: string | undefined,
    bwbId: string
  ): Promise<string | undefined> {
    const url = repositoryUrl ?? (await this.resolveRepositoryUrl(bwbId));
    if (!url) return undefined;

    const cacheKey = `xml:${url}`;
    return this.cachedFetch(cacheKey, async () => {
      try {
        const response = await this.rateLimitedFetch(url, {
          headers: { Accept: "application/xml" },
        });
        if (!response.ok) return undefined;
        return await response.text();
      } catch {
        return undefined;
      }
    });
  }

  private fallbackSearch(query: LegalSearchQuery): LegalSearchResult[] {
    const text = queryText(query);
    return [
      {
        id: `bwb-search-${Date.now()}`,
        adapterId: this.id,
        title: `Zoek op wetten.overheid.nl: ${text}`,
        snippet: `Geen directe treffer in metadata of kernwetten. Doorzoek alle wetgeving op wetten.overheid.nl.`,
        jurisdiction: "NL_NATIONAAL",
        sourceType: "WET_IN_FORMELE_ZIN",
        authorityLevel: "PRIMAIR_BINDEND",
        officialUrl: `https://wetten.overheid.nl/zoeken?q=${encodeURIComponent(text)}`,
        relevanceScore: 0.1,
        metadata: { searchScope: "fallback" },
      },
    ];
  }

  async fetchDocument(identifier: string): Promise<LegalDocument> {
    const bwbId = identifier.replace(/^BWBR/, "BWBR");
    const url = buildOfficialUrl("bwb", bwbId);
    const repositoryUrl = await this.resolveRepositoryUrl(bwbId);
    const xml = await this.fetchRepositoryXml(repositoryUrl, bwbId);

    let fullText: string | undefined;
    let title = `Regeling ${bwbId}`;

    if (xml) {
      fullText = plainTextFromBwbXml(xml).slice(0, 100000);
      const titleMatch = xml.match(/<citeertitel[^>]*>([^<]+)</i);
      if (titleMatch?.[1]) title = titleMatch[1].trim();
    }

    return {
      id: bwbId,
      adapterId: this.id,
      title,
      fullText,
      jurisdiction: "NL_NATIONAAL",
      sourceType: "WET_IN_FORMELE_ZIN",
      authorityLevel: "PRIMAIR_BINDEND",
      identifiers: { bwbId },
      officialUrl: url,
      fetchedAt: new Date().toISOString(),
      metadata: repositoryUrl ? { repositoryUrl, searchScope: "fullText" } : undefined,
    };
  }

  normalize(raw: unknown): LegalDocument {
    const data = raw as Record<string, string>;
    return {
      id: data.bwbId ?? "unknown",
      adapterId: this.id,
      title: data.title ?? "Onbekend",
      jurisdiction: "NL_NATIONAAL",
      sourceType: "WET_IN_FORMELE_ZIN",
      authorityLevel: "PRIMAIR_BINDEND",
      identifiers: { bwbId: data.bwbId },
      officialUrl: data.url ?? buildOfficialUrl("bwb", data.bwbId),
      fetchedAt: new Date().toISOString(),
    };
  }
}

export const bwbSruAdapter = new BwbSruAdapter();
