import { BaseAdapter } from "./base-adapter";
import { parseXmlSafe, extractTextContent } from "../utils/xml-safe";
import { queryText } from "../utils/query-text";
import type { LegalSearchQuery, LegalSearchResult, LegalDocument } from "../types";

export class OfficialGazetteAdapter extends BaseAdapter {
  id = "official-gazette";
  name = "Officiële bekendmakingen";
  jurisdiction = "NL_NATIONAAL" as const;

  private readonly sruUrl = "https://zoek.officielebekendmakingen.nl/sru/Search";

  async search(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    const text = queryText(query);
    const params = new URLSearchParams({
      operation: "searchRetrieve",
      version: "1.2",
      query: `cql.serverChoice all "${text}"`,
      maximumRecords: String(query.limit ?? 10),
      startRecord: "1",
    });

    try {
      const response = await this.rateLimitedFetch(`${this.sruUrl}?${params}`);
      if (!response.ok) return this.fallbackSearch(query);
      const xml = await response.text();
      return this.parseResults(xml, text);
    } catch {
      return this.fallbackSearch(query);
    }
  }

  private parseResults(xml: string, queryText: string): LegalSearchResult[] {
    try {
      const parsed = parseXmlSafe<Record<string, unknown>>(xml);
      const response = parsed["srw:searchRetrieveResponse"] as Record<string, unknown>;
      const records = response?.["srw:records"] as Record<string, unknown>;
      const recordList = records?.["srw:record"];
      if (!recordList) return this.fallbackSearch({ text: queryText });

      const arr = Array.isArray(recordList) ? recordList : [recordList];
      return arr.map((r, i) => {
        const data = (r as Record<string, unknown>)["srw:recordData"] as Record<string, unknown>;
        const title = extractTextContent(data?.["dcterms:title"]) || `Bekendmaking ${i + 1}`;
        const id = extractTextContent(data?.["dcterms:identifier"]) || "";
        return {
          id: `ob-${id || i}`,
          adapterId: this.id,
          title,
          snippet: extractTextContent(data?.["dcterms:abstract"]) || title,
          jurisdiction: "NL_NATIONAAL" as const,
          sourceType: "PARLEMENTAIRE_GESCHIEDENIS" as const,
          authorityLevel: "PRIMAIR_GEZAGHEBBEND" as const,
          identifier: id,
          officialUrl: id
            ? `https://zoek.officielebekendmakingen.nl/resultaten?q=${encodeURIComponent(id)}`
            : "https://www.officielebekendmakingen.nl/",
        };
      });
    } catch {
      return this.fallbackSearch({ text: queryText });
    }
  }

  private fallbackSearch(query: LegalSearchQuery): LegalSearchResult[] {
    const text = queryText(query);
    return [
      {
        id: `ob-search-${Date.now()}`,
        adapterId: this.id,
        title: `Officiële bekendmaking: ${text}`,
        snippet: `Zoek op officielebekendmakingen.nl`,
        jurisdiction: "NL_NATIONAAL",
        sourceType: "PARLEMENTAIRE_GESCHIEDENIS",
        authorityLevel: "PRIMAIR_GEZAGHEBBEND",
        officialUrl: `https://zoek.officielebekendmakingen.nl/resultaten?q=${encodeURIComponent(text)}`,
      },
    ];
  }

  async fetchDocument(identifier: string): Promise<LegalDocument> {
    return {
      id: identifier,
      adapterId: this.id,
      title: `Officiële bekendmaking ${identifier}`,
      jurisdiction: "NL_NATIONAAL",
      sourceType: "PARLEMENTAIRE_GESCHIEDENIS",
      authorityLevel: "PRIMAIR_GEZAGHEBBEND",
      identifiers: {},
      officialUrl: `https://zoek.officielebekendmakingen.nl/resultaten?q=${encodeURIComponent(identifier)}`,
      fetchedAt: new Date().toISOString(),
    };
  }

  normalize(raw: unknown): LegalDocument {
    const data = raw as Record<string, string>;
    return {
      id: data.id ?? "unknown",
      adapterId: this.id,
      title: data.title ?? "Officiële bekendmaking",
      jurisdiction: "NL_NATIONAAL",
      sourceType: "PARLEMENTAIRE_GESCHIEDENIS",
      authorityLevel: "PRIMAIR_GEZAGHEBBEND",
      identifiers: {},
      officialUrl: data.url ?? "https://www.officielebekendmakingen.nl/",
      fetchedAt: new Date().toISOString(),
    };
  }
}

export const officialGazetteAdapter = new OfficialGazetteAdapter();
