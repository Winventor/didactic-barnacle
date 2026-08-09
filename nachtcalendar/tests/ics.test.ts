import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { buildEvents, buildIcs, formatUtc } from "../src/ics.js";
import { TIMEZONE } from "../src/constants.js";
import { calendarDisplayName } from "../src/locations.js";

const HOOGEVEEN = { latitude: 52.7286, longitude: 6.4763 };
const AMSTERDAM = { latitude: 52.3676, longitude: 4.9041 };

describe("ICS output", () => {
  it("emits a valid VCALENDAR envelope", () => {
    const ics = buildIcs({
      ...HOOGEVEEN,
      now: DateTime.fromISO("2024-06-15T12:00:00", { zone: TIMEZONE }),
      dtStamp: DateTime.fromISO("2024-06-15T12:00:00Z"),
    });

    expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("CALSCALE:GREGORIAN");
    expect(ics).toContain("METHOD:PUBLISH");
    expect(ics).toContain("X-WR-CALNAME:Schemer en Nacht - Hoogeveen");
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).toContain("\r\n");
  });

  it("creates three contiguous events per night cycle", () => {
    const events = buildEvents({
      ...HOOGEVEEN,
      now: DateTime.fromISO("2024-01-15T12:00:00", { zone: TIMEZONE }),
    });

    // Find the cycle that starts on 2024-01-15.
    const evening = events.find((e) =>
      e.uid.startsWith("schemer-evening-2024-01-15-"),
    );
    const night = events.find((e) => e.uid.startsWith("nacht-2024-01-15-"));
    const morning = events.find((e) =>
      e.uid.startsWith("schemer-morning-2024-01-15-"),
    );

    expect(evening?.summary).toBe("Schemer");
    expect(night?.summary).toBe("Nacht");
    expect(morning?.summary).toBe("Schemer");

    expect(evening!.dtEnd.toMillis()).toBe(night!.dtStart.toMillis());
    expect(night!.dtEnd.toMillis()).toBe(morning!.dtStart.toMillis());
  });

  it("keeps UIDs stable across regenerations", () => {
    const a = buildEvents({
      ...AMSTERDAM,
      now: DateTime.fromISO("2024-07-01T10:00:00", { zone: TIMEZONE }),
    });
    const b = buildEvents({
      ...AMSTERDAM,
      now: DateTime.fromISO("2024-07-01T22:00:00", { zone: TIMEZONE }),
    });

    const sample = a.find((e) =>
      e.uid.startsWith("nacht-2024-07-01-52.36760-4.90410@"),
    );
    expect(sample).toBeTruthy();
    expect(b.some((e) => e.uid === sample!.uid)).toBe(true);
  });

  it("normalizes coordinates inside UIDs", () => {
    const events = buildEvents({
      latitude: 52.7286,
      longitude: 6.4763,
      now: DateTime.fromISO("2024-02-01T12:00:00", { zone: TIMEZONE }),
    });
    expect(
      events.some((e) =>
        e.uid.includes("schemer-evening-2024-02-01-52.72860-6.47630@nachtcalendar"),
      ),
    ).toBe(true);
  });

  it("covers the rolling window with many events", () => {
    const now = DateTime.fromISO("2024-05-10T12:00:00", { zone: TIMEZONE });
    const events = buildEvents({ ...HOOGEVEEN, now });
    // ~13 months of nights × 3 events ≈ 1100+
    expect(events.length).toBeGreaterThan(1000);
    expect(events.length % 3).toBe(0);
  });

  it("uses UTC Z timestamps in ICS", () => {
    const dt = DateTime.fromISO("2024-06-15T22:30:00", { zone: TIMEZONE });
    expect(formatUtc(dt)).toMatch(/^\d{8}T\d{6}Z$/);

    const ics = buildIcs({
      ...HOOGEVEEN,
      now: DateTime.fromISO("2024-06-15T12:00:00", { zone: TIMEZONE }),
      dtStamp: DateTime.fromISO("2024-06-15T12:00:00Z"),
    });
    expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/);
    expect(ics).toMatch(/DTEND:\d{8}T\d{6}Z/);
    expect(ics).toContain("DTSTAMP:20240615T120000Z");
  });

  it("names the calendar without place when coords are unknown", () => {
    expect(calendarDisplayName(12.34567, 98.76543)).toBe("Schemer en Nacht");
    expect(calendarDisplayName(52.7286, 6.4763)).toBe(
      "Schemer en Nacht - Hoogeveen",
    );
  });

  it("default endpoint coords match Hoogeveen naming", () => {
    const ics = buildIcs({
      latitude: 52.7286,
      longitude: 6.4763,
      now: DateTime.fromISO("2024-08-01T12:00:00", { zone: TIMEZONE }),
    });
    expect(ics).toContain("X-WR-CALNAME:Schemer en Nacht - Hoogeveen");
  });
});
