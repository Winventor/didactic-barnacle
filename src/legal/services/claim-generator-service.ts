import { legalModel } from "../llm/provider";
import { caseAnalysisService } from "./case-analysis-service";
import type { ClaimInput, ClaimDraft, ClaimDocumentType, CaseInput } from "../types";

export class ClaimGeneratorService {
  async generate(
    caseInput: CaseInput,
    options: {
      documentType: ClaimDocumentType;
      tone: ClaimInput["tone"];
      desiredOutcome: string;
    }
  ): Promise<ClaimDraft> {
    const analysis = await caseAnalysisService.analyze(caseInput);
    const facts = await legalModel.extractFacts(caseInput.narrative);

    const legalAnalysis = {
      rules: analysis.rules,
      jurisprudence: analysis.jurisprudence,
      application: analysis.application,
      counterArguments: analysis.counterArguments,
      recommendedRoutes: analysis.routes,
    };

    const draft = await legalModel.draftClaim({
      documentType: options.documentType,
      legalArea: analysis.legalAreas[0]?.area ?? "CIVIEL",
      caseAnalysis: legalAnalysis,
      facts,
      tone: options.tone,
      desiredOutcome: options.desiredOutcome,
    });

    // Enrich with bronverwijzingen
    const bronSection: ClaimDraft["sections"][0] = {
      heading: "Bronverwijzingen",
      content: analysis.sources
        .slice(0, 10)
        .map(
          (s) =>
            `${s.title}\n${s.identifiers.bwbId ? `BWB-ID: ${s.identifiers.bwbId}` : ""}` +
            `${s.identifiers.ecli ? `ECLI: ${s.identifiers.ecli}` : ""}\nURL: ${s.officialUrl}`
        )
        .join("\n\n"),
      label: "BRON",
    };

    draft.sections.push(bronSection);

    if (options.tone === "GEMATIGD") {
      draft.sections = draft.sections.map((s) => ({
        ...s,
        content: s.content
          .replace(/altijd|zeker|schuldig/gi, "mogelijk")
          .replace(/moet/gi, "kan"),
      }));
    }

    draft.warnings.push(
      "Tegenargumenten: zie aparte analyse.",
      `Indicatieve proceskans: ${analysis.successAssessment.quantifiable ? `${analysis.successAssessment.overallRange?.low}–${analysis.successAssessment.overallRange?.high}%` : "niet verantwoord kwantificeerbaar"}`,
    );

    return draft;
  }
}

export const claimGeneratorService = new ClaimGeneratorService();
