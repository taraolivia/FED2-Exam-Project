"use client";
import { useEffect, useRef, useState } from "react";
import type { Venue } from "@/lib/schemas/venue";
import VenueCard from "./VenueCard";
import VenuesSearchFilter from "./VenuesSearchFilter";
import { VenuesGridSkeleton } from "./LoadingSkeleton";
import { useSearchParams } from "next/navigation";

/** API response metadata structure */
type ApiMeta = {
  currentPage: number;
  totalCount: number;
  pageCount: number;
};

/** API response structure for venues */
type ApiResponse = { data: Venue[]; meta: ApiMeta };

/** Number of venues to display per page */
const PAGE_SIZE = 24;

/** Available sorting options */
type SortId = "alpha" | "new" | "priceDesc" | "priceAsc";

/**
 * Maps sort IDs to API parameters
 * @param sortId - The sort option selected by user
 * @returns Object with sort and sortOrder parameters for API
 */
function getSortParams(sortId: SortId): { sort?: string; sortOrder?: string } {
  switch (sortId) {
    case "alpha":
      return { sort: "name", sortOrder: "asc" };
    case "new":
      return { sort: "created", sortOrder: "desc" };
    case "priceDesc":
      return { sort: "price", sortOrder: "desc" };
    case "priceAsc":
      return { sort: "price", sortOrder: "asc" };
    default:
      return { sort: "created", sortOrder: "desc" };
  }
}

/**
 * Fetches a single page of venues from the API
 * @param url - The API endpoint URL with query parameters
 * @param abortSignal - Signal to abort the request if needed
 * @returns Promise resolving to API response with venues and metadata
 * @throws Error if the request fails or returns non-OK status
 */
async function fetchPage(
  url: string,
  abortSignal: AbortSignal,
): Promise<ApiResponse> {
  const res = await fetch(url, { cache: "no-store", signal: abortSignal });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const errorMessage =
      errorData?.errors?.[0]?.message || `HTTP ${res.status}`;
    throw new Error(errorMessage);
  }
  return (await res.json()) as ApiResponse;
}

/**
 * Main venues grid component with search, filtering, and pagination
 * 
 * Features:
 * - Server-side pagination and sorting
 * - Search functionality via URL parameters
 * - Multiple sort options (alphabetical, newest, price)
 * - Loading states and error handling
 * - Responsive grid layout
 * - Auto-scroll to results when searching from hero
 * 
 * @returns JSX element containing the venues grid with controls
 */
export default function VenuesGrid() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || undefined;
  const [venues, setVenues] = useState<Venue[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [sortId, setSortId] = useState<SortId>("new"); // default newest first
  const [page, setPage] = useState(1);

  const abortRef = useRef<AbortController | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Fetch single page of venues
  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const base = new URL("/api/holidaze/venues", window.location.origin);
        base.searchParams.set("page", String(page));
        base.searchParams.set("limit", String(PAGE_SIZE));
        if (q) base.searchParams.set("q", q);

        // Add server-side sorting
        const { sort, sortOrder } = getSortParams(sortId);
        if (sort) base.searchParams.set("sort", sort);
        if (sortOrder) base.searchParams.set("sortOrder", sortOrder);

        const response = await fetchPage(base.toString(), ctrl.signal);
        setVenues(response.data || []);
        setMeta(response.meta);
      } catch (e) {
        if ((e as DOMException)?.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    void run();
    return () => ctrl.abort();
  }, [q, page, sortId]);

  // Server-side pagination data
  const total = meta?.totalCount ?? 0;
  const totalPages = meta?.pageCount ?? 1;
  const currentPage = page;
  const pageItems = venues;

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [q]);

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
        <header>
          <VenuesSearchFilter
            sortId={sortId}
            setSortId={setSortId}
            total={total}
            pageItemsLength={pageItems.length}
          />
        </header>

        {loading ? (
          <VenuesGridSkeleton />
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-600 mb-4">Unable to load venues</p>
            <p className="text-text/70 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-accent-darkest px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : total === 0 ? (
          <div className="p-6">No venues found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Available venues">
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
                className="rounded-lg border border-text/20 bg-background-lightest px-3 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
                className="rounded-lg border border-text/20 bg-background-lightest px-3 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
