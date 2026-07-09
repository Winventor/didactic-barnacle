export interface PolicyDocument {
  id: string;
  title: string;
  summary: string;
  policyLayer: string;
  documentType: string;
  theme: string;
  documentDate: Date;
  meetingDate: Date;
  governmentLevel: string;
  organisation: string;
  organisationType: string;
  province: string;
  municipality: string;
  waterAuthority: string;
  portfolioHolder: string;
  submitter: string;
  politicalParty: string;
  meeting: string;
  agendaItem: string;
  dossier: string;
  status: string;
  decision: string;
  votingResult: string;
  sourceUrl: string;
  documentUrl: string;
  pdfUrl: string;
  content: string;
  keywords: string[];
  updatedAt: Date;
}

/** Serialized form for static JSON / Supabase rows */
export interface PolicyDocumentRow {
  id: string;
  title: string;
  summary: string;
  policy_layer: string;
  document_type: string;
  theme: string;
  document_date: string;
  meeting_date: string;
  government_level: string;
  organisation: string;
  organisation_type: string;
  province: string;
  municipality: string;
  water_authority: string;
  portfolio_holder: string;
  submitter: string;
  political_party: string;
  meeting: string;
  agenda_item: string;
  dossier: string;
  status: string;
  decision: string;
  voting_result: string;
  source_url: string;
  document_url: string;
  pdf_url: string;
  content: string;
  keywords: string[];
  updated_at: string;
}

export type PolicyLayerTab =
  | "Beleidsvorming"
  | "Besluitvorming"
  | "Uitvoering & Evaluatie";

export interface DocumentFilters {
  search: string;
  policyLayer: string;
  documentType: string;
  governmentLevel: string;
  organisation: string;
  province: string;
  municipality: string;
  waterAuthority: string;
  theme: string;
  status: string;
  portfolioHolder: string;
  dateFrom: string;
  dateTo: string;
}

export const DEFAULT_FILTERS: DocumentFilters = {
  search: "",
  policyLayer: "",
  documentType: "",
  governmentLevel: "",
  organisation: "",
  province: "",
  municipality: "",
  waterAuthority: "",
  theme: "",
  status: "",
  portfolioHolder: "",
  dateFrom: "",
  dateTo: "",
};

export interface DashboardStats {
  total: number;
  beleidsvorming: number;
  besluitvorming: number;
  uitvoering: number;
  gemeenten: number;
  provincies: number;
  waterschappen: number;
}
