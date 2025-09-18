import { fetchJSON } from "./http";
import { bookings as ep } from "./endpoints";
import { BookingCreate, BookingListResponse, BookingSingleResponse } from "@/lib/schemas/booking";

export async function createBooking(data: BookingCreate, accessToken: string) {
  return fetchJSON<BookingSingleResponse>(ep.create(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": process.env.NEXT_PUBLIC_NOROFF_API_KEY!,
    },
    body: JSON.stringify(data),
  });
}

export async function getBookings(accessToken: string) {
  // Get username from token to fetch user's bookings
  const username = getUsernameFromToken(accessToken);
  return fetchJSON<BookingListResponse>(`https://v2.api.noroff.dev/holidaze/profiles/${username}/bookings?_venue=true`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": process.env.NEXT_PUBLIC_NOROFF_API_KEY!,
    },
  });
}

// Helper to extract username from token
function getUsernameFromToken(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.name || payload.sub || '';
  } catch {
    return '';
  }
}

export async function deleteBooking(id: string, accessToken: string) {
  return fetchJSON(ep.delete(id), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": process.env.NEXT_PUBLIC_NOROFF_API_KEY!,
    },
  });
}