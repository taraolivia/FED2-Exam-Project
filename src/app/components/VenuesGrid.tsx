"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Venue } from "@/lib/schemas/venue";
import VenueCard from "./VenueCard";
import { useSearchParams } from "next/navigation";

type ApiMeta = {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
};
type ApiResponse = { data: Venue[]; meta: ApiMeta };

const PAGE_SIZE = 24;

// ---- Sort config
type SortId = "alpha" | "new" | "priceDesc" | "priceAsc";
type SortOption = {
  id: SortId;
  label: string;
};
const SORT_OPTIONS: SortOption[] = [
  { id: "alpha", label: "Alphabetically (A–Z)" },
  { id: "new", label: "Newly added" },
  { id: "priceDesc", label: "Price: high → low" },
  { id: "priceAsc", label: "Price: low → high" },
];

// Safe accessors (in case fields are optional in your schema)
function getName(v: Venue): string {
  return (v as unknown as { name?: string }).name ?? "";
}
function getPrice(v: Venue): number {
  const p = (v as unknown as { price?: number }).price;
  return typeof p === "number" ? p : Number.NEGATIVE_INFINITY; // pushes unknowns to end
}
function getCreated(v: Venue): number {
  const c = (v as unknown as { created?: string }).created;
  const t = c ? Date.parse(c) : NaN;
  return Number.isFinite(t) ? t : 0;
}

function compare(sortId: SortId) {
  switch (sortId) {
    case "alpha":
      return (a: Venue, b: Venue) =>
        getName(a).localeCompare(getName(b), undefined, {
          sensitivity: "base",
        });
    case "new":
      // newest first
      return (a: Venue, b: Venue) => getCreated(b) - getCreated(a);
    case "priceDesc":
      return (a: Venue, b: Venue) => getPrice(b) - getPrice(a);
    case "priceAsc":
      return (a: Venue, b: Venue) => getPrice(a) - getPrice(b);
  }
}

async function fetchPage(
  url: string,
  abortSignal: AbortSignal,
): Promise<ApiResponse> {
  const res = await fetch(url, { cache: "no-store", signal: abortSignal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as ApiResponse;
}

export default function VenuesGrid() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || undefined;
  const [all, setAll] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [sortId, setSortId] = useState<SortId>("alpha"); // default A→Z
  const [page, setPage] = useState(1);

  const abortRef = useRef<AbortController | null>(null);

  // Fetch ALL venues across pages once per (q) change
  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    async function run() {
      try {
        setLoading(true);
        setError(null);
        setAll([]);
        setPage(1);

        // 1) Get page 1 to discover meta.pageCount
        const base = new URL("/api/holidaze/venues", window.location.origin);
        base.searchParams.set("page", "1");
        base.searchParams.set("limit", "100"); // larger page to reduce requests (tune if needed)
        if (q) base.searchParams.set("q", q);

        const first = await fetchPage(base.toString(), ctrl.signal);
        const meta = first.meta;
        const pages = Math.max(meta?.pageCount ?? 1, 1);

        // 2) If only one page, done
        if (pages === 1) {
          setAll(first.data);
          return;
        }

        // 3) Fetch remaining pages concurrently
        const promises: Promise<ApiResponse>[] = [];
        for (let p = 2; p <= pages; p++) {
          const u = new URL("/api/holidaze/venues", window.location.origin);
          u.searchParams.set("page", String(p));
          u.searchParams.set("limit", "100");
          if (q) u.searchParams.set("q", q);
          promises.push(fetchPage(u.toString(), ctrl.signal));
        }

        const rest = await Promise.all(promises);
        // 4) Merge + de-dup by id
        const allData = [first, ...rest].flatMap((r) => r.data);
        const uniqueMap = new Map<string, Venue>();
        for (const v of allData) {
          const id = (v as unknown as { id?: string }).id ?? "";
          if (id && !uniqueMap.has(id)) uniqueMap.set(id, v);
        }
        setAll(Array.from(uniqueMap.values()));
      } catch (e) {
        if ((e as DOMException)?.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    void run();
    return () => ctrl.abort();
  }, [q]);

  // Sorted items in memory
  const sorted = useMemo(() => {
    const arr = [...all];
    arr.sort(compare(sortId));
    return arr;
  }, [all, sortId]);

  // Client-side pagination slice
  const total = sorted.length;
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(start, start + PAGE_SIZE);

  // Reset to page 1 when sort changes (so users see the start of the new order)
  useEffect(() => {
    setPage(1);
  }, [sortId]);

  return (
    <section aria-labelledby="venues-heading" className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="venues-heading" className="font-heading text-3xl">
              Venues
            </h2>
            <p className="mt-1 text-sm text-text/70">
              Showing <span className="font-medium">{pageItems.length}</span> of{" "}
              <span className="font-medium">{total}</span>
            </p>
          </div>

          {/* Sort control */}
          <label className="flex items-center gap-2 text-sm">
            <span className="text-text/70">Sort by</span>
            <select
              value={sortId}
              onChange={(e) => setSortId(e.target.value as SortId)}
              className="rounded-lg border border-text/20 bg-background-lightest px-3 py-2"
              aria-label="Sort venues"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="p-6">Loading venues…</div>
        ) : error ? (
          <div className="p-6 text-red-700">Failed to load venues: {error}</div>
        ) : total === 0 ? (
          <div className="p-6">No venues found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((v) => (
                <VenueCard
                  key={(v as unknown as { id: string }).id}
                  venue={v}
                />
              ))}
            </div>

            {/* Client-side pagination controls */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded-lg border border-text/20 bg-background-lightest px-3 py-2 disabled:opacity-60"
              >
                Previous
              </button>
              <span className="text-sm text-text/70">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-text/20 bg-background-lightest px-3 py-2 disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
