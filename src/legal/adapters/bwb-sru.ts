import { BaseAdapter, buildOfficialUrl } from "./base-adapter";
import { parseXmlSafe, extractTextContent } from "../utils/xml-safe";
import { queryText } from "../utils/query-text";
import type { LegalSearchQuery, LegalSearchResult, LegalDocument } from "../types";

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
    const cql = query.identifier
      ? `dcterms.identifier=="${query.identifier}"`
      : `overheidbwb.titel="${text}" or overheidbwb.altKey="${text}"`;

    const params = new URLSearchParams({
      operation: "searchRetrieve",
      version: "1.2",
      query: cql,
      maximumRecords: String(query.limit ?? 10),
      startRecord: String((query.offset ?? 0) + 1),
      "x-connection": "BWB",
    });

    const response = await this.rateLimitedFetch(`${this.sruUrl}?${params}`);
    if (!response.ok) {
      // Fallback: return structured placeholder directing to official source
      return this.fallbackSearch(query);
    }

    const xml = await response.text();
    return this.parseSruResults(xml, text);
  }

  private parseSruResults(xml: string, queryText: string): LegalSearchResult[] {
    try {
      const parsed = parseXmlSafe<Record<string, unknown>>(xml);
      const records = this.extractRecords(parsed);
      return records.map((record, i) => {
        const bwbId =
          (record["dcterms:identifier"] as string) ??
          (record["overheidbwb:altKey"] as string) ??
          "";
        const title =
          extractTextContent(record["dcterms:title"]) ||
          extractTextContent(record["overheidbwb:titel"]) ||
          "Onbekende regeling";
        return {
          id: `bwb-${bwbId || i}`,
          adapterId: this.id,
          title,
          snippet: extractTextContent(record["dcterms:abstract"]) || title,
          jurisdiction: "NL_NATIONAAL" as const,
          sourceType: "WET_IN_FORMELE_ZIN" as const,
          authorityLevel: "PRIMAIR_BINDEND" as const,
          identifier: bwbId,
          officialUrl: bwbId ? buildOfficialUrl("bwb", bwbId) : "https://wetten.overheid.nl/",
          date: extractTextContent(record["dcterms:modified"]) || undefined,
        };
      });
    } catch {
      return this.fallbackSearch({ text: queryText ?? "" });
    }
  }

  private extractRecords(parsed: Record<string, unknown>): Record<string, unknown>[] {
    const response = parsed["srw:searchRetrieveResponse"] ?? parsed;
    const records =
      (response as Record<string, unknown>)["srw:records"] ??
      (response as Record<string, unknown>)["records"];
    if (!records) return [];
    const recordList = (records as Record<string, unknown>)["srw:record"] ??
      (records as Record<string, unknown>)["record"];
    if (!recordList) return [];
    const arr = Array.isArray(recordList) ? recordList : [recordList];
    return arr.map((r) => {
      const data = (r as Record<string, unknown>)["srw:recordData"] ??
        (r as Record<string, unknown>)["recordData"];
      const xmlData = (data as Record<string, unknown>)?.["gzd:gzd"] ??
        (data as Record<string, unknown>)?.["overheidbwb:meta"] ??
        data;
      return (xmlData ?? {}) as Record<string, unknown>;
    });
  }

  private fallbackSearch(query: LegalSearchQuery): LegalSearchResult[] {
    const text = queryText(query);
    const knownLaws: Record<string, { bwbId: string; title: string }> = {
      "onrechtmatige daad": { bwbId: "BWBR0005289", title: "Burgerlijk Wetboek Boek 6" },
      belaging: { bwbId: "BWBR0001854", title: "Wetboek van Strafrecht" },
      bedreiging: { bwbId: "BWBR0001854", title: "Wetboek van Strafrecht" },
      burenrecht: { bwbId: "BWBR0005289", title: "Burgerlijk Wetboek Boek 5 en 6" },
      "algemene wet bestuursrecht": { bwbId: "BWBR0005537", title: "Algemene wet bestuursrecht" },
      awb: { bwbId: "BWBR0005537", title: "Algemene wet bestuursrecht" },
      grondwet: { bwbId: "BWBR0001840", title: "Grondwet" },
      evrm: { bwbId: "BWBR0008923", title: "Verdrag tot bescherming van de rechten van de mens" },
    };

    const lower = text.toLowerCase();
    const results: LegalSearchResult[] = [];

    for (const [key, law] of Object.entries(knownLaws)) {
      if (lower.includes(key) || key.includes(lower)) {
        results.push({
          id: `bwb-${law.bwbId}`,
          adapterId: this.id,
          title: law.title,
          snippet: `Zoek op wetten.overheid.nl: ${text}`,
          jurisdiction: "NL_NATIONAAL",
          sourceType: "WET_IN_FORMELE_ZIN",
          authorityLevel: "PRIMAIR_BINDEND",
          identifier: law.bwbId,
          officialUrl: buildOfficialUrl("bwb", law.bwbId),
        });
      }
    }

    if (results.length === 0) {
      results.push({
        id: `bwb-search-${Date.now()}`,
        adapterId: this.id,
        title: `Zoekresultaat: ${text}`,
        snippet: `Raadpleeg wetten.overheid.nl voor: ${text}`,
        jurisdiction: "NL_NATIONAAL",
        sourceType: "WET_IN_FORMELE_ZIN",
        authorityLevel: "PRIMAIR_BINDEND",
        officialUrl: `https://wetten.overheid.nl/zoeken?q=${encodeURIComponent(text)}`,
      });
    }

    return results.slice(0, query.limit ?? 10);
  }

  async fetchDocument(identifier: string): Promise<LegalDocument> {
    const bwbId = identifier.replace(/^BWBR/, "BWBR");
    const url = buildOfficialUrl("bwb", bwbId);
    const response = await this.rateLimitedFetch(
      `https://wetten.overheid.nl/${bwbId}/geldendheidsdatum_${new Date().toISOString().split("T")[0]}/xml`,
      { headers: { Accept: "application/xml" } }
    );

    let fullText: string | undefined;
    if (response.ok) {
      const xml = await response.text();
      fullText = extractTextContent(parseXmlSafe(xml)).slice(0, 50000);
    }

    return {
      id: bwbId,
      adapterId: this.id,
      title: `Regeling ${bwbId}`,
      fullText,
      jurisdiction: "NL_NATIONAAL",
      sourceType: "WET_IN_FORMELE_ZIN",
      authorityLevel: "PRIMAIR_BINDEND",
      identifiers: { bwbId },
      officialUrl: url,
      fetchedAt: new Date().toISOString(),
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
