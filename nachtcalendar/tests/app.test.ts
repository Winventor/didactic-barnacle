import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("HTTP calendar endpoint", () => {
  const app = createApp();

  it("serves Hoogeveen calendar without query params", async () => {
    const res = await app.request("/calendar.ics");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/calendar");
    const body = await res.text();
    expect(body).toContain("BEGIN:VCALENDAR");
    expect(body).toContain("X-WR-CALNAME:Schemer en Nacht - Hoogeveen");
  });

  it("serves Amsterdam when coordinates are provided", async () => {
    const res = await app.request("/calendar.ics?lat=52.3676&lon=4.9041");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("X-WR-CALNAME:Schemer en Nacht - Amsterdam");
    expect(body).toContain("nacht-");
  });

  it("accepts path-style URLs", async () => {
    const res = await app.request("/calendar/52.7286/6.4763.ics");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("BEGIN:VCALENDAR");
  });

  it("returns a clear HTTP error for invalid coordinates", async () => {
    const res = await app.request("/calendar.ics?lat=999&lon=6");
    expect(res.status).toBe(400);
    expect(res.headers.get("Content-Type")).toContain("text/plain");
    const body = await res.text();
    expect(body).not.toContain("BEGIN:VCALENDAR");
    expect(body.toLowerCase()).toContain("latitude");
  });

  it("sets a short cache duration", async () => {
    const res = await app.request("/calendar.ics");
    const cache = res.headers.get("Cache-Control") ?? "";
    expect(cache).toContain("max-age=21600");
  });
});
