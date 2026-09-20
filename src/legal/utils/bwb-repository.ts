import { parseXmlSafe, extractTextContent } from "./xml-safe";

const REPOSITORY_BASE = "https://repository.officiele-overheidspublicaties.nl";

/** Kernwetten die bij definitiezoekacties altijd in de volledige tekst worden doorzocht. */
export const CORE_BWB_IDS: { bwbId: string; title: string }[] = [
  { bwbId: "BWBR0001854", title: "Wetboek van Strafrecht" },
  { bwbId: "BWBR0005289", title: "Burgerlijk Wetboek" },
  { bwbId: "BWBR0005537", title: "Algemene wet bestuursrecht" },
  { bwbId: "BWBR0001840", title: "Grondwet" },
  { bwbId: "BWBR0001821", title: "Wetboek van Strafvordering" },
  { bwbId: "BWBR0005290", title: "Burgerlijk Wetboek Boek 7" },
];

export function repositoryUrlFromBwbId(bwbId: string, validityDate: string): string {
  return `${REPOSITORY_BASE}/bwb/${bwbId}/${validityDate}_0/xml/${bwbId}_${validityDate}_0.xml`;
}

export function parseLocatieToestand(record: Record<string, unknown>): string | undefined {
  const enriched = record["enrichedData"] as Record<string, unknown> | undefined;
  const direct =
    extractTextContent(record["overheidbwb:locatie_toestand"]) ||
    extractTextContent(enriched?.["overheidbwb:locatie_toestand"]);
  return direct || undefined;
}

export function parseBwbId(record: Record<string, unknown>): string {
  const owms = record["owmskern"] as Record<string, unknown> | undefined;
  const meta = record["overheidbwb:meta"] as Record<string, unknown> | undefined;
  const fromOwms = extractTextContent(owms?.["dcterms:identifier"]);
  const fromMeta = extractTextContent(
    (meta?.["owmskern"] as Record<string, unknown> | undefined)?.["dcterms:identifier"]
  );
  return (
    extractTextContent(record["dcterms:identifier"]) ||
    extractTextContent(record["overheidbwb:altKey"]) ||
    fromOwms ||
    fromMeta ||
    ""
  );
}

export function parseBwbTitle(record: Record<string, unknown>): string {
  const owms = record["owmskern"] as Record<string, unknown> | undefined;
  const meta = record["overheidbwb:meta"] as Record<string, unknown> | undefined;
  return (
    extractTextContent(record["dcterms:title"]) ||
    extractTextContent(record["overheidbwb:titel"]) ||
    extractTextContent(owms?.["dcterms:title"]) ||
    extractTextContent((meta?.["owmskern"] as Record<string, unknown>)?.["dcterms:title"]) ||
    "Onbekende regeling"
  );
}

export function buildBwbCql(text: string, identifier?: string): string {
  if (identifier?.startsWith("BWBR")) {
    return `dcterms.identifier=="${identifier}"`;
  }
  const escaped = text.replace(/"/g, '\\"');
  return [
    `overheidbwb.titel adj "${escaped}"`,
    `overheidbwb.titel any "${escaped}"`,
    `overheidbwb.afkorting any "${escaped}"`,
    `overheidbwb.rechtsgebied any "${escaped}"`,
  ].join(" or ");
}

/** Probeert recente geldigheidsdata om de actuele repository-URL te vinden. */
export function candidateValidityDates(count = 18): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    dates.push(d.toISOString().split("T")[0]);
  }
  dates.push(now.toISOString().split("T")[0]);
  return [...new Set(dates)];
}

export function extractSruRecords(parsed: Record<string, unknown>): Record<string, unknown>[] {
  const response = parsed["srw:searchRetrieveResponse"] ?? parsed;
  const records =
    (response as Record<string, unknown>)["srw:records"] ??
    (response as Record<string, unknown>)["records"];
  if (!records) return [];
  const recordList =
    (records as Record<string, unknown>)["srw:record"] ??
    (records as Record<string, unknown>)["record"];
  if (!recordList) return [];
  const arr = Array.isArray(recordList) ? recordList : [recordList];

  return arr.map((r) => {
    const data =
      (r as Record<string, unknown>)["srw:recordData"] ??
      (r as Record<string, unknown>)["recordData"];
    const gzd =
      (data as Record<string, unknown>)?.["gzd:gzd"] ??
      (data as Record<string, unknown>)?.["overheidbwb:meta"] ??
      data;
    const original = (gzd as Record<string, unknown>)?.["originalData"] ?? gzd;
    const enriched = (gzd as Record<string, unknown>)?.["enrichedData"];
    return {
      ...(original as Record<string, unknown>),
      enrichedData: enriched,
    } as Record<string, unknown>;
  });
}

export function pickLatestRepositoryUrl(urls: string[]): string | undefined {
  if (urls.length === 0) return undefined;
  const scored = urls
    .map((url) => {
      const match = url.match(/\/bwb\/[^/]+\/(\d{4}-\d{2}-\d{2})_/);
      return { url, date: match?.[1] ?? "0000-01-01" };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  return scored[0]?.url;
}

export function parseSruXml(xml: string): Record<string, unknown> {
  return parseXmlSafe<Record<string, unknown>>(xml);
}
