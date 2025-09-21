"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/lib/contexts/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBookings, deleteBooking } from "@/lib/api/bookings";
import type { Booking } from "@/lib/schemas/booking";
import Image from "next/image";
import { BookingsSkeleton } from "@/app/components/LoadingSkeleton";

export default function BookingsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadBookings();
  }, [user, router]);

  const loadBookings = async () => {
    if (!user) return;

    try {
      const response = await getBookings(user.accessToken);
      setBookings(response.data);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setError("Unable to load your bookings. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!user || !confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      await deleteBooking(id, user.accessToken);
      setBookings(bookings.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-20 md:pt-32">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h1 className="font-heading text-3xl mb-8">My Bookings</h1>
          <BookingsSkeleton />
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-background pt-20 md:pt-32">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-heading text-3xl mb-8">My Bookings</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-background-lighter rounded-lg p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="font-heading text-lg mb-2">No bookings yet</h3>
              <p className="text-text/70 mb-4">Discover amazing places to stay</p>
            </div>
            <Link href="/" className="bg-primary text-accent-darkest px-6 py-2 rounded-lg hover:opacity-90 transition-opacity inline-block">
              Browse venues
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-background-lighter rounded-lg p-6"
              >
                <div className="flex gap-6">
                  {booking.venue?.media?.[0]?.url && (
                    <div className="relative w-32 h-24 bg-secondary-lighter rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={booking.venue.media[0].url}
                        alt={booking.venue.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-heading text-xl mb-2">
                      {booking.venue?.name || "Venue"}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
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
                      <div>
                        <span className="text-text/70">Total:</span>
                        <p className="font-medium">
                          $
                          {booking.venue?.price
                            ? booking.venue.price *
                              Math.ceil(
                                (new Date(booking.dateTo).getTime() -
                                  new Date(booking.dateFrom).getTime()) /
                                  (1000 * 60 * 60 * 24),
                              )
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {booking.venue && (
                        <Link
                          href={`/venues/${booking.venue.id}`}
                          className="text-primary hover:underline text-sm"
                        >
                          View venue
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Cancel booking
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
