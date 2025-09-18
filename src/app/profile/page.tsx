"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/lib/contexts/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      loadProfile();
    }
  }, [user, router]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const res = await fetch(
        `https://v2.api.noroff.dev/holidaze/profiles/${user.name}`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "X-Noroff-API-Key": process.env.NEXT_PUBLIC_NOROFF_API_KEY!,
          },
        },
      );
      const data = await res.json();
      setProfileData(data.data);

      // Update user context with fresh data
      setUser({
        ...user,
        venueManager: data.data.venueManager,
        avatar: data.data.avatar,
        banner: data.data.banner,
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="bg-background-lighter rounded-lg p-8">
          <div className="flex items-center gap-6 mb-8">
            {user.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.avatar.alt || user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                <span className="text-2xl font-heading text-accent-darkest">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="font-heading text-3xl mb-2">{user.name}</h1>
              <p className="text-text/70 mb-2">{user.email}</p>
              {(profileData?.venueManager || user.venueManager) && (
                <span className="inline-block bg-primary text-accent-darkest px-3 py-1 rounded-full text-sm font-medium">
                  Venue Manager
                </span>
              )}
            </div>
            <Link
              href="/profile/edit"
              className="bg-primary text-accent-darkest px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Edit Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-background rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-heading text-xl">My Bookings</h2>
                <Link
                  href="/bookings"
                  className="text-primary hover:underline text-sm"
                >
                  View all
                </Link>
              </div>
              <p className="text-text/70">View and manage your bookings</p>
            </div>

            <div className="bg-background rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-heading text-xl">My Venues</h2>
                {profileData?.venueManager || user.venueManager ? (
                  <Link
                    href="/manage-venues"
                    className="text-primary hover:underline text-sm"
                  >
                    Manage venues
                  </Link>
                ) : (
                  <Link
                    href="/profile/edit"
                    className="text-primary hover:underline text-sm"
                  >
                    Become manager
                  </Link>
                )}
              </div>
              <p className="text-text/70">
                {profileData?.venueManager || user.venueManager
                  ? "Create and manage your venues"
                  : "Become a venue manager to list properties"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
