import { fetchJSON } from "./http";
import { profiles as ep } from "./endpoints";
import { ProfileSingleResponse, ProfileUpdate } from "@/lib/schemas/profile";
import { validateApiKey } from "@/lib/auth";

/**
 * Updates a user profile
 * @param username - Username to update
 * @param data - Profile update data
 * @param accessToken - User authentication token
 * @returns Promise resolving to updated profile
 */
export async function updateProfile(
  username: string,
  data: ProfileUpdate,
  accessToken: string,
) {
  validateApiKey();
  const apiKey = process.env.NEXT_PUBLIC_NOROFF_API_KEY!;
  if (!accessToken) throw new Error("Access token required");
  if (!username) throw new Error("Username required");

  try {
    return await fetchJSON<ProfileSingleResponse>(ep.update(username), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": apiKey,
      },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    const errorMessage =
      error?.errors?.[0]?.message || error.message || "Profile update failed";
    throw new Error(errorMessage);
  }
}

/**
 * Fetches a single profile with optional bookings and venues
 * @param username - Username to fetch
 * @param options - Optional query parameters
 * @returns Promise resolving to profile data
 */
export async function getProfile(
  username: string,
  options: { _bookings?: boolean; _venues?: boolean } = {},
) {
  validateApiKey();
  const apiKey = process.env.NEXT_PUBLIC_NOROFF_API_KEY!;
  if (!username) throw new Error("Username required");

  try {
    return await fetchJSON<ProfileSingleResponse>(
      ep.single(username, options),
      {
        headers: {
          "X-Noroff-API-Key": apiKey,
        },
      },
    );
  } catch (error: any) {
    const errorMessage =
      error?.errors?.[0]?.message || error.message || "Failed to fetch profile";
    throw new Error(errorMessage);
  }
}

/**
 * Fetches profile bookings
 * @param username - Username to fetch bookings for
 * @param accessToken - User authentication token
 * @param options - Optional query parameters
 * @returns Promise resolving to profile bookings
 */
export async function getProfileBookings(
  username: string,
  accessToken: string,
  options: { _venue?: boolean; _customer?: boolean } = {},
) {
  validateApiKey();
  const apiKey = process.env.NEXT_PUBLIC_NOROFF_API_KEY!;
  if (!accessToken) throw new Error("Access token required");
  if (!username) throw new Error("Username required");

  try {
    return await fetchJSON(ep.bookings(username, options as any), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": apiKey,
      },
    });
  } catch (error: any) {
    const errorMessage =
      error?.errors?.[0]?.message ||
      error.message ||
      "Failed to fetch bookings";
    throw new Error(errorMessage);
  }
}

/**
 * Fetches profile venues
 * @param username - Username to fetch venues for
 * @param accessToken - User authentication token
 * @param options - Optional query parameters
 * @returns Promise resolving to profile venues
 */
export async function getProfileVenues(
  username: string,
  accessToken: string,
  options: { _bookings?: boolean; _owner?: boolean } = {},
) {
  validateApiKey();
  const apiKey = process.env.NEXT_PUBLIC_NOROFF_API_KEY!;
  if (!accessToken) throw new Error("Access token required");
  if (!username) throw new Error("Username required");

  try {
    return await fetchJSON(ep.venues(username, options), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": apiKey,
      },
    });
  } catch (error: any) {
    const errorMessage =
      error?.errors?.[0]?.message || error.message || "Failed to fetch venues";
    throw new Error(errorMessage);
  }
}
