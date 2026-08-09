import SunCalc from "suncalc";
import { DateTime } from "luxon";
import { TIMEZONE } from "./constants.js";

export type SunEvents = {
  /** Official sunset on the evening date. */
  sunset: DateTime;
  /** End of civil evening twilight (sun at −6°). */
  civilDusk: DateTime;
  /** Start of civil morning twilight next day (sun at −6°). */
  civilDawn: DateTime;
  /** Official sunrise next day. */
  sunrise: DateTime;
};

function isValidJsDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function toAmsterdam(date: Date): DateTime {
  return DateTime.fromJSDate(date, { zone: "utc" }).setZone(TIMEZONE);
}

/**
 * Compute the night-cycle sun events starting on `eveningDate` (local calendar day).
 *
 * Cycle:
 *   eveningDate: sunset → civilDusk → (night) →
 *   eveningDate+1: civilDawn → sunrise
 *
 * Returns null when any event is missing (polar day/night / library edge cases).
 */
export function getNightCycleEvents(
  eveningDate: DateTime,
  latitude: number,
  longitude: number,
): SunEvents | null {
  const localEvening = eveningDate.setZone(TIMEZONE).startOf("day");
  const localMorning = localEvening.plus({ days: 1 });

  // Midday UTC-ish anchors help suncalc pick the correct solar day.
  const eveningAnchor = localEvening.set({ hour: 12 }).toUTC().toJSDate();
  const morningAnchor = localMorning.set({ hour: 12 }).toUTC().toJSDate();

  const eveningTimes = SunCalc.getTimes(eveningAnchor, latitude, longitude);
  const morningTimes = SunCalc.getTimes(morningAnchor, latitude, longitude);

  if (
    !isValidJsDate(eveningTimes.sunset) ||
    !isValidJsDate(eveningTimes.dusk) ||
    !isValidJsDate(morningTimes.dawn) ||
    !isValidJsDate(morningTimes.sunrise)
  ) {
    return null;
  }

  const sunset = toAmsterdam(eveningTimes.sunset);
  const civilDusk = toAmsterdam(eveningTimes.dusk);
  const civilDawn = toAmsterdam(morningTimes.dawn);
  const sunrise = toAmsterdam(morningTimes.sunrise);

  if (
    !sunset.isValid ||
    !civilDusk.isValid ||
    !civilDawn.isValid ||
    !sunrise.isValid
  ) {
    return null;
  }

  // Defensive ordering: skip malformed sequences instead of emitting bad ICS.
  if (!(sunset < civilDusk && civilDusk < civilDawn && civilDawn < sunrise)) {
    return null;
  }

  return { sunset, civilDusk, civilDawn, sunrise };
}
