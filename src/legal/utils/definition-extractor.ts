import { parseXmlSafe, extractTextContent } from "./xml-safe";
import type { LegalFragment } from "../types";

const DEFINITION_PATTERNS = [
  /wordt\s+(?:in\s+deze\s+\w+\s+)?verstaan\s*[:;]?\s*([^.]{10,400}\.)/gi,
  /verstaan\s+onder\s*[:;]?\s*([^.]{10,400}\.)/gi,
  /begrip\s+['"]?[^'"]+['"]?\s*[:;]\s*([^.]{10,400}\.)/gi,
  /onder\s+['"]?[^'"]+['"]?\s+wordt\s+verstaan\s*[:;]?\s*([^.]{10,400}\.)/gi,
];

export function normalizeSearchTerm(term: string): string {
  return term.toLowerCase().trim().replace(/\s+/g, " ");
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function termMatches(text: string, term: string): boolean {
  const normalized = normalizeSearchTerm(term);
  if (!normalized) return false;
  const haystack = text.toLowerCase();
  if (haystack.includes(normalized)) return true;

  const words = normalized.split(" ").filter(Boolean);
  if (words.length > 1) {
    return words.every((word) => haystack.includes(word));
  }
  return false;
}

export function extractPassages(
  text: string,
  term: string,
  options?: { maxPassages?: number; contextChars?: number }
): string[] {
  const maxPassages = options?.maxPassages ?? 5;
  const contextChars = options?.contextChars ?? 220;
  const normalized = normalizeSearchTerm(term);
  if (!normalized || !text) return [];

  const lower = text.toLowerCase();
  const passages: string[] = [];
  let searchFrom = 0;

  while (passages.length < maxPassages) {
    const index = lower.indexOf(normalized, searchFrom);
    if (index === -1) break;

    const start = Math.max(0, index - contextChars);
    const end = Math.min(text.length, index + normalized.length + contextChars);
    let passage = text.slice(start, end).replace(/\s+/g, " ").trim();
    if (start > 0) passage = `…${passage}`;
    if (end < text.length) passage = `${passage}…`;
    passages.push(passage);
    searchFrom = index + normalized.length;
  }

  return passages;
}

export function extractStatutoryDefinition(text: string, term: string): string | undefined {
  if (!termMatches(text, term)) return undefined;

  for (const pattern of DEFINITION_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match?.[1] && termMatches(match[1], term)) {
      return match[1].trim();
    }
  }

  const passages = extractPassages(text, term, { maxPassages: 1, contextChars: 350 });
  return passages[0];
}

export function plainTextFromBwbXml(xml: string): string {
  try {
    const parsed = parseXmlSafe(xml);
    return extractTextContent(parsed).replace(/\s+/g, " ").trim();
  } catch {
    return xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
}

export function extractArticleLabel(xml: string, termIndex: number): string | undefined {
  const before = xml.slice(Math.max(0, termIndex - 2500), termIndex);
  const articleMatch = before.match(/<artikel[^>]*>[\s\S]*?<kop>[\s\S]*?<label[^>]*>([^<]+)</i)
    ?? before.match(/Artikel\s+(\d+[a-z]?(?:\s+lid\s+\d+)?)/gi);
  if (!articleMatch) return undefined;
  const label = Array.isArray(articleMatch) ? articleMatch[articleMatch.length - 1] : articleMatch[1];
  return typeof label === "string" ? label.replace(/<[^>]+>/g, "").trim() : undefined;
}

export function extractFragmentsFromBwbXml(xml: string, term: string): LegalFragment[] {
  const plain = plainTextFromBwbXml(xml);
  const passages = extractPassages(plain, term, { maxPassages: 8, contextChars: 280 });
  const lowerPlain = plain.toLowerCase();
  const normalized = normalizeSearchTerm(term);

  return passages.map((passage, index) => {
    const position = lowerPlain.indexOf(normalized, index > 0 ? lowerPlain.indexOf(passages[index - 1]) + 1 : 0);
    return {
      id: `frag-${index}`,
      text: passage,
      articleNumber: position >= 0 ? extractArticleLabel(xml, position) : undefined,
    };
  });
}

export function inferLegalAreaFromText(text: string): string {
  const lower = text.toLowerCase();
  if (/strafrecht|wetboek van strafrecht|\bsr\b/.test(lower)) return "Strafrecht";
  if (/burgerlijk wetboek|\bbw\b|verbintenissenrecht/.test(lower)) return "Civielrecht";
  if (/bestuursrecht|awb|algemene wet bestuursrecht/.test(lower)) return "Bestuursrecht";
  if (/grondwet/.test(lower)) return "Constitutioneel recht";
  if (/europese|eu-|verordening \(eu\)/.test(lower)) return "Europees recht";
  return "Nader te bepalen";
}
