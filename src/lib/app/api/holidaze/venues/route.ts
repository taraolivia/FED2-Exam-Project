import { NextResponse } from "next/server";
import { venues as ep } from "@/lib/api/endpoints";
import type { VenueSortField, SortOrder } from "@/lib/api/endpoints";
import { fetchJSON } from "@/lib/api/http";
import { VenueListResponseSchema } from "@/lib/schemas/venue";

function parseIntParam(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseSortField(v: string | null): VenueSortField {
  if (v === "created" || v === "price" || v === "name") return v;
  return "name";
}

function parseSortOrder(v: string | null): SortOrder {
  return v === "desc" ? "desc" : "asc";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") ?? undefined;
    const page = parseIntParam(searchParams.get("page"));
    const limit = parseIntParam(searchParams.get("limit"));

    // ✅ default to alphabetical A→Z
    const sort = parseSortField(searchParams.get("sort"));
    const sortOrder = parseSortOrder(searchParams.get("sortOrder"));

    const _owner = searchParams.get("_owner") === "true" ? true : undefined;
    const _bookings =
      searchParams.get("_bookings") === "true" ? true : undefined;

    const url = q
      ? ep.search(q, { page, limit, sort, sortOrder, _owner, _bookings })
      : ep.list({ page, limit, sort, sortOrder, _owner, _bookings });

    const json = await fetchJSON<unknown>(url, { cache: "no-store" });
    const parsed = VenueListResponseSchema.parse(json);

    return NextResponse.json(parsed, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load venues";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
