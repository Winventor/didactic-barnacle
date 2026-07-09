import type {
  TESInterpretation,
  EvidenceLevel,
  HistoricalValue,
  Indicator,
} from "@/types";
import { mockTESComponents, mockIndicators } from "@/data/mock";

export interface TESAnalysisInput {
  queryId: string;
  historicalData: HistoricalValue[];
  allIndicators: HistoricalValue[];
  regionName: string;
}

const INDICATOR_TES_MAP: Record<string, { componentId: string; signalRule: (trend: number) => "positief" | "negatief" | "neutraal"; narrative: (trend: number, region: string) => string }> = {
  "ind-scholing": {
    componentId: "tes-competentie",
    signalRule: (t) => (t > 0 ? "positief" : t < 0 ? "negatief" : "neutraal"),
    narrative: (t, region) =>
      t >= 0
        ? `Stabiele tot licht stijgende scholingsdeelname in ${region} wijst op groeiende investering in competenties.`
        : `Dalende scholingsdeelname in ${region} kan de ontwikkeling van competenties beperken.`,
  },
  "ind-verzuim": {
    componentId: "tes-verbondenheid",
    signalRule: (t) => (t > 0 ? "negatief" : t < 0 ? "positief" : "neutraal"),
    narrative: (t, region) =>
      t > 0
        ? `Stijgend verzuim in ${region} kan duiden op verminderde verbondenheid en werkdruk.`
        : `Stabiel of dalend verzuim in ${region} suggereert relatief gezonde werkomstandigheden.`,
  },
  "ind-vacatures": {
    componentId: "tes-autonomie",
    signalRule: (t) => (t > 0 ? "negatief" : "neutraal"),
    narrative: (t, region) =>
      t > 0
        ? `Hoge en stijgende vacaturedruk in ${region} beperkt de autonomie van werknemers door werkdruk en onderbezetting.`
        : `Beperkte vacaturedruk in ${region} biedt meer ruimte voor autonome werkinvulling.`,
  },
  "ind-werkgelegenheid": {
    componentId: "tes-generativiteit",
    signalRule: (t) => (t > 0 ? "positief" : "negatief"),
    narrative: (t, region) =>
      t > 0
        ? `Groei van werkgelegenheid in de zorgsector in ${region} draagt bij aan maatschappelijke zorgcontinuïteit (generativiteit).`
        : `Krimp in werkgelegenheid in ${region} kan de maatschappelijke bijdrage onder druk zetten.`,
  },
  "ind-mobiliteit": {
    componentId: "tes-bereidwilligheid",
    signalRule: (t) => (t > 0 ? "positief" : "neutraal"),
    narrative: (t, region) =>
      t > 0
        ? `Toenemende intersectorale mobiliteit in ${region} wijst op bereidwilligheid tot verandering.`
        : `Beperkte mobiliteit in ${region} kan wijzen op voorkeur voor stabiliteit.`,
  },
};

function computeTrend(data: HistoricalValue[]): number {
  if (data.length < 2) return 0;
  const sorted = [...data].sort((a, b) => a.year - b.year);
  return sorted[sorted.length - 1].value - sorted[0].value;
}

export function generateTESInterpretations(input: TESAnalysisInput): TESInterpretation[] {
  const interpretations: TESInterpretation[] = [];
  const indicatorData = input.allIndicators.length > 0 ? input.allIndicators : input.historicalData;

  const indicatorIds = [...new Set(indicatorData.map((d) => d.indicatorId))];

  for (const indicatorId of indicatorIds) {
    const config = INDICATOR_TES_MAP[indicatorId];
    if (!config) continue;

    const data = indicatorData.filter((d) => d.indicatorId === indicatorId);
    const trend = computeTrend(data);
    const indicator = mockIndicators.find((i) => i.id === indicatorId);

    interpretations.push({
      id: `tes-${input.queryId}-${config.componentId}`,
      queryId: input.queryId,
      componentId: config.componentId,
      indicatorId,
      signal: config.signalRule(trend),
      narrative: config.narrative(trend, input.regionName),
      evidenceLevel: "voorlopig" as EvidenceLevel,
    });
  }

  if (!interpretations.some((i) => i.componentId === "tes-co-creatie")) {
    interpretations.push({
      id: `tes-${input.queryId}-co-creatie`,
      queryId: input.queryId,
      componentId: "tes-co-creatie",
      signal: "neutraal",
      narrative: `Onvoldoende directe indicatoren voor co-creatie in ${input.regionName}. Aanbevolen: aanvullend onderzoek naar participatie in roostervorming en multidisciplinaire samenwerking.`,
      evidenceLevel: "beperkt",
    });
  }

  return interpretations;
}

export function getTESComponents() {
  return mockTESComponents;
}

export function getTESRadarData(interpretations: TESInterpretation[]): { component: string; score: number }[] {
  const signalScore = { positief: 80, neutraal: 50, negatief: 25 };
  return mockTESComponents.map((comp) => {
    const interp = interpretations.find((i) => i.componentId === comp.id);
    return {
      component: comp.name,
      score: interp ? signalScore[interp.signal] : 50,
    };
  });
}

export function getIndicatorById(id: string): Indicator | undefined {
  return mockIndicators.find((i) => i.id === id);
}
