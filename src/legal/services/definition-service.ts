import { bwbSruAdapter } from "../adapters/bwb-sru";
import { rechtspraakAdapter } from "../adapters/rechtspraak";
import {
  extractFragmentsFromBwbXml,
  extractPassages,
  extractStatutoryDefinition,
  inferLegalAreaFromText,
  normalizeSearchTerm,
  termMatches,
} from "../utils/definition-extractor";
import type { DefinitionResult, LegalDocument, LegalSearchQuery } from "../types";

const ENRICHMENT: Record<
  string,
  Partial<
    Pick<
      DefinitionResult,
      | "status"
      | "legalMeaning"
      | "legalArea"
      | "elements"
      | "mainRule"
      | "exceptions"
      | "relatedTerms"
      | "examples"
      | "counterExamples"
      | "evidencePoints"
    >
  >
> = {
  intimidatie: {
    status: {
      inStatute: false,
      developedInCaseLaw: true,
      colloquialTerm: true,
      variesByArea: true,
      description:
        "Geen algemeen zelfstandig strafbaar feit onder exact deze benaming; kan onder andere bedreiging, dwang of belaging vallen.",
    },
    relatedTerms: [
      { term: "bedreiging", difference: "Vereist dreiging met bepaald misdrijf (Sr art. 285)" },
      { term: "belaging", difference: "Vereist wederrechtelijke stelselmatigheid (Sr art. 285b)" },
    ],
  },
};

export class DefinitionService {
  async search(term: string, options?: Partial<LegalSearchQuery>): Promise<DefinitionResult> {
    const normalized = normalizeSearchTerm(term);
    const limit = options?.limit ?? 12;

    const [wetResults, caseResults] = await Promise.all([
      bwbSruAdapter.search({ text: term, limit, ...options }),
      rechtspraakAdapter.search({ text: term, limit: 8, ...options }),
    ]);

    const statutorySources = await this.buildStatutorySources(wetResults, term);
    const jurisprudence = await this.buildJurisprudence(caseResults, term);

    const statutoryDefinition = this.pickStatutoryDefinition(statutorySources, wetResults, term);
    const inStatute = statutorySources.some(
      (s) => s.metadata?.searchScope === "fullText" || Boolean(statutoryDefinition)
    );
    const inCaseLaw = jurisprudence.length > 0;

    const enrichment = ENRICHMENT[normalized];
    const primarySnippet = statutoryDefinition ?? wetResults[0]?.snippet ?? caseResults[0]?.snippet;
    const legalArea =
      enrichment?.legalArea ??
      inferLegalAreaFromText(
        [primarySnippet, ...statutorySources.map((s) => s.title)].filter(Boolean).join(" ")
      );

    const hasFullTextHits =
      wetResults.some((r) => r.metadata?.searchScope === "fullText") || inCaseLaw;

    return {
      term,
      status: enrichment?.status ?? {
        inStatute,
        developedInCaseLaw: inCaseLaw,
        colloquialTerm: !inStatute && !inCaseLaw,
        variesByArea: !inStatute,
        description: inStatute
          ? "Het begrip komt voor in de volledige tekst van wet- of regelgeving."
          : inCaseLaw
            ? "Het begrip komt voor in jurisprudentie; geen directe wettelijke definitie gevonden in doorzochte regelingen."
            : "Geen treffer in doorzochte kernwetten; raadpleeg de officiële zoeklinks voor het volledige corpus.",
      },
      statutoryDefinition,
      legalMeaning:
        enrichment?.legalMeaning ??
        statutoryDefinition ??
        primarySnippet ??
        `Geen definitie gevonden voor "${term}".`,
      legalArea,
      elements: enrichment?.elements ?? [],
      mainRule: enrichment?.mainRule ?? statutorySources[0]?.fragments?.[0]?.articleNumber,
      exceptions: enrichment?.exceptions ?? [],
      relatedTerms: enrichment?.relatedTerms ?? [],
      examples: enrichment?.examples ?? [],
      counterExamples: enrichment?.counterExamples ?? [],
      evidencePoints: enrichment?.evidencePoints ?? [],
      sources: statutorySources,
      jurisprudence,
      searchScope: hasFullTextHits
        ? "Metadata én volledige tekst van wetgeving (BWB repository) en jurisprudentie (Rechtspraak Open Data)"
        : "Metadata wetgeving; volledige tekst beperkt door netwerk/CORS op static hosting",
    };
  }

  private async buildStatutorySources(
    wetResults: Awaited<ReturnType<typeof bwbSruAdapter.search>>,
    term: string
  ): Promise<LegalDocument[]> {
    const docs: LegalDocument[] = [];
    const seen = new Set<string>();

    for (const result of wetResults) {
      if (!result.identifier || seen.has(result.identifier)) continue;
      if (result.metadata?.searchScope === "fallback") continue;
      seen.add(result.identifier);

      try {
        const doc = await bwbSruAdapter.fetchDocument(result.identifier);
        const repositoryUrl = result.metadata?.repositoryUrl as string | undefined;
        let fragments = doc.fragments;

        if (repositoryUrl) {
          const xml = await this.fetchXmlCached(repositoryUrl);
          if (xml) {
            fragments = extractFragmentsFromBwbXml(xml, term);
          }
        } else if (doc.fullText && termMatches(doc.fullText, term)) {
          const passages = extractPassages(doc.fullText, term, { maxPassages: 5 });
          fragments = passages.map((text, i) => ({ id: `frag-${i}`, text }));
        }

        const statutoryFromMeta = result.metadata?.statutoryDefinition as string | undefined;
        docs.push({
          ...doc,
          title: result.title || doc.title,
          fragments: fragments?.length ? fragments : undefined,
          fullText: statutoryFromMeta ?? fragments?.[0]?.text ?? doc.fullText?.slice(0, 800),
          metadata: {
            ...doc.metadata,
            searchScope: result.metadata?.searchScope ?? "fullText",
            statutoryDefinition: statutoryFromMeta,
          },
        });
      } catch {
        docs.push({
          id: result.identifier,
          adapterId: "bwb-sru",
          title: result.title,
          fullText: result.snippet,
          jurisdiction: "NL_NATIONAAL",
          sourceType: "WET_IN_FORMELE_ZIN",
          authorityLevel: "PRIMAIR_BINDEND",
          identifiers: { bwbId: result.identifier },
          officialUrl: result.officialUrl,
          fetchedAt: new Date().toISOString(),
          metadata: result.metadata,
        });
      }

      if (docs.length >= 8) break;
    }

    return docs;
  }

  private async buildJurisprudence(
    caseResults: Awaited<ReturnType<typeof rechtspraakAdapter.search>>,
    term: string
  ) {
    const decisions = [];

    for (const result of caseResults) {
      if (!result.identifier || result.metadata?.searchScope === "fallback") continue;

      let snippet = result.snippet;
      let considerations: string[] = [];

      try {
        const doc = await rechtspraakAdapter.fetchDocument(result.identifier);
        const enriched = await rechtspraakAdapter.enrichWithPassages(doc, term);
        if (enriched.fragments?.length) {
          snippet = enriched.fragments[0].text;
          considerations = enriched.fragments.slice(1, 4).map((f) => f.text);
        } else if (doc.fullText && termMatches(doc.fullText, term)) {
          snippet = doc.fullText.slice(0, 400);
        }
      } catch {
        // gebruik metadata-snippet
      }

      decisions.push({
        ecli: result.identifier,
        institution: this.institutionFromEcli(result.identifier),
        date: result.date ?? "",
        coreRule: snippet,
        similarities: [],
        differences: [],
        outcome: "Zie volledige uitspraak",
        relevantConsiderations: considerations,
        url: result.officialUrl,
        isLeadingCase: result.identifier.includes(":HR:"),
      });

      if (decisions.length >= 6) break;
    }

    return decisions;
  }

  private pickStatutoryDefinition(
    sources: LegalDocument[],
    wetResults: Awaited<ReturnType<typeof bwbSruAdapter.search>>,
    term: string
  ): string | undefined {
    for (const result of wetResults) {
      const fromMeta = result.metadata?.statutoryDefinition as string | undefined;
      if (fromMeta) return fromMeta;
    }

    for (const source of sources) {
      const fromMeta = source.metadata?.statutoryDefinition as string | undefined;
      if (fromMeta) return fromMeta;
      if (source.fullText) {
        const def = extractStatutoryDefinition(source.fullText, term);
        if (def) return def;
      }
      if (source.fragments?.[0]?.text) return source.fragments[0].text;
    }

    return undefined;
  }

  private institutionFromEcli(ecli: string): string {
    if (ecli.includes(":HR:")) return "Hoge Raad";
    if (ecli.includes(":RVS:")) return "Raad van State";
    if (ecli.includes(":CRVB:")) return "Centrale Raad van Beroep";
    if (ecli.includes(":RB")) return "Rechtbank";
    if (ecli.includes(":GH")) return "Gerechtshof";
    return "Nederlandse rechter";
  }

  private xmlCache = new Map<string, string>();

  private async fetchXmlCached(url: string): Promise<string | undefined> {
    if (this.xmlCache.has(url)) return this.xmlCache.get(url);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) return undefined;
      const xml = await response.text();
      this.xmlCache.set(url, xml);
      return xml;
    } catch {
      return undefined;
    }
  }
}

export const definitionService = new DefinitionService();
