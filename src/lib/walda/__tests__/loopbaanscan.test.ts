import { describe, expect, it } from "vitest";
import {
  ATTENTION_THRESHOLD,
  allOpenAnswered,
  allQuickscanAnswered,
  buildProfileNarrative,
  calculateAllBlockScores,
  calculateBlockScore,
  calculateProgressBlockScores,
  describeChange,
  effectiveScore,
  getAttentionBlocks,
  getRecommendedModules,
  getSignalLevel,
  inferDominantTargetGroups,
  matchSignalProfiles,
  mirrorScore,
  QUICKSCAN_BLOCKS,
} from "../loopbaanscan";

function fillAnswers(
  overrides: Record<string, number> = {},
  defaultValue = 4,
): Record<string, number> {
  const answers: Record<string, number> = {};
  for (const block of QUICKSCAN_BLOCKS) {
    for (const q of block.questions) {
      answers[q.id] = defaultValue;
    }
  }
  return { ...answers, ...overrides };
}

describe("loopbaanscan scoring", () => {
  it("mirrors reverse-scored items", () => {
    expect(mirrorScore(1)).toBe(5);
    expect(mirrorScore(5)).toBe(1);
    expect(mirrorScore(3)).toBe(3);
    expect(effectiveScore(5, true)).toBe(1);
    expect(effectiveScore(5, false)).toBe(5);
  });

  it("calculates block averages with reverse items", () => {
    // A1=5, A2=5 (reverse→1), A3=5, A4=5 (reverse→1), A5=5 → (5+1+5+1+5)/5 = 3.4
    const answers = fillAnswers({ A1: 5, A2: 5, A3: 5, A4: 5, A5: 5 });
    expect(calculateBlockScore("A", answers)).toBe(3.4);
  });

  it("flags attention when average ≤ threshold", () => {
    const low = fillAnswers(
      { A1: 1, A2: 1, A3: 1, A4: 1, A5: 1 },
      4,
    );
    // A2 reverse: 1→5, A4 reverse: 1→5 → (1+5+1+5+1)/5 = 2.6
    const score = calculateBlockScore("A", low)!;
    expect(score).toBe(2.6);
    expect(score).toBeLessThanOrEqual(ATTENTION_THRESHOLD);
    expect(getSignalLevel(score)).toBe("attention");
  });

  it("detects urgent level at ≤ 2.0", () => {
    expect(getSignalLevel(1.8)).toBe("urgent");
    expect(getSignalLevel(2.5)).toBe("attention");
    expect(getSignalLevel(3.2)).toBe("ok");
  });

  it("recommends modules for attention blocks", () => {
    const answers = fillAnswers({
      A1: 1,
      A2: 1,
      A3: 1,
      A4: 1,
      A5: 1,
      D1: 1,
      D2: 1,
      D3: 1,
      D4: 1,
      D5: 1,
    });
    const scores = calculateAllBlockScores(answers)!;
    const modules = getRecommendedModules(scores);
    expect(modules).toContain("M1");
    expect(modules).toContain("M3");
  });

  it("matches leegte profile when A low and D ok", () => {
    const answers = fillAnswers({
      A1: 1,
      A2: 1,
      A3: 1,
      A4: 1,
      A5: 1,
    });
    const scores = calculateAllBlockScores(answers)!;
    expect(scores.A).toBeLessThanOrEqual(ATTENTION_THRESHOLD);
    expect(scores.D).toBeGreaterThan(ATTENTION_THRESHOLD);
    const profiles = matchSignalProfiles(scores, answers);
    expect(profiles.some((p) => p.id === "leegte")).toBe(true);
  });

  it("matches overbelasting when D low and F3 high", () => {
    const answers = fillAnswers({
      D1: 1,
      D2: 5,
      D3: 1,
      D4: 5,
      D5: 1,
      F3: 5,
    });
    const scores = calculateAllBlockScores(answers)!;
    const profiles = matchSignalProfiles(scores, answers);
    expect(profiles.some((p) => p.id === "overbelasting")).toBe(true);
  });

  it("matches verlamming when F2 high and F5 low", () => {
    const answers = fillAnswers({ F2: 5, F5: 1 });
    const scores = calculateAllBlockScores(answers)!;
    const profiles = matchSignalProfiles(scores, answers);
    expect(profiles.some((p) => p.id === "verlamming")).toBe(true);
  });

  it("infers target groups from profiles", () => {
    const answers = fillAnswers({
      C1: 1,
      C2: 5,
      C3: 1,
      C4: 1,
    });
    const scores = calculateAllBlockScores(answers)!;
    const groups = inferDominantTargetGroups(scores, answers);
    expect(groups.some((g) => g.id === 5)).toBe(true);
  });

  it("builds a narrative mentioning themes", () => {
    const answers = fillAnswers({
      A1: 1,
      A2: 1,
      A3: 1,
      A4: 1,
      A5: 1,
    });
    const scores = calculateAllBlockScores(answers)!;
    const narrative = buildProfileNarrative(scores, answers, {
      Q2: "energie",
      Q3: "gt1y",
    });
    expect(narrative).toMatch(/betekenisverlies|betrokkenheid/i);
    expect(narrative).toContain("energie");
  });

  it("validates completeness helpers", () => {
    const partial = { A1: 3 };
    expect(allQuickscanAnswered(partial)).toBe(false);
    expect(allQuickscanAnswered(fillAnswers())).toBe(true);
    expect(allOpenAnswered({})).toBe(false);
    expect(
      allOpenAnswered({ Q1: "twijfel", Q2: "zingeving", Q3: "6-12m" }),
    ).toBe(true);
  });

  it("describes meaningful change", () => {
    expect(describeChange(2.5, 3.2)).toBe("improved");
    expect(describeChange(3.2, 2.5)).toBe("declined");
    expect(describeChange(3.0, 3.3)).toBe("stable");
  });

  it("scores progress items per block", () => {
    const answers: Record<string, number> = {};
    for (let i = 1; i <= 12; i++) {
      answers[`V${i}`] = 4;
    }
    answers.V3 = 2; // reverse → 4
    answers.V12 = 2; // reverse → 4
    const scores = calculateProgressBlockScores(answers)!;
    expect(scores.A).toBe(4);
    expect(getAttentionBlocks(scores)).toEqual([]);
  });
});
