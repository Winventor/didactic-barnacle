import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { getNightCycleEvents } from "../src/astronomy.js";
import { TIMEZONE } from "../src/constants.js";
import { KNOWN_LOCATIONS } from "../src/locations.js";

const HOOGEVEEN = { latitude: 52.7286, longitude: 6.4763 };
const AMSTERDAM = { latitude: 52.3676, longitude: 4.9041 };
const MAASTRICHT = { latitude: 50.8514, longitude: 5.691 };
const GRONINGEN = { latitude: 53.2194, longitude: 6.5665 };
const VLISSINGEN = { latitude: 51.4426, longitude: 3.5735 };

function evening(isoDate: string): DateTime {
  return DateTime.fromISO(isoDate, { zone: TIMEZONE });
}

describe("astronomical night cycles", () => {
  it("orders events on a normal winter day", () => {
    const sun = getNightCycleEvents(
      evening("2024-01-15"),
      HOOGEVEEN.latitude,
      HOOGEVEEN.longitude,
    );
    expect(sun).not.toBeNull();
    if (!sun) return;

    expect(sun.sunset < sun.civilDusk).toBe(true);
    expect(sun.civilDusk < sun.civilDawn).toBe(true);
    expect(sun.civilDawn < sun.sunrise).toBe(true);

    expect(sun.sunset.setZone(TIMEZONE).toISODate()).toBe("2024-01-15");
    expect(sun.civilDawn.setZone(TIMEZONE).toISODate()).toBe("2024-01-16");
    expect(sun.sunrise.setZone(TIMEZONE).toISODate()).toBe("2024-01-16");
  });

  it("orders events on a normal summer day", () => {
    const sun = getNightCycleEvents(
      evening("2024-06-20"),
      HOOGEVEEN.latitude,
      HOOGEVEEN.longitude,
    );
    expect(sun).not.toBeNull();
    if (!sun) return;

    expect(sun.sunset < sun.civilDusk).toBe(true);
    expect(sun.civilDusk < sun.civilDawn).toBe(true);
    expect(sun.civilDawn < sun.sunrise).toBe(true);

    // Summer nights are short in NL.
    const nightHours = sun.civilDawn.diff(sun.civilDusk, "hours").hours;
    expect(nightHours).toBeGreaterThan(0);
    expect(nightHours).toBeLessThan(8);
  });

  it("handles the spring DST transition (to CEST)", () => {
    // Netherlands: clocks spring forward 2024-03-31 02:00 → 03:00.
    const sun = getNightCycleEvents(
      evening("2024-03-30"),
      AMSTERDAM.latitude,
      AMSTERDAM.longitude,
    );
    expect(sun).not.toBeNull();
    if (!sun) return;

    expect(sun.sunset < sun.civilDusk).toBe(true);
    expect(sun.civilDusk < sun.civilDawn).toBe(true);
    expect(sun.civilDawn < sun.sunrise).toBe(true);

    // Instant ordering remains strict across the missing hour.
    expect(sun.civilDawn.toMillis()).toBeGreaterThan(sun.civilDusk.toMillis());
  });

  it("handles the autumn DST transition (to CET)", () => {
    // Netherlands: clocks fall back 2024-10-27 03:00 → 02:00.
    const sun = getNightCycleEvents(
      evening("2024-10-26"),
      AMSTERDAM.latitude,
      AMSTERDAM.longitude,
    );
    expect(sun).not.toBeNull();
    if (!sun) return;

    expect(sun.sunset < sun.civilDusk).toBe(true);
    expect(sun.civilDusk < sun.civilDawn).toBe(true);
    expect(sun.civilDawn < sun.sunrise).toBe(true);
  });

  it("produces location-dependent times across Dutch cities", () => {
    const date = evening("2024-09-01");
    const samples = [
      HOOGEVEEN,
      AMSTERDAM,
      MAASTRICHT,
      GRONINGEN,
      VLISSINGEN,
    ].map((loc) => getNightCycleEvents(date, loc.latitude, loc.longitude));

    expect(samples.every((s) => s !== null)).toBe(true);

    const sunsets = samples.map((s) => s!.sunset.toMillis());
    const unique = new Set(sunsets);
    // Longitude differences should shift sunset times.
    expect(unique.size).toBeGreaterThan(1);

    // Eastern locations (Groningen/Hoogeveen) should see earlier sunset than Vlissingen.
    const groningen = getNightCycleEvents(
      date,
      GRONINGEN.latitude,
      GRONINGEN.longitude,
    )!;
    const vlissingen = getNightCycleEvents(
      date,
      VLISSINGEN.latitude,
      VLISSINGEN.longitude,
    )!;
    expect(groningen.sunset.toMillis()).toBeLessThan(
      vlissingen.sunset.toMillis(),
    );
  });

  it("exposes fixed coordinates for all known locations used in docs", () => {
    expect(KNOWN_LOCATIONS.map((l) => l.name)).toEqual([
      "Hoogeveen",
      "Amsterdam",
      "Maastricht",
      "Groningen",
      "Vlissingen",
    ]);
  });

  it("returns null defensively for polar-day edge cases instead of crashing", () => {
    const sun = getNightCycleEvents(evening("2024-06-21"), 89.9, 0);
    // May be null (no sunset) — must not throw.
    expect(sun === null || sun.sunset < sun.sunrise).toBe(true);
  });
});
