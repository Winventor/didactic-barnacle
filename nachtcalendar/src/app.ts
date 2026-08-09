import { Hono } from "hono";
import { icsResponseHeaders, buildIcs } from "./ics.js";
import { isValidationError, validateCoordinates } from "./validate.js";

type Env = {
  Bindings: {
    ASSETS?: {
      fetch: (request: Request) => Promise<Response>;
    };
  };
};

export function createApp() {
  const app = new Hono<Env>();

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

  // On Cloudflare Workers, static assets (public/index.html) are served
  // automatically. This route is a fallback when ASSETS is bound.
  app.get("/", async (c) => {
    if (c.env?.ASSETS) {
      return c.env.ASSETS.fetch(c.req.raw);
    }
    return c.text("Open /index.html via the Node server (npm run dev).", 200);
  });

  return app;
}

export type AppType = ReturnType<typeof createApp>;
