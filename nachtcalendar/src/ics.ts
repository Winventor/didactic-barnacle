import { DateTime } from "luxon";
import { getNightCycleEvents } from "./astronomy.js";
import {
  CACHE_CONTROL,
  CALENDAR_DESCRIPTION,
  TIMEZONE,
} from "./constants.js";
import { calendarDisplayName, normalizeCoord } from "./locations.js";
import { eachLocalDay, getCalendarWindow } from "./window.js";

export type CalendarEvent = {
  uid: string;
  summary: string;
  dtStart: DateTime;
  dtEnd: DateTime;
  description: string;
};

export type BuildCalendarOptions = {
  latitude: number;
  longitude: number;
  now?: DateTime;
  /** Override DTSTAMP for deterministic tests. */
  dtStamp?: DateTime;
};

function foldLine(line: string): string {
  // RFC 5545: fold at 75 octets (not JS string length), never split UTF-8 chars.
  const encoder = new TextEncoder();
  const bytes = encoder.encode(line);
  if (bytes.length <= 75) return line;

  const parts: string[] = [];
  let offset = 0;
  let first = true;
  const decoder = new TextDecoder();

  while (offset < bytes.length) {
    const budget = first ? 75 : 74;
    let end = Math.min(offset + budget, bytes.length);
    // Back up if we landed mid-codepoint.
    while (end > offset && (bytes[end] & 0xc0) === 0x80) {
      end -= 1;
    }
    if (end === offset) end = Math.min(offset + budget, bytes.length);
    const chunk = decoder.decode(bytes.subarray(offset, end));
    parts.push(first ? chunk : ` ${chunk}`);
    offset = end;
    first = false;
  }

  return parts.join("\r\n");
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Format as UTC iCalendar datetime: 20240101T180000Z */
export function formatUtc(dt: DateTime): string {
  return dt.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
}

function buildUid(
  kind: "schemer-evening" | "nacht" | "schemer-morning",
  eveningDate: DateTime,
  latitude: number,
  longitude: number,
): string {
  const date = eveningDate.setZone(TIMEZONE).toFormat("yyyy-MM-dd");
  const lat = normalizeCoord(latitude);
  const lon = normalizeCoord(longitude);
  return `${kind}-${date}-${lat}-${lon}@nachtcalendar`;
}

export function buildEvents(options: BuildCalendarOptions): CalendarEvent[] {
  const { latitude, longitude } = options;
  const now = options.now ?? DateTime.now();
  const { start, end } = getCalendarWindow(now);
  const events: CalendarEvent[] = [];

  for (const eveningDate of eachLocalDay(start, end)) {
    const sun = getNightCycleEvents(eveningDate, latitude, longitude);
    if (!sun) continue;

    const dateLabel = eveningDate.setZone(TIMEZONE).toFormat("yyyy-MM-dd");

    events.push({
      uid: buildUid("schemer-evening", eveningDate, latitude, longitude),
      summary: "Schemer",
      dtStart: sun.sunset,
      dtEnd: sun.civilDusk,
      description: `Avondschemer ${dateLabel}: zonsondergang tot einde burgerlijke schemering (zon -6 graden).`,
    });

    events.push({
      uid: buildUid("nacht", eveningDate, latitude, longitude),
      summary: "Nacht",
      dtStart: sun.civilDusk,
      dtEnd: sun.civilDawn,
      description: `Nacht na ${dateLabel}: einde burgerlijke avondschemering tot begin burgerlijke ochtendschemering.`,
    });

    events.push({
      uid: buildUid("schemer-morning", eveningDate, latitude, longitude),
      summary: "Schemer",
      dtStart: sun.civilDawn,
      dtEnd: sun.sunrise,
      description: `Ochtendschemer na ${dateLabel}: begin burgerlijke schemering tot zonsopkomst.`,
    });
  }

  return events;
}

export function buildIcs(options: BuildCalendarOptions): string {
  const { latitude, longitude } = options;
  const dtStamp = options.dtStamp ?? DateTime.utc();
  const calName = calendarDisplayName(latitude, longitude);
  const events = buildEvents(options);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nachtcalendar//Schemer en Nacht//NL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calName)}`,
    `X-WR-CALDESC:${escapeText(CALENDAR_DESCRIPTION)}`,
    `X-WR-TIMEZONE:${TIMEZONE}`,
    "NAME:" + escapeText(calName),
  ];

  for (const event of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.uid}`);
    lines.push(`DTSTAMP:${formatUtc(dtStamp)}`);
    lines.push(`DTSTART:${formatUtc(event.dtStart)}`);
    lines.push(`DTEND:${formatUtc(event.dtEnd)}`);
    lines.push(`SUMMARY:${escapeText(event.summary)}`);
    lines.push(`DESCRIPTION:${escapeText(event.description)}`);
    lines.push(
      `LOCATION:${escapeText(`${normalizeCoord(latitude)}, ${normalizeCoord(longitude)}`)}`,
    );
    lines.push("TRANSP:TRANSPARENT");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function icsResponseHeaders(): Record<string, string> {
  return {
    "Content-Type": "text/calendar; charset=utf-8",
    "Content-Disposition": 'inline; filename="schemer-nacht.ics"',
    "Cache-Control": CACHE_CONTROL,
    "Access-Control-Allow-Origin": "*",
  };
}
