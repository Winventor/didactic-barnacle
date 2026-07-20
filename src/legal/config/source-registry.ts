import type { Jurisdiction, SourceType, AuthorityLevel } from "../types";

export interface SourceConfig {
  id: string;
  name: string;
  jurisdiction: Jurisdiction;
  website: string;
  apiUrl?: string;
  documentationUrl?: string;
  registrationRequired: boolean;
  registrationUrl?: string;
  identifiers: string[];
  defaultSourceTypes: SourceType[];
  defaultAuthorityLevel: AuthorityLevel;
  rateLimitPerMinute: number;
  timeoutMs: number;
  robotsTxtUrl?: string;
}

export const SOURCE_REGISTRY: SourceConfig[] = [
  {
    id: "bwb-sru",
    name: "Wetten.overheid.nl (BWB SRU)",
    jurisdiction: "NL_NATIONAAL",
    website: "https://wetten.overheid.nl/",
    apiUrl: "https://zoekservice.overheid.nl/sru/Search",
    documentationUrl:
      "https://www.overheid.nl/sites/default/files/pdf/Handleiding%2BSRU%2BBWB.pdf",
    registrationRequired: false,
    identifiers: ["BWB-ID", "citeertitel", "artikelnummer"],
    defaultSourceTypes: ["WET_IN_FORMELE_ZIN", "AMVB", "MINISTERIELE_REGELING"],
    defaultAuthorityLevel: "PRIMAIR_BINDEND",
    rateLimitPerMinute: 30,
    timeoutMs: 15000,
    robotsTxtUrl: "https://wetten.overheid.nl/robots.txt",
  },
  {
    id: "official-gazette",
    name: "Officiële bekendmakingen",
    jurisdiction: "NL_NATIONAAL",
    website: "https://www.officielebekendmakingen.nl/",
    apiUrl: "https://zoek.officielebekendmakingen.nl/sru/Search",
    documentationUrl: "https://data.overheid.nl/dataset/officiele-bekendmakingen",
    registrationRequired: false,
    identifiers: ["Stcrt", "Stb", "Trb", "Kamerstuk"],
    defaultSourceTypes: ["PARLEMENTAIRE_GESCHIEDENIS"],
    defaultAuthorityLevel: "PRIMAIR_GEZAGHEBBEND",
    rateLimitPerMinute: 20,
    timeoutMs: 15000,
  },
  {
    id: "local-regulations",
    name: "Lokale wet- en regelgeving",
    jurisdiction: "NL_LOKAAL",
    website: "https://lokaleregelgeving.overheid.nl/",
    apiUrl: "https://lokaleregelgeving.overheid.nl/HRDOCS/_int/",
    registrationRequired: false,
    identifiers: ["CVDR-ID"],
    defaultSourceTypes: [
      "GEMEENTELIJKE_VERORDENING",
      "PROVINCIALE_VERORDENING",
      "WATERSCHAPSREGELING",
    ],
    defaultAuthorityLevel: "PRIMAIR_BINDEND",
    rateLimitPerMinute: 20,
    timeoutMs: 15000,
  },
  {
    id: "rechtspraak",
    name: "Rechtspraak.nl Open Data",
    jurisdiction: "NL_NATIONAAL",
    website: "https://uitspraken.rechtspraak.nl/",
    apiUrl: "https://data.rechtspraak.nl/uitspraken/zoeken",
    documentationUrl: "https://www.rechtspraak.nl/uitspraken/open-data",
    registrationRequired: false,
    identifiers: ["ECLI"],
    defaultSourceTypes: ["NATIONALE_JURISPRUDENTIE", "CONCLUSIE_ADVOCAAT_GENERAAL"],
    defaultAuthorityLevel: "PRIMAIR_GEZAGHEBBEND",
    rateLimitPerMinute: 30,
    timeoutMs: 15000,
  },
  {
    id: "council-of-state",
    name: "Raad van State",
    jurisdiction: "NL_NATIONAAL",
    website: "https://www.raadvanstate.nl/uitspraken/",
    registrationRequired: false,
    identifiers: ["ECLI:NL:RVS"],
    defaultSourceTypes: ["NATIONALE_JURISPRUDENTIE"],
    defaultAuthorityLevel: "PRIMAIR_GEZAGHEBBEND",
    rateLimitPerMinute: 10,
    timeoutMs: 15000,
  },
  {
    id: "treaties",
    name: "Verdragenbank",
    jurisdiction: "INTERNATIONAAL_VOOR_NEDERLAND",
    website: "https://verdragenbank.overheid.nl/",
    registrationRequired: false,
    identifiers: ["verdragsnummer", "Trb"],
    defaultSourceTypes: ["VERDRAG"],
    defaultAuthorityLevel: "PRIMAIR_BINDEND",
    rateLimitPerMinute: 10,
    timeoutMs: 15000,
  },
  {
    id: "eur-lex",
    name: "EUR-Lex",
    jurisdiction: "EU",
    website: "https://eur-lex.europa.eu/",
    apiUrl: "https://eur-lex.europa.eu/EURLexWebService",
    documentationUrl:
      "https://eur-lex.europa.eu/content/help/data-reuse/webservice.html",
    registrationRequired: true,
    registrationUrl:
      "https://eur-lex.europa.eu/content/help/data-reuse/webservice.html",
    identifiers: ["CELEX", "ELI"],
    defaultSourceTypes: [
      "EU_VERDRAG",
      "EU_VERORDENING",
      "EU_RICHTLIJN",
      "EU_BESLUIT",
    ],
    defaultAuthorityLevel: "PRIMAIR_BINDEND",
    rateLimitPerMinute: 10,
    timeoutMs: 20000,
  },
  {
    id: "cellar",
    name: "CELLAR (Publications Office)",
    jurisdiction: "EU",
    website: "https://publications.europa.eu/",
    apiUrl: "https://publications.europa.eu/resource/cellar/",
    documentationUrl:
      "https://eur-lex.europa.eu/content/help/data-reuse/reuse-contents-eurlex-details.html",
    registrationRequired: false,
    identifiers: ["CELEX", "CELLAR-ID"],
    defaultSourceTypes: ["EU_VERORDENING", "EU_RICHTLIJN"],
    defaultAuthorityLevel: "PRIMAIR_BINDEND",
    rateLimitPerMinute: 15,
    timeoutMs: 20000,
  },
  {
    id: "curia",
    name: "CURIA / InfoCuria",
    jurisdiction: "EU",
    website: "https://curia.europa.eu/",
    apiUrl: "https://curia.europa.eu/juris/document/document.jsf",
    documentationUrl:
      "https://curia.europa.eu/site/jcms/d2_5119/en/case-law-database",
    registrationRequired: false,
    identifiers: ["ECLI", "CELEX", "zaaknummer"],
    defaultSourceTypes: ["CJEU_JURISPRUDENTIE", "CONCLUSIE_ADVOCAAT_GENERAAL"],
    defaultAuthorityLevel: "PRIMAIR_GEZAGHEBBEND",
    rateLimitPerMinute: 10,
    timeoutMs: 20000,
  },
  {
    id: "hudoc",
    name: "HUDOC (EHRM)",
    jurisdiction: "RAAD_VAN_EUROPA",
    website: "https://hudoc.echr.coe.int/",
    apiUrl: "https://hudoc.echr.coe.int/app/query/results",
    documentationUrl: "https://www.echr.coe.int/hudoc-database",
    registrationRequired: false,
    identifiers: ["applicatienummer", "zaaknaam"],
    defaultSourceTypes: ["EHRM_JURISPRUDENTIE"],
    defaultAuthorityLevel: "PRIMAIR_GEZAGHEBBEND",
    rateLimitPerMinute: 15,
    timeoutMs: 20000,
  },
];

export function getSourceConfig(id: string): SourceConfig | undefined {
  return SOURCE_REGISTRY.find((s) => s.id === id);
}
