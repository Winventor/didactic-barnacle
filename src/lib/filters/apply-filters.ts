import type { PolicyDocument, DocumentFilters } from "@/types/policy-document";

const SEARCH_FIELDS: (keyof PolicyDocument)[] = [
  "title",
  "summary",
  "content",
  "documentType",
  "organisation",
  "theme",
  "portfolioHolder",
  "dossier",
];

/**
 * Full-text search across multiple document fields including keywords.
 */
export function searchDocuments(
  documents: PolicyDocument[],
  query: string,
): PolicyDocument[] {
  const q = query.trim().toLowerCase();
  if (!q) return documents;

  return documents.filter((doc) => {
    const keywordMatch = doc.keywords.some((k) => k.includes(q));
    if (keywordMatch) return true;

    return SEARCH_FIELDS.some((field) => {
      const value = doc[field];
      if (typeof value === "string") {
        return value.toLowerCase().includes(q);
      }
      return false;
    });
  });
}

function matchesSelect(value: string, filter: string): boolean {
  if (!filter) return true;
  return value === filter;
}

function matchesDateRange(
  date: Date,
  from: string,
  to: string,
): boolean {
  if (from) {
    const fromDate = new Date(from);
    if (date < fromDate) return false;
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    if (date > toDate) return false;
  }
  return true;
}

/**
 * Apply all combined filters to a document set.
 */
export function applyFilters(
  documents: PolicyDocument[],
  filters: DocumentFilters,
): PolicyDocument[] {
  let result = documents;

  if (filters.search) {
    result = searchDocuments(result, filters.search);
  }

  result = result.filter((doc) => {
    if (!matchesSelect(doc.policyLayer, filters.policyLayer)) return false;
    if (!matchesSelect(doc.documentType, filters.documentType)) return false;
    if (!matchesSelect(doc.governmentLevel, filters.governmentLevel))
      return false;
    if (!matchesSelect(doc.organisation, filters.organisation)) return false;
    if (!matchesSelect(doc.province, filters.province)) return false;
    if (!matchesSelect(doc.municipality, filters.municipality)) return false;
    if (!matchesSelect(doc.waterAuthority, filters.waterAuthority))
      return false;
    if (!matchesSelect(doc.theme, filters.theme)) return false;
    if (!matchesSelect(doc.status, filters.status)) return false;
    if (!matchesSelect(doc.portfolioHolder, filters.portfolioHolder))
      return false;
    if (!matchesDateRange(doc.documentDate, filters.dateFrom, filters.dateTo))
      return false;
    return true;
  });

  return result;
}

export function getUniqueValues(
  documents: PolicyDocument[],
  field: keyof PolicyDocument,
): string[] {
  const values = new Set<string>();
  for (const doc of documents) {
    const val = doc[field];
    if (typeof val === "string" && val.trim()) {
      values.add(val);
    }
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b, "nl"));
}
