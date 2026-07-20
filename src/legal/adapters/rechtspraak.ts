import { BaseAdapter, buildOfficialUrl } from "./base-adapter";
import { queryText } from "../utils/query-text";
import type { LegalSearchQuery, LegalSearchResult, LegalDocument } from "../types";

interface RechtspraakHit {
  id?: string;
  titel?: string;
  type?: string;
  datumUitspraak?: string;
  datumPublicatie?: string;
  instantie?: string;
  rechtsgebieden?: string[];
  inhoudsindicatie?: string;
  ecli?: string;
  zaaknummer?: string;
}

interface RechtspraakResponse {
  results?: RechtspraakHit[];
  totaal?: number;
}

export class RechtspraakOpenDataAdapter extends BaseAdapter {
  id = "rechtspraak";
  name = "Rechtspraak.nl Open Data";
  jurisdiction = "NL_NATIONAAL" as const;

  private readonly apiUrl = "https://data.rechtspraak.nl/uitspraken/zoeken";

  async search(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    return this.cachedFetch(JSON.stringify(query), () => this.doSearch(query));
  }

  private async doSearch(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    const body: Record<string, unknown> = {
      start: query.offset ?? 0,
      max: query.limit ?? 10,
    };

    if (query.identifier?.startsWith("ECLI")) {
      body.id = query.identifier;
    } else {
      body.zoektekst = query.text ?? query.identifier ?? "";
    }

    if (query.dateFrom) body.datumUitspraakVan = query.dateFrom;
    if (query.dateTo) body.datumUitspraakTot = query.dateTo;

    try {
      const response = await this.rateLimitedFetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) return this.fallbackSearch(query);

      const data = (await response.json()) as RechtspraakResponse;
      return (data.results ?? []).map((hit) => this.hitToResult(hit));
    } catch {
      return this.fallbackSearch(query);
    }
  }

  private hitToResult(hit: RechtspraakHit): LegalSearchResult {
    const ecli = hit.ecli ?? hit.id ?? "";
    const isAg = ecli.includes(":PHR:");
    return {
      id: ecli || `rp-${Date.now()}`,
      adapterId: this.id,
      title: hit.titel ?? ecli,
      snippet: hit.inhoudsindicatie ?? hit.titel ?? "",
      jurisdiction: "NL_NATIONAAL",
      sourceType: isAg ? "CONCLUSIE_ADVOCAAT_GENERAAL" : "NATIONALE_JURISPRUDENTIE",
      authorityLevel: this.getAuthorityLevel(ecli),
      identifier: ecli,
      officialUrl: ecli ? buildOfficialUrl("ecli", ecli) : "https://uitspraken.rechtspraak.nl/",
      date: hit.datumUitspraak,
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
        title: `Jurisprudentie: ${text}`,
        snippet: `Zoek op rechtspraak.nl voor: ${text}`,
        jurisdiction: "NL_NATIONAAL",
        sourceType: "NATIONALE_JURISPRUDENTIE",
        authorityLevel: "PERSUASIEF",
        officialUrl: `https://uitspraken.rechtspraak.nl/resultaat?zoekterm=${encodeURIComponent(text)}`,
      },
    ];
  }

  async fetchDocument(identifier: string): Promise<LegalDocument> {
    const ecli = identifier;
    const contentUrl = `https://data.rechtspraak.nl/uitspraken/content?id=${encodeURIComponent(ecli)}`;

    let fullText: string | undefined;
    try {
      const response = await this.rateLimitedFetch(contentUrl, {
        headers: { Accept: "application/xml" },
      });
      if (response.ok) {
        fullText = (await response.text()).slice(0, 100000);
      }
    } catch {
      // content may not be available
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
      institution: this.getInstitution(ecli),
      date: hit?.date,
      identifiers: { ecli },
      officialUrl: buildOfficialUrl("ecli", ecli),
      fetchedAt: new Date().toISOString(),
    };
  }

  private getInstitution(ecli: string): string {
    if (ecli.includes(":HR:")) return "Hoge Raad";
    if (ecli.includes(":RVS:")) return "Raad van State";
    if (ecli.includes(":CRVB:")) return "Centrale Raad van Beroep";
    if (ecli.includes(":CBB:")) return "College van Beroep voor het bedrijfsleven";
    if (ecli.includes(":PHR:")) return "Parket bij de Hoge Raad";
    if (ecli.includes(":GH")) return "Gerechtshof";
    if (ecli.includes(":RB")) return "Rechtbank";
    return "Nederlandse rechter";
  }

  normalize(raw: unknown): LegalDocument {
    const data = raw as RechtspraakHit;
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
