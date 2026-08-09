import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { eachLocalDay, getCalendarWindow } from "../src/window.js";
import { TIMEZONE } from "../src/constants.js";

describe("rolling calendar window", () => {
  it("uses calendar months and years, not fixed day counts", () => {
    // Choose a date where +1 calendar year ≠ +365 days (crosses a leap day).
    const now = DateTime.fromISO("2024-02-10T12:00:00", { zone: TIMEZONE });
    const { start, end } = getCalendarWindow(now);

    expect(start.toISODate()).toBe("2024-01-10");
    expect(end.toISODate()).toBe("2025-02-10");

    // Not a naive ±30 / ±365 day window.
    expect(start.toISODate()).not.toBe(
      now.minus({ days: 30 }).toISODate(),
    );
    expect(end.toISODate()).not.toBe(now.plus({ days: 365 }).toISODate());
  });

  it("handles month-end anchoring (Jan 31 → Dec 31)", () => {
    const now = DateTime.fromISO("2024-01-31T08:00:00", { zone: TIMEZONE });
    const { start, end } = getCalendarWindow(now);
    expect(start.toISODate()).toBe("2023-12-31");
    expect(end.toISODate()).toBe("2025-01-31");
  });

  it("iterates inclusive local days", () => {
    const start = DateTime.fromISO("2024-03-01", { zone: TIMEZONE });
    const end = DateTime.fromISO("2024-03-03", { zone: TIMEZONE });
    const days = eachLocalDay(start, end).map((d) => d.toISODate());
    expect(days).toEqual(["2024-03-01", "2024-03-02", "2024-03-03"]);
  });
});
