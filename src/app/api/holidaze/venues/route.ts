// src/app/api/holidaze/venues/route.ts
import { NextResponse } from "next/server";
// Prefer the alias if it's working:
import { venues as ep } from "@/lib/api/endpoints";
import { fetchJSON } from "@/lib/api/http";
// If the alias gives you trouble, switch this import to:
// import { VenueListResponseSchema } from "../../lib/schemas/venue";
import { VenueListResponseSchema } from "@/lib/schemas/venue";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") ?? undefined;
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const _owner = searchParams.get("_owner") === "true" ? true : undefined;
    const _bookings =
      searchParams.get("_bookings") === "true" ? true : undefined;

    const url = q
      ? ep.search(q, {
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
          _owner,
          _bookings,
        })
      : ep.list({
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
          _owner,
          _bookings,
        });

    // Public list/single endpoints don’t require auth headers.
    const json = await fetchJSON<unknown>(url);

    // Validate the v2 shape: { data, meta }
    const parsed = VenueListResponseSchema.parse(json);

    return NextResponse.json(parsed);
  } catch (err: any) {
    const status = err?.status ?? 500;
    const message = err?.message ?? "Failed to load venues";
    return NextResponse.json({ error: message }, { status });
  }
}
