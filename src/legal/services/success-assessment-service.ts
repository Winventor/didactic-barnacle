import type { SuccessAssessment, ExtractedFacts, AnalyzedRule, AnalyzedDecision, LegalDocument } from "../types";
import { SUCCESS_WEIGHTS, PROCESS_CHANCE_WARNING } from "../config/legal-areas";

interface AssessmentInput {
  facts: ExtractedFacts;
  rules: AnalyzedRule[];
  jurisprudence: AnalyzedDecision[];
  sources: LegalDocument[];
}

export class SuccessAssessmentService {
  assess(input: AssessmentInput): SuccessAssessment {
    const { facts, rules, jurisprudence, sources } = input;

    const hasEssentialFacts = facts.facts.length >= 3;
    const hasEvidence = facts.facts.some((f) => f.label === "BEVESTIGD_FEIT");
    const hasRules = rules.length > 0;
    const hasJurisprudence = jurisprudence.length > 0;
    const hasLeadingCase = jurisprudence.some((j) => j.isLeadingCase);

    if (!hasEssentialFacts || facts.missingInformation.length > 3) {
      return {
        quantifiable: false,
        reason: "Essentiële feiten ontbreken of bewijs is niet beschreven",
        category: "ONZEKER",
        components: [],
        comparableCases: [],
        warning: PROCESS_CHANCE_WARNING,
        reliability: "LAAG",
      };
    }

    const scores = {
      juridischeGrondslag: hasRules ? 0.7 : 0.3,
      wettelijkeVereisten: hasRules ? 0.6 : 0.2,
      bewijskracht: hasEvidence ? 0.65 : 0.25,
      vergelijkbareJurisprudentie: hasJurisprudence ? 0.6 : 0.2,
      gezagJurisprudentie: hasLeadingCase ? 0.8 : hasJurisprudence ? 0.5 : 0.2,
      procedureleHaalbaarheid: 0.55,
      proportionaliteit: 0.6,
      verwachtVerweer: 0.45,
    };

    const components = Object.entries(SUCCESS_WEIGHTS).map(([name, weight]) => ({
      name,
      weight,
      score: scores[name as keyof typeof scores] ?? 0.5,
      explanation: this.explainComponent(name, scores[name as keyof typeof scores] ?? 0.5),
    }));

    const totalScore = components.reduce((sum, c) => sum + c.score * c.weight, 0);
    const low = Math.max(0, Math.round((totalScore - 0.15) * 100));
    const high = Math.min(100, Math.round((totalScore + 0.15) * 100));

    const category = this.scoreToCategory(totalScore);

    return {
      quantifiable: true,
      category,
      overallRange: { low, high },
      components,
      comparableCases: jurisprudence.slice(0, 5).map((j) => ({
        ecli: j.ecli ?? "Onbekend",
        outcome: j.outcome,
        similarity: j.similarities.join("; ") || "Vergelijkbaar feitenpatroon",
        difference: j.differences.join("; ") || "Details kunnen afwijken",
        url: j.url,
      })),
      warning:
        PROCESS_CHANCE_WARNING +
        " Uitkomstenratio binnen gevonden vergelijkingsset, niet objectieve winstkans.",
      reliability: hasEvidence && hasJurisprudence ? "MIDDEL" : "LAAG",
    };
  }

  private explainComponent(name: string, score: number): string {
    const level = score >= 0.7 ? "sterk" : score >= 0.5 ? "gemiddeld" : "zwak";
    const explanations: Record<string, string> = {
      juridischeGrondslag: `Juridische grondslag is ${level}`,
      wettelijkeVereisten: `Vervulling wettelijke vereisten is ${level}`,
      bewijskracht: `Bewijskracht is ${level}`,
      vergelijkbareJurisprudentie: `Vergelijkbaarheid jurisprudentie is ${level}`,
      gezagJurisprudentie: `Gezag van jurisprudentie is ${level}`,
      procedureleHaalbaarheid: `Procedurele haalbaarheid is ${level}`,
      proportionaliteit: `Proportionaliteit vordering is ${level}`,
      verwachtVerweer: `Verwachte kracht verweer is ${level === "sterk" ? "zwak (gunstig)" : "sterk (ongunstig)"}`,
    };
    return explanations[name] ?? `${name}: ${level}`;
  }

  private scoreToCategory(
    score: number
  ): SuccessAssessment["category"] {
    if (score >= 0.8) return "ZEER_STERK";
    if (score >= 0.65) return "STERK";
    if (score >= 0.55) return "REDELIJK";
    if (score >= 0.45) return "VERDEDIGBAAR";
    if (score >= 0.35) return "ONZEKER";
    if (score >= 0.25) return "ZWAK";
    return "ZEER_ZWAK";
  }
}

export const successAssessmentService = new SuccessAssessmentService();
