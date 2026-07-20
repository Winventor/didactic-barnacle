import { NextResponse } from "next/server";
import { searchOrchestrator } from "@/legal/services/search-orchestrator";
import { SOURCE_REGISTRY } from "@/legal/config/source-registry";

export async function GET() {
  const health = await searchOrchestrator.healthCheckAll();
  return NextResponse.json({
    sources: SOURCE_REGISTRY,
    health,
    checkedAt: new Date().toISOString(),
  });
}
