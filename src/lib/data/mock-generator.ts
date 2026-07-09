import { ALL_DOCUMENT_TYPES } from "@/lib/constants/document-types";
import { GOVERNMENT_LEVELS } from "@/lib/constants/government-levels";
import {
  MUNICIPALITIES,
  PROVINCES,
  WATER_AUTHORITIES,
  STATUSES,
  PORTFOLIO_HOLDERS,
  POLITICAL_PARTIES,
} from "@/lib/constants/organisations";
import { THEMES } from "@/lib/constants/themes";
import { classifyPolicyLayer } from "@/lib/classification/policy-layer";
import type { PolicyDocument } from "@/types/policy-document";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const SUMMARIES = [
  "Dit document beschrijft de koers voor de komende jaren op het gebied van duurzaamheid en klimaatadaptatie.",
  "Een uitgebreide analyse van de huidige stand van zaken en aanbevelingen voor verbetering.",
  "Het college stelt voor om de bestaande regeling te wijzigen in lijn met nieuwe wetgeving.",
  "De raad wordt verzocht een besluit te nemen over de financiering van het meerjarenprogramma.",
  "Evaluatie van de uitvoering van het beleid in de afgelopen periode met lessons learned.",
  "Visie op de toekomstige ontwikkeling van de openbare ruimte en woningbouw.",
  "Monitoringsrapport over de voortgang van de energietransitie in de regio.",
  "Startnotitie ter voorbereiding van een nieuw beleidskader voor mobiliteit.",
  "Jaarverslag over de financiële positie en de gerealiseerde resultaten.",
  "Programmaplan voor de aanpak van woningtekort en betaalbaarheid.",
];

const CONTENT_SNIPPETS = [
  "De gemeente streeft naar een CO2-neutrale organisatie in 2030.",
  "Er is brede steun voor het voorstel vanuit de raadsfracties.",
  "Het budget wordt verdeeld over drie prioritaire thema's.",
  "De participatie van inwoners heeft geleid tot waardevolle aanvullingen.",
  "De verordening wordt aangepast aan de Omgevingswet.",
  "Het waterschap investeert in waterberging en klimaatadaptatie.",
  "De provincie stelt een subsidie beschikbaar voor innovatieve projecten.",
  "De evaluatie toont aan dat de doelstellingen deels zijn behaald.",
];

const DECISIONS = [
  "Vastgesteld",
  "Aangenomen",
  "Verworpen",
  "Aangehouden",
  "Ter besluitvorming voorgelegd",
  "Ingediend",
  "Voor kennisgeving aangenomen",
];

const VOTING_RESULTS = [
  "26 voor, 10 tegen, 3 onthoudingen",
  "Unaniem aangenomen",
  "15 voor, 18 tegen",
  "22 voor, 12 tegen, 5 onthoudingen",
  "Bij acclamatie aangenomen",
  "Niet in stemming gebracht",
  "",
];

function buildOrganisation(
  level: string,
  rand: () => number,
): {
  organisation: string;
  organisationType: string;
  province: string;
  municipality: string;
  waterAuthority: string;
} {
  switch (level) {
    case "Gemeente": {
      const municipality = pick(MUNICIPALITIES, rand);
      const province = pick(PROVINCES, rand);
      return {
        organisation: `Gemeente ${municipality}`,
        organisationType: "Gemeente",
        province,
        municipality,
        waterAuthority: "",
      };
    }
    case "Provincie": {
      const province = pick(PROVINCES, rand);
      return {
        organisation: `Provincie ${province}`,
        organisationType: "Provincie",
        province,
        municipality: "",
        waterAuthority: "",
      };
    }
    case "Waterschap": {
      const waterAuthority = pick(WATER_AUTHORITIES, rand);
      const province = pick(PROVINCES, rand);
      return {
        organisation: waterAuthority,
        organisationType: "Waterschap",
        province,
        municipality: "",
        waterAuthority,
      };
    }
    case "Gemeenschappelijke regeling":
      return {
        organisation: `Samenwerkingsverband ${pick(MUNICIPALITIES, rand)}-Regio`,
        organisationType: "Gemeenschappelijke regeling",
        province: pick(PROVINCES, rand),
        municipality: pick(MUNICIPALITIES, rand),
        waterAuthority: "",
      };
    case "Veiligheidsregio":
      return {
        organisation: `Veiligheidsregio ${pick(PROVINCES, rand)}`,
        organisationType: "Veiligheidsregio",
        province: pick(PROVINCES, rand),
        municipality: "",
        waterAuthority: "",
      };
    case "Omgevingsdienst":
      return {
        organisation: `Omgevingsdienst ${pick(MUNICIPALITIES, rand)} en omgeving`,
        organisationType: "Omgevingsdienst",
        province: pick(PROVINCES, rand),
        municipality: pick(MUNICIPALITIES, rand),
        waterAuthority: "",
      };
    case "Regio":
      return {
        organisation: `Regio ${pick(PROVINCES, rand)}`,
        organisationType: "Regio",
        province: pick(PROVINCES, rand),
        municipality: "",
        waterAuthority: "",
      };
    default:
      return {
        organisation: "Overheidsorganisatie",
        organisationType: "Overig",
        province: pick(PROVINCES, rand),
        municipality: "",
        waterAuthority: "",
      };
  }
}

/**
 * Generates realistic mock policy documents for development.
 * Replace with API/Supabase provider in production.
 */
export function generateMockDocuments(count: number): PolicyDocument[] {
  const documents: PolicyDocument[] = [];
  const rand = seededRandom(42);

  const levelWeights = [
    { level: "Gemeente", weight: 0.55 },
    { level: "Provincie", weight: 0.2 },
    { level: "Waterschap", weight: 0.15 },
    { level: "Gemeenschappelijke regeling", weight: 0.04 },
    { level: "Veiligheidsregio", weight: 0.03 },
    { level: "Omgevingsdienst", weight: 0.02 },
    { level: "Regio", weight: 0.005 },
    { level: "Overig", weight: 0.005 },
  ];

  function pickLevel(): string {
    const r = rand();
    let cumulative = 0;
    for (const { level, weight } of levelWeights) {
      cumulative += weight;
      if (r <= cumulative) return level;
    }
    return "Gemeente";
  }

  for (let i = 0; i < count; i++) {
    const documentType = pick(ALL_DOCUMENT_TYPES, rand);
    const policyLayer = classifyPolicyLayer(documentType);
    const theme = pick(THEMES, rand);
    const governmentLevel = pickLevel();
    const org = buildOrganisation(governmentLevel, rand);
    const year = 2018 + Math.floor(rand() * 8);
    const month = Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 28);
    const documentDate = new Date(year, month, day);
    const meetingDate = new Date(year, month, Math.min(day + 7, 28));
    const portfolioHolder = pick(PORTFOLIO_HOLDERS, rand);
    const politicalParty = pick(POLITICAL_PARTIES, rand);
    const status = pick(STATUSES, rand);
    const orgSlug = slugify(org.organisation);

    const id = `doc-${String(i + 1).padStart(4, "0")}`;
    const title = `${documentType}: ${theme} ${org.organisation} ${year}`;

    documents.push({
      id,
      title,
      summary: pick(SUMMARIES, rand),
      policyLayer,
      documentType,
      theme,
      documentDate,
      meetingDate,
      governmentLevel,
      organisation: org.organisation,
      organisationType: org.organisationType,
      province: org.province,
      municipality: org.municipality,
      waterAuthority: org.waterAuthority,
      portfolioHolder,
      submitter: `${pick(["Dhr.", "Mevr."] as const, rand)} ${["Jansen", "de Vries", "Bakker", "Visser", "Smit", "Meijer", "Mulder", "de Boer"][Math.floor(rand() * 8)]} (${politicalParty})`,
      politicalParty,
      meeting: `${policyLayer === "Besluitvorming" ? "Raadsvergadering" : "Commissievergadering"} ${formatMonth(year, month)}`,
      agendaItem: `${Math.floor(rand() * 20) + 1}`,
      dossier: `${theme.substring(0, 3).toUpperCase()}-${year}-${String(Math.floor(rand() * 999)).padStart(3, "0")}`,
      status,
      decision: pick(DECISIONS, rand),
      votingResult: pick(VOTING_RESULTS, rand),
      sourceUrl: `https://openraadsinformatie.nl/${orgSlug}/${id}`,
      documentUrl: `https://id.openraadsinformatie.nl/${id}`,
      pdfUrl: `https://example.com/documents/${id}.pdf`,
      content: [
        pick(CONTENT_SNIPPETS, rand),
        pick(CONTENT_SNIPPETS, rand),
        pick(CONTENT_SNIPPETS, rand),
      ].join(" "),
      keywords: [
        theme.toLowerCase(),
        documentType.toLowerCase(),
        org.organisation.toLowerCase(),
        governmentLevel.toLowerCase(),
      ],
      updatedAt: new Date(year, month, day + 14),
    });
  }

  return documents;
}

function formatMonth(year: number, month: number): string {
  const months = [
    "januari",
    "februari",
    "maart",
    "april",
    "mei",
    "juni",
    "juli",
    "augustus",
    "september",
    "oktober",
    "november",
    "december",
  ];
  return `${months[month]} ${year}`;
}

/** Pre-generated mock dataset (280 records) */
export const MOCK_DOCUMENTS = generateMockDocuments(280);
