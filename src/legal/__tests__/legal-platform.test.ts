import { describe, it, expect } from "vitest";
import { issueTreeService } from "../services/issue-tree-service";
import { successAssessmentService } from "../services/success-assessment-service";
import { citationValidator } from "../services/citation-validator";
import { EXCEPTION_PHRASES } from "../config/legal-areas";

describe("IssueTreeService", () => {
  it("detecteert civiel en strafrechtelijke issues bij burenconflict", () => {
    const tree = issueTreeService.build(
      "Mijn buurman provoceert mij herhaaldelijk en bedreigt mij. De gemeente handhaaft niet."
    );
    expect(tree.children.length).toBeGreaterThan(0);
    const labels = tree.children.flatMap((c) => [c.label, ...c.children.map((ch) => ch.label)]);
    const hasCivielIssue = tree.children.some((c) => c.legalArea === "CIVIEL" && c.children.length > 0);
    expect(hasCivielIssue || labels.some((l) => /woongenot|buren|provoc/i.test(l))).toBe(true);
  });

  it("genereert zoekqueries", () => {
    const tree = issueTreeService.build("belaging en bedreiging");
    const queries = issueTreeService.generateSearchQueries(tree);
    expect(queries.length).toBeGreaterThan(0);
  });
});

describe("SuccessAssessmentService", () => {
  it("geeft niet-kwantificeerbaar bij ontbrekende feiten", () => {
    const result = successAssessmentService.assess({
      facts: { facts: [], timeline: [], missingInformation: ["a", "b", "c", "d"], parties: [] },
      rules: [],
      jurisprudence: [],
      sources: [],
    });
    expect(result.quantifiable).toBe(false);
  });

  it("berekent bandbreedte bij voldoende informatie", () => {
    const result = successAssessmentService.assess({
      facts: {
        facts: [
          { id: "1", text: "Feit 1", label: "BEVESTIGD_FEIT", confidence: "HOOG" },
          { id: "2", text: "Feit 2", label: "BEVESTIGD_FEIT", confidence: "HOOG" },
          { id: "3", text: "Feit 3", label: "STELLING_GEBRUIKER", confidence: "MIDDEL" },
        ],
        timeline: [],
        missingInformation: [],
        parties: [],
      },
      rules: [{ rule: "Test", conditions: [], exceptions: [], label: "BRON", sources: [] }],
      jurisprudence: [],
      sources: [],
    });
    expect(result.quantifiable).toBe(true);
    expect(result.overallRange).toBeDefined();
  });
});

describe("CitationValidator", () => {
  it("valideert officiële URLs", async () => {
    expect(await citationValidator.validateUrl("https://wetten.overheid.nl/BWBR0005289/")).toBe(true);
    expect(await citationValidator.validateUrl("https://example.com/fake")).toBe(false);
  });

  it("verifieert passages in brontekst", () => {
    const citation = citationValidator.verifyPassage(
      {
        id: "test",
        adapterId: "bwb",
        title: "Test",
        fullText: "Artikel 6:162 BW bepaalt de onrechtmatige daad.",
        jurisdiction: "NL_NATIONAAL",
        sourceType: "WET_IN_FORMELE_ZIN",
        authorityLevel: "PRIMAIR_BINDEND",
        identifiers: {},
        officialUrl: "https://wetten.overheid.nl/",
        fetchedAt: new Date().toISOString(),
      },
      "onrechtmatige daad"
    );
    expect(citation.verified).toBe(true);
  });
});

describe("Exception phrases", () => {
  it("bevat verplichte uitzonderingsformuleringen", () => {
    expect(EXCEPTION_PHRASES).toContain("in beginsel");
    expect(EXCEPTION_PHRASES).toContain("tenzij");
  });
});

describe("Source registry", () => {
  it("bevat alle verplichte adapters", async () => {
    const { SOURCE_REGISTRY } = await import("../config/source-registry");
    const ids = SOURCE_REGISTRY.map((s) => s.id);
    expect(ids).toContain("bwb-sru");
    expect(ids).toContain("rechtspraak");
    expect(ids).toContain("hudoc");
    expect(ids).toContain("eur-lex");
    expect(ids).toContain("curia");
  });
});
