import type { PolicyDocument, DashboardStats } from "@/types/policy-document";

export function computeDashboardStats(
  documents: PolicyDocument[],
): DashboardStats {
  const gemeenten = new Set<string>();
  const provincies = new Set<string>();
  const waterschappen = new Set<string>();

  let beleidsvorming = 0;
  let besluitvorming = 0;
  let uitvoering = 0;

  for (const doc of documents) {
    if (doc.policyLayer === "Beleidsvorming") beleidsvorming++;
    else if (doc.policyLayer === "Besluitvorming") besluitvorming++;
    else if (doc.policyLayer === "Uitvoering & Evaluatie") uitvoering++;

    if (doc.municipality) gemeenten.add(doc.municipality);
    if (doc.governmentLevel === "Provincie" || doc.organisationType === "Provincie") {
      provincies.add(doc.province || doc.organisation);
    }
    if (doc.waterAuthority) waterschappen.add(doc.waterAuthority);
    if (doc.governmentLevel === "Waterschap") {
      waterschappen.add(doc.organisation);
    }
  }

  return {
    total: documents.length,
    beleidsvorming,
    besluitvorming,
    uitvoering,
    gemeenten: gemeenten.size,
    provincies: provincies.size,
    waterschappen: waterschappen.size,
  };
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export function documentsPerYear(
  documents: PolicyDocument[],
): ChartDataPoint[] {
  const counts = new Map<string, number>();
  for (const doc of documents) {
    const year = String(doc.documentDate.getFullYear());
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value }));
}

export function countByField(
  documents: PolicyDocument[],
  field: keyof PolicyDocument,
  limit = 10,
): ChartDataPoint[] {
  const counts = new Map<string, number>();
  for (const doc of documents) {
    const val = doc[field];
    if (typeof val === "string" && val.trim()) {
      counts.set(val, (counts.get(val) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}
