/** CBS gemeentecodes voor live data (StatLine 84799NED) */
export const CBS_GEMEENTE_CODES: Record<string, string> = {
  "gem-assen": "GM0106",
  "gem-emmen": "GM0114",
  "gem-meppel": "GM0119",
  "gem-hoogeveen": "GM0118",
  "gem-eindhoven": "GM0772",
  "gem-tilburg": "GM0855",
  "gem-utrecht": "GM0344",
  "gem-amersfoort": "GM0307",
  "gem-zeist": "GM0355",
};

export const CBS_TABLE_LABOUR = "84799NED";
export const CBS_TABLE_UNEMPLOYMENT = "82809NED";
export const CBS_API_BASE = "https://opendata.cbs.nl/ODataApi/OData";

export interface CBSLabourPoint {
  year: number;
  labourParticipationPct: number;
  population: number;
  regionLabel: string;
  sourceId: "src-cbs";
  isLive: true;
}

export interface CBSUnemploymentPoint {
  year: number;
  unemploymentPct: number;
  regionLabel: string;
  sourceId: "src-cbs";
  isLive: true;
}

interface CBSTypedRow {
  Perioden?: string;
  Nettoarbeidsparticipatie_67?: number;
  AantalInwoners_5?: number;
  Gemeentenaam_1?: string;
  WijkenEnBuurten?: string;
}

function parseCBSYear(period: string): number | null {
  const match = period.match(/^(\d{4})JJ/);
  return match ? parseInt(match[1], 10) : null;
}

async function fetchCBSRows(tableId: string, filter: string, top = 50): Promise<CBSTypedRow[]> {
  const url = `${CBS_API_BASE}/${tableId}/TypedDataSet?$filter=${encodeURIComponent(filter)}&$top=${top}&$format=json`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`CBS API ${response.status}`);
  }
  const data = (await response.json()) as { value?: CBSTypedRow[] };
  return data.value ?? [];
}

/** Live nationale arbeidsparticipatie (CBS Kerncijfers wijken en buurten) */
export async function fetchNationalLabourSeries(
  startYear = 2015,
  endYear = 2024
): Promise<CBSLabourPoint[]> {
  const yearFilters = Array.from({ length: endYear - startYear + 1 }, (_, i) => {
    const y = startYear + i;
    return `Perioden eq '${y}JJ00'`;
  }).join(" or ");

  const filter = `WijkenEnBuurten eq 'NL00      ' and (${yearFilters})`;
  const rows = await fetchCBSRows(CBS_TABLE_LABOUR, filter, 20);
  return rows
    .map((row) => {
      const year = row.Perioden ? parseCBSYear(row.Perioden) : null;
      if (!year || row.Nettoarbeidsparticipatie_67 == null) return null;
      return {
        year,
        labourParticipationPct: row.Nettoarbeidsparticipatie_67,
        population: row.AantalInwoners_5 ?? 0,
        regionLabel: "Nederland",
        sourceId: "src-cbs" as const,
        isLive: true as const,
      };
    })
    .filter((p): p is CBSLabourPoint => p !== null)
    .sort((a, b) => a.year - b.year);
}

/** Live gemeente-arbeidsparticipatie voor één jaar */
export async function fetchMunicipalityLabour(
  gemeenteCode: string,
  year = 2023
): Promise<CBSLabourPoint | null> {
  const padded = gemeenteCode.padEnd(6, " ");
  const filter = `Codering_3 eq '${padded}' and Perioden eq '${year}JJ00'`;
  const rows = await fetchCBSRows(CBS_TABLE_LABOUR, filter, 1);
  const row = rows[0];
  if (!row?.Nettoarbeidsparticipatie_67) return null;
  return {
    year,
    labourParticipationPct: row.Nettoarbeidsparticipatie_67,
    population: row.AantalInwoners_5 ?? 0,
    regionLabel: (row.Gemeentenaam_1 ?? gemeenteCode).trim(),
    sourceId: "src-cbs",
    isLive: true,
  };
}

/** Provincie = gewogen gemiddelde van bekende gemeenten in die provincie */
export async function fetchProvinceLabourProxy(
  provinceId: string,
  gemeenteIds: string[],
  year = 2023
): Promise<CBSLabourPoint | null> {
  const points: CBSLabourPoint[] = [];
  for (const gemId of gemeenteIds) {
    const code = CBS_GEMEENTE_CODES[gemId];
    if (!code) continue;
    const point = await fetchMunicipalityLabour(code, year);
    if (point) points.push(point);
  }
  if (points.length === 0) return null;

  const totalPop = points.reduce((s, p) => s + p.population, 0);
  const weightedParticipation =
    points.reduce((s, p) => s + p.labourParticipationPct * p.population, 0) / totalPop;

  return {
    year,
    labourParticipationPct: Math.round(weightedParticipation * 10) / 10,
    population: totalPop,
    regionLabel: provinceId,
    sourceId: "src-cbs",
    isLive: true,
  };
}

export async function fetchLiveLabourContext(regionId: string, parentProvinceId?: string) {
  const [national, unemploymentNational] = await Promise.all([
    fetchNationalLabourSeries(2015, 2024),
    fetchNationalUnemploymentSeries(2015, 2024).catch(() => [] as CBSUnemploymentPoint[]),
  ]);
  let regional: CBSLabourPoint | null = null;

  const gemeenteCode = CBS_GEMEENTE_CODES[regionId];
  if (gemeenteCode) {
    regional = await fetchMunicipalityLabour(gemeenteCode, 2023);
  } else if (regionId.startsWith("prov-")) {
    const { mockRegions } = await import("@/data/mock");
    const gemeenten = mockRegions
      .filter((r) => r.parentId === regionId)
      .map((r) => r.id);
    regional = await fetchProvinceLabourProxy(regionId, gemeenten, 2023);
  } else if (parentProvinceId) {
    const { mockRegions } = await import("@/data/mock");
    const gemeenten = mockRegions
      .filter((r) => r.parentId === parentProvinceId)
      .map((r) => r.id);
    regional = await fetchProvinceLabourProxy(parentProvinceId, gemeenten, 2023);
  }

  return { national, regional, unemploymentNational };
}

interface CBSUnemploymentRow {
  Perioden?: string;
  Werkloosheidspercentage_21?: number;
}

/** Live nationaal werkloosheidspercentage (CBS Arbeidsdeelname) */
export async function fetchNationalUnemploymentSeries(
  startYear = 2015,
  endYear = 2024
): Promise<CBSUnemploymentPoint[]> {
  const yearFilters = Array.from({ length: endYear - startYear + 1 }, (_, i) => {
    const y = startYear + i;
    return `Perioden eq '${y}JJ00'`;
  }).join(" or ");

  const filter = `Leeftijd eq '52052' and Geslacht eq 'T001038' and (${yearFilters})`;
  const url = `${CBS_API_BASE}/${CBS_TABLE_UNEMPLOYMENT}/TypedDataSet?$filter=${encodeURIComponent(filter)}&$top=30&$format=json`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`CBS unemployment API ${response.status}`);

  const data = (await response.json()) as { value?: CBSUnemploymentRow[] };
  return (data.value ?? [])
    .map((row) => {
      const year = row.Perioden ? parseCBSYear(row.Perioden) : null;
      if (!year || row.Werkloosheidspercentage_21 == null) return null;
      return {
        year,
        unemploymentPct: row.Werkloosheidspercentage_21,
        regionLabel: "Nederland",
        sourceId: "src-cbs" as const,
        isLive: true as const,
      };
    })
    .filter((p): p is CBSUnemploymentPoint => p !== null)
    .sort((a, b) => a.year - b.year);
}
