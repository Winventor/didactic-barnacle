import { Hono } from "hono";
import { icsResponseHeaders, buildIcs } from "./ics.js";
import { isValidationError, validateCoordinates } from "./validate.js";

export function createApp() {
  const app = new Hono();

  app.get("/health", (c) =>
    c.json({ ok: true, service: "nachtcalendar", timezone: "Europe/Amsterdam" }),
  );

  app.get("/calendar.ics", (c) => {
    const result = validateCoordinates(
      c.req.query("lat"),
      c.req.query("lon") ?? c.req.query("lng"),
    );

    if (isValidationError(result)) {
      return c.text(result.message, result.status, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      });
    }

    const body = buildIcs({
      latitude: result.latitude,
      longitude: result.longitude,
    });

    return c.body(body, 200, icsResponseHeaders());
  });

  // Path-style alternative: /calendar/52.7286/6.4763.ics
  app.get("/calendar/:lat/:lon", (c) => {
    const lat = c.req.param("lat");
    const lon = c.req.param("lon").replace(/\.ics$/i, "");

    const result = validateCoordinates(lat, lon);
    if (isValidationError(result)) {
      return c.text(result.message, result.status, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      });
    }

    const body = buildIcs({
      latitude: result.latitude,
      longitude: result.longitude,
    });

    return c.body(body, 200, icsResponseHeaders());
  });

  return app;
}

export type AppType = ReturnType<typeof createApp>;
