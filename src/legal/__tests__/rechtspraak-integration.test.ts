import { describe, it, expect } from "vitest";
import { rechtspraakAdapter } from "../adapters/rechtspraak";

describe("RechtspraakOpenDataAdapter integration", () => {
  it(
    "vindt belaging in metadata-inhoudsindicaties",
    async () => {
      const results = await rechtspraakAdapter.search({ text: "belaging", limit: 5 });
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some((r) => /belaging/i.test(`${r.title} ${r.snippet}`))
      ).toBe(true);
    },
    90000
  );
});
