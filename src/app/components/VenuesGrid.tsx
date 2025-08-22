"use client";
import { useEffect, useState } from "react";
import type { Venue } from "@/lib/schemas/venue";
import VenueCard from "./VenueCard";

type ApiResponse = { data: Venue[]; meta: Record<string, unknown> };

export default function VenuesGrid({ q }: { q?: string }) {
  const [data, setData] = useState<Venue[]>([]); // ✅ always an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = q
      ? `/api/holidaze/venues?q=${encodeURIComponent(q)}&limit=12`
      : `/api/holidaze/venues?limit=12`;

    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = (await r.json()) as Partial<ApiResponse>;
        // ✅ defensive: only set array, otherwise fallback to []
        setData(Array.isArray(json?.data) ? json!.data! : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q]);

  if (loading) return <div className="p-6">Loading venues…</div>;
  if (error)
    return (
      <div className="p-6 text-red-700">Failed to load venues: {error}</div>
    );
  if (!data.length) return <div className="p-6">No venues found.</div>; // ✅ now safe

  // VenuesGrid.tsx snippet
  return (
    <section aria-labelledby="venues-heading" className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h2 id="venues-heading" className="mb-6 font-heading text-3xl">
          Venues
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      </div>
    </section>
  );
}
