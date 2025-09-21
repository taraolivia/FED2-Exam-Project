import { fetchJSON } from "./http";
import { profiles as ep } from "./endpoints";
import { ProfileSingleResponse, ProfileUpdate } from "@/lib/schemas/profile";

export async function updateProfile(
  username: string,
  data: ProfileUpdate,
  accessToken: string,
) {
  const apiKey = process.env.NEXT_PUBLIC_NOROFF_API_KEY;
  if (!apiKey) throw new Error('API key not configured');
  if (!accessToken) throw new Error('Access token required');
  if (!username) throw new Error('Username required');
  
  return fetchJSON<ProfileSingleResponse>(ep.update(username), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": apiKey,
    },
    body: JSON.stringify(data),
  });
}
