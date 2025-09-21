"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Venue } from "@/lib/schemas/venue";
import VenueCard from "./VenueCard";
import VenuesSearchFilter from "./VenuesSearchFilter";
import { VenuesGridSkeleton } from "./LoadingSkeleton";
import { useSearchParams } from "next/navigation";

type ApiMeta = {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
};
type ApiResponse = { data: Venue[]; meta: ApiMeta };

const PAGE_SIZE = 24;
const API_LIMIT = 100;

// ---- Sort config
type SortId = "alpha" | "new" | "priceDesc" | "priceAsc";
type SortOption = {
  id: SortId;
  label: string;
};

// Move outside component to prevent recreation on renders
const SORT_OPTIONS: SortOption[] = [
  { id: "alpha", label: "Alphabetically (A–Z)" },
  { id: "new", label: "Newly added" },
  { id: "priceDesc", label: "Price: high → low" },
  { id: "priceAsc", label: "Price: low → high" },
];

// Safe accessors using proper typing
function getName(v: Venue): string {
  return v.name ?? "";
}
function getPrice(v: Venue): number {
  return typeof v.price === "number" ? v.price : Number.NEGATIVE_INFINITY;
}
function getCreated(v: Venue): number {
  const t = v.created ? Date.parse(v.created) : NaN;
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
    default:
      return () => 0;
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
  const sectionRef = useRef<HTMLElement>(null);

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
        base.searchParams.set("limit", String(API_LIMIT));
        if (q) base.searchParams.set("q", q);

        const first = await fetchPage(base.toString(), ctrl.signal);
        const meta = first.meta;
        const pages = Math.max(meta?.pageCount ?? 1, 1);

        // 2) If only one page, done
        if (pages === 1) {
          setAll(first.data);
          return;
        }

        // 3) Fetch remaining pages with rate limiting (max 3 concurrent)
        const rest: ApiResponse[] = [];
        const BATCH_SIZE = 3;
        
        for (let i = 2; i <= pages; i += BATCH_SIZE) {
          const batch: Promise<ApiResponse>[] = [];
          const end = Math.min(i + BATCH_SIZE - 1, pages);
          
          for (let p = i; p <= end; p++) {
            const u = new URL("/api/holidaze/venues", window.location.origin);

            u.searchParams.set("page", String(p));
            u.searchParams.set("limit", String(API_LIMIT));
            if (q) u.searchParams.set("q", q);
            batch.push(fetchPage(u.toString(), ctrl.signal));
          }
          
          const batchResults = await Promise.all(batch);
          rest.push(...batchResults);
          
          // Small delay between batches to respect rate limits
          if (i + BATCH_SIZE <= pages) {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
          }
        }
        // 4) Merge + de-dup by id
        const allData = [first, ...rest].flatMap((r) => r.data);
        const uniqueMap = new Map<string, Venue>();
        for (const v of allData) {
          if (v.id && !uniqueMap.has(v.id)) uniqueMap.set(v.id, v);
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

  // Auto-scroll to venues section when search results load (only from hero)
  useEffect(() => {
    if (q && !loading && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [q, loading]);

  return (
    <section
      id="venues"
      ref={sectionRef}
      aria-labelledby="venues-heading"
      className="bg-background"
    >
      <div className="mx-auto max-w-6xl px-4 py-8">
        <VenuesSearchFilter
          sortId={sortId}
          setSortId={setSortId}
          total={total}
          pageItemsLength={pageItems.length}
        />

        {loading ? (
          <VenuesGridSkeleton />
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-600 mb-4">Unable to load venues</p>
            <p className="text-text/70 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-accent-darkest px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        ) : total === 0 ? (
          <div className="p-6">No venues found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((v) => (
                <VenueCard key={v.id} venue={v} />
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
