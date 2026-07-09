import type { SearchEntity, SearchEntityType } from "@/types";
import {
  mockRegions,
  mockOccupations,
  mockSectors,
  mockIndicators,
} from "@/data/mock";

const SYNONYMS: Record<string, { type: SearchEntityType; terms: string[] }> = {
  zorg: { type: "sector", terms: ["zorg", "zorgpersoneel", "verpleegkundige", "verpleger", "gezondheidszorg", "welzijn", "verzorgende"] },
  tech: { type: "sector", terms: ["ict", "technologie", "software", "data", "programmeur"] },
  leiderschap: { type: "leiderschap", terms: ["leiderschap", "leidinggevende", "management", "manager"] },
  inzetbaarheid: { type: "duurzame_inzetbaarheid", terms: ["duurzame inzetbaarheid", "verzuim", "inzetbaarheid", "werkvermogen"] },
  arbeidsmarkt: { type: "arbeidsmarkt", terms: ["arbeidsmarkt", "vacature", "krapte", "tekort", "werkgelegenheid"] },
};

const REGION_ALIASES: Record<string, string> = {
  drenthe: "prov-drenthe",
  "noord-brabant": "prov-brabant",
  brabant: "prov-brabant",
  utrecht: "prov-utrecht",
};

export interface ParsedQuery {
  originalQuery: string;
  entities: SearchEntity[];
  occupationId?: string;
  regionId?: string;
  sectorId?: string;
  indicatorId?: string;
}

function normalize(text: string): string {
  return text.toLowerCase().trim().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function semanticSearch(query: string): ParsedQuery {
  const normalized = normalize(query);
  const entities: SearchEntity[] = [];

  for (const region of mockRegions) {
    const regionNorm = normalize(region.name);
    if (normalized.includes(regionNorm)) {
      entities.push({
        type: region.type === "provincie" ? "provincie" : region.type === "gemeente" ? "gemeente" : "arbeidsmarktregio",
        value: region.name,
        matchedId: region.id,
        confidence: 0.95,
      });
    }
  }

  for (const [alias, id] of Object.entries(REGION_ALIASES)) {
    if (normalized.includes(alias) && !entities.some((e) => e.matchedId === id)) {
      const region = mockRegions.find((r) => r.id === id);
      if (region) {
        entities.push({ type: "provincie", value: region.name, matchedId: id, confidence: 0.9 });
      }
    }
  }

  for (const occupation of mockOccupations) {
    const terms = [occupation.name, ...occupation.synonyms].map(normalize);
    for (const term of terms) {
      if (normalized.includes(term)) {
        entities.push({
          type: "beroep",
          value: occupation.name,
          matchedId: occupation.id,
          confidence: term === normalize(occupation.name) ? 0.98 : 0.85,
        });
        break;
      }
    }
  }

  for (const sector of mockSectors) {
    if (normalized.includes(normalize(sector.name)) || normalized.includes(normalize(sector.id.replace("sec-", "")))) {
      entities.push({ type: "sector", value: sector.name, matchedId: sector.id, confidence: 0.9 });
    }
  }

  for (const [key, config] of Object.entries(SYNONYMS)) {
    for (const term of config.terms) {
      if (normalized.includes(normalize(term))) {
        entities.push({ type: config.type, value: term, confidence: 0.8 });
        if (config.type === "sector" && key === "zorg") {
          const zorgSector = mockSectors.find((s) => s.id === "sec-zorg");
          if (zorgSector && !entities.some((e) => e.matchedId === zorgSector.id)) {
            entities.push({ type: "sector", value: zorgSector.name, matchedId: zorgSector.id, confidence: 0.85 });
          }
        }
        break;
      }
    }
  }

  for (const indicator of mockIndicators) {
    if (normalized.includes(normalize(indicator.name))) {
      entities.push({ type: "arbeidsmarkt", value: indicator.name, matchedId: indicator.id, confidence: 0.75 });
    }
  }

  if (normalized.includes("voorspel") || normalized.includes("prognose") || normalized.includes("ontwikkeling")) {
    entities.push({ type: "arbeidsmarkt", value: "prognose", confidence: 0.7 });
  }

  const occupationId = entities.find((e) => e.type === "beroep")?.matchedId
    ?? (normalized.includes("zorg") ? "occ-verpleegkundige" : undefined);
  const regionId = entities.find((e) => e.type === "provincie" || e.type === "gemeente")?.matchedId
    ?? (normalized.includes("drenthe") ? "prov-drenthe" : undefined);
  const sectorId = entities.find((e) => e.type === "sector")?.matchedId;
  const indicatorId = "ind-werkgelegenheid";

  return {
    originalQuery: query,
    entities: dedupeEntities(entities),
    occupationId,
    regionId,
    sectorId,
    indicatorId,
  };
}

function dedupeEntities(entities: SearchEntity[]): SearchEntity[] {
  const seen = new Set<string>();
  return entities.filter((e) => {
    const key = `${e.type}-${e.matchedId ?? e.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getExampleQueries(): string[] {
  return [
    "Hoe ontwikkelt de arbeidsmarkt voor verpleegkundigen zich?",
    "Welke beroepen krijgen waarschijnlijk tekorten?",
    "Welke sectoren groeien de komende vijf jaar?",
    "Welke regio krijgt de grootste arbeidsmarktkrapte?",
    "Welke beroepen verdwijnen waarschijnlijk?",
    "Voorspel de ontwikkeling van zorgpersoneel in Drenthe.",
    "Wat betekent deze ontwikkeling volgens het TES-model?",
  ];
}
