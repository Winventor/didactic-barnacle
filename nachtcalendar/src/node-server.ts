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

    const request = new Request(url, {
      method: req.method,
      headers: req.headers as HeadersInit,
    });
    const response = await app.fetch(request);
    const buffer = Buffer.from(await response.arrayBuffer());

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    res.writeHead(response.status, headers);
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
