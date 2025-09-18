"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/lib/contexts/UserContext";
import { useRouter } from "next/navigation";
import { getMyVenues, deleteVenue } from "@/lib/api/venues";
import type { Venue } from "@/lib/schemas/venue";
import Image from "next/image";
import Link from "next/link";

export default function ManageVenuesPage() {
  const { user } = useUser();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

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
  }, [user, router]);

  const loadVenues = async () => {
    if (!user) return;
    
    try {
      const response = await getMyVenues(user.accessToken);
      setVenues(response.data);
    } catch (err) {
      console.error('Failed to load venues:', err);
      setError("Unable to load your venues. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVenue = async (id: string, name: string) => {
    if (!user || !confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteVenue(id, user.accessToken);
      setVenues(venues.filter(v => v.id !== id));
    } catch (err) {
      console.error('Failed to delete venue:', err);
      setError("Unable to delete venue. Please try again.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading venues...</div>
      </main>
    );
  }

  if (!user || !user.venueManager) return null;

  return (
    <main className="min-h-screen bg-background pt-20">
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
          <div className="bg-background-lighter rounded-lg p-8 text-center">
            <p className="text-text/70 mb-4">No venues yet</p>
            <Link
              href="/manage-venues/create"
              className="text-primary hover:underline"
            >
              Create your first venue
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {venues.map((venue) => (
              <div key={venue.id} className="bg-background-lighter rounded-lg p-6">
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
                    <h3 className="font-heading text-xl mb-2">{venue.name}</h3>
                    <p className="text-text/70 mb-4 line-clamp-2">{venue.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-text/70">Price:</span>
                        <p>${venue.price}/night</p>
                      </div>
                      <div>
                        <span className="text-text/70">Max guests:</span>
                        <p>{venue.maxGuests}</p>
                      </div>
                      <div>
                        <span className="text-text/70">Rating:</span>
                        <p>{venue.rating ?? "—"}</p>
                      </div>
                      <div>
                        <span className="text-text/70">Bookings:</span>
                        <p>{(venue as any).bookings?.length ?? 0}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Link
                        href={`/venues/${venue.id}`}
                        className="text-primary hover:underline text-sm"
                      >
                        View
                      </Link>
                      <Link
                        href={`/manage-venues/edit/${venue.id}`}
                        className="text-primary hover:underline text-sm"
                      >
                        Edit
                      </Link>
                      {(venue as any).bookings?.length > 0 && (
                        <button
                          onClick={() => setSelectedVenue(venue)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Bookings ({(venue as any).bookings.length})
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteVenue(venue.id, venue.name)}
                        className="text-red-600 hover:text-red-800 text-sm"
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
              <h3 className="font-heading text-xl">Bookings for {selectedVenue.name}</h3>
              <button
                onClick={() => setSelectedVenue(null)}
                className="text-text/70 hover:text-text text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {(selectedVenue as any).bookings?.map((booking: any) => (
                <div key={booking.id} className="bg-background-lighter rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-text/70">Guest:</span>
                      <p>{booking.customer?.name || 'Unknown'}</p>
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
              )) || (
                <p className="text-text/70">No bookings yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}