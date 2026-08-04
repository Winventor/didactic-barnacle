import { BaseAdapter, buildOfficialUrl } from "./base-adapter";
import { parseXmlSafe, extractTextContent } from "../utils/xml-safe";
import { queryText } from "../utils/query-text";
import { fetchLegal } from "../utils/browser-fetch";
import { extractPassages, termMatches } from "../utils/definition-extractor";
import {
  buildMetadataSearchUrl,
  buildOfficialSearchUrl,
  entryMatchesTerm,
  institutionFromEcli,
  isEcli,
  parseRechtspraakAtomFeed,
  rankEntry,
  RECHTSPRAAK_CONTENT_URL,
  type RechtspraakAtomEntry,
  type RechtspraakSearchOptions,
} from "../utils/rechtspraak-search";
import type { LegalSearchQuery, LegalSearchResult, LegalDocument } from "../types";

export class RechtspraakOpenDataAdapter extends BaseAdapter {
  id = "rechtspraak";
  name = "Rechtspraak.nl Open Data";
  jurisdiction = "NL_NATIONAAL" as const;

  async search(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    return this.cachedFetch(JSON.stringify(query), () => this.doSearch(query));
  }

  private async doSearch(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    const text = queryText(query).trim();
    const ecli = query.identifier?.trim() || (isEcli(text) ? text : "");

    if (ecli) {
      return this.searchByEcli(ecli, query.limit ?? 10);
    }

    if (!text) {
      return this.fallbackSearch(query);
    }

    try {
      const results = await this.searchByKeyword(text, {
        limit: query.limit ?? 10,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      });
      if (results.length > 0) return results;
    } catch {
      // fallback hieronder
    }

    return this.fallbackSearch(query);
  }

  private async searchByEcli(ecli: string, limit: number): Promise<LegalSearchResult[]> {
    const contentUrl = `${RECHTSPRAAK_CONTENT_URL}?id=${encodeURIComponent(ecli)}`;
    let snippet = `Uitspraak ${ecli}`;

    try {
      const response = await fetchLegal(contentUrl, {
        headers: { Accept: "application/xml" },
      });
      if (response.ok) {
        const xml = await response.text();
        const plain = extractTextContent(parseXmlSafe(xml));
        snippet = plain.slice(0, 500) || snippet;
      }
    } catch {
      // metadata/snippet blijft fallback
    }

    const metadataResults = await this.fetchMetadataPage(
      buildMetadataSearchUrl({ pageSize: 5, dateFrom: "1990-01-01" })
    );
    const meta = metadataResults.find((entry) => entry.ecli === ecli);

    return [
      this.entryToResult(
        meta ?? {
          ecli,
          title: ecli,
          summary: snippet,
          officialUrl: buildOfficialUrl("ecli", ecli),
        },
        ""
      ),
    ].slice(0, limit);
  }

  private async searchByKeyword(
    term: string,
    options: RechtspraakSearchOptions & { limit: number }
  ): Promise<LegalSearchResult[]> {
    const limit = options.limit;
    const matches = new Map<string, LegalSearchResult>();
    const pageSize = options.pageSize ?? 100;
    const maxPages = options.maxPages ?? 6;

    for (let page = 0; page < maxPages && matches.size < limit; page++) {
      const url = buildMetadataSearchUrl({
        ...options,
        pageSize,
        from: page * pageSize,
      });

      const entries = await this.fetchMetadataPage(url);
      for (const entry of entries) {
        if (!entryMatchesTerm(entry, term)) continue;
        const result = this.entryToResult(entry, term);
        const existing = matches.get(entry.ecli);
        if (!existing || (result.relevanceScore ?? 0) > (existing.relevanceScore ?? 0)) {
          matches.set(entry.ecli, result);
        }
        if (matches.size >= limit) break;
      }

      if (entries.length < pageSize) break;
    }

    if (matches.size < limit) {
      const enriched = await this.enrichWithFullText([...matches.values()], term, limit);
      return enriched.slice(0, limit);
    }

    return [...matches.values()]
      .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
      .slice(0, limit);
  }

  private async enrichWithFullText(
    current: LegalSearchResult[],
    term: string,
    limit: number
  ): Promise<LegalSearchResult[]> {
    const found = new Map(current.map((r) => [r.identifier ?? r.id, r]));
    const candidates = await this.fetchMetadataPage(
      buildMetadataSearchUrl({ pageSize: 80, maxPages: 1 })
    );

    for (const entry of candidates) {
      if (found.size >= limit) break;
      if (found.has(entry.ecli)) continue;

      try {
        const contentUrl = `${RECHTSPRAAK_CONTENT_URL}?id=${encodeURIComponent(entry.ecli)}`;
        const response = await fetchLegal(contentUrl, {
          headers: { Accept: "application/xml" },
        });
        if (!response.ok) continue;
        const xml = await response.text();
        const plain = extractTextContent(parseXmlSafe(xml));
        if (!termMatches(plain, term)) continue;

        const passages = extractPassages(plain, term, { maxPassages: 1 });
        found.set(entry.ecli, {
          ...this.entryToResult(entry, term),
          snippet: passages[0] ?? entry.summary,
          relevanceScore: 0.95,
          metadata: { searchScope: "fullText" },
        });
      } catch {
        // volgende kandidaat
      }
    }

    return [...found.values()].sort(
      (a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0)
    );
  }

  private async fetchMetadataPage(url: string): Promise<RechtspraakAtomEntry[]> {
    const response = await fetchLegal(url, {
      headers: { Accept: "application/atom+xml, application/xml" },
    });
    if (!response.ok) {
      throw new Error(`Rechtspraak metadata zoeken mislukt (${response.status})`);
    }
    const xml = await response.text();
    return parseRechtspraakAtomFeed(xml);
  }

  private entryToResult(entry: RechtspraakAtomEntry, term: string): LegalSearchResult {
    const ecli = entry.ecli;
    const isAg = ecli.includes(":PHR:");
    const snippet =
      entry.summary ||
      (term
        ? `Vermelding van "${term}" in metadata of uitspraak ${ecli}`
        : entry.title);

    return {
      id: ecli,
      adapterId: this.id,
      title: entry.title,
      snippet: snippet.slice(0, 500),
      jurisdiction: "NL_NATIONAAL",
      sourceType: isAg ? "CONCLUSIE_ADVOCAAT_GENERAAL" : "NATIONALE_JURISPRUDENTIE",
      authorityLevel: this.getAuthorityLevel(ecli),
      identifier: ecli,
      officialUrl: entry.officialUrl,
      date: entry.updated?.split("T")[0],
      relevanceScore: term ? rankEntry(entry, term) : 0.7,
      metadata: {
        searchScope: entry.summary ? "metadata" : "metadata",
        institution: institutionFromEcli(ecli),
      },
    };
  }

  private getAuthorityLevel(ecli: string): LegalSearchResult["authorityLevel"] {
    if (ecli.includes(":HR:")) return "PRIMAIR_GEZAGHEBBEND";
    if (ecli.includes(":RVS:") || ecli.includes(":CRVB:")) return "PRIMAIR_GEZAGHEBBEND";
    if (ecli.includes(":PHR:")) return "TOELICHTEND";
    return "PERSUASIEF";
  }

  private fallbackSearch(query: LegalSearchQuery): LegalSearchResult[] {
    const text = queryText(query);
    return [
      {
        id: `rp-search-${Date.now()}`,
        adapterId: this.id,
        title: `Zoek op rechtspraak.nl: ${text}`,
        snippet:
          "Live zoeken via Open Data vereist een server-API (CORS). Gebruik de officiële zoeklink of deploy met API-routes.",
        jurisdiction: "NL_NATIONAAL",
        sourceType: "NATIONALE_JURISPRUDENTIE",
        authorityLevel: "PERSUASIEF",
        officialUrl: buildOfficialSearchUrl(text),
        relevanceScore: 0.1,
        metadata: { searchScope: "fallback" },
      },
    ];
  }

  async fetchDocument(identifier: string): Promise<LegalDocument> {
    const ecli = identifier;
    const contentUrl = `${RECHTSPRAAK_CONTENT_URL}?id=${encodeURIComponent(ecli)}`;

    let fullText: string | undefined;
    try {
      const response = await fetchLegal(contentUrl, {
        headers: { Accept: "application/xml" },
      });
      if (response.ok) {
        fullText = extractTextContent(parseXmlSafe(await response.text())).slice(0, 100000);
      }
    } catch {
      // content niet beschikbaar
    }

    const results = await this.search({ identifier: ecli, limit: 1 });
    const hit = results[0];

    return {
      id: ecli,
      adapterId: this.id,
      title: hit?.title ?? ecli,
      fullText,
      jurisdiction: "NL_NATIONAAL",
      sourceType: ecli.includes(":PHR:")
        ? "CONCLUSIE_ADVOCAAT_GENERAAL"
        : "NATIONALE_JURISPRUDENTIE",
      authorityLevel: this.getAuthorityLevel(ecli),
      institution: institutionFromEcli(ecli),
      date: hit?.date,
      identifiers: { ecli },
      officialUrl: buildOfficialUrl("ecli", ecli),
      fetchedAt: new Date().toISOString(),
      metadata: { searchScope: "fullText" },
    };
  }

  async enrichWithPassages(doc: LegalDocument, term: string): Promise<LegalDocument> {
    if (!doc.fullText || !termMatches(doc.fullText, term)) return doc;
    const passages = extractPassages(doc.fullText, term, { maxPassages: 5 });
    return {
      ...doc,
      fragments: passages.map((text, i) => ({ id: `rp-frag-${i}`, text })),
    };
  }

  normalize(raw: unknown): LegalDocument {
    const data = raw as { ecli?: string; id?: string; titel?: string };
    const ecli = data.ecli ?? data.id ?? "unknown";
    return {
      id: ecli,
      adapterId: this.id,
      title: data.titel ?? ecli,
      jurisdiction: "NL_NATIONAAL",
      sourceType: "NATIONALE_JURISPRUDENTIE",
      authorityLevel: this.getAuthorityLevel(ecli),
      identifiers: { ecli },
      officialUrl: buildOfficialUrl("ecli", ecli),
      fetchedAt: new Date().toISOString(),
    };
  }
}

export const rechtspraakAdapter = new RechtspraakOpenDataAdapter();
