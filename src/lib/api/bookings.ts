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
  const apiKey = process.env.NEXT_PUBLIC_NOROFF_API_KEY;
  if (!apiKey) throw new Error('API key not configured');
  if (!accessToken) throw new Error('Access token required');
  
  return fetchJSON<BookingSingleResponse>(ep.create(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": apiKey,
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
  if (!accessToken) throw new Error('Access token required');
  const username = getUsernameFromToken(accessToken);
  if (!username?.trim()) {
    throw new Error("Invalid access token");
  }
  
  const apiKey = process.env.NEXT_PUBLIC_NOROFF_API_KEY;
  if (!apiKey) {
    throw new Error("API key not configured");
  }
  
  return fetchJSON<BookingListResponse>(
    `https://v2.api.noroff.dev/holidaze/profiles/${username}/bookings?_venue=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": apiKey,
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
 * Updates an existing booking
 * @param id - Booking ID to update
 * @param data - Updated booking data
 * @param accessToken - User authentication token
 */
type BookingUpdateData = {
  dateFrom?: string;
  dateTo?: string;
  guests?: number;
};

export async function updateBooking(
  id: string,
  data: BookingUpdateData,
  accessToken: string
) {
  const apiKey = process.env.NEXT_PUBLIC_NOROFF_API_KEY;
  if (!apiKey) throw new Error('API key not configured');
  if (!accessToken) throw new Error('Access token required');
  if (!id) throw new Error('Booking ID required');
  
  return fetchJSON<BookingSingleResponse>(ep.update(id), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": apiKey,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Cancels/deletes a booking
 * @param id - Booking ID to delete
 * @param accessToken - User authentication token
 */
export async function deleteBooking(id: string, accessToken: string) {
  const apiKey = process.env.NEXT_PUBLIC_NOROFF_API_KEY;
  if (!apiKey) throw new Error('API key not configured');
  if (!accessToken) throw new Error('Access token required');
  if (!id) throw new Error('Booking ID required');
  
  return fetchJSON(ep.delete(id), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": apiKey,
    },
  });
}
