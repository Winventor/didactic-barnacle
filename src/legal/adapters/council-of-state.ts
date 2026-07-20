import { rechtspraakAdapter } from "./rechtspraak";
import { queryText } from "../utils/query-text";
import type { LegalSearchQuery, LegalSearchResult, LegalDocument, SourceHealth } from "../types";

/** Raad van State uitspraken via Rechtspraak.nl met ECLI:NL:RVS filter */
export class CouncilOfStateAdapter {
  id = "council-of-state";
  name = "Raad van State";
  jurisdiction = "NL_NATIONAAL" as const;

  async search(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    const results = await rechtspraakAdapter.search({
      ...query,
      text: `${queryText(query)} ECLI:NL:RVS`,
    });
    return results
      .filter((r) => r.identifier?.includes(":RVS:") || r.title.toLowerCase().includes("raad van state"))
      .map((r) => ({ ...r, adapterId: this.id }));
  }

  async fetchDocument(identifier: string): Promise<LegalDocument> {
    const doc = await rechtspraakAdapter.fetchDocument(identifier);
    return { ...doc, adapterId: this.id, institution: "Raad van State" };
  }

  normalize(raw: unknown): LegalDocument {
    return rechtspraakAdapter.normalize(raw);
  }

  async healthCheck(): Promise<SourceHealth> {
    return rechtspraakAdapter.healthCheck();
  }
}

export const councilOfStateAdapter = new CouncilOfStateAdapter();
