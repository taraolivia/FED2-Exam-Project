import { fetchJSON } from "./http";
import { profiles as ep } from "./endpoints";
import { ProfileSingleResponse, ProfileUpdate } from "@/lib/schemas/profile";

export async function updateProfile(username: string, data: ProfileUpdate, accessToken: string) {
  return fetchJSON<ProfileSingleResponse>(ep.update(username), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": process.env.NEXT_PUBLIC_NOROFF_API_KEY!,
    },
    body: JSON.stringify(data),
  });
}