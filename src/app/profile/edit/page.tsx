/**
 * Profile editing page component
 */
"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/lib/contexts/UserContext";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/api/profiles";
import type { User } from "@/lib/auth";
import Image from "next/image";

export default function EditProfilePage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [previewBio, setPreviewBio] = useState("");
  const [previewVenueManager, setPreviewVenueManager] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Initialize preview states once when user loads
  useEffect(() => {
    if (user && previewBio === "") {
      setPreviewBio(user.bio || "");
      setPreviewVenueManager(user.venueManager || false);
    }
  }, [user, previewBio]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    const avatarUrl = formData.get("avatarUrl") as string;
    const avatarAlt = formData.get("avatarAlt") as string;
    const bannerUrl = formData.get("bannerUrl") as string;
    const bannerAlt = formData.get("bannerAlt") as string;
    const bio = formData.get("bio") as string;
    const venueManager = formData.get("venueManager") === "on";

    interface UpdateData {
      bio?: string;
      avatar?: { url: string; alt: string };
      banner?: { url: string; alt: string };
      venueManager?: boolean;
    }
    const updateData: UpdateData = {};

    if (bio !== null) updateData.bio = bio.trim();
    if (avatarUrl.trim()) {
      updateData.avatar = {
        url: avatarUrl.trim(),
        alt: avatarAlt.trim() || "",
      };
    }
    if (bannerUrl.trim()) {
      updateData.banner = {
        url: bannerUrl.trim(),
        alt: bannerAlt.trim() || "",
      };
    }
    if (venueManager !== user.venueManager) {
      updateData.venueManager = venueManager;
    }

    // Check if we have at least one field to update
    if (Object.keys(updateData).length === 0) {
      setError("Please make at least one change to update your profile");
      setLoading(false);
      return;
    }

    try {
      console.log('📤 Updating profile with data:', updateData);
      const response = await updateProfile(
        user.name,
        updateData,
        user.accessToken,
      );
      console.log('✅ Profile update response:', response.data);

      // Update user context with new data
      const updatedUser = {
        ...user,
        ...response.data,
        accessToken: user.accessToken, // Keep the token
      };
      console.log('🔄 Setting updated user:', updatedUser);
      setUser(updatedUser);
      
      // Also update localStorage to persist the changes
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log('💾 Updated localStorage with:', updatedUser);
      }

      setSuccess(true);
      setTimeout(() => router.push("/profile?refresh=edit"), 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";

      // Handle specific API error messages
      if (errorMessage.includes("avatar") || errorMessage.includes("banner")) {
        setError(
          "Invalid image URL. Please ensure the URL is publicly accessible.",
        );
      } else if (errorMessage.includes("bio")) {
        setError("Bio must be less than 160 characters.");
      } else if (errorMessage.includes("venueManager")) {
        setError("Unable to update venue manager status. Please try again.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-background pt-20 md:pt-32">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-heading text-3xl mb-8">Edit Profile</h1>

        {/* Profile Preview */}
        <div className="bg-background-lighter rounded-lg overflow-hidden mb-8">
          <h2 className="font-heading text-xl p-6 pb-4">Preview</h2>

          {/* Banner */}
          <div className="relative h-32 bg-secondary-lighter mx-6 rounded-lg overflow-hidden">
            {user.banner?.url ? (
              <Image
                src={user.banner.url}
                alt={user.banner.alt || "Banner"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text/50">
                No banner image
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {user.avatar?.url ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto sm:mx-0">
                  <Image
                    src={user.avatar.url}
                    alt={user.avatar.alt || user.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto sm:mx-0">
                  <span className="text-2xl font-heading text-accent-darkest">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-2">
                  <h3 className="font-heading text-2xl">{user.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm mx-auto sm:mx-0 mt-2 sm:mt-0 w-fit ${
                      previewVenueManager
                        ? "bg-primary/20 text-primary"
                        : "bg-text/10 text-text/70"
                    }`}
                  >
                    {previewVenueManager ? "Venue Manager" : "Customer"}
                  </span>
                </div>
                <p className="text-text/70 mb-4">{user.email}</p>
                {previewBio && <p className="text-text/80">{previewBio}</p>}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Profile updated successfully! Redirecting...
            </div>
          )}

          <div className="bg-background-lighter rounded-lg p-6">
            <h3 className="font-heading text-lg mb-4">Basic Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full px-3 py-2 border border-text/20 rounded-lg bg-text/5 text-text/70"
                />
                <p className="text-xs text-text/60 mt-1">
                  Username cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-text/20 rounded-lg bg-text/5 text-text/70"
                />
                <p className="text-xs text-text/60 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-1">
                  Bio (max 160 characters)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  maxLength={160}
                  rows={3}
                  value={previewBio}
                  placeholder="Tell us about yourself..."
                  onChange={(e) => setPreviewBio(e.target.value)}
                  className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-background-lighter rounded-lg p-6">
            <h3 className="font-heading text-lg mb-4">Avatar</h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="avatarUrl"
                  className="block text-sm font-medium mb-1"
                >
                  Avatar URL
                </label>
                <input
                  type="url"
                  id="avatarUrl"
                  name="avatarUrl"
                  defaultValue={user.avatar?.url || ""}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50 cursor-pointer"
                />
              </div>

              <div>
                <label
                  htmlFor="avatarAlt"
                  className="block text-sm font-medium mb-1"
                >
                  Avatar Alt Text (max 120 characters)
                </label>
                <input
                  type="text"
                  id="avatarAlt"
                  name="avatarAlt"
                  maxLength={120}
                  defaultValue={user.avatar?.alt || ""}
                  placeholder="Description of your avatar image"
                  className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-background-lighter rounded-lg p-6">
            <h3 className="font-heading text-lg mb-4">Banner</h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="bannerUrl"
                  className="block text-sm font-medium mb-1"
                >
                  Banner URL
                </label>
                <input
                  type="url"
                  id="bannerUrl"
                  name="bannerUrl"
                  defaultValue={user.banner?.url || ""}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="bannerAlt"
                  className="block text-sm font-medium mb-1"
                >
                  Banner Alt Text (max 120 characters)
                </label>
                <input
                  type="text"
                  id="bannerAlt"
                  name="bannerAlt"
                  maxLength={120}
                  defaultValue={user.banner?.alt || ""}
                  placeholder="Description of your banner image"
                  className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-background-lighter rounded-lg p-6">
            <h3 className="font-heading text-lg mb-4">Account Type</h3>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="venueManager"
                defaultChecked={user.venueManager || false}
                onChange={(e) => setPreviewVenueManager(e.target.checked)}
                className="mr-3 focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded"
              />
              <div>
                <span className="font-medium">Venue Manager</span>
                <p className="text-sm text-text/70">
                  {user.venueManager
                    ? "You can create and manage venue listings"
                    : "Enable this to create and manage venue listings"}
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-background-lighter text-text py-3 rounded-lg hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-accent-darkest py-3 rounded-lg hover:bg-primary/90 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
