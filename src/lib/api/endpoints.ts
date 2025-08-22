export const API_BASE = process.env.HOLIDAZE_API_BASE!;

// ---- Auth
export const auth = {
  register: () => `${API_BASE}/auth/register`,
  login: () => `${API_BASE}/auth/login`,
  createApiKey: () => `${API_BASE}/auth/create-api-key`,
};

// ---- Venues (public list/single; search is a separate path)
export const venues = {
  list: (opts?: {
    page?: number;
    limit?: number;
    _owner?: boolean;
    _bookings?: boolean;
  }) => {
    const u = new URL(`${API_BASE}/holidaze/venues`);
    if (opts?.page) u.searchParams.set("page", String(opts.page));
    if (opts?.limit) u.searchParams.set("limit", String(opts.limit));
    if (opts?._owner) u.searchParams.set("_owner", "true");
    if (opts?._bookings) u.searchParams.set("_bookings", "true");
    return u.toString();
  },
  search: (
    q: string,
    opts?: {
      page?: number;
      limit?: number;
      _owner?: boolean;
      _bookings?: boolean;
    },
  ) => {
    const u = new URL(`${API_BASE}/holidaze/venues/search`);
    u.searchParams.set("q", q);
    if (opts?.page) u.searchParams.set("page", String(opts.page));
    if (opts?.limit) u.searchParams.set("limit", String(opts.limit));
    if (opts?._owner) u.searchParams.set("_owner", "true");
    if (opts?._bookings) u.searchParams.set("_bookings", "true");
    return u.toString();
  },
  single: (id: string, flags?: { _owner?: boolean; _bookings?: boolean }) => {
    const u = new URL(`${API_BASE}/holidaze/venues/${id}`);
    if (flags?._owner) u.searchParams.set("_owner", "true");
    if (flags?._bookings) u.searchParams.set("_bookings", "true");
    return u.toString();
  },
};
