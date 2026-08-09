import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT ?? 8787);

createServer(async (req, res) => {
  try {
    const host = req.headers.host ?? `localhost:${port}`;
    const url = new URL(req.url ?? "/", `http://${host}`);

    if (url.pathname === "/" || url.pathname === "/index.html") {
      const html = await readFile(join(process.cwd(), "public", "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    const incoming = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") incoming.set(key, value);
      else if (Array.isArray(value)) incoming.set(key, value.join(", "));
    }

    const request = new Request(url, {
      method: req.method,
      headers: incoming,
    });
    const response = await app.fetch(request);
    const buffer = Buffer.from(await response.arrayBuffer());

    const outgoing: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      outgoing[key] = value;
    });

    res.writeHead(response.status, outgoing);
    res.end(buffer);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Interne serverfout");
  }
}).listen(port, () => {
  console.log(`Nachtcalendar listening on http://localhost:${port}`);
  console.log(`ICS: http://localhost:${port}/calendar.ics`);
});
