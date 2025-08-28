// lib/api/endpoints.ts
const BASE = process.env.NOROFF_API_BASE ?? "https://v2.api.noroff.dev";

export type VenueSortField = "name" | "created" | "price";
export type SortOrder = "asc" | "desc";

export type VenueQueryOpts = {
  page?: number;
  limit?: number;
  sort?: VenueSortField;
  sortOrder?: SortOrder;
  _owner?: boolean;
  _bookings?: boolean;
};

function applyCommonParams(u: URL, opts?: VenueQueryOpts) {
  if (!opts) return;
  if (opts.page) u.searchParams.set("page", String(opts.page));
  if (opts.limit) u.searchParams.set("limit", String(opts.limit));
  if (opts.sort) u.searchParams.set("sort", opts.sort);
  if (opts.sortOrder) u.searchParams.set("sortOrder", opts.sortOrder);
  if (opts._owner) u.searchParams.set("_owner", "true");
  if (opts._bookings) u.searchParams.set("_bookings", "true");
}

export const venues = {
  list(opts?: VenueQueryOpts) {
    const u = new URL(`${BASE}/holidaze/venues`);
    applyCommonParams(u, opts);
    return u.toString();
  },
  search(q: string, opts?: VenueQueryOpts) {
    const u = new URL(`${BASE}/holidaze/venues/search`);
    u.searchParams.set("q", q);
    applyCommonParams(u, opts);
    return u.toString();
  },
};
