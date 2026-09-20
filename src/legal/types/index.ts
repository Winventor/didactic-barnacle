// Core legal platform types

export type Jurisdiction =
  | "NL_NATIONAAL"
  | "NL_LOKAAL"
  | "EU"
  | "RAAD_VAN_EUROPA"
  | "INTERNATIONAAL_VOOR_NEDERLAND"
  | "RECHTSVERGELIJKEND_NIET_BINDEND";

export type SourceType =
  | "GRONDWET"
  | "WET_IN_FORMELE_ZIN"
  | "AMVB"
  | "MINISTERIELE_REGELING"
  | "PROVINCIALE_VERORDENING"
  | "GEMEENTELIJKE_VERORDENING"
  | "WATERSCHAPSREGELING"
  | "BELEIDSREGEL"
  | "VERDRAG"
  | "EU_VERDRAG"
  | "EU_VERORDENING"
  | "EU_RICHTLIJN"
  | "EU_BESLUIT"
  | "NATIONALE_JURISPRUDENTIE"
  | "CJEU_JURISPRUDENTIE"
  | "EHRM_JURISPRUDENTIE"
  | "CONCLUSIE_ADVOCAAT_GENERAAL"
  | "PARLEMENTAIRE_GESCHIEDENIS"
  | "OFFICIELE_TOELICHTING"
  | "BELEID"
  | "SECUNDAIRE_BRON";

export type AuthorityLevel =
  | "PRIMAIR_BINDEND"
  | "PRIMAIR_GEZAGHEBBEND"
  | "PERSUASIEF"
  | "TOELICHTEND"
  | "NIET_BINDEND";

export type ClaimLabel = "BRON" | "AFGELEIDE_RECHTSREGEL" | "TOEPASSING_OP_CASUS";

export type FactLabel =
  | "BEVESTIGD_FEIT"
  | "STELLING_GEBRUIKER"
  | "VERMOEDEN"
  | "INTERPRETATIE"
  | "ONTBREKENDE_INFORMATIE"
  | "JURIDISCH_OORDEEL";

export type LegalAreaCategory =
  | "CIVIEL"
  | "STRAF"
  | "BESTUUR"
  | "CONSTITUTIONEEL"
  | "EU"
  | "VERDRAG"
  | "OVERIG";

export interface LegalSearchQuery {
  text?: string;
  legalArea?: string;
  jurisdiction?: Jurisdiction[];
  sourceTypes?: SourceType[];
  dateFrom?: string;
  dateTo?: string;
  validityDate?: string;
  identifier?: string; // BWB-ID, ECLI, CELEX, CVDR-ID
  articleNumber?: string;
  limit?: number;
  offset?: number;
}

export interface LegalSearchResult {
  id: string;
  adapterId: string;
  title: string;
  snippet: string;
  jurisdiction: Jurisdiction;
  sourceType: SourceType;
  authorityLevel: AuthorityLevel;
  identifier?: string;
  officialUrl: string;
  date?: string;
  relevanceScore?: number;
  metadata?: Record<string, unknown>;
}

export interface LegalDocument {
  id: string;
  adapterId: string;
  title: string;
  fullText?: string;
  jurisdiction: Jurisdiction;
  sourceType: SourceType;
  authorityLevel: AuthorityLevel;
  legalArea?: string;
  institution?: string;
  date?: string;
  effectiveDate?: string;
  validityPeriod?: string;
  status?: string;
  version?: string;
  identifiers: DocumentIdentifiers;
  officialUrl: string;
  fetchedAt: string;
  lastVerifiedAt?: string;
  fragments?: LegalFragment[];
  metadata?: Record<string, unknown>;
}

export interface DocumentIdentifiers {
  bwbId?: string;
  ecli?: string;
  celex?: string;
  eli?: string;
  cvdrId?: string;
  treatyNumber?: string;
  applicationNumber?: string;
  caseNumber?: string;
}

export interface LegalFragment {
  id: string;
  text: string;
  articleNumber?: string;
  paragraphNumber?: string;
  sectionLabel?: string;
  startPosition?: number;
  endPosition?: number;
}

export interface SourceHealth {
  adapterId: string;
  status: "HEALTHY" | "DEGRADED" | "UNAVAILABLE";
  latencyMs?: number;
  lastChecked: string;
  message?: string;
}

export interface Citation {
  id: string;
  exactPassage?: string;
  documentId: string;
  paragraphRef?: string;
  startPosition?: number;
  endPosition?: number;
  language: string;
  url: string;
  fetchedAt: string;
  textHash?: string;
  verified: boolean;
  isSummary: boolean;
}

export interface JurisprudentialRule {
  title: string;
  legalArea: string;
  mainRule: string;
  exception: string;
  conditions: string[];
  sourceEclis: string[];
  leadingAuthority: string | null;
  authorityStrength: "HOOG" | "MIDDEL" | "LAAG";
  consistency: "VASTE_LIJN" | "MEERDERE_UITSPRAKEN" | "ENKELE_UITSPRAAK";
  laterConfirmed: boolean | null;
  potentiallyOverruled: boolean;
  currentAsOf: string;
}

export interface ExtractedFact {
  id: string;
  text: string;
  label: FactLabel;
  date?: string;
  parties?: string[];
  legalRelevance?: string;
  confidence: "HOOG" | "MIDDEL" | "LAAG";
}

export interface TimelineEvent {
  date: string;
  time?: string;
  description: string;
  source?: string;
  legalRelevance?: string;
  possibleLegalArea?: string;
  certainty: "HOOG" | "MIDDEL" | "LAAG";
}

export interface IssueTreeNode {
  id: string;
  label: string;
  legalArea: LegalAreaCategory;
  subArea?: string;
  children: IssueTreeNode[];
  searchQueries?: string[];
  relevant?: boolean;
}

export interface CaseInput {
  narrative: string;
  municipality?: string;
  province?: string;
  documents?: UploadedDocument[];
}

export interface UploadedDocument {
  id: string;
  filename: string;
  mimeType: string;
  extractedText?: string;
  uploadedAt: string;
}

export interface CaseClassification {
  legalAreas: LegalAreaCategory[];
  subAreas: string[];
  confidence: "HOOG" | "MIDDEL" | "LAAG";
}

export interface ExtractedFacts {
  facts: ExtractedFact[];
  timeline: TimelineEvent[];
  missingInformation: string[];
  parties: { name: string; role: string }[];
}

export interface AuthorityInput {
  caseFacts: ExtractedFacts;
  issueTree: IssueTreeNode[];
  sources: LegalDocument[];
}

export interface LegalAnalysis {
  rules: AnalyzedRule[];
  jurisprudence: AnalyzedDecision[];
  application: ApplicationSection[];
  counterArguments: CounterArgumentRow[];
  recommendedRoutes: string[];
}

export interface AnalyzedRule {
  rule: string;
  conditions: string[];
  exceptions: string[];
  label: ClaimLabel;
  sources: LegalDocument[];
}

export interface AnalyzedDecision {
  ecli?: string;
  institution: string;
  date: string;
  coreRule: string;
  similarities: string[];
  differences: string[];
  outcome: string;
  relevantConsiderations: string[];
  url: string;
  isLeadingCase: boolean;
}

export interface ApplicationSection {
  title: string;
  content: string;
  label: ClaimLabel;
  citations: Citation[];
}

export interface CounterArgumentRow {
  element: string;
  userArgument: string;
  expectedDefense: string;
  response: string;
  evidenceNeeded: string;
}

export type ClaimDocumentType =
  | "SOMMATIE"
  | "AANSPRAKELIJKSTELLING"
  | "INGEBREKESTELLING"
  | "CONCEPTDAGVAARDING"
  | "CONCEPTVERZOKSCHRIFT"
  | "KORT_GEDING"
  | "VERBOD_GEBOD"
  | "SCHADEVERGOEDING"
  | "RECTIFICATIE"
  | "REACTIE_VERWEER"
  | "BEZWAAR"
  | "BEROEPSCHRIFT"
  | "HANDHAVING_VERZOEK"
  | "KLAGT"
  | "AANGIFTE_ONDERBOUWING"
  | "SLACHTOFFERVERKLARING"
  | "FEITENRELAAS"
  | "JURIDISCHE_NOTITIE"
  | "PROCESKANSEN_MEMO";

export interface ClaimInput {
  documentType: ClaimDocumentType;
  legalArea: LegalAreaCategory;
  caseAnalysis: LegalAnalysis;
  facts: ExtractedFacts;
  tone: "FORMEEL" | "GEMATIGD" | "BEWIJSVEILIG";
  desiredOutcome: string;
}

export interface ClaimDraft {
  title: string;
  sections: ClaimSection[];
  citations: Citation[];
  warnings: string[];
}

export interface ClaimSection {
  heading: string;
  content: string;
  label: ClaimLabel;
}

export interface SuccessAssessment {
  quantifiable: boolean;
  reason?: string;
  category?: "ZEER_ZWAK" | "ZWAK" | "ONZEKER" | "VERDEDIGBAAR" | "REDELIJK" | "STERK" | "ZEER_STERK";
  overallRange?: { low: number; high: number };
  components: SuccessComponent[];
  comparableCases: ComparableCase[];
  warning: string;
  reliability: "LAAG" | "MIDDEL" | "HOOG";
}

export interface SuccessComponent {
  name: string;
  weight: number;
  score: number;
  explanation: string;
}

export interface ComparableCase {
  ecli: string;
  outcome: string;
  similarity: string;
  difference: string;
  url: string;
}

export interface DefinitionResult {
  term: string;
  status: DefinitionStatus;
  ordinaryMeaning?: string;
  statutoryDefinition?: string;
  legalMeaning: string;
  legalArea: string;
  elements: string[];
  mainRule?: string;
  exceptions: string[];
  relatedTerms: { term: string; difference: string }[];
  examples: string[];
  counterExamples: string[];
  evidencePoints: string[];
  sources: LegalDocument[];
  jurisprudence: AnalyzedDecision[];
  /** Beschrijving van wat er is doorzocht (metadata vs volledige tekst). */
  searchScope?: string;
}

export interface DefinitionStatus {
  inStatute: boolean;
  developedInCaseLaw: boolean;
  colloquialTerm: boolean;
  variesByArea: boolean;
  description: string;
}

export interface LegalSourceAdapter {
  id: string;
  name: string;
  jurisdiction: Jurisdiction;
  search(query: LegalSearchQuery): Promise<LegalSearchResult[]>;
  fetchDocument(identifier: string): Promise<LegalDocument>;
  normalize(raw: unknown): LegalDocument;
  healthCheck(): Promise<SourceHealth>;
}

export interface LegalAnalysisModel {
  classifyCase(input: CaseInput): Promise<CaseClassification>;
  extractFacts(input: string): Promise<ExtractedFacts>;
  analyzeAuthorities(input: AuthorityInput): Promise<LegalAnalysis>;
  draftClaim(input: ClaimInput): Promise<ClaimDraft>;
}

export interface CaseAnalysisResult {
  summary: string;
  facts: ExtractedFact[];
  claimsRequiringProof: ExtractedFact[];
  missingInformation: string[];
  legalAreas: { area: LegalAreaCategory; subAreas: string[] }[];
  rules: AnalyzedRule[];
  jurisprudence: AnalyzedDecision[];
  application: ApplicationSection[];
  evidenceMatrix: EvidenceMatrixRow[];
  counterArguments: CounterArgumentRow[];
  routes: string[];
  strongestClaim: string;
  weaknesses: string[];
  successAssessment: SuccessAssessment;
  actions: string[];
  sources: LegalDocument[];
  issueTree: IssueTreeNode;
  timeline: TimelineEvent[];
  metadata: AnalysisMetadata;
}

export interface EvidenceMatrixRow {
  fact: string;
  evidence: string;
  strength: string;
  disputed: boolean;
}

export interface AnalysisMetadata {
  assessedAsOf: string;
  factsPeriodFrom?: string;
  factsPeriodTo?: string;
  appliedLawVersion?: string;
  lastSourceCheck: string;
}
