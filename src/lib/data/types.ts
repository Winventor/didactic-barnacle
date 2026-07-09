import type {
  PolicyDocument,
  PolicyDocumentRow,
} from "@/types/policy-document";

/** Data provider interface — swap implementation for API, scraper, or Supabase */
export interface DataProvider {
  getDocuments(): Promise<PolicyDocument[]>;
  getDocumentById(id: string): Promise<PolicyDocument | null>;
}

export function rowToDocument(row: PolicyDocumentRow): PolicyDocument {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    policyLayer: row.policy_layer,
    documentType: row.document_type,
    theme: row.theme,
    documentDate: new Date(row.document_date),
    meetingDate: new Date(row.meeting_date),
    governmentLevel: row.government_level,
    organisation: row.organisation,
    organisationType: row.organisation_type,
    province: row.province,
    municipality: row.municipality,
    waterAuthority: row.water_authority,
    portfolioHolder: row.portfolio_holder,
    submitter: row.submitter,
    politicalParty: row.political_party,
    meeting: row.meeting,
    agendaItem: row.agenda_item,
    dossier: row.dossier,
    status: row.status,
    decision: row.decision,
    votingResult: row.voting_result,
    sourceUrl: row.source_url,
    documentUrl: row.document_url,
    pdfUrl: row.pdf_url,
    content: row.content,
    keywords: row.keywords,
    updatedAt: new Date(row.updated_at),
  };
}

export function documentToRow(doc: PolicyDocument): PolicyDocumentRow {
  return {
    id: doc.id,
    title: doc.title,
    summary: doc.summary,
    policy_layer: doc.policyLayer,
    document_type: doc.documentType,
    theme: doc.theme,
    document_date: doc.documentDate.toISOString(),
    meeting_date: doc.meetingDate.toISOString(),
    government_level: doc.governmentLevel,
    organisation: doc.organisation,
    organisation_type: doc.organisationType,
    province: doc.province,
    municipality: doc.municipality,
    water_authority: doc.waterAuthority,
    portfolio_holder: doc.portfolioHolder,
    submitter: doc.submitter,
    political_party: doc.politicalParty,
    meeting: doc.meeting,
    agenda_item: doc.agendaItem,
    dossier: doc.dossier,
    status: doc.status,
    decision: doc.decision,
    voting_result: doc.votingResult,
    source_url: doc.sourceUrl,
    document_url: doc.documentUrl,
    pdf_url: doc.pdfUrl,
    content: doc.content,
    keywords: doc.keywords,
    updated_at: doc.updatedAt.toISOString(),
  };
}
