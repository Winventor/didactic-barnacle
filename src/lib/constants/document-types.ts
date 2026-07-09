import type { PolicyLayerTab } from "@/types/policy-document";

export const POLICY_LAYER_TABS: PolicyLayerTab[] = [
  "Beleidsvorming",
  "Besluitvorming",
  "Uitvoering & Evaluatie",
];

export const DOCUMENT_TYPES_BY_LAYER: Record<PolicyLayerTab, string[]> = {
  Beleidsvorming: [
    "Visie",
    "Omgevingsvisie",
    "Startnotitie",
    "Nota van uitgangspunten",
    "Beleidsnota",
    "Beleidsplan",
    "Kadernota",
    "Koersdocument",
    "Contourennota",
    "Discussienota",
    "Routekaart",
    "Masterplan",
    "Agenda",
    "Transitieplan",
  ],
  Besluitvorming: [
    "Raadsvoorstel",
    "Collegevoorstel",
    "Raadsbesluit",
    "Collegebesluit",
    "Motie",
    "Amendement",
    "Verordening",
    "Beleidsregel",
    "Initiatiefvoorstel",
    "Besluitenlijst",
  ],
  "Uitvoering & Evaluatie": [
    "Uitvoeringsprogramma",
    "Uitvoeringsagenda",
    "Actieplan",
    "Programmaplan",
    "Meerjarenprogramma",
    "Jaarprogramma",
    "Monitor",
    "Evaluatierapport",
    "Jaarverslag",
    "Jaarrekening",
    "Programmabegroting",
    "Rekenkamerrapport",
    "Voortgangsrapportage",
  ],
};

export const ALL_DOCUMENT_TYPES = POLICY_LAYER_TABS.flatMap(
  (layer) => DOCUMENT_TYPES_BY_LAYER[layer],
);
