export const ORI_API_BASE = "https://api.openraadsinformatie.nl/v1/elastic";

export const DOCUMENT_TYPES = [
  "Moties",
  "Amendementen",
  "Schriftelijke vragen",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const RESULT_PASSED = "http://www.w3.org/ns/opengov#ResultPassed";
export const RESULT_FAILED = "http://www.w3.org/ns/opengov#ResultFailed";

export type DocumentStatus = "aangenomen" | "verworpen" | "onbekend";

export interface Raadsstuk {
  id: string;
  type: DocumentType;
  onderwerp: string;
  status: DocumentStatus;
  partijen: string;
  datum: string | null;
  gemeente: string;
  gemeenteSlug: string;
  documentUrl: string | null;
  dataUrl: string;
  pdfUrl: string | null;
}

export interface SearchParams {
  type?: DocumentType | "alle";
  status?: DocumentStatus | "alle";
  gemeente?: string;
  zoekterm?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  items: Raadsstuk[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Municipality {
  slug: string;
  name: string;
}
