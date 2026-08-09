/** IANA timezone for Dutch locations (handles CET/CEST automatically). */
export const TIMEZONE = "Europe/Amsterdam";

/** Hardcoded safe default: Hoogeveen. */
export const DEFAULT_LOCATION = {
  name: "Hoogeveen",
  latitude: 52.7286,
  longitude: 6.4763,
  timezone: TIMEZONE,
} as const;

/** Decimal places used for stable UIDs and URL normalization. */
export const COORD_DECIMALS = 5;

export const CALENDAR_NAME = "Schemer en Nacht";

export const CALENDAR_DESCRIPTION =
  "Dynamische kalender met avondschemer, nacht en ochtendschemer op basis van zonsondergang, burgerlijke schemering (-6 graden) en zonsopkomst voor jouw locatie.";

/** HTTP cache: a few hours; clients can refresh at least daily. */
export const CACHE_CONTROL = "public, max-age=21600, stale-while-revalidate=3600";
