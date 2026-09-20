import { NextRequest, NextResponse } from "next/server";
import { searchOrchestrator } from "@/legal/services/search-orchestrator";
import { isEcli } from "@/legal/utils/rechtspraak-search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const adapter = request.nextUrl.searchParams.get("adapter");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10);

  if (!q) {
    return NextResponse.json({ error: "Parameter q is verplicht" }, { status: 400 });
  }

  const query = isEcli(q)
    ? { identifier: q.trim(), limit }
    : { text: q, limit };

  const results = adapter
    ? await searchOrchestrator.searchAll(query, [adapter])
    : await searchOrchestrator.searchByPriority(query);

  return NextResponse.json({ query: q, count: results.length, results });
}
