import { DateTime } from "luxon";
import { TIMEZONE } from "./constants.js";

export type CalendarWindow = {
  /** Inclusive start of evening-cycle dates (local calendar day). */
  start: DateTime;
  /** Inclusive end of evening-cycle dates (local calendar day). */
  end: DateTime;
};

/**
 * Rolling window: current date − 1 calendar month … current date + 1 calendar year.
 * Uses calendar months/years in Europe/Amsterdam, not fixed day counts.
 */
export function getCalendarWindow(now: DateTime = DateTime.now()): CalendarWindow {
  const today = now.setZone(TIMEZONE).startOf("day");
  const start = today.minus({ months: 1 });
  const end = today.plus({ years: 1 });
  return { start, end };
}

/**
 * Iterate each local calendar day from start through end (inclusive).
 * Each date is the evening (sunset) date of a night cycle.
 */
export function eachLocalDay(start: DateTime, end: DateTime): DateTime[] {
  const days: DateTime[] = [];
  let cursor = start.setZone(TIMEZONE).startOf("day");
  const last = end.setZone(TIMEZONE).startOf("day");

  if (!cursor.isValid || !last.isValid) return days;

  while (cursor <= last) {
    days.push(cursor);
    cursor = cursor.plus({ days: 1 });
  }

  return days;
}
