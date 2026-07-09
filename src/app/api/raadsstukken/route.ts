import { NextRequest, NextResponse } from "next/server";
import { fetchMunicipalities, searchRaadsstukken } from "@/lib/ori-api";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  try {
    const typeParam = searchParams.get("type");
    const type =
      typeParam && typeParam !== "alle" && DOCUMENT_TYPES.includes(typeParam as DocumentType)
        ? (typeParam as DocumentType)
        : "alle";

    const statusParam = searchParams.get("status");
    const status =
      statusParam === "aangenomen" ||
      statusParam === "verworpen" ||
      statusParam === "onbekend"
        ? statusParam
        : "alle";

    const result = await searchRaadsstukken({
      type,
      status,
      gemeente: searchParams.get("gemeente") ?? undefined,
      zoekterm: searchParams.get("q") ?? undefined,
      page: Number(searchParams.get("page") ?? "1"),
      pageSize: Number(searchParams.get("pageSize") ?? "25"),
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Onbekende serverfout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const municipalities = await fetchMunicipalities();
    return NextResponse.json({ municipalities });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Onbekende serverfout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
