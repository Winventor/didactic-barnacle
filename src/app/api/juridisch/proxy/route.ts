import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout } from "@/legal/utils/retry";

const ALLOWED_HOSTS = new Set([
  "data.rechtspraak.nl",
  "uitspraken.rechtspraak.nl",
]);

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "Parameter url is verplicht" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: "Ongeldige url" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json({ error: "Host niet toegestaan" }, { status: 403 });
  }

  try {
    const upstream = await fetchWithTimeout(target, {
      headers: {
        Accept: "application/atom+xml, application/xml, application/json, */*",
      },
      timeoutMs: 20000,
    });

    const body = await upstream.text();
    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/xml",
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Proxy-request mislukt",
        message: error instanceof Error ? error.message : "Onbekende fout",
      },
      { status: 502 }
    );
  }
}
