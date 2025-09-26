/**
 * Venue management page component
 */
"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/lib/contexts/UserContext";
import { useRouter } from "next/navigation";
import { createVenue } from "@/lib/api/venues";

export default function CreateVenuePage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!user.venueManager) {
      router.push("/profile");
      return;
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const mediaUrl = formData.get("mediaUrl") as string;
    const mediaAlt = formData.get("mediaAlt") as string;

    try {
      await createVenue(
        {
          name: formData.get("name") as string,
          description: formData.get("description") as string,
          price: parseFloat(formData.get("price") as string),
          maxGuests: parseInt(formData.get("maxGuests") as string),
          rating: formData.get("rating")
            ? parseFloat(formData.get("rating") as string)
            : undefined,
          media: mediaUrl ? [{ url: mediaUrl, alt: mediaAlt || "" }] : [],
          meta: {
            wifi: formData.get("wifi") === "on",
            parking: formData.get("parking") === "on",
            breakfast: formData.get("breakfast") === "on",
            pets: formData.get("pets") === "on",
          },
          location: {
            address: (formData.get("address") as string) || undefined,
            city: (formData.get("city") as string) || undefined,
            zip: (formData.get("zip") as string) || undefined,
            country: (formData.get("country") as string) || undefined,
          },
        },
        user.accessToken,
      );

      setSuccess(true);
      setTimeout(() => router.push("/manage-venues"), 1500);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("media")) {
          setError(
            "Invalid image URL. Please provide a valid, publicly accessible image URL.",
          );
        } else if (err.message.includes("price")) {
          setError("Invalid price. Please enter a valid price.");
        } else {
          setError(err.message);
        }
      } else {
        setError(
          "Unable to create venue. Please check all fields and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.venueManager) return null;

  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-heading text-3xl mb-8">Create New Venue</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✓ Venue created successfully! Redirecting to your venues...
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Venue Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Enter venue name"
              className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              placeholder="Describe your venue, amenities, and what makes it special..."
              className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Price per night *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="maxGuests"
                className="block text-sm font-medium mb-1"
              >
                Max Guests *
              </label>
              <input
                type="number"
                id="maxGuests"
                name="maxGuests"
                min="1"
                required
                className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="rating"
                className="block text-sm font-medium mb-1"
              >
                Rating (0-5)
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                placeholder="0"
                className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="mediaUrl"
              className="block text-sm font-medium mb-1"
            >
              Image URL
            </label>
            <input
              type="url"
              id="mediaUrl"
              name="mediaUrl"
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="mediaAlt"
              className="block text-sm font-medium mb-1"
            >
              Image Alt Text
            </label>
            <input
              type="text"
              id="mediaAlt"
              name="mediaAlt"
              className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Amenities</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input type="checkbox" name="wifi" className="mr-2" />
                WiFi
              </label>
              <label className="flex items-center">
                <input type="checkbox" name="parking" className="mr-2" />
                Parking
              </label>
              <label className="flex items-center">
                <input type="checkbox" name="breakfast" className="mr-2" />
                Breakfast
              </label>
              <label className="flex items-center">
                <input type="checkbox" name="pets" className="mr-2" />
                Pets allowed
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Location</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="address"
                placeholder="Address"
                className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  name="zip"
                  placeholder="ZIP Code"
                  className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <input
                type="text"
                name="country"
                placeholder="Country"
                className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-background-lighter text-text py-3 rounded-lg hover:bg-background transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-accent-darkest py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Venue"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
