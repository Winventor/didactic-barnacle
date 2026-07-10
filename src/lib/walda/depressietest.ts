export interface DepressietestOption {
  id: string;
  label: string;
  score: number;
}

export interface DepressietestQuestion {
  id: number;
  text: string;
  options: DepressietestOption[];
}

export type ScoreRangeId = "0-4" | "5-9" | "10-14" | "15-21";

export interface ScoreInterpretation {
  id: ScoreRangeId;
  min: number;
  max: number;
  title: string;
  limited: {
    summary: string;
    advice: string[];
  };
  extended: {
    summary: string;
    selfHelp: string[];
    additionalHelp: string[];
    advice: string[];
    reflectionQuestions: string[];
    twoWeekAssignment: string[];
  };
}

export const DEPRESSIETEST_BANNER = {
  src: "https://waldacoaching.nl/wp-content/uploads/2024/09/Obsidian-Banner-Walda-Coaching-2024.png",
  positionX: 0.51741,
};

export const DEPRESSIETEST_QUESTIONS: DepressietestQuestion[] = [
  {
    id: 1,
    text: "Ik geniet nog steeds van de dingen waar ik vroeger van genoot",
    options: [
      { id: "1-0", label: "Zeker zoveel", score: 0 },
      { id: "1-1", label: "Niet zoveel als vroeger", score: 1 },
      { id: "1-2", label: "Weinig", score: 2 },
      { id: "1-3", label: "Haast helemaal niet", score: 3 },
    ],
  },
  {
    id: 2,
    text: "Ik kan lachen en de dingen van een vrolijke kant bekijken",
    options: [
      { id: "2-0", label: "Net zoveel als vroeger", score: 0 },
      { id: "2-1", label: "Niet zo goed als vroeger", score: 1 },
      { id: "2-2", label: "Beslist niet zoveel als vroeger", score: 2 },
      { id: "2-3", label: "Helemaal niet", score: 3 },
    ],
  },
  {
    id: 3,
    text: "Ik voel me opgewekt",
    options: [
      { id: "3-0", label: "Meestal", score: 0 },
      { id: "3-1", label: "Soms", score: 1 },
      { id: "3-2", label: "Niet vaak", score: 2 },
      { id: "3-3", label: "Helemaal niet", score: 3 },
    ],
  },
  {
    id: 4,
    text: "Ik voel me alsof alles moeizamer gaat",
    options: [
      { id: "4-0", label: "Helemaal niet", score: 0 },
      { id: "4-1", label: "Soms", score: 1 },
      { id: "4-2", label: "Heel vaak", score: 2 },
      { id: "4-3", label: "Bijna altijd", score: 3 },
    ],
  },
  {
    id: 5,
    text: "Ik heb geen interesse meer in mijn uiterlijk",
    options: [
      { id: "5-0", label: "Evenveel interesse als vroeger", score: 0 },
      { id: "5-1", label: "Waarschijnlijk niet zoveel", score: 1 },
      { id: "5-2", label: "Niet meer zoveel als ik zou moeten doen", score: 2 },
      { id: "5-3", label: "Zeker", score: 3 },
    ],
  },
  {
    id: 6,
    text: "Ik verheug me van tevoren al op dingen",
    options: [
      { id: "6-0", label: "Niet zoveel als vroeger", score: 0 },
      { id: "6-1", label: "Een beetje minder dan vroeger", score: 1 },
      { id: "6-2", label: "Zeker minder dan vroeger", score: 2 },
      { id: "6-3", label: "Bijna nooit", score: 3 },
    ],
  },
  {
    id: 7,
    text: "Ik kan van een goed boek genieten, of van een radio- of televisieprogramma",
    options: [
      { id: "7-0", label: "Vaak", score: 0 },
      { id: "7-1", label: "Soms", score: 1 },
      { id: "7-2", label: "Niet vaak", score: 2 },
      { id: "7-3", label: "Heel zelden", score: 3 },
    ],
  },
];

export const SCORE_INTERPRETATIONS: ScoreInterpretation[] = [
  {
    id: "0-4",
    min: 0,
    max: 4,
    title: "Geen of minimale klachten",
    limited: {
      summary:
        "Je antwoorden geven aan dat je momenteel weinig tot geen klachten ervaart die wijzen op depressieve gevoelens. Je lijkt nog plezier te halen uit dagelijkse bezigheden, behoudt motivatie en ziet de wereld regelmatig positief.",
      advice: [
        "Blijf actief dingen doen die je leuk vindt.",
        "Onderhoud sociale contacten en rustmomenten.",
        "Houd aandacht voor veranderingen: als je stemming of motivatie afneemt, blijf er dan niet mee zitten.",
        "Overweeg preventieve zelfzorg zoals wandelen, dagstructuur en gezonde voeding.",
      ],
    },
    extended: {
      summary:
        "Je stemming is overwegend stabiel. Er zijn weinig signalen van depressieve gevoelens. Dat is positief, maar het blijft belangrijk om goed voor jezelf te zorgen.",
      selfHelp: [
        "Onderhoud je routines (werken, slapen, eten, ontspanning).",
        "Doe elke dag iets waar je plezier aan beleeft.",
        "Blijf bewegen (bijv. wandelen, fietsen, yoga).",
        "Blijf open praten met mensen in je omgeving.",
      ],
      additionalHelp: [
        "Een [[dankbaarheidsdagboek bijhouden]].",
        "Mindfulness of ademhalingsoefeningen.",
        "Korte [[reflectiemomenten]] (bijv. [[dagboekje]]).",
        "Deelname aan sociale of creatieve activiteiten.",
      ],
      advice: [
        "Voorkom overbelasting, bewaak je grenzen.",
        "Zorg voor afwisseling tussen werk, rust en plezier.",
        "Let op signalen van afname in energie of motivatie.",
      ],
      reflectionQuestions: [
        "Wat geeft mij energie op een doorsnee dag?",
        "Wat kan ik doen om plezier te blijven ervaren?",
        "Hoe ga ik om met spanning of veranderingen?",
      ],
      twoWeekAssignment: [
        "Waar werd ik vandaag blij van?",
        "Wanneer voelde ik me kalm of ontspannen?",
        "Was er iets dat me energie kostte?",
        "Bespreek opvallende patronen in een gesprek met je coach of therapeut.",
      ],
    },
  },
  {
    id: "5-9",
    min: 5,
    max: 9,
    title: "Lichte klachten",
    limited: {
      summary:
        "Je vertoont enkele signalen van lichte somberheid of verminderde motivatie. Dit kan passen bij tijdelijke stress, een drukke periode of milde stemmingsklachten.",
      advice: [
        "Onderzoek mogelijke oorzaken: ben je overbelast, vermoeid, of emotioneel uitgeput?",
        "Gun jezelf herstelmomenten en structuur.",
        "Voer [[Opdracht - Houd een stemmingsoverzicht bij]] uit om te zien of het verbetert of verslechtert.",
        "Overweeg een laagdrempelig gesprek met een coach of praktijkondersteuner bij de huisarts.",
        "Let op signalen van verergering (zoals terugtrekgedrag of aanhoudende lusteloosheid).",
      ],
    },
    extended: {
      summary:
        "Er zijn beginnende signalen van [[somberheid]], [[lusteloosheid]] of minder plezier. Dit hoeft geen probleem te zijn, maar het vraagt wel om bewuste aandacht.",
      selfHelp: [
        "Houd een dagstructuur aan, zelfs als je je wat minder voelt.",
        "Doe elke dag iets waar je normaal blij van wordt, ook als je geen zin hebt.",
        "Blijf onder de mensen, ook al voelt het soms als moeite.",
      ],
      additionalHelp: [
        "[[Kortdurende coaching]] of begeleiding.",
        "Beweeg dagelijks minimaal 20 minuten buiten.",
        "Verminder overmatige schermtijd, zeker 's avonds.",
        "Voeding en slaap optimaliseren.",
      ],
      advice: [
        "Let op je energiebalans: werk toe naar herstelmomenten.",
        "Plan vooruit: kleine doelen, kleine successen.",
        "Geef jezelf ruimte voor [[mildheid]] en fouten.",
      ],
      reflectionQuestions: [
        "Wat heb ik nodig om beter in mijn vel te zitten?",
        "Waar komt mijn verminderde energie vandaan?",
        "Hoe reageer ik op tegenslag?",
      ],
      twoWeekAssignment: [
        "Wat was vandaag een klein succesje?",
        "Wat deed ik ondanks weinig zin toch?",
        "Waar ben ik trots op?",
        "Bespreek na twee weken of je stemming stabiel is gebleven of veranderd is.",
      ],
    },
  },
  {
    id: "10-14",
    min: 10,
    max: 14,
    title: "Matige klachten",
    limited: {
      summary:
        "Je ervaart verschillende klachten die passen bij een depressieve stemming, zoals verminderde interesse, motivatie en plezier. De klachten lijken je dagelijks functioneren te beïnvloeden.",
      advice: [
        "Zoek professioneel contact, bijvoorbeeld via je huisarts of psycholoog.",
        "Therapie (zoals [[cognitieve gedragstherapie]] of [[ACT]]) kan goed helpen in dit stadium.",
        "Maak kleine haalbare doelen per dag en blijf bewegen.",
        "Praat erover met iemand in je omgeving; openheid helpt.",
        "Let op: hoe sneller je ondersteuning zoekt, hoe beter de kans op herstel.",
      ],
    },
    extended: {
      summary:
        "Je ervaart duidelijke signalen van een sombere stemming. Je hebt mogelijk minder energie, motivatie of plezier in dagelijkse dingen. Dit vraagt om aandacht en actie.",
      selfHelp: [
        "Breng structuur aan in je dag: opstaan, eten, rust, activiteiten.",
        "Voer de [[Opdracht - Houd een stemmingsoverzicht bij]] uit.",
        "Geef jezelf toestemming om rustiger aan te doen.",
        "Zorg voor lichamelijke beweging, hoe klein ook.",
      ],
      additionalHelp: [
        "[[Psychologische begeleiding]] (bijv. via huisarts of praktijkondersteuner).",
        "Therapie gericht op gedrag, gedachten en emoties.",
        "Betrokkenheid van naasten: durf hulp te vragen.",
        "Groepsactiviteiten met een lage drempel (sport, creatieve les).",
      ],
      advice: [
        "Laat negatieve gedachten niet de hele dag domineren: schrijf ze op.",
        "Zoek minimaal één moment per dag waar je jezelf rust gunt.",
        "Ga niet piekeren over de toekomst, focus op één dag tegelijk.",
      ],
      reflectionQuestions: [
        "Wat mis ik op dit moment in mijn leven?",
        "Wanneer voel ik me iets beter? Wat helpt dan?",
        "Wat vermijd ik en waarom?",
      ],
      twoWeekAssignment: [
        "Wanneer voelde ik me vandaag iets lichter?",
        "Wat heb ik gedaan dat mij goed deed?",
        "Welke gedachte bleef hangen en hielp niet?",
        "Bespreek deze inzichten met je hulpverlener.",
      ],
    },
  },
  {
    id: "15-21",
    min: 15,
    max: 21,
    title: "Ernstige klachten",
    limited: {
      summary:
        "De klachten die je ervaart zijn ernstig en wijzen sterk op een depressieve stoornis. Het gebrek aan energie, plezier en motivatie is mogelijk overweldigend of verlammend geworden.",
      advice: [
        "Neem direct contact op met je huisarts of crisisdienst als je niet meer weet hoe verder.",
        "Psychologische behandeling is dringend nodig, en kan ondersteund worden met medicatie (in overleg met een arts).",
        "Vermijd isolement: vertel het aan ten minste één vertrouwenspersoon.",
        "Besef: depressie is behandelbaar. Met hulp kun je je beter gaan voelen, ook al voelt dat nu misschien niet zo.",
        "Blijf niet alleen met deze gevoelens. Wacht niet.",
      ],
    },
    extended: {
      summary:
        "Je hebt te maken met forse stemmingsklachten. Het dagelijkse functioneren staat waarschijnlijk onder druk. Het is belangrijk dat je dit serieus neemt en hulp zoekt.",
      selfHelp: [
        "Geef jezelf toestemming om niet te presteren.",
        "Houd vast aan één tot drie basisdingen per dag: opstaan, eten, aankleden.",
        "Schrijf gevoelens van [[hopeloosheid]] of spanning van je af.",
        "Zoek steun bij iemand die je vertrouwt.",
      ],
      additionalHelp: [
        "Professionele hulp: huisarts, psycholoog, eventueel medicatie.",
        "Crisislijn of hulplijn bij zware gedachten (113.nl).",
        "Oefeningen voor ademhaling en ontspanning.",
        "Tijdelijke ziekmelding of afschaling werkdruk.",
      ],
      advice: [
        "Je hoeft dit niet alleen te doen.",
        "Elk stapje telt, ook als het klein is.",
        "Zeg af wat te veel is. Zorg voor mentale rust.",
        "Evalueer je gedachten: zijn ze feitelijk of ingegeven door stemming?",
      ],
      reflectionQuestions: [
        "Wat maakt het zwaar om de dag te beginnen?",
        "Wat zou ik aan iemand anders adviseren als die zich zo voelt?",
        "Wat probeer ik voor mezelf verborgen te houden?",
      ],
      twoWeekAssignment: [
        "Wat zou me vandaag kunnen helpen, hoe klein ook?",
        "Wat deed ik vandaag ondanks alles toch?",
        "Wat zou ik willen zeggen maar durf ik nog niet?",
        "Bespreek deze antwoorden in een gesprek met je behandelaar.",
      ],
    },
  },
];

export function calculateTotalScore(answers: Record<number, number>): number {
  return Object.values(answers).reduce((sum, score) => sum + score, 0);
}

export function getInterpretationForScore(
  totalScore: number,
): ScoreInterpretation {
  const interpretation = SCORE_INTERPRETATIONS.find(
    (item) => totalScore >= item.min && totalScore <= item.max,
  );
  return interpretation ?? SCORE_INTERPRETATIONS[0];
}

export function allQuestionsAnswered(
  answers: Record<number, number>,
  questionCount: number,
): boolean {
  return Object.keys(answers).length === questionCount;
}
