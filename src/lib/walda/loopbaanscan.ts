/** Walda Loopbaanscan — drielaags progressief instrument */

export const LOOPBAANSCAN_BANNER = {
  src: "https://waldacoaching.nl/wp-content/uploads/2024/09/Obsidian-Banner-Walda-Coaching-2024.png",
  positionX: 0.51741,
};

export const ATTENTION_THRESHOLD = 2.8;
/** Soft threshold: relatief lager, wel advies maar nog geen harde module-trigger */
export const SOFT_ATTENTION_THRESHOLD = 3.2;
export const MEANINGFUL_CHANGE = 0.5;
export const LIKERT_MIN = 1;
export const LIKERT_MAX = 5;

export const QUICKSCAN_INSTRUCTION =
  "Deze scan geeft jou en je begeleider een beeld van waar je nu staat in je werk en loopbaan. Er zijn geen goede of foute antwoorden. Geef aan hoe het er voor jou op dit moment uitziet, niet hoe je denkt dat het zou moeten zijn. De scan duurt ongeveer 10 minuten.";

export const LIKERT_LABELS: Record<number, string> = {
  1: "Helemaal niet / zelden",
  2: "Soms",
  3: "Regelmatig",
  4: "Vaak",
  5: "(Bijna) altijd",
};

export type BlockId = "A" | "B" | "C" | "D" | "E" | "F";
export type ModuleId = "M1" | "M2" | "M3" | "M4" | "M5";
export type SignalLevel = "ok" | "attention" | "urgent";
export type MeasurementMoment = "T0" | "T1" | "T2";

export interface TargetGroup {
  id: number;
  name: string;
  profile: string;
  coreQuestion: string;
  recognition: string[];
}

export interface LikertQuestion {
  id: string;
  text: string;
  /** Negatief geformuleerd: score wordt gespiegeld vóór verwerking */
  reverse: boolean;
}

export interface QuickscanBlock {
  id: BlockId;
  title: string;
  description: string;
  questions: LikertQuestion[];
  relatedModules: ModuleId[];
}

export interface OpenQuestion {
  id: string;
  text: string;
  hint: string;
  type: "text" | "choice";
  options?: { id: string; label: string }[];
}

export interface ChoiceOption {
  id: string;
  label: string;
}

export type ModuleQuestionType =
  | "likert"
  | "open"
  | "choice"
  | "multi"
  | "scale10"
  | "agree";

export interface ModuleQuestion {
  id: string;
  text: string;
  type: ModuleQuestionType;
  reverse?: boolean;
  options?: ChoiceOption[];
  maxSelections?: number;
  hint?: string;
}

export interface DeepeningModule {
  id: ModuleId;
  title: string;
  forTargetGroups: number[];
  triggerBlocks: BlockId[];
  description: string;
  questions: ModuleQuestion[];
}

export interface ProgressItem {
  id: string;
  text: string;
  reverse: boolean;
  block: BlockId;
}

export interface SignalProfile {
  id: string;
  name: string;
  core: string;
  targetGroupIds: number[];
  match: (scores: Record<BlockId, number>, answers: Record<string, number>) => boolean;
  /** Advies voor de cliënt (zichtbaar op de uitslag) */
  clientAdvice: string[];
  interventions: string[];
}

export interface ClientReportClosingQuestion {
  id: string;
  text: string;
}

export const TARGET_GROUPS: TargetGroup[] = [
  {
    id: 1,
    name: "De Functionerende Leegloper",
    profile:
      "Heeft objectief een goede baan, presteert goed, maar voelt innerlijk weinig. De zondagavond is zwaar.",
    coreQuestion: "Waarom voelt een goede baan toch leeg?",
    recognition: [
      "Kan niet uitleggen waarom het niet goed voelt",
      "Schaamt zich voor het gevoel",
      "Functioneert op de automatische piloot",
      'Vraagt: "Is dit het nu?"',
    ],
  },
  {
    id: 2,
    name: "De Succesvolle Vastloper",
    profile:
      "Succesvol in loopbaantermen, maar na het bereiken van het doel volgt verwarring in plaats van voldoening.",
    coreQuestion: "Waarom loop ik vast terwijl het van buiten zo goed lijkt te gaan?",
    recognition: [
      "Loopt vast juist ná een succesmoment",
      'Vraagt: "Waarvoor doe ik dit eigenlijk?"',
      "Succes voelt als een kooi",
      "Buitenwereld ziet geen probleem; persoon wel",
    ],
  },
  {
    id: 3,
    name: "De Loopbaantwijfelaar",
    profile:
      "Twijfelt openlijk of de huidige functie of sector nog past. Weet vaak beter wat hij niet meer wil dan wat hij wél wil.",
    coreQuestion: "Welke baan past bij mij?",
    recognition: [
      'Is al een tijd "bezig" zonder stap te zetten',
      "Heeft meerdere tests gedaan zonder helderheid",
      "Zoekt de perfecte keuze",
      "Bang voor een verkeerde keuze",
    ],
  },
  {
    id: 4,
    name: "De Overbelaste",
    profile:
      "Werkt te hard, te lang, voor te veel mensen. De kern is uitputting; loopbaantwijfel kan secundair zijn.",
    coreQuestion: "Moet ik weg, of moet ik eerst herstellen?",
    recognition: [
      "Voelt leegte ook privé",
      "Vraagt loopbaanhulp terwijl herstel eerst nodig is",
      "Zegt moeilijk nee",
      'Wil "ontsnappen" via een nieuwe baan',
    ],
  },
  {
    id: 5,
    name: "De Waardenbotser",
    profile:
      "Werkt in een omgeving die botst met wat hij wezenlijk belangrijk vindt.",
    coreQuestion: "Botst mijn werk structureel met wie ik ben?",
    recognition: [
      "Spreekt over cynisme en vervreemding",
      "Heeft zich lange tijd aangepast",
      "Klacht lijkt werkdruk; kern is waardenconflict",
      "Vraagt of hij nog achter zijn manier van werken kan staan",
    ],
  },
  {
    id: 6,
    name: "De Levensfasewisselaar",
    profile:
      "Heeft jaren in dezelfde richting gewerkt. De keuze klopte ooit, maar persoon of functie is veranderd.",
    coreQuestion: "Mijn werk paste ooit, maar past het nu nog?",
    recognition: [
      "Het werk klopt niet meer, maar weet niet waarom",
      "Behoeften zijn verschoven",
      "Organisatie of persoon is veranderd",
      "Raakt aan identiteit: wie ben ik als ik dit loslaat?",
    ],
  },
  {
    id: 7,
    name: "De Patroonherhaler",
    profile:
      "Wisselt van baan en loopt telkens op hetzelfde vast, of maakt keuzes op basis van wat anderen verwachten.",
    coreQuestion: "Wat is mijn patroon, en hoe doorbreek ik het?",
    recognition: [
      "Frisse starts, zelfde patroon keert terug",
      "Keuzes op basis van verwachtingen van anderen",
      "Weet niet wat hij zelf wil vs. behoort te willen",
      "Moeite om eigen oordeel te vertrouwen",
    ],
  },
];

export const QUICKSCAN_BLOCKS: QuickscanBlock[] = [
  {
    id: "A",
    title: "Betrokkenheid en energie",
    description: "Signaleert leegte en betekenisverlies",
    relatedModules: ["M1"],
    questions: [
      {
        id: "A1",
        text: "Als ik aan mijn werkdag denk, merk ik dat ik er energie van krijg.",
        reverse: false,
      },
      {
        id: "A2",
        text: "Ik doe mijn werk goed, maar het raakt mij nauwelijks nog.",
        reverse: true,
      },
      {
        id: "A3",
        text: "Ik weet waarom mijn werk ertoe doet, en dat motiveert mij.",
        reverse: false,
      },
      {
        id: "A4",
        text: "De zondagavond of het begin van de werkweek voel ik als zwaar.",
        reverse: true,
      },
      {
        id: "A5",
        text: "Er zijn momenten in mijn werk waarop ik helemaal opgaan in wat ik doe.",
        reverse: false,
      },
    ],
  },
  {
    id: "B",
    title: "Passendheid van het werk",
    description: "Signaleert mismatch persoon–functie",
    relatedModules: ["M1", "M2"],
    questions: [
      {
        id: "B1",
        text: "Mijn werk sluit aan bij wie ik nu ben, niet alleen bij wie ik was toen ik begon.",
        reverse: false,
      },
      {
        id: "B2",
        text: "Ik kan in mijn werk een deel van mijzelf laten zien dat ik belangrijk vind.",
        reverse: false,
      },
      {
        id: "B3",
        text: "Mijn functie past goed bij mijn behoeften op dit moment in mijn leven.",
        reverse: false,
      },
      {
        id: "B4",
        text: "Ik merk dat ik op mijn werk voortdurend een kant van mijzelf verberg of onderdrukt houd.",
        reverse: true,
      },
      {
        id: "B5",
        text: "Mijn werk vraagt precies genoeg van wat ik écht goed kan en wil gebruiken.",
        reverse: false,
      },
    ],
  },
  {
    id: "C",
    title: "Waarden en organisatie",
    description: "Signaleert waardenconflict",
    relatedModules: ["M2"],
    questions: [
      {
        id: "C1",
        text: "In mijn werk kan ik handelen op een manier die ik zelf goed vind.",
        reverse: false,
      },
      {
        id: "C2",
        text: "De manier waarop hier wordt gewerkt botst met wat ik belangrijk vind.",
        reverse: true,
      },
      {
        id: "C3",
        text: "Ik kan in mijn functie de kwaliteit leveren die ik mijzelf stel.",
        reverse: false,
      },
      {
        id: "C4",
        text: "Ik herken mijzelf in de waarden die mijn organisatie uitdraagt.",
        reverse: false,
      },
    ],
  },
  {
    id: "D",
    title: "Belasting en herstel",
    description: "Signaleert overbelasting",
    relatedModules: ["M3"],
    questions: [
      {
        id: "D1",
        text: "Ik heb na het werk voldoende energie voor andere dingen die mij belangrijk zijn.",
        reverse: false,
      },
      {
        id: "D2",
        text: "Ik merk dat ik taken op mij neem die eigenlijk niet van mij zijn.",
        reverse: true,
      },
      {
        id: "D3",
        text: 'Ik kan "nee" zeggen wanneer mijn grens wordt bereikt.',
        reverse: false,
      },
      {
        id: "D4",
        text: "De vermoeidheid die ik voel, komt door mijn werk én door privé-omstandigheden.",
        reverse: true,
      },
      {
        id: "D5",
        text: "Ik herstel voldoende tussen werkdagen en werkweken.",
        reverse: false,
      },
    ],
  },
  {
    id: "E",
    title: "Autonomie en omgeving",
    description: "Signaleert autonomietekort of omgevingsmismatch",
    relatedModules: ["M4"],
    questions: [
      {
        id: "E1",
        text: "Ik heb voldoende ruimte om mijn werk op mijn eigen manier te doen.",
        reverse: false,
      },
      {
        id: "E2",
        text: "Ik voel mij thuis in de cultuur van mijn werkomgeving.",
        reverse: false,
      },
      {
        id: "E3",
        text: "Ik kan in mijn werk invloed uitoefenen op wat er gebeurt.",
        reverse: false,
      },
      {
        id: "E4",
        text: "Ik voel mij gezien en gehoord door de mensen om mij heen op het werk.",
        reverse: false,
      },
    ],
  },
  {
    id: "F",
    title: "Loopbaanbeweging en keuzebereidheid",
    description: "Signaleert verlamming, zoekgedrag, patroonherhaling",
    relatedModules: ["M2", "M5"],
    questions: [
      {
        id: "F1",
        text: "Ik weet wat ik wél wil in mijn werk, niet alleen wat ik niet meer wil.",
        reverse: false,
      },
      {
        id: "F2",
        text: "Ik stel verandering in mijn werk of loopbaan uit, omdat ik nog niet zeker genoeg ben.",
        reverse: true,
      },
      {
        id: "F3",
        text: "Ik herken mezelf in het idee dat ik blijf waar ik ben vanwege wat ik zou verliezen.",
        reverse: true,
      },
      {
        id: "F4",
        text: "Mijn loopbaankeuzes worden mede bepaald door wat anderen van mij verwachten.",
        reverse: true,
      },
      {
        id: "F5",
        text: "Ik vertrouw erop dat ik een passende volgende stap kan zetten, ook zonder volledige zekerheid.",
        reverse: false,
      },
    ],
  },
];

export const OPEN_QUESTIONS: OpenQuestion[] = [
  {
    id: "Q1",
    text: "Wat bracht jou ertoe om nu begeleiding te zoeken?",
    hint: "Open, 2–5 zinnen",
    type: "text",
  },
  {
    id: "Q2",
    text: "Als je in één zin zou zeggen wat je het meest mist in je werk op dit moment, wat zou dat zijn?",
    hint: "Open, 1 zin",
    type: "text",
  },
  {
    id: "Q3",
    text: "Hoe lang speelt dit gevoel al?",
    hint: "Kies één optie",
    type: "choice",
    options: [
      { id: "lt3m", label: "Minder dan 3 maanden" },
      { id: "3-6m", label: "3–6 maanden" },
      { id: "6-12m", label: "6–12 maanden" },
      { id: "gt1y", label: "Langer dan 1 jaar" },
      { id: "gt3y", label: "Langer dan 3 jaar" },
    ],
  },
];

export const WORK_VALUES: ChoiceOption[] = [
  { id: "vrijheid", label: "Vrijheid" },
  { id: "verbinding", label: "Verbinding" },
  { id: "rechtvaardigheid", label: "Rechtvaardigheid" },
  { id: "zorgzaamheid", label: "Zorgzaamheid" },
  { id: "vakmanschap", label: "Vakmanschap" },
  { id: "groei", label: "Groei" },
  { id: "eerlijkheid", label: "Eerlijkheid" },
  { id: "autonomie", label: "Autonomie" },
  { id: "creativiteit", label: "Creativiteit" },
  { id: "betrouwbaarheid", label: "Betrouwbaarheid" },
  { id: "maatschappelijk", label: "Maatschappelijke bijdrage" },
  { id: "rust", label: "Rust" },
  { id: "erkenning", label: "Erkenning" },
  { id: "invloed", label: "Invloed" },
  { id: "veiligheid", label: "Veiligheid" },
];

export const DEEPENING_MODULES: DeepeningModule[] = [
  {
    id: "M1",
    title: "Betekenis & Betrokkenheid",
    forTargetGroups: [1, 2, 5],
    triggerBlocks: ["A", "B"],
    description:
      "Verdieping bij leegte, betekenisverlies of persoon–functiemismatch.",
    questions: [
      {
        id: "M1-1",
        text: "Op welke momenten in mijn werk weet ik echt waarom ik dit doe? Beschrijf een recent voorbeeld.",
        type: "open",
      },
      {
        id: "M1-2",
        text: "Het gevoel dat mijn werk ertoe doet, is de afgelopen tijd:",
        type: "choice",
        options: [
          { id: "sterker", label: "Sterker geworden" },
          { id: "onveranderd", label: "Onveranderd gebleven" },
          { id: "zwakker", label: "Zwakker geworden" },
          { id: "verdwenen", label: "Verdwenen" },
        ],
      },
      {
        id: "M1-3",
        text: "Ik weet voor wie mijn werk van waarde is.",
        type: "likert",
      },
      {
        id: "M1-4",
        text: "Mijn werk geeft mij het gevoel dat ik ergens aan bijdraag.",
        type: "likert",
      },
      {
        id: "M1-5",
        text: "De resultaten die ik bereik in mijn werk, geven mij voldoening.",
        type: "likert",
      },
      {
        id: "M1-6",
        text: "Ik doe mijn werk goed, maar het raakt mij niet meer zoals vroeger.",
        type: "likert",
        reverse: true,
      },
      {
        id: "M1-7",
        text: "Wanneer ik denk aan wat ik vroeger wilde bijdragen met mijn werk, herken ik dat nog in mijn huidige functie.",
        type: "likert",
      },
      {
        id: "M1-8",
        text: "Buiten het werk vind ik wel betekenis (in relaties, vrijwilligerswerk, creativiteit, etc.).",
        type: "likert",
      },
      {
        id: "M1-9",
        text: "Wat was de laatste keer dat je werk je echt raakte? Wat gebeurde er precies?",
        type: "open",
      },
      {
        id: "M1-10",
        text: "Als je kijkt naar je werk van de afgelopen zes maanden: welk moment gaf je de meeste voldoening, en waarom?",
        type: "open",
      },
    ],
  },
  {
    id: "M2",
    title: "Waarden & Identiteit",
    forTargetGroups: [5, 6, 7],
    triggerBlocks: ["C", "F"],
    description:
      "Verdieping bij waardenconflict, levensfasewisseling of externe sturing.",
    questions: [
      {
        id: "M2-1",
        text: "Hieronder staan waarden. Kies de drie die voor jou het meest leidend zijn in je werk:",
        type: "multi",
        options: WORK_VALUES,
        maxSelections: 3,
      },
      {
        id: "M2-2",
        text: "In welke mate komen deze drie waarden terug in jouw dagelijkse werk?",
        type: "choice",
        options: [
          { id: "nauwelijks", label: "Nauwelijks" },
          { id: "beetje", label: "Een beetje" },
          { id: "redelijk", label: "Redelijk" },
          { id: "grotendeels", label: "Grotendeels" },
          { id: "volledig", label: "Volledig" },
        ],
      },
      {
        id: "M2-3",
        text: "Er zijn momenten waarop ik moet handelen op een manier die botst met wat ik zelf belangrijk vind.",
        type: "likert",
        reverse: true,
      },
      {
        id: "M2-4",
        text: "Als ik eerlijk naar mijzelf kijk: maak ik mijn loopbaankeuzes op basis van wat ík wil, of op basis van wat van mij verwacht wordt?",
        type: "choice",
        options: [
          { id: "altijd-zelf", label: "Vrijwel altijd op basis van wat ik zelf wil" },
          { id: "overwegend-zelf", label: "Overwegend wat ik zelf wil" },
          { id: "mix", label: "Mix van beide" },
          { id: "overwegend-verwacht", label: "Overwegend wat van mij wordt verwacht" },
          { id: "altijd-verwacht", label: "Vrijwel altijd wat van mij wordt verwacht" },
        ],
      },
      {
        id: "M2-5",
        text: "Ik vind het moeilijk om mij voor te stellen wie ik ben buiten mijn huidige functie of beroep.",
        type: "likert",
        reverse: true,
      },
      {
        id: "M2-6",
        text: "Als ik aan een grote loopbaanstap denk, houdt mij het meest tegen:",
        type: "choice",
        options: [
          { id: "anderen", label: "Angst voor wat anderen denken" },
          { id: "loslaten", label: "Angst om eerder gemaakte keuzes los te laten" },
          { id: "financieel", label: "Financiële zekerheid" },
          { id: "onduidelijk", label: "Onduidelijkheid over wat ik wil" },
          { id: "twijfel", label: "Twijfel aan mijzelf" },
          { id: "anders", label: "Iets anders" },
        ],
      },
      {
        id: "M2-7",
        text: "Mijn werk vroeger paste beter bij wie ik was. Nu merk ik dat ik ben veranderd, maar mijn werk niet.",
        type: "agree",
        options: [
          { id: "helemaal-niet", label: "Helemaal niet mee eens" },
          { id: "enigszins", label: "Enigszins" },
          { id: "neutraal", label: "Neutraal" },
          { id: "grotendeels", label: "Grotendeels mee eens" },
          { id: "volledig", label: "Volledig mee eens" },
        ],
      },
      {
        id: "M2-8",
        text: "Beschrijf in één of twee zinnen: wie wil jij zijn in je werk? Niet wat je doet, maar hoe je wil staan in je werk.",
        type: "open",
      },
    ],
  },
  {
    id: "M3",
    title: "Belasting, Herstel & Grenzen",
    forTargetGroups: [4],
    triggerBlocks: ["D"],
    description:
      "Verdieping bij overbelasting — eerst herstel, dan loopbaankeuze.",
    questions: [
      {
        id: "M3-1",
        text: "Op een schaal van 1–10: hoe uitgeput voel jij je op dit moment, als je terugkijkt op de afgelopen maand?",
        type: "scale10",
      },
      {
        id: "M3-2",
        text: "De vermoeidheid die ik voel, heeft voor het grootste deel te maken met:",
        type: "choice",
        options: [
          { id: "werk-zelf", label: "Het werk zelf" },
          { id: "hoeveelheid", label: "De hoeveelheid werk" },
          { id: "relaties", label: "Relaties op het werk" },
          { id: "prive", label: "Privéomstandigheden" },
          { id: "combinatie", label: "Een combinatie" },
          { id: "weet-niet", label: "Ik weet het niet" },
        ],
      },
      {
        id: "M3-3",
        text: "Als ik zou weten dat mijn vermoeidheid volledig was hersteld, zou ik dan nog steeds loopbaantwijfels hebben?",
        type: "choice",
        options: [
          { id: "zeker", label: "Ja, zeker" },
          { id: "waarschijnlijk", label: "Waarschijnlijk wel" },
          { id: "weet-niet", label: "Ik weet het niet" },
          { id: "waarschijnlijk-niet", label: "Waarschijnlijk niet" },
          { id: "nee", label: "Nee, ik denk dat het dan weer zou kloppen" },
        ],
      },
      {
        id: "M3-4",
        text: "Ik neem verantwoordelijkheden op mij die eigenlijk niet van mij zijn.",
        type: "likert",
        reverse: true,
      },
      {
        id: "M3-5",
        text: 'Als ik "nee" zeg op het werk, voel ik:',
        type: "choice",
        options: [
          { id: "niets", label: "Niets bijzonders" },
          { id: "onrust", label: "Lichte onrust" },
          { id: "schuld", label: "Schuldgevoel" },
          { id: "angst", label: "Sterke angst om iemand teleur te stellen" },
          { id: "kan-niet", label: "Ik kan eigenlijk geen nee zeggen" },
        ],
      },
      {
        id: "M3-6",
        text: "Er zijn taken in mijn werk waar ik energie van krijg, ook nu.",
        type: "likert",
      },
      {
        id: "M3-7",
        text: "Welke taken zijn dat?",
        type: "open",
      },
      {
        id: "M3-8",
        text: "Wat zou er moeten veranderen om jouw belasting te verminderen? Is dat iets in jezelf, in je werk, of allebei?",
        type: "open",
      },
    ],
  },
  {
    id: "M4",
    title: "Autonomie, Omgeving & Verbondenheid",
    forTargetGroups: [1, 6],
    triggerBlocks: ["E"],
    description:
      "Verdieping bij autonomietekort of omgevingsmismatch.",
    questions: [
      {
        id: "M4-1",
        text: "Ik heb het gevoel dat ik mijn expertise en ervaring werkelijk kan inzetten.",
        type: "likert",
      },
      {
        id: "M4-2",
        text: "Beslissingen worden in mijn omgeving genomen zonder dat ik daar invloed op heb, terwijl ik dat wel wil.",
        type: "likert",
        reverse: true,
      },
      {
        id: "M4-3",
        text: "Er is iemand op mijn werk met wie ik werkelijk kan overleggen, ook over moeilijkere dingen.",
        type: "likert",
      },
      {
        id: "M4-4",
        text: "Ik pas mij op het werk voortdurend aan aan anderen, ten koste van mezelf.",
        type: "likert",
        reverse: true,
      },
      {
        id: "M4-5",
        text: "De cultuur van mijn organisatie past bij mijn manier van werken en zijn.",
        type: "likert",
      },
      {
        id: "M4-6",
        text: "Als ik eerlijk kijk: gaat het mij om een ander beroep, of om een andere werkomgeving?",
        type: "choice",
        options: [
          { id: "beroep", label: "Ander beroep" },
          { id: "omgeving", label: "Andere werkomgeving" },
          { id: "allebei", label: "Allebei" },
          { id: "weet-niet", label: "Ik weet het nog niet" },
        ],
      },
      {
        id: "M4-7",
        text: "Beschrijf de werkomgeving waarin jij het beste tot je recht komt. Denk aan cultuur, leiderschapsstijl, teamsamenstelling, vrijheid en structuur.",
        type: "open",
      },
    ],
  },
  {
    id: "M5",
    title: "Loopbaankeuze & Besluitvorming",
    forTargetGroups: [3, 7],
    triggerBlocks: ["F"],
    description:
      "Verdieping bij keuzeangst, verlamming of patroonherhaling.",
    questions: [
      {
        id: "M5-1",
        text: "Ik heb al eerder een loopbaanstap gezet om vergelijkbare redenen als nu.",
        type: "choice",
        options: [
          { id: "nee", label: "Nee" },
          { id: "een", label: "Eén keer eerder" },
          { id: "meerdere", label: "Meerdere keren" },
        ],
      },
      {
        id: "M5-2",
        text: "Wanneer ik op die vorige stap terugkijk: loste die het echte probleem op?",
        type: "choice",
        options: [
          { id: "volledig", label: "Ja, volledig" },
          { id: "grotendeels", label: "Grotendeels" },
          { id: "gedeeltelijk", label: "Gedeeltelijk" },
          { id: "nauwelijks", label: "Nauwelijks" },
          { id: "nee", label: "Nee" },
          { id: "nvt", label: "Niet van toepassing" },
        ],
      },
      {
        id: "M5-3",
        text: "Ik weet wat ik zoek in een volgende stap, en kan dat concreet benoemen.",
        type: "likert",
      },
      {
        id: "M5-4",
        text: "Als ik denk aan wat ik niet meer wil, en dan vraag wat ik daarvoor in de plaats wil: wat komt er dan op?",
        type: "open",
      },
      {
        id: "M5-5",
        text: "Ik merk dat ik informatie blijf verzamelen zonder een stap dichter bij een keuze te komen.",
        type: "likert",
        reverse: true,
      },
      {
        id: "M5-6",
        text: "De voornaamste reden dat ik nog geen keuze heb gemaakt, is:",
        type: "choice",
        options: [
          { id: "informatie", label: "Onvoldoende informatie" },
          { id: "verlies", label: "Angst voor verlies" },
          { id: "oordeel", label: "Angst voor oordeel van anderen" },
          { id: "financieel", label: "Financiële druk" },
          { id: "onduidelijk", label: "Onduidelijkheid over wat ik wil" },
          { id: "moment", label: "Ik wacht op het juiste moment" },
          { id: "anders", label: "Iets anders" },
        ],
      },
      {
        id: "M5-7",
        text: "Wat zou een kleine, omkeerbare stap zijn die jij nu zou kunnen zetten om meer duidelijkheid te krijgen?",
        type: "open",
      },
      {
        id: "M5-8",
        text: "Als ik over vijf jaar terugkijk op dit moment: wat zou ik mezelf toewensen dat ik nu had gedaan?",
        type: "open",
      },
    ],
  },
];

export const PROGRESS_ITEMS: ProgressItem[] = [
  { id: "V1", text: "Mijn werk geeft mij voldoende energie.", reverse: false, block: "A" },
  {
    id: "V2",
    text: "Ik weet wat ik nodig heb om goed te kunnen functioneren in mijn werk.",
    reverse: false,
    block: "B",
  },
  {
    id: "V3",
    text: "Ik doe mijn werk goed, maar het raakt mij nauwelijks nog.",
    reverse: true,
    block: "A",
  },
  {
    id: "V4",
    text: "Mijn werk sluit voldoende aan bij wie ik nu ben.",
    reverse: false,
    block: "B",
  },
  {
    id: "V5",
    text: "Ik kan in mijn werk handelen op een manier die ik zelf goed vind.",
    reverse: false,
    block: "C",
  },
  { id: "V6", text: "Ik herstel voldoende van mijn werk.", reverse: false, block: "D" },
  {
    id: "V7",
    text: "Ik kan grenzen stellen wanneer dat nodig is.",
    reverse: false,
    block: "D",
  },
  {
    id: "V8",
    text: "Ik heb ruimte om mijn werk op mijn eigen manier te doen.",
    reverse: false,
    block: "E",
  },
  {
    id: "V9",
    text: "Ik weet wat ik wil, niet alleen wat ik niet meer wil.",
    reverse: false,
    block: "F",
  },
  {
    id: "V10",
    text: "Ik voel mij gezien en gehoord in mijn werkomgeving.",
    reverse: false,
    block: "E",
  },
  {
    id: "V11",
    text: "Ik vertrouw erop dat ik een passende volgende stap kan zetten.",
    reverse: false,
    block: "F",
  },
  {
    id: "V12",
    text: "Ik stel besluiten of stappen uit uit angst voor een verkeerde keuze.",
    reverse: true,
    block: "F",
  },
];

export const REFLECTION_QUESTIONS: OpenQuestion[] = [
  {
    id: "R1",
    text: "Wat is er in de afgelopen periode veranderd in hoe jij je verhoudt tot je werk of loopbaan?",
    hint: "Open, 3–6 zinnen",
    type: "text",
  },
  {
    id: "R2",
    text: "Welke stap of inzicht heeft jou het meest geholpen?",
    hint: "Open, 2–4 zinnen",
    type: "text",
  },
  {
    id: "R3",
    text: "Wat is op dit moment de meest concrete volgende stap die voor jou helder is?",
    hint: "Open, 1–3 zinnen",
    type: "text",
  },
];

export const REPORT_CLOSING_QUESTIONS: ClientReportClosingQuestion[] = [
  {
    id: "close-1",
    text: "Wat geeft mij energie in mijn werk, en onder welke omstandigheden?",
  },
  {
    id: "close-2",
    text: "Welke signalen herken ik wanneer ik mijn grens nader?",
  },
  {
    id: "close-3",
    text: "Wanneer is het tijd om opnieuw stil te staan bij wat ik nodig heb?",
  },
];

export const SIGNAL_PROFILES: SignalProfile[] = [
  {
    id: "leegte",
    name: "Leegte bij goede omstandigheden",
    core: "Betekenisverlies zonder overbelasting. Functionerende leegloper.",
    targetGroupIds: [1, 2],
    match: (scores) => scores.A <= ATTENTION_THRESHOLD && scores.D > ATTENTION_THRESHOLD,
    clientAdvice: [
      "Je functioneert waarschijnlijk goed, maar voelt weinig echte betrokkenheid. Dat is een serieus signaal, geen luxeprobleem.",
      "Onderzoek wanneer je werk wél energie geeft: welke taken, mensen of momenten zijn dat?",
      "Stel de vraag: wat zou ik willen dat mijn werk betekent — niet alleen wat ik goed kan?",
      "Begin met kleine experimenten in je huidige rol voordat je grote loopbaanstappen overweegt.",
    ],
    interventions: [
      "Normaliseer het gevoel. Benoem dat functioneren en leven niet hetzelfde zijn.",
      "Verken de tijdlijn: wanneer begon het, wat veranderde er?",
      "Onderzoek uitzonderingen: wanneer is het er minder? Welke taken geven nog energie?",
      "Verdiep op waarden: wat vond iemand vroeger belangrijk, wat nu?",
      "Verken de kloof tussen de professionele rol en de persoon.",
      "Kleine experimenten: wat kan er anders, ook zonder de baan te verlaten?",
      "Beslissing: blijven en anders kijken / werk aanpassen / vertrekken.",
    ],
  },
  {
    id: "overbelasting",
    name: "Overbelasting met loopbaanvraag vermengd",
    core: "Loopbaantwijfel die mogelijk voortkomt uit uitputting. Niet meteen loopbaanstap zetten.",
    targetGroupIds: [4],
    match: (scores, answers) =>
      scores.D <= ATTENTION_THRESHOLD && (answers.F3 ?? 1) >= 4,
    clientAdvice: [
      "Herstel heeft nu voorrang op een loopbaankeuze. Uitputting maakt het moeilijk om helder te weten wat je wilt.",
      "Kijk eerst naar grenzen: waar zeg je te laat of te weinig 'nee'?",
      "Vraag je af: als ik uitgerust was, zou ik dan nog steeds weg willen?",
      "Werk samen met je begeleider aan een herstelplan voordat je grote stappen zet.",
    ],
    interventions: [
      "Prioriteit: herstelplan voor overbelasting, niet direct loopbaankeuze.",
      "Grensdynamiek onderzoeken: welk patroon zorgt voor de overbelasting?",
      "Psycho-educatie: uitgeputte mensen kunnen geen goede loopbaankeuzes maken.",
      "Pas als de belasting afneemt: is de loopbaanvraag er nog? In welke vorm?",
      "Module 3 inzetten voor verdieping.",
      "Grenstraining als onderdeel van het traject.",
    ],
  },
  {
    id: "waarden",
    name: "Waardenconflict",
    core: "De omgeving botst structureel met wie de persoon is.",
    targetGroupIds: [5],
    match: (scores) => scores.C <= ATTENTION_THRESHOLD,
    clientAdvice: [
      "Er lijkt een spanning te zitten tussen wat jij belangrijk vindt en hoe er op het werk wordt gewerkt.",
      "Maak expliciet welke waarden botsen — dat geeft richting aan wat er moet veranderen.",
      "Onderscheid: is het de organisatie, de sector, of vooral jouw specifieke functie?",
      "Verken of aanpassing binnen je huidige context nog mogelijk is, of dat een andere omgeving nodig is.",
    ],
    interventions: [
      "Maak het conflict expliciet: welke waarden worden geschonden?",
      "Onderscheid: is dit de organisatie, de sector, of de specifieke functie?",
      "Verken of aanpassing binnen huidige context mogelijk is.",
      "Zo niet: is vertrek noodzakelijk, of is er een andere context in hetzelfde vak?",
      "Identiteitswerk: wie wil iemand zijn in zijn werk?",
      "Module 2 inzetten voor verdieping.",
    ],
  },
  {
    id: "verlamming",
    name: "Verlamming en keuzeangst",
    core: "Weet wat hij niet wil, maar komt niet tot beweging. Zoekt zekerheid die er niet is.",
    targetGroupIds: [3],
    match: (_scores, answers) =>
      (answers.F2 ?? 1) >= 4 && (answers.F5 ?? 5) <= 2,
    clientAdvice: [
      "Je zoekt waarschijnlijk meer zekerheid dan er bij een loopbaanstap beschikbaar is.",
      "Onderscheid: mis je informatie, of houd je vooral spanning rond 'de verkeerde keuze'?",
      "Kies niet de perfecte stap, maar de volgende passende, omkeerbare stap.",
      "Formuleer één klein experiment dat je binnen twee weken kunt doen.",
    ],
    interventions: [
      'Benoem het patroon zonder oordeel: "Je bent al een tijdje aan het zoeken. Wat houdt je tegen?"',
      "Onderscheid informatietekort van keuzeangst.",
      "Perfectionisme en spijtvermijding onderzoeken.",
      "Goed-genoegkeuze introduceren: niet de perfecte stap, maar de volgende passende stap.",
      "Kleine experimenten inzetten: omkeerbare stappen die informatie geven.",
      "Module 5 inzetten voor verdieping.",
      "Besluitvormingspatroon onderzoeken: hoe maakt iemand normaal keuzes?",
    ],
  },
  {
    id: "patroon",
    name: "Patroonherhaling en externe sturing",
    core: "Keuzes worden gemaakt op basis van wat anderen verwachten. Patroon keert terug.",
    targetGroupIds: [7],
    match: (_scores, answers) => (answers.F4 ?? 1) >= 4,
    clientAdvice: [
      "Je keuzes lijken deels te worden gestuurd door wat anderen van je verwachten.",
      "Onderzoek je loopbaangeschiedenis: welke stappen waren echt van jou?",
      "Oefen met kleine zelfgestuurde keuzes — dat bouwt vertrouwen in je eigen oordeel.",
      "Stel de vraag: wat wil ík, versus wat behoor ik te willen?",
    ],
    interventions: [
      "Tijdlijn van loopbaan in kaart brengen: welke keuzes zijn gemaakt, en waarop gebaseerd?",
      "Patronen benoemen zonder veroordelen.",
      "Onderscheid wat iemand wil vs. wat iemand behoort te willen.",
      "Identiteitswerk: wie ben ik buiten de functie, de opleiding, de verwachting van anderen?",
      "Module 2 inzetten voor verdieping.",
      "Oefenen met kleine zelfgestuurde keuzes als tussenstap.",
    ],
  },
  {
    id: "levensfase",
    name: "Levensfasewisseling",
    core: "Persoon of werk is veranderd; de aansluiting is er niet meer.",
    targetGroupIds: [6],
    match: (scores, answers) =>
      scores.B <= ATTENTION_THRESHOLD && (answers.B1 ?? 5) <= 2,
    clientAdvice: [
      "Wat ooit paste, past nu minder — jij of je werk is veranderd.",
      "Erken wat je mist van vroeger; dat is geen zwakte, maar informatie.",
      "Breng in kaart wat nu belangrijk is: rust, betekenis, balans, groei?",
      "Zoek niet meteen de perfecte eindbaan, maar een passende volgende fase.",
    ],
    interventions: [
      "Verken de verandering: is de persoon veranderd, het werk, of allebei?",
      "Rouw erkennen: wat is er verloren gegaan? Wat mist iemand van vroeger?",
      "Behoeftenverschuiving in kaart brengen: wat was vroeger belangrijk, wat nu?",
      "Verken welke levensfase nu aan de orde is en wat die vraagt.",
      "Module 1 en Module 2 inzetten.",
      "Richting formuleren: niet de perfecte eindbaan, maar een passende volgende fase.",
    ],
  },
];

export const BLOCK_CLIENT_ADVICE: Record<BlockId, string[]> = {
  A: [
    "Je betrokkenheid en energie verdienen aandacht: werk kan goed gaan en toch leeg voelen.",
    "Zoek naar momenten waarop je wél opgaat in je werk — daar zit vaak een spoor van betekenis.",
  ],
  B: [
    "De aansluiting tussen wie je nu bent en je functie lijkt onder druk te staan.",
    "Vraag je af: past dit werk bij mijn huidige behoeften, of vooral bij wie ik was?",
  ],
  C: [
    "Er speelt mogelijk een waardenconflict met je werkomgeving.",
    "Benoeem wat voor jou niet-onderhandelbaar is in hoe je wilt werken.",
  ],
  D: [
    "Belasting en herstel vragen eerst aandacht voordat je grote loopbaankeuzes maakt.",
    "Herstel is geen uitstel van de vraag — het is een voorwaarde om de vraag goed te kunnen stellen.",
  ],
  E: [
    "Autonomie of verbondenheid in je omgeving lijkt niet goed te kloppen.",
    "Onderscheid: wil je ander werk, of vooral een andere manier van samenwerken?",
  ],
  F: [
    "Richting en keuzebereidheid verdienen aandacht: je weet mogelijk beter wat je niet wilt dan wat je wél wilt.",
    "Zet in op één kleine, omkeerbare stap in plaats van de perfecte keuze.",
  ],
};

export const STABLE_CLIENT_ADVICE: string[] = [
  "Je scores laten geen sterk aandachtsgebied zien. Dat betekent niet dat je vraag onbelangrijk is.",
  "Gebruik de open antwoorden en het gesprek met je begeleider om te verdiepen wat je toch hierheen bracht.",
  "Kijk naar de relatief laagste domeinen hieronder — daar zit vaak alsnog een bruikbaar aanknopingspunt.",
];

export interface ClientAdviceResult {
  profiles: SignalProfile[];
  targetGroups: TargetGroup[];
  advice: string[];
  softBlocks: BlockId[];
  hardBlocks: BlockId[];
  dominantLabel: string | null;
}

// ——— Scoring helpers ———

export function mirrorScore(score: number): number {
  return LIKERT_MAX + LIKERT_MIN - score;
}

export function effectiveScore(score: number, reverse: boolean): number {
  return reverse ? mirrorScore(score) : score;
}

export function getAllQuickscanQuestions(): LikertQuestion[] {
  return QUICKSCAN_BLOCKS.flatMap((block) => block.questions);
}

export function getQuestionById(id: string): LikertQuestion | undefined {
  return getAllQuickscanQuestions().find((q) => q.id === id);
}

export function calculateBlockScore(
  blockId: BlockId,
  answers: Record<string, number>,
): number | null {
  const block = QUICKSCAN_BLOCKS.find((b) => b.id === blockId);
  if (!block) return null;

  const values: number[] = [];
  for (const question of block.questions) {
    const raw = answers[question.id];
    if (raw == null || raw < LIKERT_MIN || raw > LIKERT_MAX) return null;
    values.push(effectiveScore(raw, question.reverse));
  }

  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

export function calculateAllBlockScores(
  answers: Record<string, number>,
): Record<BlockId, number> | null {
  const result = {} as Record<BlockId, number>;
  for (const block of QUICKSCAN_BLOCKS) {
    const score = calculateBlockScore(block.id, answers);
    if (score == null) return null;
    result[block.id] = score;
  }
  return result;
}

export function getSignalLevel(score: number): SignalLevel {
  if (score <= 2.0) return "urgent";
  if (score <= ATTENTION_THRESHOLD) return "attention";
  return "ok";
}

export function getAttentionBlocks(
  scores: Record<BlockId, number>,
): BlockId[] {
  return (Object.keys(scores) as BlockId[]).filter(
    (id) => scores[id] <= ATTENTION_THRESHOLD,
  );
}

/** Domeinen ≤ soft threshold, of de 1–2 relatief laagste als alles boven de harde drempel ligt */
export function getSoftAttentionBlocks(
  scores: Record<BlockId, number>,
): BlockId[] {
  const soft = (Object.keys(scores) as BlockId[]).filter(
    (id) => scores[id] <= SOFT_ATTENTION_THRESHOLD,
  );
  if (soft.length > 0) return soft;

  const ranked = (Object.keys(scores) as BlockId[])
    .slice()
    .sort((a, b) => scores[a] - scores[b]);
  const lowest = ranked[0];
  const second = ranked[1];
  const result: BlockId[] = [lowest];
  if (second && scores[second] - scores[lowest] <= 0.4) {
    result.push(second);
  }
  return result;
}

export function getRecommendedModules(
  scores: Record<BlockId, number>,
): ModuleId[] {
  const attention = new Set(getAttentionBlocks(scores));
  const modules: ModuleId[] = [];

  for (const mod of DEEPENING_MODULES) {
    if (mod.triggerBlocks.some((b) => attention.has(b))) {
      modules.push(mod.id);
    }
  }

  return modules;
}

/** Modules ook bij soft aandacht — als suggestie, niet als harde trigger */
export function getSuggestedModules(
  scores: Record<BlockId, number>,
): ModuleId[] {
  const hard = getRecommendedModules(scores);
  if (hard.length > 0) return hard;

  const soft = new Set(getSoftAttentionBlocks(scores));
  const modules: ModuleId[] = [];
  for (const mod of DEEPENING_MODULES) {
    if (mod.triggerBlocks.some((b) => soft.has(b))) {
      modules.push(mod.id);
    }
  }
  return modules;
}

export function matchSignalProfiles(
  scores: Record<BlockId, number>,
  answers: Record<string, number>,
): SignalProfile[] {
  return SIGNAL_PROFILES.filter((profile) => profile.match(scores, answers));
}

function targetGroupIdsForBlocks(blocks: BlockId[]): number[] {
  const ids = new Set<number>();
  for (const block of blocks) {
    if (block === "A") ids.add(1);
    if (block === "B") ids.add(6);
    if (block === "C") ids.add(5);
    if (block === "D") ids.add(4);
    if (block === "E") {
      ids.add(1);
      ids.add(6);
    }
    if (block === "F") {
      ids.add(3);
      ids.add(7);
    }
  }
  return [...ids];
}

export function inferDominantTargetGroups(
  scores: Record<BlockId, number>,
  answers: Record<string, number>,
): TargetGroup[] {
  const profiles = matchSignalProfiles(scores, answers);
  const ids = new Set<number>();

  for (const profile of profiles) {
    for (const id of profile.targetGroupIds) ids.add(id);
  }

  // Fallback: harde aandachtsdomeinen
  if (ids.size === 0) {
    for (const id of targetGroupIdsForBlocks(getAttentionBlocks(scores))) {
      ids.add(id);
    }
  }

  // Soft fallback: relatief laagste domeinen → toch een herkenbaar profiel
  if (ids.size === 0) {
    for (const id of targetGroupIdsForBlocks(getSoftAttentionBlocks(scores))) {
      ids.add(id);
    }
  }

  return TARGET_GROUPS.filter((g) => ids.has(g.id));
}

export function buildClientAdviceResult(
  scores: Record<BlockId, number>,
  answers: Record<string, number>,
): ClientAdviceResult {
  const profiles = matchSignalProfiles(scores, answers);
  const hardBlocks = getAttentionBlocks(scores);
  const softBlocks = getSoftAttentionBlocks(scores);
  const targetGroups = inferDominantTargetGroups(scores, answers);

  const advice: string[] = [];

  if (profiles.length > 0) {
    for (const profile of profiles) {
      for (const line of profile.clientAdvice) {
        if (!advice.includes(line)) advice.push(line);
      }
    }
  } else if (hardBlocks.length > 0) {
    for (const block of hardBlocks.slice(0, 2)) {
      for (const line of BLOCK_CLIENT_ADVICE[block]) {
        if (!advice.includes(line)) advice.push(line);
      }
    }
  } else {
    for (const line of STABLE_CLIENT_ADVICE) advice.push(line);
    for (const block of softBlocks.slice(0, 2)) {
      for (const line of BLOCK_CLIENT_ADVICE[block]) {
        if (!advice.includes(line)) advice.push(line);
      }
    }
  }

  const dominantLabel =
    profiles[0]?.name ??
    targetGroups[0]?.name ??
    (softBlocks[0]
      ? `Relatief: ${QUICKSCAN_BLOCKS.find((b) => b.id === softBlocks[0])?.title ?? softBlocks[0]}`
      : null);

  return {
    profiles,
    targetGroups,
    advice: advice.slice(0, 6),
    softBlocks,
    hardBlocks,
    dominantLabel,
  };
}

export function buildProfileNarrative(
  scores: Record<BlockId, number>,
  answers: Record<string, number>,
  openAnswers: Record<string, string>,
): string {
  const adviceResult = buildClientAdviceResult(scores, answers);
  const groups = adviceResult.targetGroups;
  const attention = adviceResult.hardBlocks;
  const soft = adviceResult.softBlocks;
  const dominant = groups[0];
  const profile = adviceResult.profiles[0];

  const themeParts: string[] = [];
  const themeSource = attention.length > 0 ? attention : soft;
  if (themeSource.includes("A")) themeParts.push("betekenisverlies of lage betrokkenheid");
  if (themeSource.includes("B")) themeParts.push("passendheid van het werk");
  if (themeSource.includes("C")) themeParts.push("waardenconflict met de organisatie");
  if (themeSource.includes("D")) themeParts.push("overbelasting en herstel");
  if (themeSource.includes("E")) themeParts.push("autonomie of omgevingsfit");
  if (themeSource.includes("F")) themeParts.push("keuzeparalysis of loopbaanbeweging");

  const hasHardSignal = attention.length > 0 || adviceResult.profiles.length > 0;

  const theme =
    themeParts.length > 0
      ? themeParts.slice(0, 2).join(" en ")
      : "een relatief stabiel beeld zonder sterke aandachtsgebieden";

  const strength = hasHardSignal
    ? "vooral te maken met"
    : "mogelijk vooral te maken met";

  const groupLine = profile
    ? ` Dit past bij het signaalprofiel "${profile.name}": ${profile.core}`
    : dominant
      ? ` Jouw hulpvraag sluit het meest aan bij het profiel "${dominant.name}": ${dominant.coreQuestion}`
      : "";

  const duration = openAnswers.Q3
    ? ` Dit speelt volgens jou al: ${OPEN_QUESTIONS.find((q) => q.id === "Q3")?.options?.find((o) => o.id === openAnswers.Q3)?.label ?? openAnswers.Q3}.`
    : "";

  const miss = openAnswers.Q2?.trim()
    ? ` Wat je het meest mist: "${openAnswers.Q2.trim()}".`
    : "";

  return `Jouw hulpvraag heeft bij de start van het traject ${strength} ${theme}.${groupLine}${duration}${miss}`;
}

export function allQuickscanAnswered(
  answers: Record<string, number>,
): boolean {
  return getAllQuickscanQuestions().every((q) => {
    const v = answers[q.id];
    return v != null && v >= LIKERT_MIN && v <= LIKERT_MAX;
  });
}

export function allOpenAnswered(openAnswers: Record<string, string>): boolean {
  return OPEN_QUESTIONS.every((q) => {
    const v = openAnswers[q.id];
    return typeof v === "string" && v.trim().length > 0;
  });
}

export function calculateProgressBlockScores(
  answers: Record<string, number>,
): Record<BlockId, number> | null {
  const byBlock: Record<BlockId, number[]> = {
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: [],
  };

  for (const item of PROGRESS_ITEMS) {
    const raw = answers[item.id];
    if (raw == null || raw < LIKERT_MIN || raw > LIKERT_MAX) return null;
    byBlock[item.block].push(effectiveScore(raw, item.reverse));
  }

  const result = {} as Record<BlockId, number>;
  for (const blockId of Object.keys(byBlock) as BlockId[]) {
    const values = byBlock[blockId];
    if (values.length === 0) {
      result[blockId] = 0;
      continue;
    }
    const sum = values.reduce((a, b) => a + b, 0);
    result[blockId] = Math.round((sum / values.length) * 100) / 100;
  }
  return result;
}

export function allProgressAnswered(answers: Record<string, number>): boolean {
  return PROGRESS_ITEMS.every((item) => {
    const v = answers[item.id];
    return v != null && v >= LIKERT_MIN && v <= LIKERT_MAX;
  });
}

export function describeChange(
  before: number,
  after: number,
): "improved" | "stable" | "declined" {
  const delta = after - before;
  if (delta >= MEANINGFUL_CHANGE) return "improved";
  if (delta <= -MEANINGFUL_CHANGE) return "declined";
  return "stable";
}

export function getModuleById(id: ModuleId): DeepeningModule | undefined {
  return DEEPENING_MODULES.find((m) => m.id === id);
}

export function isModuleComplete(
  moduleId: ModuleId,
  answers: Record<string, string | number | string[]>,
): boolean {
  const mod = getModuleById(moduleId);
  if (!mod) return false;

  return mod.questions.every((q) => {
    const v = answers[q.id];
    if (v == null) return false;
    if (q.type === "multi") return Array.isArray(v) && v.length > 0;
    if (q.type === "likert" || q.type === "scale10") {
      return typeof v === "number" && v >= 1;
    }
    return typeof v === "string" && v.trim().length > 0;
  });
}

export const SIGNAL_LEVEL_LABELS: Record<SignalLevel, string> = {
  ok: "In balans",
  attention: "Aandacht",
  urgent: "Urgent",
};

export const SIGNAL_LEVEL_COLORS: Record<SignalLevel, string> = {
  ok: "bg-emerald-500",
  attention: "bg-amber-500",
  urgent: "bg-rose-500",
};

export const STORAGE_KEY = "walda-loopbaanscan-v1";

export interface StoredSession {
  version: 1;
  updatedAt: string;
  quickscanAnswers: Record<string, number>;
  openAnswers: Record<string, string>;
  moduleAnswers: Partial<Record<ModuleId, Record<string, string | number | string[]>>>;
  progress: Partial<
    Record<
      MeasurementMoment,
      {
        answers: Record<string, number>;
        reflections: Record<string, string>;
        completedAt: string;
      }
    >
  >;
}

export function createEmptySession(): StoredSession {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    quickscanAnswers: {},
    openAnswers: {},
    moduleAnswers: {},
    progress: {},
  };
}
