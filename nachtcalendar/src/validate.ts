import { DEFAULT_LOCATION } from "./constants.js";
import { normalizeCoord } from "./locations.js";

export type ValidatedCoords = {
  latitude: number;
  longitude: number;
  usedDefault: boolean;
};

export type ValidationError = {
  status: 400;
  message: string;
};

function parseCoord(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  // Accept only decimal point notation (not comma).
  if (!/^-?\d+(\.\d+)?$/.test(raw.trim())) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return n;
}

/**
 * Validate lat/lon query parameters.
 * - Both omitted → Hoogeveen defaults
 * - One present without the other → error
 * - Out of range → error
 */
export function validateCoordinates(
  latRaw: string | null | undefined,
  lonRaw: string | null | undefined,
): ValidatedCoords | ValidationError {
  const latPresent = latRaw !== null && latRaw !== undefined && latRaw !== "";
  const lonPresent = lonRaw !== null && lonRaw !== undefined && lonRaw !== "";

  if (!latPresent && !lonPresent) {
    return {
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
      usedDefault: true,
    };
  }

  if (latPresent !== lonPresent) {
    return {
      status: 400,
      message:
        "Geef zowel lat als lon op, of laat beide weg voor de standaardlocatie Hoogeveen. Voorbeeld: /calendar.ics?lat=52.7286&lon=6.4763",
    };
  }

  const latitude = parseCoord(latRaw);
  const longitude = parseCoord(lonRaw);

  if (latitude === null) {
    return {
      status: 400,
      message:
        "Ongeldige latitude. Gebruik een decimaal getal met een punt, bijvoorbeeld lat=52.7286",
    };
  }

  if (longitude === null) {
    return {
      status: 400,
      message:
        "Ongeldige longitude. Gebruik een decimaal getal met een punt, bijvoorbeeld lon=6.4763",
    };
  }

  if (latitude < -90 || latitude > 90) {
    return {
      status: 400,
      message: "Latitude moet tussen -90 en 90 liggen.",
    };
  }

  if (longitude < -180 || longitude > 180) {
    return {
      status: 400,
      message: "Longitude moet tussen -180 en 180 liggen.",
    };
  }

  // Normalize precision for stable downstream UIDs / URLs.
  return {
    latitude: Number(normalizeCoord(latitude)),
    longitude: Number(normalizeCoord(longitude)),
    usedDefault: false,
  };
}

export function isValidationError(
  value: ValidatedCoords | ValidationError,
): value is ValidationError {
  return "status" in value;
}
