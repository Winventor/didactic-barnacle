import { describe, expect, it } from "vitest";
import { isValidationError, validateCoordinates } from "../src/validate.js";
import { DEFAULT_LOCATION } from "../src/constants.js";

describe("URL / coordinate validation", () => {
  it("uses Hoogeveen when lat and lon are omitted", () => {
    const result = validateCoordinates(null, null);
    expect(isValidationError(result)).toBe(false);
    if (isValidationError(result)) return;
    expect(result.latitude).toBe(DEFAULT_LOCATION.latitude);
    expect(result.longitude).toBe(DEFAULT_LOCATION.longitude);
    expect(result.usedDefault).toBe(true);
  });

  it("accepts valid Dutch coordinates", () => {
    const result = validateCoordinates("52.3676", "4.9041");
    expect(isValidationError(result)).toBe(false);
    if (isValidationError(result)) return;
    expect(result.latitude).toBe(52.3676);
    expect(result.longitude).toBe(4.9041);
    expect(result.usedDefault).toBe(false);
  });

  it("rejects missing lon when lat is present", () => {
    const result = validateCoordinates("52.7", null);
    expect(isValidationError(result)).toBe(true);
  });

  it("rejects comma decimals", () => {
    const result = validateCoordinates("52,7286", "6,4763");
    expect(isValidationError(result)).toBe(true);
  });

  it("rejects latitude out of range", () => {
    const result = validateCoordinates("91", "6.4763");
    expect(isValidationError(result)).toBe(true);
    if (!isValidationError(result)) return;
    expect(result.status).toBe(400);
  });

  it("rejects longitude out of range", () => {
    const result = validateCoordinates("52.7286", "181");
    expect(isValidationError(result)).toBe(true);
  });

  it("normalizes to 5 decimals for stable UIDs", () => {
    const result = validateCoordinates("52.72860001", "6.47630009");
    expect(isValidationError(result)).toBe(false);
    if (isValidationError(result)) return;
    expect(result.latitude).toBe(52.7286);
    expect(result.longitude).toBe(6.4763);
  });
});
