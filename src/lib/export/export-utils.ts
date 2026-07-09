import { formatDateShort } from "@/lib/utils";
import type { PolicyDocument } from "@/types/policy-document";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const CSV_COLUMNS: { header: string; get: (d: PolicyDocument) => string }[] = [
  { header: "Datum", get: (d) => formatDateShort(d.documentDate) },
  { header: "Titel", get: (d) => d.title },
  { header: "Beleidslaag", get: (d) => d.policyLayer },
  { header: "Documentsoort", get: (d) => d.documentType },
  { header: "Bestuurslaag", get: (d) => d.governmentLevel },
  { header: "Organisatie", get: (d) => d.organisation },
  { header: "Provincie", get: (d) => d.province },
  { header: "Gemeente", get: (d) => d.municipality },
  { header: "Waterschap", get: (d) => d.waterAuthority },
  { header: "Thema", get: (d) => d.theme },
  { header: "Portefeuillehouder", get: (d) => d.portfolioHolder },
  { header: "Status", get: (d) => d.status },
  { header: "Vergadering", get: (d) => d.meeting },
  { header: "Link", get: (d) => d.sourceUrl },
];

export function exportToCsv(documents: PolicyDocument[]): string {
  const headers = CSV_COLUMNS.map((c) => c.header).join(",");
  const rows = documents.map((doc) =>
    CSV_COLUMNS.map((c) => escapeCsv(c.get(doc))).join(","),
  );
  return [headers, ...rows].join("\n");
}

export function downloadFile(
  content: string | Blob,
  filename: string,
  mimeType: string,
): void {
  const blob =
    content instanceof Blob
      ? content
      : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportToExcel(
  documents: PolicyDocument[],
): Promise<void> {
  const XLSX = await import("xlsx");
  const data = documents.map((doc) => {
    const row: Record<string, string> = {};
    for (const col of CSV_COLUMNS) {
      row[col.header] = col.get(doc);
    }
    return row;
  });
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Documenten");
  XLSX.writeFile(workbook, "beleidsdocumenten.xlsx");
}

export function exportToJson(documents: PolicyDocument[]): string {
  return JSON.stringify(
    documents.map((doc) => ({
      ...doc,
      documentDate: doc.documentDate.toISOString(),
      meetingDate: doc.meetingDate.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    })),
    null,
    2,
  );
}
