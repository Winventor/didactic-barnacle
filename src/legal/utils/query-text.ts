import type { LegalSearchQuery } from "../types";

export function queryText(query: LegalSearchQuery): string {
  return query.text ?? query.identifier ?? "";
}
