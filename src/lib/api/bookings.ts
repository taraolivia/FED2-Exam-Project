import { fetchJSON } from "./http";
import { bookings as ep } from "./endpoints";
import {
  BookingCreate,
  BookingListResponse,
  BookingSingleResponse,
} from "@/lib/schemas/booking";

/**
 * Creates a new booking for a venue
 * @param data - Booking creation data
 * @param accessToken - User authentication token
 * @returns Promise resolving to created booking
 */
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

/**
 * Fetches current user's bookings with venue details
 * @param accessToken - User authentication token
 * @returns Promise resolving to user's bookings
 */
export async function getBookings(accessToken: string) {
  // Get username from token to fetch user's bookings
  const username = getUsernameFromToken(accessToken);
  return fetchJSON<BookingListResponse>(
    `https://v2.api.noroff.dev/holidaze/profiles/${username}/bookings?_venue=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": process.env.NEXT_PUBLIC_NOROFF_API_KEY!,
      },
    },
  );
}

/**
 * Extracts username from JWT token
 * @param token - JWT access token
 * @returns Username from token payload
 */
function getUsernameFromToken(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.name || payload.sub || "";
  } catch {
    return "";
  }
}

/**
 * Cancels/deletes a booking
 * @param id - Booking ID to delete
 * @param accessToken - User authentication token
 */
export async function deleteBooking(id: string, accessToken: string) {
  return fetchJSON(ep.delete(id), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": process.env.NEXT_PUBLIC_NOROFF_API_KEY!,
    },
  });
}
