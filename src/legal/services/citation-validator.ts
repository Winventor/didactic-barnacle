import type { Citation, LegalDocument } from "../types";

function simpleHash(text: string): string {
  // Browser-safe hash (not cryptographic; for citation integrity checks)
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return `h${(h >>> 0).toString(16)}`;
}

export class CitationValidator {
  verifyPassage(
    document: LegalDocument,
    passage: string,
    paragraphRef?: string
  ): Citation {
    const fullText = document.fullText ?? "";
    const verified = fullText.length > 0 && fullText.includes(passage);
    const textHash = fullText ? simpleHash(fullText) : undefined;

    return {
      id: `cite-${Date.now()}`,
      exactPassage: verified ? passage : undefined,
      documentId: document.id,
      paragraphRef,
      language: "nl",
      url: document.officialUrl,
      fetchedAt: document.fetchedAt,
      textHash,
      verified,
      isSummary: !verified,
    };
  }

  validateUrl(url: string): Promise<boolean> {
    try {
      const parsed = new URL(url);
      const officialDomains = [
        "wetten.overheid.nl",
        "uitspraken.rechtspraak.nl",
        "lokaleregelgeving.overheid.nl",
        "eur-lex.europa.eu",
        "hudoc.echr.coe.int",
        "curia.europa.eu",
        "verdragenbank.overheid.nl",
        "officielebekendmakingen.nl",
        "zoek.officielebekendmakingen.nl",
      ];
      return Promise.resolve(officialDomains.some((d) => parsed.hostname.includes(d)));
    } catch {
      return Promise.resolve(false);
    }
  }

  formatCitation(document: LegalDocument, articleRef?: string): string {
    const parts: string[] = [document.title];
    if (articleRef) parts.push(articleRef);
    if (document.identifiers.bwbId) parts.push(`BWB-ID: ${document.identifiers.bwbId}`);
    if (document.identifiers.ecli) parts.push(`ECLI: ${document.identifiers.ecli}`);
    if (document.identifiers.celex) parts.push(`CELEX: ${document.identifiers.celex}`);
    parts.push(`URL: ${document.officialUrl}`);
    parts.push(`Geraadpleegd op: ${document.fetchedAt.split("T")[0]}`);
    return parts.join("\n");
  }
}

export const citationValidator = new CitationValidator();
