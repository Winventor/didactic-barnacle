export interface BurnoutSymptom {
  id: string;
  label: string;
}

export interface BurnoutSymptomCategory {
  id: string;
  title: string;
  description?: string;
  symptoms: BurnoutSymptom[];
}

export interface BurnoutDemographicQuestion {
  id: string;
  label: string;
  required: boolean;
  options: { id: string; label: string }[];
}

export type BurnoutScoreRangeId = "1-4" | "5-7" | "8-10" | "11+";

export interface BurnoutResult {
  id: BurnoutScoreRangeId;
  min: number;
  max: number | null;
  title: string;
  body: string[];
  stressExplanation?: string[];
  signature: {
    name: string;
    titles: string;
    link?: { label: string; href: string };
  };
  showEmailNote?: boolean;
}

export const BURNOUT_TEST_BANNER = {
  src: "https://waldacoaching.nl/wp-content/uploads/2024/09/Obsidian-Banner-Walda-Coaching-2024.png",
  positionX: 0.51741,
};

export const BURNOUT_TEST_INSTRUCTIONS = [
  "Kijk naar de afgelopen maand",
  "Let op veranderingen",
  "En wees eerlijk naar jezelf",
];

export const BURNOUT_SYMPTOM_CATEGORIES: BurnoutSymptomCategory[] = [
  {
    id: "mental",
    title: "Klachten op mentaal niveau",
    description:
      "Kijk naar de afgelopen maand en klik de symptomen aan die op jou van toepassing zijn",
    symptoms: [
      { id: "mental-1", label: "geen overzicht meer" },
      { id: "mental-2", label: "niet kunnen stoppen" },
      { id: "mental-3", label: "niet meer kunnen [[relativeren]]" },
      { id: "mental-4", label: "slecht geheugen" },
      { id: "mental-5", label: "niet op woorden kunnen komen" },
      { id: "mental-6", label: "slecht kunnen concentreren" },
      { id: "mental-7", label: "vergeetachtig" },
      { id: "mental-8", label: "malen/piekeren" },
      { id: "mental-9", label: "niet tegen druk kunnen" },
      { id: "mental-10", label: "geen zin in werk" },
      { id: "mental-11", label: "werken op automatische piloot" },
      { id: "mental-12", label: "geen controle meer hebben" },
      { id: "mental-13", label: "dingen niet af kunnen krijgen" },
      { id: "mental-14", label: "niet kunnen loslaten van bv werk" },
      { id: "mental-15", label: "niet helder kunnen denken" },
      { id: "mental-16", label: "negatieve gedachten" },
      { id: "mental-17", label: "moeilijker beslissingen kunnen nemen" },
    ],
  },
  {
    id: "physical",
    title: "Klachten op fysiek niveau",
    description:
      "Kijk naar de afgelopen maand en klik de symptomen aan die op jou van toepassing zijn",
    symptoms: [
      { id: "physical-1", label: "hoofdpijn/druk op je hoofd" },
      { id: "physical-2", label: "(onder)rugpijn" },
      { id: "physical-3", label: "nek- en schouderklachten" },
      { id: "physical-4", label: "buikpijn/maagklachten/darmklachten" },
      { id: "physical-5", label: "hyperventilatie" },
      { id: "physical-6", label: "hartkloppingen" },
      { id: "physical-7", label: "vermoeidheid" },
      { id: "physical-8", label: "duizelig / black-outs" },
      { id: "physical-9", label: "niet kunnen ontspannen" },
      { id: "physical-10", label: "hyper energie" },
      { id: "physical-11", label: "hoge bloeddruk" },
      { id: "physical-12", label: "trillen (bv van kleine spiertjes)" },
      { id: "physical-13", label: "oogproblemen" },
      { id: "physical-14", label: "gewichtsproblemen" },
      { id: "physical-15", label: "gespannen" },
      { id: "physical-16", label: "zweepslag" },
      { id: "physical-17", label: "lage weerstand" },
      { id: "physical-18", label: "eczeem" },
      { id: "physical-19", label: "gewrichtspijn" },
      { id: "physical-20", label: "RSI klachten" },
      { id: "physical-21", label: "moeite met duursporten" },
      { id: "physical-22", label: "wit zien" },
      { id: "physical-23", label: "aanhoudende griep/keelpijn/verkoudheid" },
      { id: "physical-24", label: "blaasontsteking" },
      { id: "physical-25", label: "oppervlakkige ademhaling" },
      { id: "physical-26", label: "slecht kunnen slapen" },
    ],
  },
  {
    id: "behavior",
    title: "Veranderingen in gedrag",
    symptoms: [
      { id: "behavior-1", label: "meer roken" },
      { id: "behavior-2", label: "meer alcohol drinken" },
      { id: "behavior-3", label: "meer koffie drinken" },
      { id: "behavior-4", label: "meer/minder eten" },
      { id: "behavior-5", label: "klagen" },
      { id: "behavior-6", label: "kortaf" },
      { id: "behavior-7", label: "seksuele uitspattingen" },
      { id: "behavior-8", label: "teruggetrokken/afwezig" },
      { id: "behavior-9", label: "onzekerheid" },
      { id: "behavior-10", label: "afleiding zoeken" },
      { id: "behavior-11", label: "makkelijkere taken opzoeken" },
      { id: "behavior-12", label: "fouten maken" },
    ],
  },
  {
    id: "emotion",
    title: "Veranderingen in emotie",
    description:
      "Kijk naar de afgelopen maand en klik aan wat op jou van toepassing is",
    symptoms: [
      { id: "emotion-1", label: "huilen" },
      { id: "emotion-2", label: "angsten" },
      { id: "emotion-3", label: "[[lusteloos]]" },
      { id: "emotion-4", label: "depressieve gevoelens" },
      { id: "emotion-5", label: "zelfvervreemding" },
      { id: "emotion-6", label: "somber" },
      { id: "emotion-7", label: "emotioneel" },
      { id: "emotion-8", label: "paniekaanvallen" },
      { id: "emotion-9", label: "sneller geïrriteerd" },
      { id: "emotion-10", label: "woedeaanvallen" },
      { id: "emotion-11", label: "cynisme" },
      { id: "emotion-12", label: "onrustig" },
      { id: "emotion-13", label: "verdoofd (vlak)" },
      { id: "emotion-14", label: "gevoel dat je niet aanwezig bent" },
      { id: "emotion-15", label: "stemmingswisselingen" },
    ],
  },
];

export const BURNOUT_RESEARCH_INTRO =
  "We zouden jouw testresultaat graag anoniem gebruiken voor onderzoek. Het onderzoek is erop gericht om meer bekendheid te verkrijgen over de klachten die mensen ervaren bij stress. De missie is om meer bewustzijn over stress en stress management de wereld in te brengen. Wil je hiertoe een bijdrage leveren? Beantwoord dan de volgende vier demografische vragen.";

export const BURNOUT_DEMOGRAPHIC_QUESTIONS: BurnoutDemographicQuestion[] = [
  {
    id: "gender",
    label: "Ben je een man of een vrouw?",
    required: true,
    options: [
      { id: "man", label: "Man" },
      { id: "vrouw", label: "Vrouw" },
      { id: "geen-antwoord", label: "Dat deel ik liever niet" },
    ],
  },
  {
    id: "employment",
    label: "Ben je ondernemer of werknemer?",
    required: true,
    options: [
      { id: "dienstverband", label: "In dienstverband" },
      { id: "ondernemer", label: "Ondernemer" },
      { id: "geen-antwoord", label: "Dat deel ik liever niet" },
    ],
  },
  {
    id: "age",
    label: "Wat is je leeftijd?",
    required: true,
    options: [
      { id: "onder-16", label: "<16" },
      { id: "16-23", label: "16-23" },
      { id: "24-35", label: "24-35" },
      { id: "36-50", label: "36-50" },
      { id: "boven-50", label: ">50" },
      { id: "geen-antwoord", label: "Wil ik niet delen" },
    ],
  },
  {
    id: "education",
    label: "Wat is je opleidingsniveau?",
    required: true,
    options: [
      { id: "mbo", label: "MBO" },
      { id: "hbo", label: "HBO" },
      { id: "wo", label: "WO" },
      { id: "anders", label: "Anders" },
      { id: "geen-antwoord", label: "Dat deel ik liever niet" },
    ],
  },
];

export const BURNOUT_PRIVACY_POLICY_URL =
  "https://waldacoaching.nl/privacy-verklaring/";

export const BURNOUT_RESULTS: BurnoutResult[] = [
  {
    id: "1-4",
    min: 1,
    max: 4,
    title: "geen stress",
    body: [
      "Je hebt aangegeven dat 1 tot 4 van de klachten & symptomen bij jou voorkomen.",
      "Als dat 100% klopt, helemaal goed en ga vooral door zoals je het doet. No stress 😉",
      "Of wellicht was je nieuwsgierig voor iemand anders. Dan wil ik je vragen om diegene [de test](https://www.burnout-test.nl/) zelf te laten invullen. Dit zou nog wel eens een belangrijk punt in het herstelproces kunnen zijn.",
    ],
    signature: {
      name: "Kirsten Nelis",
      titles: "[[burn-out coach]] / [[leiderschapscoach]] / ervaringsdeskundige",
      link: {
        label: "Over Kirsten.",
        href: "http://www.kirstennelis.nl/over-kirsten-nelis-burn-out-coach/",
      },
    },
  },
  {
    id: "5-7",
    min: 5,
    max: 7,
    title: "Een beetje stress",
    body: [
      "Zorg dat je jezelf in de gaten houdt en zoek hulp als je er zelf niet uitkomt.",
      "Ik zou je daarbij kunnen helpen als coach. Individueel of door middel van een van mijn online programma's.",
    ],
    stressExplanation: [
      "Jouw stress-systeem heeft een te lange tijd constant 'aan' gestaan waardoor je op jouw reserve batterij hebt ingeteerd. In deze tijd verergeren de stressklachten: ze worden zwaarder, komen vaker voor en ook het aantal breidt zich uit. Als je doorgaat op de manier waarop je hier gekomen bent, zullen de stressklachten zich verder verergeren. Kom dus nu in actie en start met jouw herstel.",
    ],
    signature: {
      name: "Kirsten Nelis",
      titles:
        "[[burn-out coach]] & leiderschapscoach (2015) & ervaringsdeskundige (2010)",
      link: {
        label: "Meer over Kirsten",
        href: "http://www.kirstennelis.nl/over-kirsten-nelis-burn-out-coach/",
      },
    },
  },
  {
    id: "8-10",
    min: 8,
    max: 10,
    title: "Chronische stress",
    body: [
      "Jouw stress levels vragen de aandacht. In deze situatie teer je in op jouw reserves. Maar je bent op tijd om in te grijpen. Wacht niet om deze situatie te verbeteren om overspannenheid of burn-out te voorkomen.",
      "Ik zou je daarbij kunnen helpen als coach. Individueel of door middel van een van mijn online programma's.",
    ],
    stressExplanation: [
      "Jouw stress-systeem heeft een te lange tijd constant 'aan' gestaan waardoor je op jouw reserve batterij hebt ingeteerd. In deze tijd verergeren de stressklachten: ze worden zwaarder, komen vaker voor en ook het aantal breidt zich uit. Als je doorgaat op de manier waarop je hier gekomen bent, zullen de stressklachten zich verder verergeren. Kom dus nu in actie en start met jouw herstel.",
    ],
    signature: {
      name: "Kirsten Nelis",
      titles:
        "[[burn-out coach]] & leiderschapscoach (2015) & ervaringsdeskundige (2010)",
      link: {
        label: "Meer over Kirsten",
        href: "http://www.kirstennelis.nl/over-kirsten-nelis-burn-out-coach/",
      },
    },
    showEmailNote: true,
  },
  {
    id: "11+",
    min: 11,
    max: null,
    title: "Chronische stress — significant risico",
    body: [
      "Jouw uitslag: chronische stress waarbij het risico significant is om overspannen of [[overwerkt]] te raken. Kom dus nu in actie om jouw stress levels te verlagen. In deze situatie is het raadzaam om hulp in te schakelen van een coach of iemand die gespecialiseerd is stress management & burn-out preventie.",
      "Ik zou je daarbij kunnen helpen als coach. Individueel of door middel van een van mijn online programma's.",
    ],
    signature: {
      name: "Geert-Jan Walda",
      titles: "",
    },
  },
];

export function getAllSymptomIds(): string[] {
  return BURNOUT_SYMPTOM_CATEGORIES.flatMap((category) =>
    category.symptoms.map((symptom) => symptom.id),
  );
}

export function countSelectedSymptoms(selected: Set<string>): number {
  return selected.size;
}

export function getResultForSymptomCount(count: number): BurnoutResult {
  if (count <= 0) {
    return {
      id: "1-4",
      min: 0,
      max: 0,
      title: "geen stress",
      body: [
        "Je hebt geen klachten aangevinkt. Als dat klopt, helemaal goed en ga vooral door zoals je het doet. No stress 😉",
      ],
      signature: {
        name: "Kirsten Nelis",
        titles: "[[burn-out coach]] / [[leiderschapscoach]] / ervaringsdeskundige",
        link: {
          label: "Over Kirsten.",
          href: "http://www.kirstennelis.nl/over-kirsten-nelis-burn-out-coach/",
        },
      },
    };
  }

  if (count <= 4) {
    return BURNOUT_RESULTS[0];
  }
  if (count <= 7) {
    return BURNOUT_RESULTS[1];
  }
  if (count <= 10) {
    return BURNOUT_RESULTS[2];
  }
  return BURNOUT_RESULTS[3];
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
