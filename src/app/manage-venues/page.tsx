"use client";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/lib/contexts/UserContext";
import { useRouter } from "next/navigation";
import { getMyVenues, deleteVenue } from "@/lib/api/venues";
import type { Venue } from "@/lib/schemas/venue";
import Image from "next/image";
import Link from "next/link";
import { ShimmerBox } from "@/app/components/LoadingSkeleton";

export default function ManageVenuesPage() {
  const { user } = useUser();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const loadVenues = useCallback(async () => {
    if (!user) return;

    try {
      const response = await getMyVenues(user.accessToken);
      setVenues(response.data);
    } catch {
      setError(
        "Unable to load your venues. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!user.venueManager) {
      router.push("/profile");
      return;
    }

    loadVenues();
  }, [user, router, loadVenues]);



  const handleDeleteVenue = async (id: string, name: string) => {
    if (
      !user ||
      !confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      )
    )
      return;

    const originalVenues = [...venues];
    // Optimistically remove from UI
    setVenues(venues.filter((v) => v.id !== id));

    try {
      await deleteVenue(id, user.accessToken);
    } catch {
      // Restore venues on error
      setVenues(originalVenues);
      setError("Failed to delete venue");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-20 md:pt-32">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <ShimmerBox className="h-10 w-32 rounded" />
            <ShimmerBox className="h-10 w-32 rounded" />
          </div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-background-lighter rounded-xl p-6">
                <div className="flex gap-6">
                  <ShimmerBox className="w-32 h-24 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <ShimmerBox className="h-6 w-48 rounded" />
                    <ShimmerBox className="h-4 w-full rounded" />
                    <div className="grid grid-cols-4 gap-4">
                      {[...Array(4)].map((_, j) => (
                        <ShimmerBox key={j} className="h-4 w-16 rounded" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!user || !user.venueManager) return null;

  return (
    <main className="min-h-screen bg-background pt-20 md:pt-32">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-3xl">My Venues</h1>
          <Link
            href="/manage-venues/create"
            className="bg-primary text-accent-darkest px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Create Venue
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {venues.length === 0 ? (
          <div className="bg-background-lighter rounded-xl p-12 text-center border border-text/10">
            <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-primary rounded opacity-60"></div>
            </div>
            <h3 className="font-heading text-xl mb-3">No venues yet</h3>
            <p className="text-text/60 mb-6 max-w-md mx-auto">
              Start earning by listing your first property and welcoming guests
              from around the world
            </p>
            <Link
              href="/manage-venues/create"
              className="bg-primary text-accent-darkest px-8 py-3 rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2 font-medium"
            >
              <span>+</span> Create your first venue
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-background-lighter rounded-xl p-6 border border-text/10 hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex gap-6">
                  {venue.media?.[0]?.url && (
                    <div className="relative w-32 h-24 bg-secondary-lighter rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={venue.media[0].url}
                        alt={venue.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link
                          href={`/venues/${venue.id}`}
                          className="font-heading text-xl mb-2 hover:text-primary transition-colors block"
                        >
                          {venue.name}
                        </Link>
                        <p className="text-text/60 text-sm line-clamp-3">
                          {venue.description}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-medium text-lg">
                          ${venue.price}
                          <span className="text-sm text-text/60">/night</span>
                        </p>
                        <p className="text-text/60 text-sm">
                          {venue.maxGuests} guests max
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4 bg-background rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-text/60">Rating:</span>
                        <span>{venue.rating ?? "No rating"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text/60">Bookings:</span>
                        <span>
                          {venue.bookings?.length ?? 0} booking
                          {(venue.bookings?.length ?? 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <Link
                        href={`/manage-venues/edit/${venue.id}`}
                        className="bg-primary text-accent-darkest px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
                      >
                        Edit
                      </Link>
                      {venue.bookings && venue.bookings.length > 0 && (
                        <button
                          onClick={() => setSelectedVenue(venue)}
                          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                        >
                          View Bookings ({venue.bookings.length})
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteVenue(venue.id, venue.name)}
                        className="text-red-600 hover:text-red-800 text-sm px-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bookings Modal */}
      {selectedVenue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-xl">
                Bookings for {selectedVenue.name}
              </h3>
              <button
                onClick={() => setSelectedVenue(null)}
                className="text-text/70 hover:text-text text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {selectedVenue.bookings?.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-background-lighter rounded-lg p-4"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-text/70">Guest:</span>
                      <p>{booking.customer?.name || "Unknown"}</p>
                    </div>
                    <div>
                      <span className="text-text/70">Check-in:</span>
                      <p>{new Date(booking.dateFrom).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-text/70">Check-out:</span>
                      <p>{new Date(booking.dateTo).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-text/70">Guests:</span>
                      <p>{booking.guests}</p>
                    </div>
                  </div>
                </div>
              ))}
              {(!selectedVenue.bookings ||
                selectedVenue.bookings.length === 0) && (
                <p className="text-text/70">No bookings yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
