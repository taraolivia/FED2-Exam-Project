"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/lib/contexts/UserContext";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/api/profiles";

export default function EditProfilePage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

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

    const updateData: any = {};
    
    if (bio.trim()) updateData.bio = bio.trim();
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
      const response = await updateProfile(user.name, updateData, user.accessToken);
      
      // Update user context with new data
      setUser({
        ...user,
        ...response.data,
        accessToken: user.accessToken, // Keep the token
      });
      
      setSuccess(true);
      setTimeout(() => router.push("/profile"), 2000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      if (err instanceof Error) {
        if (err.message.includes('avatar') || err.message.includes('banner')) {
          setError("Invalid image URL. Please provide a valid, publicly accessible image URL.");
        } else if (err.message.includes('bio')) {
          setError("Bio is too long. Please keep it under 160 characters.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Unable to update profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-heading text-3xl mb-8">Edit Profile</h1>

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
                <p className="text-xs text-text/60 mt-1">Username cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-text/20 rounded-lg bg-text/5 text-text/70"
                />
                <p className="text-xs text-text/60 mt-1">Email cannot be changed</p>
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
                  placeholder="Tell us about yourself..."
                  className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-background-lighter rounded-lg p-6">
            <h3 className="font-heading text-lg mb-4">Avatar</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium mb-1">
                  Avatar URL
                </label>
                <input
                  type="url"
                  id="avatarUrl"
                  name="avatarUrl"
                  defaultValue={user.avatar?.url || ""}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="avatarAlt" className="block text-sm font-medium mb-1">
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
                <label htmlFor="bannerUrl" className="block text-sm font-medium mb-1">
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
                <label htmlFor="bannerAlt" className="block text-sm font-medium mb-1">
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
                defaultChecked={user.venueManager}
                className="mr-3"
              />
              <div>
                <span className="font-medium">Venue Manager</span>
                <p className="text-sm text-text/70">
                  Enable this to create and manage venue listings
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-background-lighter text-text py-3 rounded-lg hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-accent-darkest py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}