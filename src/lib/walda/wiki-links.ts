const WIKI_LINKS: Record<string, string> = {
  "cognitieve gedragstherapie": "https://waldacoaching.nl/persoonlijke-coaching/",
  ACT: "https://waldacoaching.nl/persoonlijke-coaching/",
  somberheid: "https://waldacoaching.nl/persoonlijke-coaching/",
  lusteloosheid: "https://waldacoaching.nl/stressbegeleiding/",
  lusteloos: "https://waldacoaching.nl/stressbegeleiding/",
  relativeren: "https://waldacoaching.nl/stressbegeleiding/",
  "burn-out coach": "https://waldacoaching.nl/stressbegeleiding/",
  leiderschapscoach: "https://waldacoaching.nl/leiderschapscoaching/",
  overwerkt: "https://waldacoaching.nl/stressbegeleiding/",
  hopeloosheid: "https://waldacoaching.nl/persoonlijke-coaching/",
  mildheid: "https://waldacoaching.nl/persoonlijke-coaching/",
  "Kortdurende coaching": "https://waldacoaching.nl/persoonlijke-coaching/",
  "Psychologische begeleiding": "https://waldacoaching.nl/persoonlijke-coaching/",
  "dankbaarheidsdagboek bijhouden": "https://waldacoaching.nl/persoonlijke-coaching/",
  reflectiemomenten: "https://waldacoaching.nl/persoonlijke-coaching/",
  dagboekje: "https://waldacoaching.nl/persoonlijke-coaching/",
  "Opdracht - Houd een stemmingsoverzicht bij":
    "https://waldacoaching.nl/persoonlijke-coaching/",
  "Depressie test  Online zelftest - PsyQ - pgweb.nl":
    "https://www.pgweb.nl/zelftest/depressie",
};

export function getWikiLinkUrl(term: string): string | undefined {
  return WIKI_LINKS[term];
}
