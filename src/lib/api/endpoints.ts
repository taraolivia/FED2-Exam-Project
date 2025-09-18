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

function applyCommonParams(url: URL, opts?: VenueQueryOpts) {
  if (!opts) return;
  if (opts.page !== undefined) url.searchParams.set("page", String(opts.page));
  if (opts.limit !== undefined) url.searchParams.set("limit", String(opts.limit));
  if (opts.sort) url.searchParams.set("sort", opts.sort);
  if (opts.sortOrder) url.searchParams.set("sortOrder", opts.sortOrder);
  if (opts._owner === true) url.searchParams.set("_owner", "true");
  if (opts._bookings === true) url.searchParams.set("_bookings", "true");
}

export const venues = {
  list(opts?: VenueQueryOpts) {
    const url = new URL(`${BASE}/holidaze/venues`);
    applyCommonParams(url, opts);
    return url.toString();
  },
  search(q: string, opts?: VenueQueryOpts) {
    if (!q.trim()) throw new Error("Search query cannot be empty");
    const url = new URL(`${BASE}/holidaze/venues/search`);
    url.searchParams.set("q", q);
    applyCommonParams(url, opts);
    return url.toString();
  },
};

export const auth = {
  login() {
    return `${BASE}/auth/login`;
  },
  register() {
    return `${BASE}/auth/register`;
  },
};

export type ProfileQueryOpts = {
  page?: number;
  limit?: number;
  _bookings?: boolean;
  _venues?: boolean;
};

function applyProfileParams(url: URL, opts?: ProfileQueryOpts) {
  if (!opts) return;
  if (opts.page !== undefined) url.searchParams.set("page", String(opts.page));
  if (opts.limit !== undefined) url.searchParams.set("limit", String(opts.limit));
  if (opts._bookings === true) url.searchParams.set("_bookings", "true");
  if (opts._venues === true) url.searchParams.set("_venues", "true");
}

export const profiles = {
  list(opts?: ProfileQueryOpts) {
    const url = new URL(`${BASE}/holidaze/profiles`);
    applyProfileParams(url, opts);
    return url.toString();
  },
  single(name: string, opts?: ProfileQueryOpts) {
    const url = new URL(`${BASE}/holidaze/profiles/${name}`);
    applyProfileParams(url, opts);
    return url.toString();
  },
  update(name: string) {
    return `${BASE}/holidaze/profiles/${name}`;
  },
  bookings(name: string, opts?: ProfileQueryOpts) {
    const url = new URL(`${BASE}/holidaze/profiles/${name}/bookings`);
    applyProfileParams(url, opts);
    return url.toString();
  },
  venues(name: string, opts?: ProfileQueryOpts) {
    const url = new URL(`${BASE}/holidaze/profiles/${name}/venues`);
    applyProfileParams(url, opts);
    return url.toString();
  },
};

export type BookingQueryOpts = {
  page?: number;
  limit?: number;
  _venue?: boolean;
  _customer?: boolean;
};

function applyBookingParams(url: URL, opts?: BookingQueryOpts) {
  if (!opts) return;
  if (opts.page !== undefined) url.searchParams.set("page", String(opts.page));
  if (opts.limit !== undefined) url.searchParams.set("limit", String(opts.limit));
  if (opts._venue === true) url.searchParams.set("_venue", "true");
  if (opts._customer === true) url.searchParams.set("_customer", "true");
}

export const bookings = {
  list(opts?: BookingQueryOpts) {
    const url = new URL(`${BASE}/holidaze/bookings`);
    applyBookingParams(url, opts);
    return url.toString();
  },
  single(id: string, opts?: BookingQueryOpts) {
    const url = new URL(`${BASE}/holidaze/bookings/${id}`);
    applyBookingParams(url, opts);
    return url.toString();
  },
  create() {
    return `${BASE}/holidaze/bookings`;
  },
  update(id: string) {
    return `${BASE}/holidaze/bookings/${id}`;
  },
  delete(id: string) {
    return `${BASE}/holidaze/bookings/${id}`;
  },
};
