"use client";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/lib/contexts/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBookings, deleteBooking, updateBooking } from "@/lib/api/bookings";
import { getMyVenues } from "@/lib/api/venues";
import type { Booking } from "@/lib/schemas/booking";
import type { Venue } from "@/lib/schemas/venue";
import Image from "next/image";
import { ProfileSkeleton, BookingsSkeleton } from "@/app/components/LoadingSkeleton";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isVenueManager, setIsVenueManager] = useState(false);
  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string>("");

  const calculateBookingPrice = (booking: Booking) => {
    if (!booking.venue?.price) return "—";
    const days = Math.ceil((new Date(booking.dateTo).getTime() - new Date(booking.dateFrom).getTime()) / (1000 * 60 * 60 * 24));
    return booking.venue.price * days;
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      loadProfile();
    }
  }, [user, router]);

  // Handle refresh parameter separately
  useEffect(() => {
    const refreshParam = searchParams.get('refresh');
    if (refreshParam && user) {
      loadProfile();
    }
  }, [searchParams, user]);

  const handleDeleteBooking = async (id: string) => {
    if (!user || !confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      await deleteBooking(id, user.accessToken);
      setBookings(bookings.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    }
  };

  const handleEditBooking = async (e: React.FormEvent<HTMLFormElement>, bookingId: string) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const dateFrom = formData.get("dateFrom") as string;
    const dateTo = formData.get("dateTo") as string;
    const guests = parseInt(formData.get("guests") as string);

    setBookingError("");

    // Validate dates
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fromDate < today) {
      setBookingError("Check-in date cannot be in the past");
      return;
    }
    if (toDate <= fromDate) {
      setBookingError("Check-out date must be after check-in date");
      return;
    }

    try {
      const updatedBooking = await updateBooking(bookingId, {
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo).toISOString(),
        guests,
      }, user.accessToken);

      setBookings(bookings.map(b => b.id === bookingId ? { ...b, ...updatedBooking.data } : b));
      setEditingBooking(null);
    } catch (err) {
      console.error("Failed to update booking:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update booking";
      setBookingError(errorMessage.includes("conflict") || errorMessage.includes("available") 
        ? "Those dates are not available. Please choose different dates." 
        : errorMessage);
    }
  };

  const loadProfile = async () => {
    if (!user) return;

    // Use cached user data as fallback
    let currentVenueManager = user.venueManager || false;
    setIsVenueManager(currentVenueManager);
    
    // Try to get fresh profile data to check venue manager status
    try {
      const apiKey = process.env.NEXT_PUBLIC_NOROFF_API_KEY;
      if (apiKey) {
        const url = `https://v2.api.noroff.dev/holidaze/profiles/${user.name}`;
        const urlObj = new URL(url);
        if (urlObj.hostname !== 'v2.api.noroff.dev') {
          throw new Error('Invalid API endpoint');
        }
        const profileRes = await fetch(url, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "X-Noroff-API-Key": apiKey,
          },
        });
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          currentVenueManager = profileData.data.venueManager || false;
          setIsVenueManager(currentVenueManager);
          
          // Update user context with fresh data
          setUser({
            ...user,
            bio: profileData.data.bio,
            venueManager: currentVenueManager,
            avatar: profileData.data.avatar,
            banner: profileData.data.banner,
          });
        }
      }
    } catch (profileErr) {
      // Use cached data if profile fetch fails
    }
    
    try {
      // Load bookings
      try {
        const bookingsResponse = await getBookings(user.accessToken);
        setBookings(bookingsResponse.data);
      } catch (bookingErr) {
        setBookings([]);
      }
      
      // Load venues if user is venue manager
      if (currentVenueManager) {
        try {
          const venuesResponse = await getMyVenues(user.accessToken);
          setVenues(venuesResponse.data);
        } catch (venueErr) {
          setVenues([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-20 md:pt-32">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <div className="h-10 w-32 bg-gradient-to-r from-secondary-lighter via-background-lighter to-secondary-lighter bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded" />
            <div className="h-10 w-32 bg-gradient-to-r from-secondary-lighter via-background-lighter to-secondary-lighter bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded" />
          </div>
          <ProfileSkeleton />
          <div className="space-y-8">
            <div>
              <div className="h-8 w-32 bg-gradient-to-r from-secondary-lighter via-background-lighter to-secondary-lighter bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded mb-4" />
              <BookingsSkeleton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-background pt-20 md:pt-32">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl">Profile</h1>
        </div>

        {/* Profile Info */}
        <div className="bg-background-lighter rounded-lg overflow-hidden mb-8">
          {/* Banner */}
          <div className="relative h-32 bg-secondary-lighter">
            {user.banner?.url ? (
              <img
                src={user.banner.url}
                alt={user.banner.alt || "Banner"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text/50">
                No banner image
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {user.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.avatar.alt || user.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto sm:mx-0"
                />
              ) : (
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto sm:mx-0">
                  <span className="text-2xl font-heading text-accent-darkest">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <h2 className="font-heading text-2xl">{user.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm mx-auto sm:mx-0 mt-2 sm:mt-0 w-fit ${
                      isVenueManager 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-text/10 text-text/70'
                    }`}>
                      {isVenueManager ? 'Venue Manager' : 'Customer'}
                    </span>
                  </div>
                  <Link
                    href="/profile/edit"
                    className="bg-primary text-accent-darkest px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity mt-4 mb-2 sm:mt-0 sm:mb-0 w-fit mx-auto sm:mx-0"
                  >
                    Edit Profile
                  </Link>
                </div>
                <p className="text-text/70 mb-4">{user.email}</p>
                {user.bio && (
                  <p className="text-text/80">{user.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* My Bookings */}
        <div className="mb-8 pt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl">My Bookings</h2>
            {bookings.length > 0 && (
              <Link href="/bookings" className="text-sm text-primary hover:underline">
                View all ({bookings.length})
              </Link>
            )}
          </div>
          
          {bookings.length === 0 ? (
            <div className="bg-background-lighter rounded-xl p-8 text-center border border-text/10">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-primary rounded opacity-60"></div>
              </div>
              <h3 className="font-medium mb-2">No bookings yet</h3>
              <p className="text-text/60 text-sm mb-4">Start planning your next adventure</p>
              <Link href="/" className="inline-flex items-center gap-2 bg-primary text-accent-darkest px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm">
                Browse venues
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="bg-background-lighter rounded-xl p-6 border border-text/10 hover:border-primary/30 transition-all duration-200">
                  <div className="flex gap-4">
                    {booking.venue?.media?.[0]?.url && (
                      <Link href={`/venues/${booking.venue.id}`} className="relative w-24 h-24 bg-secondary-lighter rounded-lg overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity">
                        <Image
                          src={booking.venue.media[0].url}
                          alt={booking.venue.name}
                          fill
                          className="object-cover"
                        />
                      </Link>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          {booking.venue ? (
                            <Link href={`/venues/${booking.venue.id}`} className="font-medium text-lg mb-1 hover:text-primary transition-colors block">
                              {booking.venue.name}
                            </Link>
                          ) : (
                            <h3 className="font-medium text-lg mb-1">Venue</h3>
                          )}
                          <p className="text-text/60 text-sm">
                            {new Date(booking.dateFrom).toLocaleDateString()} - {new Date(booking.dateTo).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg">
                            ${calculateBookingPrice(booking)}
                          </p>
                          <p className="text-text/60 text-sm">{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      
                      {editingBooking === booking.id ? (
                        <div className="bg-background rounded-lg p-4 border border-text/20">
                          <form onSubmit={(e) => handleEditBooking(e, booking.id)} className="space-y-4">
                            {bookingError && (
                              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                                {bookingError}
                              </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-text/70 mb-1">Check-in</label>
                                <input
                                  type="date"
                                  name="dateFrom"
                                  defaultValue={booking.dateFrom.split('T')[0]}
                                  className="w-full px-3 py-2 text-sm border border-text/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text/70 mb-1">Check-out</label>
                                <input
                                  type="date"
                                  name="dateTo"
                                  defaultValue={booking.dateTo.split('T')[0]}
                                  className="w-full px-3 py-2 text-sm border border-text/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text/70 mb-1">Guests</label>
                                <input
                                  type="number"
                                  name="guests"
                                  defaultValue={booking.guests}
                                  min="1"
                                  max={booking.venue?.maxGuests || 10}
                                  className="w-full px-3 py-2 text-sm border border-text/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                  required
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button type="submit" className="bg-primary text-accent-darkest px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
                                Save Changes
                              </button>
                              <button type="button" onClick={() => setEditingBooking(null)} className="px-4 py-2 text-sm text-text/70 hover:text-text transition-colors">
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setEditingBooking(booking.id)}
                            className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {bookings.length > 3 && (
                <Link href="/bookings" className="block text-center text-primary hover:underline">
                  View all {bookings.length} bookings
                </Link>
              )}
            </div>
          )}
        </div>

        {/* My Venues (if venue manager) */}
        {isVenueManager && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl">My Venues</h2>
              {venues.length > 0 ? (
                <Link href="/manage-venues" className="text-sm text-primary hover:underline">
                  Manage all ({venues.length})
                </Link>
              ) : (
                <Link
                  href="/manage-venues/create"
                  className="text-sm text-primary hover:underline"
                >
                  Create venue
                </Link>
              )}
            </div>
            {venues.length === 0 ? (
              <div className="bg-background-lighter rounded-lg p-6 text-center">
                <p className="text-text/70 mb-4">No venues yet</p>
                <Link href="/manage-venues/create" className="text-primary hover:underline">
                  Create your first venue
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {venues.slice(0, 3).map((venue) => (
                  <div key={venue.id} className="bg-background-lighter rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {venue.media?.[0]?.url && (
                        <div className="relative w-full sm:w-20 h-20 bg-secondary-lighter rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={venue.media[0].url}
                            alt={venue.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{venue.name}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-text/70">
                          <div>Price: ${venue.price}/night</div>
                          <div>Max guests: {venue.maxGuests}</div>
                          <div>Rating: {venue.rating ?? "—"}</div>
                          <div>Bookings: {venue.bookings?.length ?? 0}</div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Link href={`/venues/${venue.id}`} className="text-primary hover:underline text-sm">
                            View
                          </Link>
                          <Link href={`/manage-venues/edit/${venue.id}`} className="text-primary hover:underline text-sm">
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {venues.length > 3 && (
                  <Link href="/manage-venues" className="block text-center text-primary hover:underline">
                    View all {venues.length} venues
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}