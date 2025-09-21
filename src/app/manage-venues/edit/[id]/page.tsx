"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/lib/contexts/UserContext";
import { useRouter } from "next/navigation";
import { updateVenue } from "@/lib/api/venues";
import type { Venue } from "@/lib/schemas/venue";

export default function EditVenuePage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const router = useRouter();
  const [venue, setVenue] = useState<Venue | null>(null);
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

    loadVenue();
  }, [user, router]);

  const loadVenue = async () => {
    try {
      // Validate params.id to prevent SSRF
      if (!params.id || !/^[a-zA-Z0-9-_]+$/.test(params.id)) {
        throw new Error('Invalid venue ID');
      }
      const url = `https://v2.api.noroff.dev/holidaze/venues/${params.id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch venue');
      const data = await res.json();
      setVenue(data.data);
    } catch (err) {
      console.error("Failed to load venue:", err);
      setError("Unable to load venue details. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !venue) return;

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const mediaUrl = formData.get("mediaUrl") as string;
    const mediaAlt = formData.get("mediaAlt") as string;

    try {
      await updateVenue(
        venue.id,
        {
          name: formData.get("name") as string,
          description: formData.get("description") as string,
          price: (() => {
            const price = parseFloat(formData.get("price") as string);
            if (isNaN(price) || price < 0) throw new Error('Invalid price');
            return price;
          })(),
          maxGuests: (() => {
            const guests = parseInt(formData.get("maxGuests") as string);
            if (isNaN(guests) || guests < 1) throw new Error('Invalid guest count');
            return guests;
          })(),
          rating: formData.get("rating")
            ? parseFloat(formData.get("rating") as string)
            : venue.rating || undefined,
          media: mediaUrl
            ? [{ url: mediaUrl, alt: mediaAlt || "" }]
            : venue.media?.map((m) => ({ url: m.url, alt: m.alt || "" })),
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
      setTimeout(() => router.push("/manage-venues"), 2000);
    } catch (err) {
      console.error("Failed to update venue:", err);
      if (err instanceof Error) {
        if (err.message.includes("media")) {
          setError(
            "Invalid image URL. Please provide a valid, publicly accessible image URL.",
          );
        } else {
          if (err instanceof Error && err.message.includes('400')) {
        setError(err.message);
      } else {
        setError("Failed to update venue");
      }
        }
      } else {
        setError(
          "Unable to update venue. Please check all fields and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.venueManager) return null;
  if (!venue)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-heading text-3xl mb-8">Edit Venue</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✓ Venue updated successfully! Redirecting...
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
              defaultValue={venue.name}
              required
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
              defaultValue={venue.description}
              required
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
                defaultValue={venue.price}
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
                defaultValue={venue.maxGuests}
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
                defaultValue={venue.rating || ""}
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
              defaultValue={venue.media?.[0]?.url || ""}
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
              defaultValue={venue.media?.[0]?.alt || ""}
              className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Amenities</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="wifi"
                  defaultChecked={venue.meta?.wifi}
                  className="mr-2"
                />
                WiFi
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="parking"
                  defaultChecked={venue.meta?.parking}
                  className="mr-2"
                />
                Parking
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="breakfast"
                  defaultChecked={venue.meta?.breakfast}
                  className="mr-2"
                />
                Breakfast
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="pets"
                  defaultChecked={venue.meta?.pets}
                  className="mr-2"
                />
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
                defaultValue={venue.location?.address || ""}
                className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  defaultValue={venue.location?.city || ""}
                  className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  name="zip"
                  placeholder="ZIP Code"
                  defaultValue={venue.location?.zip || ""}
                  className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <input
                type="text"
                name="country"
                placeholder="Country"
                defaultValue={venue.location?.country || ""}
                className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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
              {loading ? "Updating..." : "Update Venue"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
