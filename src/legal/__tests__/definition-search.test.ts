import { describe, it, expect } from "vitest";
import {
  extractPassages,
  extractStatutoryDefinition,
  normalizeSearchTerm,
  termMatches,
  plainTextFromBwbXml,
} from "../utils/definition-extractor";
import { buildBwbCql, pickLatestRepositoryUrl } from "../utils/bwb-repository";
import { RechtspraakOpenDataAdapter } from "../adapters/rechtspraak";

const SAMPLE_BWB_XML = `<?xml version="1.0"?><toestand bwb-id="BWBR0001854">
  <wetgeving><wet-besluit><wettekst>
    <artikel><kop><label>Artikel 285b</label></kop>
    <al>Belaging: wederrechtelijk stelselmatig opzettelijk inbreuk maken op eens anders persoonlijke levenssfeer.</al>
    </artikel>
  </wettekst></wet-besluit></wetgeving></toestand>`;

const SAMPLE_ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>ECLI:NL:HR:2020:1</id>
    <title type="text">ECLI:NL:HR:2020:1, Hoge Raad</title>
    <summary type="text">Over belaging en stelselmatigheid.</summary>
    <link rel="alternate" href="https://uitspraken.rechtspraak.nl/details?id=ECLI:NL:HR:2020:1"/>
  </entry>
</feed>`;

describe("definition-extractor", () => {
  it("normaliseert zoektermen", () => {
    expect(normalizeSearchTerm("  Onrechtmatige   Daad ")).toBe("onrechtmatige daad");
  });

  it("vindt termen in tekst", () => {
    expect(termMatches("Artikel over belaging in het strafrecht", "belaging")).toBe(true);
    expect(termMatches("Geen match", "belaging")).toBe(false);
  });

  it("extraheert passages rond een term", () => {
    const text = "Inleiding. ".repeat(5) + "Dit gaat over proportionaliteit in het bestuursrecht. Slot.";
    const passages = extractPassages(text, "proportionaliteit");
    expect(passages.length).toBeGreaterThan(0);
    expect(passages[0].toLowerCase()).toContain("proportionaliteit");
  });

  it("extraheert platte tekst uit BWB XML", () => {
    const plain = plainTextFromBwbXml(SAMPLE_BWB_XML);
    expect(plain).toContain("285b");
    expect(plain).toContain("Belaging");
  });

  it("herkent wettelijke context rond een term", () => {
    const plain = plainTextFromBwbXml(SAMPLE_BWB_XML);
    const def = extractStatutoryDefinition(plain, "belaging");
    expect(def?.toLowerCase()).toContain("belaging");
  });
});

describe("bwb-repository", () => {
  it("bouwt brede CQL voor metadata én titelvarianten", () => {
    const cql = buildBwbCql("proportionaliteit");
    expect(cql).toContain("overheidbwb.titel adj");
    expect(cql).toContain("overheidbwb.titel any");
    expect(cql).toContain("proportionaliteit");
  });

  it("kiest de meest recente repository-URL", () => {
    const latest = pickLatestRepositoryUrl([
      "https://repository.officiele-overheidspublicaties.nl/bwb/BWBR0001854/2019-01-01_0/xml/x.xml",
      "https://repository.officiele-overheidspublicaties.nl/bwb/BWBR0001854/2024-01-01_0/xml/x.xml",
    ]);
    expect(latest).toContain("2024-01-01");
  });
});

describe("RechtspraakOpenDataAdapter", () => {
  it("parseert Atom XML feeds", async () => {
    const adapter = new RechtspraakOpenDataAdapter();
    const results = (
      adapter as unknown as { parseAtomFeed: (xml: string, q: string) => { identifier?: string }[] }
    ).parseAtomFeed(SAMPLE_ATOM, "belaging");
    expect(results[0]?.identifier).toBe("ECLI:NL:HR:2020:1");
  });
});
