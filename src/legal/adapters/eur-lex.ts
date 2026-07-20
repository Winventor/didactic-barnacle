import { BaseAdapter, buildOfficialUrl } from "./base-adapter";
import { queryText } from "../utils/query-text";
import type { LegalSearchQuery, LegalSearchResult, LegalDocument } from "../types";

export class EurLexAdapter extends BaseAdapter {
  id = "eur-lex";
  name = "EUR-Lex";
  jurisdiction = "EU" as const;
  protected timeoutMs = 20000;

  async search(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    return this.cachedFetch(JSON.stringify(query), () => this.doSearch(query));
  }

  private async doSearch(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    const text = queryText(query);
    const sparqlQuery = `
      PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      SELECT ?work ?title ?date ?celex WHERE {
        ?work cdm:work_id_celex ?celex .
        ?exp cdm:expression_belongs_to_work ?work .
        ?exp cdm:expression_title ?title .
        OPTIONAL { ?work cdm:work_date_document ?date }
        FILTER(LANG(?title) = "nl" || LANG(?title) = "")
        FILTER(CONTAINS(LCASE(STR(?title)), LCASE("${text.replace(/"/g, '\\"')}"))
      }
      ORDER BY DESC(?date)
      LIMIT ${query.limit ?? 10}
    `;

    try {
      const url = `https://publications.europa.eu/webapi/rdf/sparql?format=json&query=${encodeURIComponent(sparqlQuery)}`;
      const response = await this.rateLimitedFetch(url);
      if (!response.ok) return this.fallbackSearch(query);

      const data = (await response.json()) as {
        results?: { bindings?: Array<Record<string, { value: string }>> };
      };
      const bindings = data.results?.bindings ?? [];
      return bindings.map((b, i) => {
        const celex = b.celex?.value ?? "";
        const title = b.title?.value ?? celex;
        return {
          id: `eurlex-${celex || i}`,
          adapterId: this.id,
          title,
          snippet: title,
          jurisdiction: "EU" as const,
          sourceType: this.celexToSourceType(celex),
          authorityLevel: "PRIMAIR_BINDEND" as const,
          identifier: celex,
          officialUrl: celex ? buildOfficialUrl("eurlex", celex) : "https://eur-lex.europa.eu/",
          date: b.date?.value,
        };
      });
    } catch {
      return this.fallbackSearch(query);
    }
  }

  private celexToSourceType(celex: string): LegalSearchResult["sourceType"] {
    if (celex.startsWith("3")) return "EU_VERORDENING";
    if (celex.startsWith("L")) return "EU_RICHTLIJN";
    if (celex.startsWith("1")) return "EU_VERDRAG";
    return "EU_BESLUIT";
  }

  private fallbackSearch(query: LegalSearchQuery): LegalSearchResult[] {
    const text = queryText(query);
    return [
      {
        id: `eurlex-search-${Date.now()}`,
        adapterId: this.id,
        title: `EU-wetgeving: ${text}`,
        snippet: `Zoek op EUR-Lex voor: ${text}`,
        jurisdiction: "EU",
        sourceType: "EU_VERORDENING",
        authorityLevel: "PRIMAIR_BINDEND",
        officialUrl: `https://eur-lex.europa.eu/search.html?text=${encodeURIComponent(text)}&lang=nl`,
      },
    ];
  }

  async fetchDocument(identifier: string): Promise<LegalDocument> {
    const celex = identifier;
    return {
      id: celex,
      adapterId: this.id,
      title: `EU-document ${celex}`,
      jurisdiction: "EU",
      sourceType: this.celexToSourceType(celex),
      authorityLevel: "PRIMAIR_BINDEND",
      identifiers: { celex, eli: `http://data.europa.eu/eli/${celex}` },
      officialUrl: buildOfficialUrl("eurlex", celex),
      fetchedAt: new Date().toISOString(),
    };
  }

  normalize(raw: unknown): LegalDocument {
    const data = raw as Record<string, string>;
    return {
      id: data.celex ?? "unknown",
      adapterId: this.id,
      title: data.title ?? "EU-document",
      jurisdiction: "EU",
      sourceType: "EU_VERORDENING",
      authorityLevel: "PRIMAIR_BINDEND",
      identifiers: { celex: data.celex },
      officialUrl: buildOfficialUrl("eurlex", data.celex),
      fetchedAt: new Date().toISOString(),
    };
  }
}

export const eurLexAdapter = new EurLexAdapter();
