import type {
  EvidenceItem,
  EvidenceLevel,
  Source,
  Dataset,
  ForecastModel,
  ExplainabilityDetail,
} from "@/types";

export interface EvidencePanelData {
  sources: Source[];
  datasets: Dataset[];
  models: ForecastModel[];
  evidenceLevel: EvidenceLevel;
  assumptions: string[];
  limitations: string[];
  openQuestions: string[];
  items: EvidenceItem[];
}

export function buildEvidencePanel(
  queryId: string,
  sources: Source[],
  datasets: Dataset[],
  model: ForecastModel,
  explainability: Partial<ExplainabilityDetail>
): EvidencePanelData {
  const assumptions = explainability.limitations
    ? [
        "Historische trend wordt voortgezet (ceteris paribus)",
        "Geen onvoorziene macro-economische schokken",
        "Datakwaliteit en definities blijven consistent",
        "Scenario-onderscheid gebaseerd op vaste multipliers (±8%)",
      ]
    : [];

  const limitations = [
    "Versie 1 gebruikt mockdata en vereenvoudigde statistische modellen",
    "Geen real-time CBS/UWV API-koppeling actief",
    "Regionale prognoses niet gedifferentieerd naar gemeenteniveau",
    "TES-interpretatie is kwalitatief, niet gevalideerd",
    "Onzekerheidsmarges gebaseerd op residuen, niet op volledige bayesiaanse analyse",
    "Seizoenseffecten en beleidswijzigingen niet expliciet gemodelleerd",
  ];

  const openQuestions = [
    "Hoe beïnvloedt AI-automatisering de zorgarbeidsvraag op middellange termijn?",
    "Wat is het effect van internationalisering op regionale arbeidsmarkten?",
    "Hoe correleren TES-componenten met objectieve uitstroomcijfers?",
    "Welke interventies verlagen vacaturedruk het meest effectief?",
  ];

  const items: EvidenceItem[] = [
    ...sources.map((s) => ({
      id: `ev-src-${s.id}`,
      queryId,
      type: "bron" as const,
      title: s.name,
      content: `${s.owner} — Laatste sync: ${s.lastSync}. Betrouwbaarheid: ${(s.reliability * 100).toFixed(0)}%. Licentie: ${s.license}.`,
      sourceId: s.id,
      evidenceLevel: s.reliability >= 0.9 ? "hoog" as EvidenceLevel : "gemiddeld" as EvidenceLevel,
    })),
    ...datasets.map((d) => ({
      id: `ev-ds-${d.id}`,
      queryId,
      type: "dataset" as const,
      title: d.name,
      content: `${d.description}. Laatste update: ${d.lastUpdate}.`,
      evidenceLevel: "gemiddeld" as EvidenceLevel,
    })),
    {
      id: `ev-model-${model.id}`,
      queryId,
      type: "model",
      title: model.name,
      content: `${model.description}. Type: ${model.type}.`,
      evidenceLevel: "gemiddeld",
    },
    ...assumptions.map((a, i) => ({
      id: `ev-assumption-${i}`,
      queryId,
      type: "aanname" as const,
      title: `Aanname ${i + 1}`,
      content: a,
      evidenceLevel: "voorlopig" as EvidenceLevel,
    })),
    ...limitations.map((l, i) => ({
      id: `ev-limitation-${i}`,
      queryId,
      type: "beperking" as const,
      title: `Beperking ${i + 1}`,
      content: l,
      evidenceLevel: "hoog" as EvidenceLevel,
    })),
    ...openQuestions.map((q, i) => ({
      id: `ev-question-${i}`,
      queryId,
      type: "onderzoeksvraag" as const,
      title: `Open vraag ${i + 1}`,
      content: q,
      evidenceLevel: "voorlopig" as EvidenceLevel,
    })),
  ];

  return {
    sources,
    datasets,
    models: [model],
    evidenceLevel: "gemiddeld",
    assumptions,
    limitations,
    openQuestions,
    items,
  };
}

export function buildExplainability(
  datasets: Dataset[],
  indicators: { id: string; name: string }[],
  model: ForecastModel,
  historicalPeriod: { start: number; end: number },
  uncertaintyMargin: number,
  rSquared?: number,
  cagr?: number
): ExplainabilityDetail {
  const variableInfluence = [
    { variable: "Tijd (jaar)", influence: rSquared ?? 0.85, description: "Primaire voorspeller in trendmodel" },
    { variable: "Historische groei", influence: cagr ? Math.min(Math.abs(cagr) * 10, 1) : 0.6, description: "CAGR over historische periode" },
    { variable: "Regionale factor", influence: 0.3, description: "Provinciaal basiseffect (mock)" },
    { variable: "Sectorale vraag", influence: 0.45, description: "Zorgvraag door vergrijzing" },
  ];

  return {
    datasets,
    indicators: indicators as ExplainabilityDetail["indicators"],
    model,
    historicalPeriod,
    variableInfluence,
    uncertaintyMargin,
    limitations: [
      "Model verklaart niet alle variantie — externe factoren (beleid, technologie) ontbreken",
      "Scenario's zijn illustratief, niet probabilistisch gekalibreerd",
    ],
  };
}
