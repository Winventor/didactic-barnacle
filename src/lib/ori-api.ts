import {
  DOCUMENT_TYPES,
  ORI_API_BASE,
  RESULT_FAILED,
  RESULT_PASSED,
  type DocumentStatus,
  type DocumentType,
  type Municipality,
  type Raadsstuk,
  type SearchParams,
  type SearchResult,
} from "./types";

interface ElasticHit<T> {
  _id: string;
  _index: string;
  _source: T;
}

interface ElasticResponse<T> {
  hits: {
    total: { value: number; relation: string };
    hits: ElasticHit<T>[];
  };
}

interface ReportSource {
  "@id"?: string;
  name?: string;
  classification?: string;
  result?: string;
  start_date?: string;
  end_date?: string;
  attachment?: string | string[];
  has_organization_name?: string;
}

interface MediaSource {
  name?: string;
  url?: string;
  text?: string[];
}

interface OrganizationSource {
  name?: string;
  collection?: string;
}

async function elasticSearch<T>(
  body: Record<string, unknown>
): Promise<ElasticResponse<T>> {
  const response = await fetch(`${ORI_API_BASE}/ori_*/_search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Open Raadsinformatie API fout: ${response.status}`);
  }

  return response.json();
}

export function mapResult(result?: string): DocumentStatus {
  if (result === RESULT_PASSED) return "aangenomen";
  if (result === RESULT_FAILED) return "verworpen";
  return "onbekend";
}

export function extractParties(text: string, onderwerp: string): string {
  const patterns = [
    /Indiener:\s*([^\n(]+)/i,
    /De fractie\(s\) van:\s*([^\n]+)/i,
    /Ingediend (?:en ondertekend )?door:\s*([^\n]+)/i,
    /fractie\s+([A-Za-z0-9./+\-\s]+?)(?:\s+inzake|\s+over|\s+m\.b\.t\.|$)/i,
    /Partij\(en\)\s*\n\s*([^\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/\s+/g, " ").trim();
    }
  }

  const nameMatch = onderwerp.match(/fractie\s+([A-Za-z0-9./+\-\s]+?)(?:\s+inzake|\s+over|$)/i);
  if (nameMatch?.[1]) {
    return nameMatch[1].trim();
  }

  return "—";
}

function extractGemeenteSlug(index: string): string {
  const match = index.match(/^ori_(.+?)_\d+$/);
  return match?.[1] ?? index;
}

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function normalizeIds(ids: Array<string | string[] | undefined>): string[] {
  return [
    ...new Set(
      ids.flatMap((id) => (Array.isArray(id) ? id : id ? [id] : []))
    ),
  ];
}

async function fetchByIds<T>(ids: string[]): Promise<Map<string, T>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map();

  const data = await elasticSearch<T>({
    query: { terms: { _id: uniqueIds } },
    size: uniqueIds.length,
  });

  return new Map(data.hits.hits.map((hit) => [hit._id, hit._source]));
}

export async function fetchMunicipalities(): Promise<Municipality[]> {
  const data = await elasticSearch<OrganizationSource>({
    size: 500,
    query: {
      bool: {
        filter: {
          terms: {
            "classification.keyword": ["Municipality"],
          },
        },
      },
    },
    _source: ["name", "collection"],
    sort: [{ "collection.keyword": { order: "asc", unmapped_type: "keyword" } }],
  });

  return data.hits.hits
    .map((hit) => ({
      slug: hit._source.collection ?? "",
      name: hit._source.name ?? hit._source.collection ?? "",
    }))
    .filter((item) => item.slug)
    .sort((a, b) => a.name.localeCompare(b.name, "nl"));
}

export async function searchRaadsstukken(
  params: SearchParams
): Promise<SearchResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, params.pageSize ?? 25));
  const from = (page - 1) * pageSize;

  const filters: Record<string, unknown>[] = [
    {
      terms: {
        "classification.keyword":
          params.type && params.type !== "alle"
            ? [params.type]
            : [...DOCUMENT_TYPES],
      },
    },
  ];

  if (params.gemeente) {
    filters.push({
      wildcard: {
        _index: `ori_${params.gemeente}_*`,
      },
    });
  }

  if (params.status && params.status !== "alle") {
    const resultUri =
      params.status === "aangenomen" ? RESULT_PASSED : RESULT_FAILED;
    filters.push({ term: { "result.keyword": resultUri } });
  }

  const must: Record<string, unknown>[] = [];

  if (params.zoekterm?.trim()) {
    must.push({
      simple_query_string: {
        fields: ["name", "text", "description"],
        default_operator: "and",
        query: params.zoekterm.trim(),
      },
    });
  }

  const queryBody = {
    query: {
      bool: {
        ...(must.length > 0 ? { must } : {}),
        filter: filters,
      },
    },
    from,
    size: pageSize,
    sort: [
      { start_date: { order: "desc", missing: "_last", unmapped_type: "date" } },
    ],
    _source: [
      "@id",
      "name",
      "classification",
      "result",
      "start_date",
      "attachment",
      "has_organization_name",
    ],
  };

  const data = await elasticSearch<ReportSource>(queryBody);
  const reports = data.hits.hits;

  const attachmentIds = normalizeIds(
    reports.map((hit) => hit._source.attachment)
  );
  const orgIds = normalizeIds(
    reports.map((hit) => hit._source.has_organization_name)
  );

  const [attachments, organizations] = await Promise.all([
    fetchByIds<MediaSource>(attachmentIds),
    fetchByIds<OrganizationSource>(orgIds),
  ]);

  const items: Raadsstuk[] = reports.map((hit) => {
    const source = hit._source;
    const attachmentId = Array.isArray(source.attachment)
      ? source.attachment[0]
      : source.attachment;
    const attachment = attachmentId
      ? attachments.get(attachmentId)
      : undefined;
    const organization = source.has_organization_name
      ? organizations.get(source.has_organization_name)
      : undefined;
    const text = attachment?.text?.join("\n") ?? "";
    const onderwerp = source.name ?? "Zonder titel";
    const dataId = source["@id"] ?? hit._id;

    return {
      id: hit._id,
      type: (source.classification as DocumentType) ?? "Moties",
      onderwerp,
      status: mapResult(source.result),
      partijen: extractParties(text, onderwerp),
      datum: formatDate(source.start_date ?? source.end_date),
      gemeente: organization?.name?.replace(/^Gemeente\s+/i, "") ?? extractGemeenteSlug(hit._index),
      gemeenteSlug: organization?.collection ?? extractGemeenteSlug(hit._index),
      documentUrl: attachment?.url ?? null,
      dataUrl: `https://id.openraadsinformatie.nl/${dataId}`,
      pdfUrl: attachment?.url ?? null,
    };
  });

  const total = data.hits.total.value;
  const relation = data.hits.total.relation;

  return {
    items,
    total: relation === "gte" ? total : total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
