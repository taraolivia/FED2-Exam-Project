// src/app/api/holidaze/venues/route.ts
import { NextResponse } from "next/server";
// Prefer the alias if it's working:
import { venues as ep } from "@/lib/api/endpoints";
import { fetchJSON } from "@/lib/api/http";
// If the alias gives you trouble, switch this import to:
// import { VenueListResponseSchema } from "../../lib/schemas/venue";
import { VenueListResponseSchema } from "@/lib/schemas/venue";

function parseVenueParams(searchParams: URLSearchParams) {
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  const pageNum = page ? parseInt(page, 10) : undefined;
  const limitNum = limit ? parseInt(limit, 10) : undefined;

  return {
    page:
      pageNum && !Number.isNaN(pageNum) && pageNum > 0 ? pageNum : undefined,
    limit:
      limitNum && !Number.isNaN(limitNum) && limitNum > 0
        ? limitNum
        : undefined,
    _owner: searchParams.get("_owner") === "true" ? true : undefined,
    _bookings: searchParams.get("_bookings") === "true" ? true : undefined,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? undefined;
    const params = parseVenueParams(searchParams);

    const url = q ? ep.search(q, params) : ep.list(params);

    // Public list/single endpoints don’t require auth headers.
    const json = await fetchJSON<unknown>(url);

    // Validate the v2 shape: { data, meta }
    const parsed = VenueListResponseSchema.parse(json);

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    // Check if it's a URL or validation error (client error)
    if (
      err instanceof TypeError ||
      (err instanceof Error && err.message?.includes("Invalid URL"))
    ) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 },
      );
    }

    const status = (err as any)?.status ?? 500;
    const message =
      err instanceof Error ? err.message : "Failed to load venues";
    return NextResponse.json({ error: message }, { status });
  }
}
