import { NextResponse } from "next/server";
import { venues as ep } from "@/lib/api/endpoints";
import { fetchJSON } from "@/lib/api/http";
import { VenueListResponseSchema } from "../../../../schemas/venue";

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
          page: page ? +page : undefined,
          limit: limit ? +limit : undefined,
          _owner,
          _bookings,
        })
      : ep.list({
          page: page ? +page : undefined,
          limit: limit ? +limit : undefined,
          _owner,
          _bookings,
        });

    // Public endpoint in docs, so no auth headers required for list/single. :contentReference[oaicite:10]{index=10}
    const json = await fetchJSON<unknown>(url);
    const parsed = VenueListResponseSchema.parse(json);
    return NextResponse.json(parsed);
  } catch (err: any) {
    const status = err?.status ?? 500;
    const message = err?.message ?? "Failed to load venues";
    return NextResponse.json({ error: message }, { status });
  }
}
