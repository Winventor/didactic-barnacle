import { parseXmlSafe, extractTextContent } from "./xml-safe";
import { normalizeSearchTerm, termMatches } from "./definition-extractor";

export const RECHTSPRAAK_OPEN_DATA_URL = "https://data.rechtspraak.nl/uitspraken/zoeken";
export const RECHTSPRAAK_CONTENT_URL = "https://data.rechtspraak.nl/uitspraken/content";

const ECLI_PATTERN = /^ECLI:[A-Z]{2}:[A-Z0-9]+:\d{4}:[A-Z0-9.]+$/i;

export interface RechtspraakAtomEntry {
  ecli: string;
  title: string;
  summary: string;
  updated?: string;
  officialUrl: string;
}

export interface RechtspraakSearchOptions {
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  creator?: string;
  subject?: string;
  maxPages?: number;
  pageSize?: number;
}

export function isEcli(value: string): boolean {
  return ECLI_PATTERN.test(value.trim());
}

export function parseRechtspraakAtomFeed(xml: string): RechtspraakAtomEntry[] {
  const parsed = parseXmlSafe<Record<string, unknown>>(xml);
  const feed = (parsed.feed ?? parsed) as Record<string, unknown>;
  const entries = feed.entry;
  if (!entries) return [];

  const entryList = Array.isArray(entries) ? entries : [entries];
  return entryList
    .map((entry) => parseAtomEntry(entry as Record<string, unknown>))
    .filter((entry): entry is RechtspraakAtomEntry => Boolean(entry?.ecli));
}

function parseAtomEntry(entry: Record<string, unknown>): RechtspraakAtomEntry | null {
  const ecli = extractTextContent(entry.id);
  if (!ecli) return null;

  const title = extractTextContent(entry.title) || ecli;
  const summary = extractTextContent(entry.summary);
  const updated = extractTextContent(entry.updated) || undefined;
  const link = entry.link;
  const links = Array.isArray(link) ? link : link ? [link] : [];
  const alternate = links.find(
    (l) => (l as Record<string, string>)["@_rel"] === "alternate"
  ) as Record<string, string> | undefined;

  return {
    ecli,
    title,
    summary: summary === "-" ? "" : summary,
    updated,
    officialUrl:
      alternate?.["@_href"] ??
      `https://uitspraken.rechtspraak.nl/details?id=${encodeURIComponent(ecli)}`,
  };
}

export function buildMetadataSearchUrl(
  options: RechtspraakSearchOptions & { from?: number }
): string {
  const params = new URLSearchParams();
  params.set("max", String(options.pageSize ?? 100));
  params.set("sort", "DESC");

  if (options.from) params.set("from", String(options.from));

  const dateFrom = options.dateFrom ?? defaultDateFrom();
  const dateTo = options.dateTo ?? new Date().toISOString().split("T")[0];
  params.append("modified", `${dateFrom}T00:00:00`);
  params.append("modified", `${dateTo}T23:59:59`);

  if (options.creator) params.append("creator", options.creator);
  if (options.subject) params.append("subject", options.subject);

  return `${RECHTSPRAAK_OPEN_DATA_URL}?${params.toString()}`;
}

function defaultDateFrom(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 8);
  return date.toISOString().split("T")[0];
}

export function entryMatchesTerm(entry: RechtspraakAtomEntry, term: string): boolean {
  const haystack = `${entry.title} ${entry.summary}`.toLowerCase();
  return termMatches(haystack, term);
}

export function rankEntry(entry: RechtspraakAtomEntry, term: string): number {
  const normalized = normalizeSearchTerm(term);
  const summary = entry.summary.toLowerCase();
  const title = entry.title.toLowerCase();
  if (summary.includes(normalized)) return 1;
  if (title.includes(normalized)) return 0.8;
  return 0.5;
}

export function buildOfficialSearchUrl(term: string): string {
  return `https://uitspraken.rechtspraak.nl/resultaat?zoekterm=${encodeURIComponent(term)}`;
}

export function institutionFromEcli(ecli: string): string {
  if (ecli.includes(":HR:")) return "Hoge Raad";
  if (ecli.includes(":RVS:")) return "Raad van State";
  if (ecli.includes(":CRVB:")) return "Centrale Raad van Beroep";
  if (ecli.includes(":CBB:")) return "College van Beroep voor het bedrijfsleven";
  if (ecli.includes(":PHR:")) return "Parket bij de Hoge Raad";
  if (ecli.includes(":GH")) return "Gerechtshof";
  if (ecli.includes(":RB")) return "Rechtbank";
  return "Nederlandse rechter";
}

export const RECHTSPRAAK_CREATORS = {
  hogeRaad: "http://standaarden.overheid.nl/owms/terms/Hoge_Raad_der_Nederlanden",
  raadVanState: "http://standaarden.overheid.nl/owms/terms/Raad_van_State",
  crvb: "http://standaarden.overheid.nl/owms/terms/Centrale_Raad_van_Beroep",
} as const;
