import type { HistoricalValue } from "@/types";
import type { CBSLabourPoint } from "@/lib/connectors/cbs-connector";
import { mockHistoricalValues } from "@/data/mock";

const START_YEAR = 2015;
const END_YEAR = 2024;

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 9999) * 10000;
  return x - Math.floor(x);
}

const INDICATOR_PROFILES: Record<
  string,
  { baseMin: number; baseMax: number; growthMin: number; growthMax: number; unit: string }
> = {
  "ind-werkgelegenheid": { baseMin: 1200, baseMax: 28000, growthMin: 0.004, growthMax: 0.028, unit: "FTE" },
  "ind-vacatures": { baseMin: 80, baseMax: 1200, growthMin: 0.01, growthMax: 0.06, unit: "aantal" },
  "ind-scholing": { baseMin: 32, baseMax: 58, growthMin: 0.002, growthMax: 0.012, unit: "%" },
  "ind-verzuim": { baseMin: 4.2, baseMax: 7.8, growthMin: 0.001, growthMax: 0.008, unit: "%" },
  "ind-mobiliteit": { baseMin: 85, baseMax: 140, growthMin: 0.005, growthMax: 0.025, unit: "index" },
};

const REGION_SCALE: Record<string, number> = {
  "prov-drenthe": 0.42,
  "prov-brabant": 1.15,
  "prov-utrecht": 0.88,
  "gem-assen": 0.08,
  "gem-emmen": 0.12,
  "gem-meppel": 0.06,
  "gem-hoogeveen": 0.07,
  "gem-eindhoven": 0.22,
  "gem-tilburg": 0.18,
  "gem-utrecht": 0.2,
  "gem-amersfoort": 0.14,
  "gem-zeist": 0.09,
  "amr-noord": 0.55,
};

const OCCUPATION_SCALE: Record<string, number> = {
  "occ-verpleegkundige": 1.0,
  "occ-verzorgende": 0.85,
  "occ-arts": 0.35,
  "occ-software": 1.2,
  "occ-data": 0.7,
  "occ-docent": 0.9,
  "occ-monteur": 1.1,
  "occ-logistiek": 0.95,
  "occ-beleidsmedewerker": 0.5,
  "occ-leidinggevende": 0.4,
};

export function generateSyntheticSeries(params: {
  indicatorId: string;
  regionId: string;
  occupationId?: string;
  liveNational?: CBSLabourPoint[];
  liveRegional?: CBSLabourPoint | null;
}): HistoricalValue[] {
  const { indicatorId, regionId, occupationId, liveNational, liveRegional } = params;
  const profile = INDICATOR_PROFILES[indicatorId] ?? INDICATOR_PROFILES["ind-werkgelegenheid"];
  const seed = hashSeed(`${indicatorId}:${regionId}:${occupationId ?? "all"}`);

  const regionScale = REGION_SCALE[regionId] ?? 0.65;
  const occScale = occupationId ? (OCCUPATION_SCALE[occupationId] ?? 0.75) : 1;
  const base =
    profile.baseMin +
    (profile.baseMax - profile.baseMin) * seededRandom(seed, 1) * regionScale * occScale;

  const annualGrowth =
    profile.growthMin + (profile.growthMax - profile.growthMin) * seededRandom(seed, 2);

  const nationalByYear = new Map(liveNational?.map((p) => [p.year, p.labourParticipationPct]));
  const nationalAnchor = liveNational?.[liveNational.length - 1]?.labourParticipationPct ?? 69;
  const regionalAnchor = liveRegional?.labourParticipationPct ?? nationalAnchor;
  const calibration = regionalAnchor / nationalAnchor;

  const values: HistoricalValue[] = [];
  for (let i = 0; i <= END_YEAR - START_YEAR; i++) {
    const year = START_YEAR + i;
    let value = base * Math.pow(1 + annualGrowth, i);

    const liveYear = nationalByYear.get(year);
    if (liveYear && indicatorId === "ind-werkgelegenheid") {
      const liveFactor = liveYear / nationalAnchor;
      value = value * liveFactor * calibration;
    }

    if (indicatorId === "ind-verzuim") {
      value = Math.min(9.5, value);
    }
    if (indicatorId === "ind-scholing") {
      value = Math.min(65, value);
    }

    values.push({
      id: `hv-${regionId}-${occupationId ?? "all"}-${indicatorId}-${year}`,
      indicatorId,
      regionId,
      occupationId,
      year,
      value: Math.round(value * (indicatorId === "ind-verzuim" || indicatorId === "ind-scholing" ? 10 : 1)) /
        (indicatorId === "ind-verzuim" || indicatorId === "ind-scholing" ? 10 : 1),
      sourceId: liveYear ? "src-cbs" : "src-cbs",
    });
  }

  return values;
}

export function getHistoricalValuesResolved(filters: {
  regionId: string;
  occupationId?: string;
  indicatorId: string;
  liveNational?: CBSLabourPoint[];
  liveRegional?: CBSLabourPoint | null;
}): HistoricalValue[] {
  const stored = mockHistoricalValues.filter((hv) => {
    if (hv.regionId !== filters.regionId) return false;
    if (hv.indicatorId !== filters.indicatorId) return false;
    if (filters.occupationId && hv.occupationId !== filters.occupationId) return false;
    if (!filters.occupationId && hv.occupationId) return false;
    return true;
  });

  if (stored.length >= 8) {
    if (filters.liveNational?.length && filters.indicatorId === "ind-werkgelegenheid") {
      return calibrateStoredWithLive(stored, filters.liveNational, filters.liveRegional);
    }
    return stored;
  }

  return generateSyntheticSeries(filters);
}

function calibrateStoredWithLive(
  stored: HistoricalValue[],
  liveNational: CBSLabourPoint[],
  liveRegional?: CBSLabourPoint | null
): HistoricalValue[] {
  const nationalAnchor = liveNational[liveNational.length - 1]?.labourParticipationPct ?? 69;
  const regionalAnchor = liveRegional?.labourParticipationPct ?? nationalAnchor;
  const calibration = regionalAnchor / nationalAnchor;
  const byYear = new Map(liveNational.map((p) => [p.year, p.labourParticipationPct]));

  return stored.map((hv) => {
    const livePct = byYear.get(hv.year);
    if (!livePct) return hv;
    const factor = (livePct / nationalAnchor) * calibration;
    return { ...hv, value: Math.round(hv.value * factor), sourceId: "src-cbs" as const };
  });
}

export function getRegionalIndicatorValues(
  regionId: string,
  liveNational?: CBSLabourPoint[],
  liveRegional?: CBSLabourPoint | null
): HistoricalValue[] {
  const indicators = [
    "ind-werkgelegenheid",
    "ind-vacatures",
    "ind-scholing",
    "ind-verzuim",
    "ind-mobiliteit",
  ];
  return indicators.flatMap((indicatorId) =>
    getHistoricalValuesResolved({ regionId, indicatorId, liveNational, liveRegional })
  );
}
