import type { SearchEntity, SearchEntityType } from "@/types";
import {
  mockRegions,
  mockOccupations,
  mockSectors,
  mockIndicators,
} from "@/data/mock";

const SYNONYMS: Record<string, { type: SearchEntityType; terms: string[]; sectorId?: string; occupationId?: string }> = {
  zorg: {
    type: "sector",
    terms: ["zorg", "zorgpersoneel", "verpleegkundige", "verpleger", "gezondheidszorg", "welzijn", "verzorgende", "nurse"],
    sectorId: "sec-zorg",
    occupationId: "occ-verpleegkundige",
  },
  tech: {
    type: "sector",
    terms: ["ict", "technologie", "software", "data", "programmeur", "developer", "data scientist"],
    sectorId: "sec-tech",
    occupationId: "occ-software",
  },
  onderwijs: {
    type: "sector",
    terms: ["onderwijs", "leraar", "docent", "school"],
    sectorId: "sec-onderwijs",
    occupationId: "occ-docent",
  },
  industrie: {
    type: "sector",
    terms: ["industrie", "productie", "monteur", "logistiek", "magazijn"],
    sectorId: "sec-industrie",
    occupationId: "occ-monteur",
  },
  leiderschap: { type: "leiderschap", terms: ["leiderschap", "leidinggevende", "management", "manager", "zorgmanager"] },
  inzetbaarheid: { type: "duurzame_inzetbaarheid", terms: ["duurzame inzetbaarheid", "verzuim", "inzetbaarheid", "werkvermogen"] },
  arbeidsmarkt: { type: "arbeidsmarkt", terms: ["arbeidsmarkt", "vacature", "krapte", "tekort", "werkgelegenheid"] },
};

const REGION_ALIASES: Record<string, string> = {
  drenthe: "prov-drenthe",
  "noord-brabant": "prov-brabant",
  brabant: "prov-brabant",
  utrecht: "prov-utrecht",
  eindhoven: "gem-eindhoven",
  assen: "gem-assen",
  emmen: "gem-emmen",
  tilburg: "gem-tilburg",
};

export type QueryResultMode = "forecast" | "shortage_ranking" | "sector_growth";

export interface ResolvedQuery {
  originalQuery: string;
  entities: SearchEntity[];
  resultMode: QueryResultMode;
  occupationId?: string;
  regionId: string;
  provinceId: string;
  sectorId?: string;
  indicatorId: string;
}

function normalize(text: string): string {
  return text.toLowerCase().trim().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function resolveProvinceId(regionId: string): string {
  const region = mockRegions.find((r) => r.id === regionId);
  if (!region) return "prov-utrecht";
  if (region.type === "provincie") return region.id;
  if (region.parentId) return region.parentId;
  return "prov-utrecht";
}

function detectResultMode(normalized: string): QueryResultMode {
  if (
    normalized.includes("tekort") ||
    normalized.includes("krapte") ||
    normalized.includes("welke beroepen") ||
    normalized.includes("verdwijnen")
  ) {
    return "shortage_ranking";
  }
  if (
    normalized.includes("welke sectoren") ||
    normalized.includes("sector") && normalized.includes("groeien")
  ) {
    return "sector_growth";
  }
  return "forecast";
}

function detectIndicator(normalized: string, entities: SearchEntity[]): string {
  const matched = entities.find((e) => e.matchedId?.startsWith("ind-"));
  if (matched?.matchedId) return matched.matchedId;

  if (normalized.includes("vacature") || normalized.includes("tekort") || normalized.includes("krapte")) {
    return "ind-vacatures";
  }
  if (normalized.includes("verzuim") || normalized.includes("inzetbaarheid")) {
    return "ind-verzuim";
  }
  if (normalized.includes("scholing") || normalized.includes("competentie") || normalized.includes("opleiding")) {
    return "ind-scholing";
  }
  if (normalized.includes("mobiliteit") || normalized.includes("wissel")) {
    return "ind-mobiliteit";
  }
  return "ind-werkgelegenheid";
}

export function resolveQuery(query: string): ResolvedQuery {
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
        entities.push({
          type: region.type === "gemeente" ? "gemeente" : "provincie",
          value: region.name,
          matchedId: id,
          confidence: 0.9,
        });
      }
    }
  }

  for (const occupation of mockOccupations) {
    const terms = [occupation.name, ...occupation.synonyms].map(normalize);
    for (const term of terms) {
      if (term.length >= 4 && normalized.includes(term)) {
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
    const sectorKey = normalize(sector.id.replace("sec-", ""));
    if (normalized.includes(normalize(sector.name)) || normalized.includes(sectorKey)) {
      entities.push({ type: "sector", value: sector.name, matchedId: sector.id, confidence: 0.9 });
    }
  }

  for (const config of Object.values(SYNONYMS)) {
    for (const term of config.terms) {
      if (normalize(term).length >= 4 && normalized.includes(normalize(term))) {
        entities.push({ type: config.type, value: term, confidence: 0.8 });
        if (config.sectorId && !entities.some((e) => e.matchedId === config.sectorId)) {
          const sector = mockSectors.find((s) => s.id === config.sectorId);
          if (sector) {
            entities.push({ type: "sector", value: sector.name, matchedId: sector.id, confidence: 0.85 });
          }
        }
        if (config.occupationId && !entities.some((e) => e.matchedId === config.occupationId)) {
          const occ = mockOccupations.find((o) => o.id === config.occupationId);
          if (occ) {
            entities.push({ type: "beroep", value: occ.name, matchedId: occ.id, confidence: 0.82 });
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

  const deduped = dedupeEntities(entities);
  const resultMode = detectResultMode(normalized);

  let occupationId = deduped.find((e) => e.type === "beroep")?.matchedId;
  const sectorId = deduped.find((e) => e.type === "sector")?.matchedId;

  if (!occupationId && sectorId) {
    occupationId = mockOccupations.find((o) => o.sectorId === sectorId)?.id;
  }

  let regionId =
    deduped.find((e) => e.type === "gemeente")?.matchedId ??
    deduped.find((e) => e.type === "provincie")?.matchedId ??
    deduped.find((e) => e.type === "arbeidsmarktregio")?.matchedId;

  if (!regionId) {
    const queryHash = hashSeed(query);
    const provinces = ["prov-drenthe", "prov-brabant", "prov-utrecht"];
    regionId = provinces[queryHash % provinces.length];
  }

  const provinceId = resolveProvinceId(regionId);
  const indicatorId = detectIndicator(normalized, deduped);

  return {
    originalQuery: query,
    entities: deduped,
    resultMode,
    occupationId,
    regionId,
    provinceId,
    sectorId,
    indicatorId,
  };
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
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
    "Voorspel softwareontwikkelaars in Noord-Brabant",
    "Vacaturedruk voor docenten in Utrecht",
    "Voorspel de ontwikkeling van zorgpersoneel in Drenthe.",
    "Wat betekent verzuim in Emmen volgens het TES-model?",
  ];
}

/** @deprecated Use resolveQuery */
export function semanticSearch(query: string) {
  const resolved = resolveQuery(query);
  return {
    originalQuery: resolved.originalQuery,
    entities: resolved.entities,
    occupationId: resolved.occupationId,
    regionId: resolved.regionId,
    sectorId: resolved.sectorId,
    indicatorId: resolved.indicatorId,
  };
}
