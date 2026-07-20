import type { LegalSourceAdapter } from "../types";
import { bwbSruAdapter } from "./bwb-sru";
import { rechtspraakAdapter } from "./rechtspraak";
import { localRegulationsAdapter } from "./local-regulations";
import { eurLexAdapter } from "./eur-lex";
import { cellarAdapter } from "./cellar";
import { curiaAdapter } from "./curia";
import { hudocAdapter } from "./hudoc";
import { officialGazetteAdapter } from "./official-gazette";
import { treatiesAdapter } from "./treaties";
import { councilOfStateAdapter } from "./council-of-state";

export const ALL_ADAPTERS: LegalSourceAdapter[] = [
  bwbSruAdapter,
  officialGazetteAdapter,
  localRegulationsAdapter,
  rechtspraakAdapter,
  councilOfStateAdapter as unknown as LegalSourceAdapter,
  treatiesAdapter,
  eurLexAdapter,
  cellarAdapter,
  curiaAdapter,
  hudocAdapter,
];

export function getAdapter(id: string): LegalSourceAdapter | undefined {
  return ALL_ADAPTERS.find((a) => a.id === id);
}

export {
  bwbSruAdapter,
  rechtspraakAdapter,
  localRegulationsAdapter,
  eurLexAdapter,
  cellarAdapter,
  curiaAdapter,
  hudocAdapter,
  officialGazetteAdapter,
  treatiesAdapter,
  councilOfStateAdapter,
};
