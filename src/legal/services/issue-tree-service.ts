import type { IssueTreeNode, LegalAreaCategory } from "../types";
import { LEGAL_AREAS } from "../config/legal-areas";

interface IssuePattern {
  keywords: string[];
  label: string;
  subArea: string;
  legalArea: LegalAreaCategory;
  searchQueries: string[];
}

const ISSUE_PATTERNS: IssuePattern[] = [
  {
    keywords: ["onrechtmatige daad", "schade", "aansprakelijk", "normschending"],
    label: "Onrechtmatige daad",
    subArea: "onrechtmatige daad",
    legalArea: "CIVIEL",
    searchQueries: ["6:162 BW onrechtmatige daad", "maatschappelijke zorgvuldigheid"],
  },
  {
    keywords: ["woongenot", "buren", "hinder", "overlast", "provocer", "provoceer"],
    label: "Woongenot / burenrecht",
    subArea: "burenrecht",
    legalArea: "CIVIEL",
    searchQueries: ["burenrecht woongenot", "5:37 BW"],
  },
  {
    keywords: ["contactverbod", "gebiedsverbod", "straatverbod", "verbod"],
    label: "Verbod of gebod",
    subArea: "verbod en gebod",
    legalArea: "CIVIEL",
    searchQueries: ["contactverbod", "kort geding verbod"],
  },
  {
    keywords: ["dwangsom"],
    label: "Dwangsom",
    subArea: "dwangsommen",
    legalArea: "CIVIEL",
    searchQueries: ["dwangsom artikel 611a Rv"],
  },
  {
    keywords: ["schade", "schadevergoeding"],
    label: "Schade",
    subArea: "schadevergoedingsrecht",
    legalArea: "CIVIEL",
    searchQueries: ["schadevergoeding 6:95 BW"],
  },
  {
    keywords: ["bedreiging", "dreigen", "dreiging"],
    label: "Bedreiging",
    subArea: "bedreiging",
    legalArea: "STRAF",
    searchQueries: ["bedreiging artikel 285 Sr", "bedreiging ECLI"],
  },
  {
    keywords: ["belaging", "stelselmatig", "achtervolg"],
    label: "Belaging",
    subArea: "belaging",
    legalArea: "STRAF",
    searchQueries: ["belaging 285b Sr", "stelselmatig inbreuk"],
  },
  {
    keywords: ["dwang", "dwingen"],
    label: "Dwang",
    subArea: "dwang",
    legalArea: "STRAF",
    searchQueries: ["dwang artikel 284 Sr"],
  },
  {
    keywords: ["vernieling", "beschadig"],
    label: "Vernieling",
    subArea: "vernieling",
    legalArea: "STRAF",
    searchQueries: ["vernieling 350 Sr"],
  },
  {
    keywords: ["huisvredebreuk"],
    label: "Huisvredebreuk",
    subArea: "huisvredebreuk",
    legalArea: "STRAF",
    searchQueries: ["huisvredebreuk 138 Sr"],
  },
  {
    keywords: ["gemeente", "handhaving", "woonoverlast", "apv", "burgemeester"],
    label: "Gemeentelijke handhaving",
    subArea: "gemeentelijke handhaving",
    legalArea: "BESTUUR",
    searchQueries: ["woonoverlast handhaving", "APV overlast"],
  },
  {
    keywords: ["woonoverlast"],
    label: "Wet aanpak woonoverlast",
    subArea: "woonoverlast",
    legalArea: "BESTUUR",
    searchQueries: ["Wet aanpak woonoverlast", "woonoverlast gemeente"],
  },
  {
    keywords: ["openbare orde"],
    label: "Openbare orde",
    subArea: "openbare orde",
    legalArea: "BESTUUR",
    searchQueries: ["openbare orde APV", "handhaving openbare orde"],
  },
  {
    keywords: ["bezwaar", "beroep", "besluit", "awb"],
    label: "Bestuursrechtelijke procedure",
    subArea: "Algemene wet bestuursrecht",
    legalArea: "BESTUUR",
    searchQueries: ["Awb bezwaar beroep", "bestuursrechtelijke procedure"],
  },
  {
    keywords: ["artikel 8", "privacy", "persoonlijke levenssfeer", "evrm"],
    label: "Artikel 8 EVRM",
    subArea: "privacy",
    legalArea: "VERDRAG",
    searchQueries: ["artikel 8 EVRM", "recht op privéleven"],
  },
  {
    keywords: ["effectieve rechtsbescherming", "toegang tot de rechter"],
    label: "Effectieve rechtsbescherming",
    subArea: "toegang tot de rechter",
    legalArea: "CONSTITUTIONEEL",
    searchQueries: ["artikel 6 EVRM", "effectieve rechtsbescherming"],
  },
];

export class IssueTreeService {
  build(narrative: string): IssueTreeNode {
    const lower = narrative.toLowerCase();
    const matchedPatterns = ISSUE_PATTERNS.filter((p) =>
      p.keywords.some((k) => lower.includes(k))
    );

    const byArea = new Map<LegalAreaCategory, IssueTreeNode>();

    for (const pattern of matchedPatterns) {
      if (!byArea.has(pattern.legalArea)) {
        const areaDef = LEGAL_AREAS.find((a) => a.category === pattern.legalArea);
        byArea.set(pattern.legalArea, {
          id: `area-${pattern.legalArea}`,
          label: areaDef?.name ?? pattern.legalArea,
          legalArea: pattern.legalArea,
          children: [],
          relevant: true,
        });
      }

      const areaNode = byArea.get(pattern.legalArea)!;
      areaNode.children.push({
        id: `issue-${pattern.subArea.replace(/\s/g, "-")}`,
        label: pattern.label,
        legalArea: pattern.legalArea,
        subArea: pattern.subArea,
        children: [],
        searchQueries: pattern.searchQueries,
        relevant: true,
      });
    }

    const root: IssueTreeNode = {
      id: "casus-root",
      label: "Casus",
      legalArea: "CIVIEL",
      children: Array.from(byArea.values()),
      relevant: true,
    };

    if (root.children.length === 0) {
      root.children = [
        {
          id: "area-civiel-default",
          label: "Civielrechtelijk (verder onderzoek nodig)",
          legalArea: "CIVIEL",
          children: [],
          relevant: false,
        },
      ];
    }

    return root;
  }

  generateSearchQueries(issueTree: IssueTreeNode): string[] {
    const queries: string[] = [];
    const walk = (node: IssueTreeNode) => {
      if (node.searchQueries) queries.push(...node.searchQueries);
      node.children.forEach(walk);
    };
    walk(issueTree);
    return [...new Set(queries)];
  }
}

export const issueTreeService = new IssueTreeService();
