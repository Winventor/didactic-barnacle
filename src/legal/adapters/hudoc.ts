import { BaseAdapter } from "./base-adapter";
import { queryText } from "../utils/query-text";
import type { LegalSearchQuery, LegalSearchResult, LegalDocument } from "../types";

interface HudocResult {
  itemid?: string[];
  docname?: string[];
  kpdate?: string[];
  ecli?: string[];
  conclusion?: string[];
  importance?: string[];
}

interface HudocResponse {
  results?: HudocResult[];
  resultcount?: number;
}

export class HudocAdapter extends BaseAdapter {
  id = "hudoc";
  name = "HUDOC (EHRM)";
  jurisdiction = "RAAD_VAN_EUROPA" as const;
  protected timeoutMs = 20000;

  private readonly apiUrl = "https://hudoc.echr.coe.int/app/query/results";

  async search(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    return this.cachedFetch(JSON.stringify(query), () => this.doSearch(query));
  }

  private async doSearch(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    const text = queryText(query);
    const hudocQuery = query.identifier
      ? `itemid:${query.identifier}`
      : `(contents("${text}") AND (NOT (doctype=PR OR doctype=HFCOMOLD)))`;

    const params = new URLSearchParams({
      query: hudocQuery,
      select: "itemid,docname,kpdate,ecli,conclusion,importance",
      sort: "kpdate Descending",
      start: "0",
      length: String(query.limit ?? 10),
    });

    try {
      const response = await this.rateLimitedFetch(`${this.apiUrl}?${params}`);
      if (!response.ok) return this.fallbackSearch(query);

      const data = (await response.json()) as HudocResponse;
      return (data.results ?? []).map((hit, i) => this.hitToResult(hit, i));
    } catch {
      return this.fallbackSearch(query);
    }
  }

  private hitToResult(hit: HudocResult, index: number): LegalSearchResult {
    const itemId = hit.itemid?.[0] ?? `hudoc-${index}`;
    const docName = hit.docname?.[0] ?? itemId;
    const conclusion = hit.conclusion?.[0] ?? "";
    const isCommunicated = docName.toLowerCase().includes("communicated");

    return {
      id: itemId,
      adapterId: this.id,
      title: docName,
      snippet: conclusion || docName,
      jurisdiction: "RAAD_VAN_EUROPA",
      sourceType: "EHRM_JURISPRUDENTIE",
      authorityLevel: isCommunicated ? "NIET_BINDEND" : "PRIMAIR_GEZAGHEBBEND",
      identifier: hit.ecli?.[0] ?? itemId,
      officialUrl: `https://hudoc.echr.coe.int/eng#{"itemid":["${itemId}"]}`,
      date: hit.kpdate?.[0],
    };
  }

  private fallbackSearch(query: LegalSearchQuery): LegalSearchResult[] {
    const text = queryText(query);
    return [
      {
        id: `hudoc-search-${Date.now()}`,
        adapterId: this.id,
        title: `EHRM: ${text}`,
        snippet:
          "Rechtsorde: Raad van Europa. Niet hetzelfde als: Europese Unie / Hof van Justitie.",
        jurisdiction: "RAAD_VAN_EUROPA",
        sourceType: "EHRM_JURISPRUDENTIE",
        authorityLevel: "PRIMAIR_GEZAGHEBBEND",
        officialUrl: `https://hudoc.echr.coe.int/eng#{"query":["${text}"]}`,
      },
    ];
  }

  async fetchDocument(identifier: string): Promise<LegalDocument> {
    return {
      id: identifier,
      adapterId: this.id,
      title: `EHRM ${identifier}`,
      jurisdiction: "RAAD_VAN_EUROPA",
      sourceType: "EHRM_JURISPRUDENTIE",
      authorityLevel: "PRIMAIR_GEZAGHEBBEND",
      institution: "Europees Hof voor de Rechten van de Mens",
      identifiers: { applicationNumber: identifier },
      officialUrl: `https://hudoc.echr.coe.int/eng#{"itemid":["${identifier}"]}`,
      fetchedAt: new Date().toISOString(),
      metadata: {
        note: "Raad van Europa / EVRM is niet hetzelfde als Europese Unie / EU-recht",
      },
    };
  }

  normalize(raw: unknown): LegalDocument {
    const data = raw as HudocResult;
    const itemId = data.itemid?.[0] ?? "unknown";
    return {
      id: itemId,
      adapterId: this.id,
      title: data.docname?.[0] ?? itemId,
      jurisdiction: "RAAD_VAN_EUROPA",
      sourceType: "EHRM_JURISPRUDENTIE",
      authorityLevel: "PRIMAIR_GEZAGHEBBEND",
      identifiers: { applicationNumber: itemId, ecli: data.ecli?.[0] },
      officialUrl: `https://hudoc.echr.coe.int/eng#{"itemid":["${itemId}"]}`,
      fetchedAt: new Date().toISOString(),
    };
  }
}

export const hudocAdapter = new HudocAdapter();
