import type {
  Source,
  Dataset,
  Region,
  Occupation,
  Sector,
  Indicator,
  HistoricalValue,
  ForecastModel,
  TESComponent,
} from "@/types";

export const mockSources: Source[] = [
  {
    id: "src-cbs",
    name: "CBS StatLine",
    owner: "Centraal Bureau voor de Statistiek",
    apiUrl: "https://opendata.cbs.nl/ODataApi/odata/",
    updateFrequency: "kwartaal",
    license: "CC BY 4.0",
    lastSync: "2025-06-15",
    reliability: 0.95,
    tesComponents: ["competentie", "generativiteit"],
    description: "Nationale arbeidsmarkt- en demografische statistieken",
  },
  {
    id: "src-uwv",
    name: "UWV Arbeidsmarktinformatie",
    owner: "Uitvoeringsinstituut Werknemersverzekeringen",
    apiUrl: "https://www.uwv.nl/werkgevers/arbeidsmarktinformatie",
    updateFrequency: "maandelijks",
    license: "CC0 1.0",
    lastSync: "2025-06-01",
    reliability: 0.92,
    tesComponents: ["autonomie", "verbondenheid"],
    description: "Vacatures, werkloosheid en arbeidsmarktkrapte",
  },
  {
    id: "src-scp",
    name: "SCP Arbeidsmarktmonitor",
    owner: "Sociaal en Cultureel Planbureau",
    apiUrl: "https://www.scp.nl/",
    updateFrequency: "jaarlijks",
    license: "CC BY 4.0",
    lastSync: "2025-03-20",
    reliability: 0.88,
    tesComponents: ["verbondenheid", "bereidwilligheid"],
    description: "Arbeidsvoorwaarden, verzuim en duurzame inzetbaarheid",
  },
  {
    id: "src-nea",
    name: "TNO / NEA Arbeidsmarktprognoses",
    owner: "TNO / NEA",
    apiUrl: "https://www.nea.nl/",
    updateFrequency: "jaarlijks",
    license: "Commercieel met open samenvattingen",
    lastSync: "2025-01-10",
    reliability: 0.85,
    tesComponents: ["competentie", "co-creatie"],
    description: "Sectorale arbeidsmarktprognoses Nederland",
  },
];

export const mockSectors: Sector[] = [
  { id: "sec-zorg", name: "Zorg en welzijn", description: "Gezondheidszorg, welzijn en maatschappelijke dienstverlening" },
  { id: "sec-tech", name: "Technologie & ICT", description: "Informatie- en communicatietechnologie" },
  { id: "sec-onderwijs", name: "Onderwijs", description: "Primair, voortgezet en hoger onderwijs" },
  { id: "sec-industrie", name: "Industrie & productie", description: "Maakindustrie en logistiek" },
  { id: "sec-overheid", name: "Overheid & publieke sector", description: "Rijk, provincies, gemeenten en zbo's" },
];

export const mockRegions: Region[] = [
  { id: "prov-drenthe", name: "Drenthe", type: "provincie", provinceCode: "DR" },
  { id: "prov-brabant", name: "Noord-Brabant", type: "provincie", provinceCode: "NB" },
  { id: "prov-utrecht", name: "Utrecht", type: "provincie", provinceCode: "UT" },
  { id: "gem-assen", name: "Assen", type: "gemeente", parentId: "prov-drenthe", provinceCode: "DR" },
  { id: "gem-emmen", name: "Emmen", type: "gemeente", parentId: "prov-drenthe", provinceCode: "DR" },
  { id: "gem-meppel", name: "Meppel", type: "gemeente", parentId: "prov-drenthe", provinceCode: "DR" },
  { id: "gem-hoogeveen", name: "Hoogeveen", type: "gemeente", parentId: "prov-drenthe", provinceCode: "DR" },
  { id: "gem-eindhoven", name: "Eindhoven", type: "gemeente", parentId: "prov-brabant", provinceCode: "NB" },
  { id: "gem-tilburg", name: "Tilburg", type: "gemeente", parentId: "prov-brabant", provinceCode: "NB" },
  { id: "gem-utrecht", name: "Utrecht", type: "gemeente", parentId: "prov-utrecht", provinceCode: "UT" },
  { id: "gem-amersfoort", name: "Amersfoort", type: "gemeente", parentId: "prov-utrecht", provinceCode: "UT" },
  { id: "gem-zeist", name: "Zeist", type: "gemeente", parentId: "prov-utrecht", provinceCode: "UT" },
  { id: "amr-noord", name: "Arbeidsmarktregio Noord-Nederland", type: "arbeidsmarktregio" },
];

export const mockOccupations: Occupation[] = [
  { id: "occ-verpleegkundige", name: "Verpleegkundige", escoCode: "2221.1", sectorId: "sec-zorg", synonyms: ["zorgpersoneel", "verpleger", "verpleegkundige", "nurse"] },
  { id: "occ-verzorgende", name: "Verzorgende IG", escoCode: "5322.1", sectorId: "sec-zorg", synonyms: ["verzorgende", "zorgmedewerker", "helpende"] },
  { id: "occ-arts", name: "Huisarts", escoCode: "2211.1", sectorId: "sec-zorg", synonyms: ["arts", "basisarts"] },
  { id: "occ-software", name: "Softwareontwikkelaar", escoCode: "2512.1", sectorId: "sec-tech", synonyms: ["programmeur", "developer", "ict'er"] },
  { id: "occ-data", name: "Data-analist", escoCode: "2120.1", sectorId: "sec-tech", synonyms: ["data scientist", "analist"] },
  { id: "occ-docent", name: "Docent voortgezet onderwijs", escoCode: "2330.1", sectorId: "sec-onderwijs", synonyms: ["leraar", "docent", "onderwijzer"] },
  { id: "occ-monteur", name: "Technisch monteur", escoCode: "7233.1", sectorId: "sec-industrie", synonyms: ["monteur", "technicus", "mechanic"] },
  { id: "occ-logistiek", name: "Logistiek medewerker", escoCode: "9333.1", sectorId: "sec-industrie", synonyms: ["magazijnmedewerker", "logistiek"] },
  { id: "occ-beleidsmedewerker", name: "Beleidsmedewerker", escoCode: "2422.1", sectorId: "sec-overheid", synonyms: ["beleidsadviseur", "beleidsmedewerker"] },
  { id: "occ-leidinggevende", name: "Leidinggevende zorg", escoCode: "1342.1", sectorId: "sec-zorg", synonyms: ["zorgmanager", "teamleider zorg", "leidinggevende"] },
];

export const mockIndicators: Indicator[] = [
  { id: "ind-werkgelegenheid", name: "Werkgelegenheid (FTE)", unit: "FTE", description: "Aantal fulltime-equivalenten in beroep/sector", tesComponentId: "tes-generativiteit" },
  { id: "ind-vacatures", name: "Openstaande vacatures", unit: "aantal", description: "Geregistreerde vacatures per kwartaal", tesComponentId: "tes-autonomie" },
  { id: "ind-scholing", name: "Scholingsdeelname", unit: "%", description: "Percentage werknemers met formele bijscholing", tesComponentId: "tes-competentie" },
  { id: "ind-verzuim", name: "Verzuimpercentage", unit: "%", description: "Percentage ziekteverzuim", tesComponentId: "tes-verbondenheid" },
  { id: "ind-mobiliteit", name: "Intersectorale mobiliteit", unit: "index", description: "Index van baanwisselingen tussen sectoren", tesComponentId: "tes-bereidwilligheid" },
];

export const mockTESComponents: TESComponent[] = [
  { id: "tes-autonomie", name: "Autonomie", slug: "autonomie", description: "Ruimte voor eigen keuzes, initiatief en zelfsturing in werk" },
  { id: "tes-competentie", name: "Competentie", slug: "competentie", description: "Vaardigheden, kennis en continue ontwikkeling" },
  { id: "tes-verbondenheid", name: "Verbondenheid", slug: "verbondenheid", description: "Sociale verbinding, veiligheid en betekenisvol werk" },
  { id: "tes-co-creatie", name: "Co-creatie", slug: "co-creatie", description: "Samenwerking, participatie en gezamenlijke vormgeving" },
  { id: "tes-generativiteit", name: "Generativiteit", slug: "generativiteit", description: "Bijdrage aan toekomstige generaties en maatschappelijke waarde" },
  { id: "tes-bereidwilligheid", name: "Bereidwilligheid", slug: "bereidwilligheid", description: "Motivatie, flexibiliteit en openheid voor verandering" },
];

export const mockForecastModels: ForecastModel[] = [
  { id: "model-linreg", name: "Lineaire regressie", type: "linear_regression", description: "OLS-trendlijn op historische tijdreeks", enabled: true },
  { id: "model-ma", name: "Voortschrijdend gemiddelde", type: "moving_average", description: "Gewogen moving average extrapolatie", enabled: true },
  { id: "model-cagr", name: "CAGR-extrapolatie", type: "cagr", description: "Compound Annual Growth Rate scenario's", enabled: true },
  { id: "model-arima", name: "ARIMA", type: "arima", description: "Autoregressief geïntegreerd voortschrijdend gemiddelde (gepland)", enabled: false },
  { id: "model-prophet", name: "Prophet", type: "prophet", description: "Facebook Prophet seizoensmodel (gepland)", enabled: false },
];

export const mockDatasets: Dataset[] = [
  {
    id: "ds-cbs-werkgelegenheid",
    sourceId: "src-cbs",
    name: "CBS Werkgelegenheid per provincie en beroep",
    description: "Jaarlijkse FTE-tellingen per provincie en beroepsgroep",
    lastUpdate: "2025-06-15",
    indicatorIds: ["ind-werkgelegenheid"],
    regionIds: ["prov-drenthe", "prov-brabant", "prov-utrecht"],
    occupationIds: ["occ-verpleegkundige", "occ-verzorgende"],
  },
  {
    id: "ds-uwv-vacatures",
    sourceId: "src-uwv",
    name: "UWV Vacaturemonitor Zorg",
    description: "Kwartaalcijfers openstaande vacatures in de zorg",
    lastUpdate: "2025-06-01",
    indicatorIds: ["ind-vacatures"],
    regionIds: ["prov-drenthe"],
    occupationIds: ["occ-verpleegkundige", "occ-verzorgende"],
  },
  {
    id: "ds-scp-verzuim",
    sourceId: "src-scp",
    name: "SCP Verzuim en inzetbaarheid",
    description: "Jaarlijks verzuimpercentage per sector",
    lastUpdate: "2025-03-20",
    indicatorIds: ["ind-verzuim", "ind-scholing"],
    regionIds: ["prov-drenthe", "prov-brabant", "prov-utrecht"],
    occupationIds: [],
  },
  {
    id: "ds-nea-prognose",
    sourceId: "src-nea",
    name: "NEA Sectorprognose Zorg 2025",
    description: "Macro-economische aannames voor zorgarbeidsmarkt",
    lastUpdate: "2025-01-10",
    indicatorIds: ["ind-werkgelegenheid"],
    regionIds: ["prov-drenthe"],
    occupationIds: ["occ-verpleegkundige"],
  },
];

/** Generate historical FTE data for verpleegkundigen in Drenthe (2015-2024) */
function generateDrentheZorgHistory(): HistoricalValue[] {
  const baseValues = [8420, 8580, 8710, 8890, 9050, 9180, 9310, 9480, 9620, 9780];
  return baseValues.map((value, i) => ({
    id: `hv-drenthe-verpleeg-${2015 + i}`,
    indicatorId: "ind-werkgelegenheid",
    regionId: "prov-drenthe",
    occupationId: "occ-verpleegkundige",
    year: 2015 + i,
    value,
    sourceId: "src-cbs",
  }));
}

function generateRegionalComparison(): HistoricalValue[] {
  const drenthe = [8420, 8580, 8710, 8890, 9050, 9180, 9310, 9480, 9620, 9780];
  const brabant = [22400, 22900, 23450, 24000, 24550, 25100, 25650, 26200, 26750, 27300];
  const utrecht = [15600, 15900, 16200, 16550, 16850, 17150, 17450, 17750, 18050, 18350];
  const regions = [
    { id: "prov-drenthe", values: drenthe },
    { id: "prov-brabant", values: brabant },
    { id: "prov-utrecht", values: utrecht },
  ];
  const result: HistoricalValue[] = [];
  for (const region of regions) {
    region.values.forEach((value, i) => {
      result.push({
        id: `hv-${region.id}-verpleeg-${2015 + i}`,
        indicatorId: "ind-werkgelegenheid",
        regionId: region.id,
        occupationId: "occ-verpleegkundige",
        year: 2015 + i,
        value,
        sourceId: "src-cbs",
      });
    });
  }
  return result;
}

function generateIndicatorHistory(): HistoricalValue[] {
  const vacatures = [320, 345, 380, 410, 445, 480, 520, 560, 595, 630];
  const scholing = [42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
  const verzuim = [5.8, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7];
  const mobiliteit = [100, 102, 105, 108, 110, 113, 115, 118, 120, 122];

  const configs = [
    { indicatorId: "ind-vacatures", values: vacatures, sourceId: "src-uwv" },
    { indicatorId: "ind-scholing", values: scholing, sourceId: "src-scp" },
    { indicatorId: "ind-verzuim", values: verzuim, sourceId: "src-scp" },
    { indicatorId: "ind-mobiliteit", values: mobiliteit, sourceId: "src-cbs" },
  ];

  const result: HistoricalValue[] = [];
  for (const cfg of configs) {
    cfg.values.forEach((value, i) => {
      result.push({
        id: `hv-drenthe-${cfg.indicatorId}-${2015 + i}`,
        indicatorId: cfg.indicatorId,
        regionId: "prov-drenthe",
        year: 2015 + i,
        value,
        sourceId: cfg.sourceId,
      });
    });
  }
  return result;
}

export const mockHistoricalValues: HistoricalValue[] = [
  ...generateDrentheZorgHistory(),
  ...generateRegionalComparison(),
  ...generateIndicatorHistory(),
];
