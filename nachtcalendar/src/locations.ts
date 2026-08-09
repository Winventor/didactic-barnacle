import { COORD_DECIMALS, DEFAULT_LOCATION } from "./constants.js";

export type NamedLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

/** Known Dutch locations (UI presets + optional calendar name metadata). */
export const KNOWN_LOCATIONS: NamedLocation[] = [
  {
    name: DEFAULT_LOCATION.name,
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
  },
  { name: "Amsterdam", latitude: 52.3676, longitude: 4.9041 },
  { name: "Maastricht", latitude: 50.8514, longitude: 5.691 },
  { name: "Groningen", latitude: 53.2194, longitude: 6.5665 },
  { name: "Vlissingen", latitude: 51.4426, longitude: 3.5735 },
];

export function normalizeCoord(value: number): string {
  return value.toFixed(COORD_DECIMALS);
}

export function coordsMatch(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): boolean {
  return (
    normalizeCoord(aLat) === normalizeCoord(bLat) &&
    normalizeCoord(aLon) === normalizeCoord(bLon)
  );
}

/**
 * Resolve a display name for calendar metadata.
 * Only exact matches against the known list (or default) get a place name.
 */
export function resolveLocationName(
  latitude: number,
  longitude: number,
): string | null {
  for (const loc of KNOWN_LOCATIONS) {
    if (coordsMatch(latitude, longitude, loc.latitude, loc.longitude)) {
      return loc.name;
    }
  }
  return null;
}

export function calendarDisplayName(
  latitude: number,
  longitude: number,
): string {
  const name = resolveLocationName(latitude, longitude);
  return name ? `Schemer en Nacht - ${name}` : "Schemer en Nacht";
}
