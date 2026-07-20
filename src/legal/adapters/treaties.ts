import { BaseAdapter } from "./base-adapter";
import { queryText } from "../utils/query-text";
import type { LegalSearchQuery, LegalSearchResult, LegalDocument } from "../types";

export class TreatiesDatabaseAdapter extends BaseAdapter {
  id = "treaties";
  name = "Verdragenbank";
  jurisdiction = "INTERNATIONAAL_VOOR_NEDERLAND" as const;

  async search(query: LegalSearchQuery): Promise<LegalSearchResult[]> {
    const text = queryText(query);
    // Verdragenbank has no public REST API; provide verified links
    const knownTreaties: Record<string, { title: string; url: string; inForce: boolean }> = {
      evrm: {
        title: "Europees Verdrag tot bescherming van de rechten van de mens (EVRM)",
        url: "https://verdragenbank.overheid.nl/Verdrag/Details/003566",
        inForce: true,
      },
      "europees verdrag": {
        title: "Europees Verdrag tot bescherming van de rechten van de mens",
        url: "https://verdragenbank.overheid.nl/Verdrag/Details/003566",
        inForce: true,
      },
    };

    const lower = text.toLowerCase();
    const results: LegalSearchResult[] = [];

    for (const [key, treaty] of Object.entries(knownTreaties)) {
      if (lower.includes(key)) {
        results.push({
          id: `treaty-${key}`,
          adapterId: this.id,
          title: treaty.title,
          snippet: treaty.inForce
            ? "Voor Nederland in werking – verifieer via Verdragenbank"
            : "Status onbekend – verifieer via Verdragenbank",
          jurisdiction: "INTERNATIONAAL_VOOR_NEDERLAND",
          sourceType: "VERDRAG",
          authorityLevel: "PRIMAIR_BINDEND",
          officialUrl: treaty.url,
        });
      }
    }

    if (results.length === 0) {
      results.push({
        id: `treaty-search-${Date.now()}`,
        adapterId: this.id,
        title: `Verdrag: ${text}`,
        snippet:
          "Internationaal verdrag alleen tonen wanneer toepasselijkheid op Nederland is geverifieerd via Verdragenbank.",
        jurisdiction: "INTERNATIONAAL_VOOR_NEDERLAND",
        sourceType: "VERDRAG",
        authorityLevel: "PRIMAIR_BINDEND",
        officialUrl: `https://verdragenbank.overheid.nl/Verdrag/Index?Zoekterm=${encodeURIComponent(text)}`,
      });
    }

    return results.slice(0, query.limit ?? 10);
  }

  async fetchDocument(identifier: string): Promise<LegalDocument> {
    return {
      id: identifier,
      adapterId: this.id,
      title: `Verdrag ${identifier}`,
      jurisdiction: "INTERNATIONAAL_VOOR_NEDERLAND",
      sourceType: "VERDRAG",
      authorityLevel: "PRIMAIR_BINDEND",
      identifiers: { treatyNumber: identifier },
      officialUrl: `https://verdragenbank.overheid.nl/Verdrag/Details/${identifier}`,
      fetchedAt: new Date().toISOString(),
      metadata: {
        verificationRequired: true,
        note: "Controleer datum inwerkingtreding, voorbehouden en Koninkrijksdeel via Verdragenbank",
      },
    };
  }

  normalize(raw: unknown): LegalDocument {
    const data = raw as Record<string, string>;
    return {
      id: data.id ?? "unknown",
      adapterId: this.id,
      title: data.title ?? "Verdrag",
      jurisdiction: "INTERNATIONAAL_VOOR_NEDERLAND",
      sourceType: "VERDRAG",
      authorityLevel: "PRIMAIR_BINDEND",
      identifiers: { treatyNumber: data.id },
      officialUrl: `https://verdragenbank.overheid.nl/Verdrag/Details/${data.id}`,
      fetchedAt: new Date().toISOString(),
    };
  }
}

export const treatiesAdapter = new TreatiesDatabaseAdapter();
