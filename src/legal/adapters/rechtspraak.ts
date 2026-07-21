import { BaseAdapter, buildOfficialUrl } from "./base-adapter";
import { parseXmlSafe, extractTextContent } from "../utils/xml-safe";
import { queryText } from "../utils/query-text";
import { extractPassages, termMatches } from "../utils/definition-extractor";
import type { LegalSearchQuery, LegalSearchResult, LegalDocument } from "../types";

interface AtomEntry {
  id?: string;
  title?: unknown;
  summary?: unknown;
  updated?: string;
  link?: { "@_rel"?: string; "@_href"?: string } | Array<{ "@_rel"?: string; "@_href"?: string }>;
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
    const text = queryText(query);
    const params = new URLSearchParams({
      max: String(query.limit ?? 10),
    });

    if (query.identifier?.startsWith("ECLI")) {
      params.set("id", query.identifier);
    } else if (text) {
      params.set("zoektekst", text);
    } else {
      return this.fallbackSearch(query);
    }

    if (query.dateFrom) params.set("datumUitspraakVan", query.dateFrom);
    if (query.dateTo) params.set("datumUitspraakTot", query.dateTo);
    if (query.offset) params.set("start", String(query.offset));

    try {
      const response = await this.rateLimitedFetch(`${this.apiUrl}?${params}`, {
        headers: { Accept: "application/atom+xml, application/xml" },
      });

      if (!response.ok) return this.fallbackSearch(query);

      const xml = await response.text();
      const results = this.parseAtomFeed(xml, text);

      if (results.length === 0) return this.fallbackSearch(query);
      return results;
    } catch {
      return this.fallbackSearch(query);
    }
  }

  private parseAtomFeed(xml: string, queryText: string): LegalSearchResult[] {
    try {
      const parsed = parseXmlSafe<Record<string, unknown>>(xml);
      const feed = (parsed.feed ?? parsed) as Record<string, unknown>;
      const entries = feed.entry;
      if (!entries) return [];

      const entryList = Array.isArray(entries) ? entries : [entries];
      return entryList.map((entry) => this.entryToResult(entry as AtomEntry, queryText));
    } catch {
      return [];
    }
  }

  private entryToResult(entry: AtomEntry, queryText: string): LegalSearchResult {
    const ecli = typeof entry.id === "string" ? entry.id : extractTextContent(entry.id);
    const title = extractTextContent(entry.title) || ecli;
    const summary = extractTextContent(entry.summary);
    const link = entry.link;
    const links = Array.isArray(link) ? link : link ? [link] : [];
    const alternate =
      links.find((l) => l["@_rel"] === "alternate")?.["@_href"] ??
      (ecli ? buildOfficialUrl("ecli", ecli) : "https://uitspraken.rechtspraak.nl/");

    const snippet =
      summary && summary !== "-"
        ? summary
        : queryText
          ? `Volledige uitspraaktekst doorzoekbaar op rechtspraak.nl voor: ${queryText}`
          : title;

    const isAg = ecli.includes(":PHR:");
  return {
      id: ecli || `rp-${Date.now()}`,
      adapterId: this.id,
      title,
      snippet: snippet.slice(0, 500),
      jurisdiction: "NL_NATIONAAL",
      sourceType: isAg ? "CONCLUSIE_ADVOCAAT_GENERAAL" : "NATIONALE_JURISPRUDENTIE",
      authorityLevel: this.getAuthorityLevel(ecli),
      identifier: ecli,
      officialUrl: alternate,
      date: entry.updated?.split("T")[0],
      relevanceScore: summary && summary !== "-" ? 0.9 : 0.7,
      metadata: { searchScope: "fullText" },
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
        snippet: `Doorzoek volledige uitspraken op rechtspraak.nl voor: ${text}`,
        jurisdiction: "NL_NATIONAAL",
        sourceType: "NATIONALE_JURISPRUDENTIE",
        authorityLevel: "PERSUASIEF",
        officialUrl: `https://uitspraken.rechtspraak.nl/resultaat?zoekterm=${encodeURIComponent(text)}`,
        relevanceScore: 0.1,
        metadata: { searchScope: "fallback" },
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
        const xml = await response.text();
        fullText = extractTextContent(parseXmlSafe(xml)).slice(0, 100000);
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
