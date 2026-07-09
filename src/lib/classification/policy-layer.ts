import {
  DOCUMENT_TYPES_BY_LAYER,
  ALL_DOCUMENT_TYPES,
} from "@/lib/constants/document-types";
import type { PolicyLayerTab } from "@/types/policy-document";

const LAYER_LOOKUP = new Map<string, PolicyLayerTab>();

for (const layer of Object.keys(DOCUMENT_TYPES_BY_LAYER) as PolicyLayerTab[]) {
  for (const docType of DOCUMENT_TYPES_BY_LAYER[layer]) {
    LAYER_LOOKUP.set(docType.toLowerCase(), layer);
  }
}

/** Fuzzy aliases for common variations */
const ALIASES: Record<string, PolicyLayerTab> = {
  besluit: "Besluitvorming",
  evaluatie: "Uitvoering & Evaluatie",
  evaluatierapport: "Uitvoering & Evaluatie",
  monitor: "Uitvoering & Evaluatie",
  jaarverslag: "Uitvoering & Evaluatie",
  visie: "Beleidsvorming",
  beleidsnota: "Beleidsvorming",
  startnotitie: "Beleidsvorming",
  motie: "Besluitvorming",
  amendement: "Besluitvorming",
  raadsvoorstel: "Besluitvorming",
  collegevoorstel: "Besluitvorming",
};

/**
 * Classifies a document type into one of the three policy layers.
 * Supports exact matches, case-insensitive lookup, and common aliases.
 */
export function classifyPolicyLayer(documentType: string): PolicyLayerTab {
  const normalized = documentType.trim().toLowerCase();

  const exact = LAYER_LOOKUP.get(normalized);
  if (exact) return exact;

  const alias = ALIASES[normalized];
  if (alias) return alias;

  for (const [key, layer] of LAYER_LOOKUP) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return layer;
    }
  }

  return "Beleidsvorming";
}

export function isKnownDocumentType(documentType: string): boolean {
  return ALL_DOCUMENT_TYPES.some(
    (t) => t.toLowerCase() === documentType.trim().toLowerCase(),
  );
}
