import { BaseAdapter } from "./base-adapter";
import { parseXmlSafe, extractTextContent } from "../utils/xml-safe";
import { queryText } from "../utils/query-text";
import type { LegalSearchQuery, LegalSearchResult, LegalDocument } from "../types";

export class LocalRegulationsAdapter extends BaseAdapter {
  id = "local-regulations";
  name = "Lokale wet- en regelgeving";
  jurisdiction = "NL_LOKAAL" as const;

  private readonly sruUrl = "https://zoekservice.overheid.nl/sru/Search";

  async search(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    return this.cachedFetch(JSON.stringify(query), () => this.doSearch(query));
  }

  private async doSearch(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    const text = queryText(query);
    const cql = query.identifier
      ? `dcterms.identifier=="${query.identifier}"`
      : `overheidlocal.titel="${text}" or overheidlocal.altKey="${text}"`;

    const params = new URLSearchParams({
      operation: "searchRetrieve",
      version: "1.2",
      query: cql,
      maximumRecords: String(query.limit ?? 10),
      startRecord: "1",
      "x-connection": "CVDR",
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
        const title = extractTextContent(data?.["dcterms:title"]) || `Lokale regeling ${i + 1}`;
        const cvdrId = extractTextContent(data?.["dcterms:identifier"]) || "";
        return {
          id: `cvdr-${cvdrId || i}`,
          adapterId: this.id,
          title,
          snippet: extractTextContent(data?.["dcterms:abstract"]) || title,
          jurisdiction: "NL_LOKAAL" as const,
          sourceType: "GEMEENTELIJKE_VERORDENING" as const,
          authorityLevel: "PRIMAIR_BINDEND" as const,
          identifier: cvdrId,
          officialUrl: cvdrId
            ? `https://lokaleregelgeving.overheid.nl/${cvdrId}`
            : "https://lokaleregelgeving.overheid.nl/",
        };
      });
    } catch {
      return this.fallbackSearch({ text: queryText });
    }
  }

  private fallbackSearch(query: LegalSearchQuery): LegalSearchResult[] {
    const text = queryText(query);
    const warning = !text.includes("gemeente")
      ? "Let op: geen gemeente/provincie opgegeven – lokale regelgeving kan relevant zijn."
      : "";

    return [
      {
        id: `cvdr-search-${Date.now()}`,
        adapterId: this.id,
        title: `Lokale regelgeving: ${text}`,
        snippet: `${warning} Zoek op lokaleregelgeving.overheid.nl`.trim(),
        jurisdiction: "NL_LOKAAL",
        sourceType: "GEMEENTELIJKE_VERORDENING",
        authorityLevel: "PRIMAIR_BINDEND",
        officialUrl: `https://lokaleregelgeving.overheid.nl/zoeken?zoekterm=${encodeURIComponent(text)}`,
      },
    ];
  }

  async fetchDocument(identifier: string): Promise<LegalDocument> {
    return {
      id: identifier,
      adapterId: this.id,
      title: `Lokale regeling ${identifier}`,
      jurisdiction: "NL_LOKAAL",
      sourceType: "GEMEENTELIJKE_VERORDENING",
      authorityLevel: "PRIMAIR_BINDEND",
      identifiers: { cvdrId: identifier },
      officialUrl: `https://lokaleregelgeving.overheid.nl/${identifier}`,
      fetchedAt: new Date().toISOString(),
    };
  }

  normalize(raw: unknown): LegalDocument {
    const data = raw as Record<string, string>;
    return {
      id: data.cvdrId ?? "unknown",
      adapterId: this.id,
      title: data.title ?? "Lokale regeling",
      jurisdiction: "NL_LOKAAL",
      sourceType: "GEMEENTELIJKE_VERORDENING",
      authorityLevel: "PRIMAIR_BINDEND",
      identifiers: { cvdrId: data.cvdrId },
      officialUrl: `https://lokaleregelgeving.overheid.nl/${data.cvdrId}`,
      fetchedAt: new Date().toISOString(),
    };
  }
}

export const localRegulationsAdapter = new LocalRegulationsAdapter();
