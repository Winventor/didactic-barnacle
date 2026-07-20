import { BaseAdapter, buildOfficialUrl } from "./base-adapter";
import { queryText } from "../utils/query-text";
import type { LegalSearchQuery, LegalSearchResult, LegalDocument } from "../types";

export class CellarAdapter extends BaseAdapter {
  id = "cellar";
  name = "CELLAR (Publications Office)";
  jurisdiction = "EU" as const;
  protected timeoutMs = 20000;

  async search(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    if (query.identifier) {
      try {
        const doc = await this.fetchDocument(query.identifier);
        return [
          {
            id: doc.id,
            adapterId: this.id,
            title: doc.title,
            snippet: doc.title,
            jurisdiction: "EU",
            sourceType: doc.sourceType,
            authorityLevel: "PRIMAIR_BINDEND",
            identifier: query.identifier,
            officialUrl: doc.officialUrl,
          },
        ];
      } catch {
        return [];
      }
    }
    // Delegate to SPARQL via EurLex pattern
    const text = queryText(query);
    const sparqlQuery = `
      PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
      SELECT ?work ?title ?celex WHERE {
        ?work cdm:work_id_celex ?celex .
        ?exp cdm:expression_belongs_to_work ?work .
        ?exp cdm:expression_title ?title .
        FILTER(CONTAINS(LCASE(STR(?title)), LCASE("${text.replace(/"/g, '\\"')}"))
      }
      LIMIT ${query.limit ?? 5}
    `;
    const url = `https://publications.europa.eu/webapi/rdf/sparql?format=json&query=${encodeURIComponent(sparqlQuery)}`;
    try {
      const response = await this.rateLimitedFetch(url);
      if (!response.ok) return [];
      const data = (await response.json()) as {
        results?: { bindings?: Array<Record<string, { value: string }>> };
      };
      return (data.results?.bindings ?? []).map((b, i) => ({
        id: `cellar-${b.celex?.value ?? i}`,
        adapterId: this.id,
        title: b.title?.value ?? "CELLAR document",
        snippet: b.title?.value ?? "",
        jurisdiction: "EU" as const,
        sourceType: "EU_VERORDENING" as const,
        authorityLevel: "PRIMAIR_BINDEND" as const,
        identifier: b.celex?.value,
        officialUrl: b.celex?.value
          ? buildOfficialUrl("eurlex", b.celex.value)
          : "https://publications.europa.eu/",
      }));
    } catch {
      return [];
    }
  }

  async fetchDocument(identifier: string): Promise<LegalDocument> {
    const cellarUrl = `https://publications.europa.eu/resource/cellar/${identifier}`;
    return {
      id: identifier,
      adapterId: this.id,
      title: `CELLAR document ${identifier}`,
      jurisdiction: "EU",
      sourceType: "EU_VERORDENING",
      authorityLevel: "PRIMAIR_BINDEND",
      identifiers: { celex: identifier },
      officialUrl: cellarUrl,
      fetchedAt: new Date().toISOString(),
      metadata: {
        cellarEndpoint: "https://publications.europa.eu/resource/cellar/",
        sparqlEndpoint: "https://publications.europa.eu/webapi/rdf/sparql",
      },
    };
  }

  normalize(raw: unknown): LegalDocument {
    const data = raw as Record<string, string>;
    return {
      id: data.id ?? "unknown",
      adapterId: this.id,
      title: data.title ?? "CELLAR document",
      jurisdiction: "EU",
      sourceType: "EU_VERORDENING",
      authorityLevel: "PRIMAIR_BINDEND",
      identifiers: { celex: data.celex },
      officialUrl: `https://publications.europa.eu/resource/cellar/${data.id}`,
      fetchedAt: new Date().toISOString(),
    };
  }
}

export const cellarAdapter = new CellarAdapter();
