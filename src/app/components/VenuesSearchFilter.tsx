"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** Available sorting options for venues */
type SortId = "alpha" | "new" | "priceDesc" | "priceAsc";

/** Sort option configuration */
type SortOption = {
  id: SortId;
  label: string;
};

/** Available sorting options with user-friendly labels */
const SORT_OPTIONS: SortOption[] = [
  { id: "new", label: "Newly added" },
  { id: "alpha", label: "Alphabetically (A–Z)" },
  { id: "priceDesc", label: "Price: high → low" },
  { id: "priceAsc", label: "Price: low → high" },
];

/** Props for the VenuesSearchFilter component */
type Props = {
  /** Current sort option */
  sortId: SortId;
  /** Function to update sort option */
  setSortId: (sortId: SortId) => void;
  /** Total number of venues available */
  total: number;
  /** Number of venues on current page */
  pageItemsLength: number;
};

/**
 * Search and filter controls for the venues grid
 * 
 * Features:
 * - Text search with URL parameter management
 * - Sort options (alphabetical, newest, price)
 * - Search result display and clearing
 * - Results count display
 * - Responsive design
 * 
 * @param props - Component props
 * @returns JSX element with search and filter controls
 */
export default function VenuesSearchFilter({
  sortId,
  setSortId,
  total,
  pageItemsLength,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || undefined;
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim());
    }
    router.replace(`/?${params.toString()}`, { scroll: false });
    setSearchTerm("");
  };

  const clearSearch = () => {
    router.replace("/", { scroll: false });
  };

  return (
    <div className="mb-6">
      {/* Header and controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="venues-heading" className="font-heading text-3xl">
            Venues
          </h2>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="my-4">
            <div className="relative max-w-md">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search venues..."
                className="w-full rounded-lg border border-text/20 bg-background-lightest px-4 py-2 pr-20 md:pr-50"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-primary px-3 py-1 text-sm text-accent-darkest hover:opacity-90 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Sort control */}
        <label className="flex items-center gap-2 text-sm my-4">
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
      </div>{" "}
      {q && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-text/70">Search results for:</span>
          <span className="font-medium">"{q}"</span>
          <button
            onClick={clearSearch}
            className="text-primary hover:underline cursor-pointer"
          >
            Clear search
          </button>
        </div>
      )}
      <p className="mt-1 text-sm text-text/70">
        Showing <span className="font-medium">{pageItemsLength}</span> of{" "}
        <span className="font-medium">{total}</span>
      </p>
    </div>
  );
}
