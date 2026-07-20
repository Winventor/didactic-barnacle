import { BaseAdapter } from "./base-adapter";
import { queryText } from "../utils/query-text";
import type { LegalSearchQuery, LegalSearchResult, LegalDocument } from "../types";

export class CuriaAdapter extends BaseAdapter {
  id = "curia";
  name = "CURIA / InfoCuria";
  jurisdiction = "EU" as const;
  protected timeoutMs = 20000;

  async search(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    return this.cachedFetch(JSON.stringify(query), () => this.doSearch(query));
  }

  private async doSearch(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    const text = queryText(query);
    const sparqlQuery = `
      PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
      SELECT ?work ?title ?date ?celex WHERE {
        ?work cdm:work_has_resource-type <http://publications.europa.eu/resource/authority/resource-type/JUDG> .
        ?exp cdm:expression_belongs_to_work ?work .
        ?exp cdm:expression_title ?title .
        ?work cdm:work_id_celex ?celex .
        OPTIONAL { ?work cdm:work_date_document ?date }
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
      return (data.results?.bindings ?? []).map((b, i) => ({
        id: `curia-${b.celex?.value ?? i}`,
        adapterId: this.id,
        title: b.title?.value ?? "CJEU uitspraak",
        snippet: b.title?.value ?? "",
        jurisdiction: "EU" as const,
        sourceType: "CJEU_JURISPRUDENTIE" as const,
        authorityLevel: "PRIMAIR_GEZAGHEBBEND" as const,
        identifier: b.celex?.value,
        officialUrl: b.celex?.value
          ? `https://eur-lex.europa.eu/legal-content/NL/TXT/?uri=CELEX:${b.celex.value}`
          : "https://curia.europa.eu/",
        date: b.date?.value,
      }));
    } catch {
      return this.fallbackSearch(query);
    }
  }

  private fallbackSearch(query: LegalSearchQuery): LegalSearchResult[] {
    const text = queryText(query);
    return [
      {
        id: `curia-search-${Date.now()}`,
        adapterId: this.id,
        title: `EU-rechtspraak: ${text}`,
        snippet:
          "Een uitspraak van het Hof van Justitie geeft uitleg aan EU-recht en kan relevant zijn voor Nederlandse rechters.",
        jurisdiction: "EU",
        sourceType: "CJEU_JURISPRUDENTIE",
        authorityLevel: "PRIMAIR_GEZAGHEBBEND",
        officialUrl: `https://curia.europa.eu/juris/recherche.jsf?language=nl&txt=${encodeURIComponent(text)}`,
      },
    ];
  }

  async fetchDocument(identifier: string): Promise<LegalDocument> {
    return {
      id: identifier,
      adapterId: this.id,
      title: `CJEU uitspraak ${identifier}`,
      jurisdiction: "EU",
      sourceType: "CJEU_JURISPRUDENTIE",
      authorityLevel: "PRIMAIR_GEZAGHEBBEND",
      institution: "Hof van Justitie van de Europese Unie",
      identifiers: { celex: identifier, caseNumber: identifier },
      officialUrl: `https://eur-lex.europa.eu/legal-content/NL/TXT/?uri=CELEX:${identifier}`,
      fetchedAt: new Date().toISOString(),
    };
  }

  normalize(raw: unknown): LegalDocument {
    const data = raw as Record<string, string>;
    return {
      id: data.celex ?? "unknown",
      adapterId: this.id,
      title: data.title ?? "CJEU uitspraak",
      jurisdiction: "EU",
      sourceType: "CJEU_JURISPRUDENTIE",
      authorityLevel: "PRIMAIR_GEZAGHEBBEND",
      identifiers: { celex: data.celex },
      officialUrl: `https://eur-lex.europa.eu/legal-content/NL/TXT/?uri=CELEX:${data.celex}`,
      fetchedAt: new Date().toISOString(),
    };
  }
}

export const curiaAdapter = new CuriaAdapter();
