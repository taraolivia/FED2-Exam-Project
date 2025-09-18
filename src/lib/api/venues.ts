import { fetchJSON } from "./http";
import { venues as ep } from "./endpoints";
import { VenueListResponse, VenueSingleResponse } from "@/lib/schemas/venue";

export type VenueCreateData = {
  name: string;
  description: string;
  media?: Array<{ url: string; alt?: string }>;
  price: number;
  maxGuests: number;
  rating?: number;
  meta?: {
    wifi?: boolean;
    parking?: boolean;
    breakfast?: boolean;
    pets?: boolean;
  };
  location?: {
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
    continent?: string;
    lat?: number;
    lng?: number;
  };
};

export async function createVenue(data: VenueCreateData, accessToken: string) {
  return fetchJSON<VenueSingleResponse>(`https://v2.api.noroff.dev/holidaze/venues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": process.env.NEXT_PUBLIC_NOROFF_API_KEY!,
    },
    body: JSON.stringify(data),
  });
}

export async function updateVenue(id: string, data: Partial<VenueCreateData>, accessToken: string) {
  return fetchJSON<VenueSingleResponse>(`https://v2.api.noroff.dev/holidaze/venues/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": process.env.NEXT_PUBLIC_NOROFF_API_KEY!,
    },
    body: JSON.stringify(data),
  });
}

export async function deleteVenue(id: string, accessToken: string) {
  return fetchJSON(`https://v2.api.noroff.dev/holidaze/venues/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": process.env.NEXT_PUBLIC_NOROFF_API_KEY!,
    },
  });
}

export async function getMyVenues(accessToken: string) {
  const username = getUsernameFromToken(accessToken);
  return fetchJSON<VenueListResponse>(`https://v2.api.noroff.dev/holidaze/profiles/${username}/venues?_bookings=true&_customer=true`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": process.env.NEXT_PUBLIC_NOROFF_API_KEY!,
    },
  });
}

// Helper to extract username from token (basic implementation)
function getUsernameFromToken(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.name || payload.sub || '';
  } catch {
    return '';
  }
}