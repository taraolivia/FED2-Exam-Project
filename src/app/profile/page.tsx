"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useUser } from "@/lib/contexts/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBookings, deleteBooking, updateBooking } from "@/lib/api/bookings";
import { getMyVenues } from "@/lib/api/venues";
import { getProfile } from "@/lib/api/profiles";
import type { Booking } from "@/lib/schemas/booking";
import type { Venue } from "@/lib/schemas/venue";
import Image from "next/image";
import {
  ProfileSkeleton,
  BookingsSkeleton,
  ShimmerBox,
} from "@/app/components/LoadingSkeleton";
import ConfirmModal from "@/app/components/ConfirmModal";

/**
 * Main profile content component displaying user information, bookings, and venues
 * 
 * Features:
 * - User profile display with avatar, banner, and bio
 * - Booking management (view, edit, cancel)
 * - Venue management for venue managers
 * - Real-time data refresh on page visibility
 * - Inline booking editing with validation
 * - Role-based content (customer vs venue manager)
 */
function ProfileContent() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string>("");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    bookingId?: string;
    title: string;
    message: string;
  }>({ isOpen: false, title: "", message: "" });

  /**
   * Calculates total price for a booking based on venue price and stay duration
   * @param booking - The booking to calculate price for
   * @returns Total price as number or "—" if venue price unavailable
   */
  const calculateBookingPrice = (booking: Booking) => {
    if (!booking.venue?.price) return "—";
    const days = Math.ceil(
      (new Date(booking.dateTo).getTime() -
        new Date(booking.dateFrom).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return booking.venue.price * days;
  };

  const loadProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Load bookings
      const bookingsResponse = await getBookings(user.accessToken);
      setBookings(bookingsResponse.data);

      // Load venues if user is venue manager
      if (user.venueManager) {
        const venuesResponse = await getMyVenues(user.accessToken);
        setVenues(venuesResponse.data);
      } else {
        setVenues([]);
      }
    } catch {
      setBookings([]);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch profile data once on page load
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProfileData = async () => {
      try {
        const profileResponse = await getProfile(user.name, user.accessToken);
        const updatedUser = {
          ...user,
          ...profileResponse.data,
          accessToken: user.accessToken,
        };
        setUser(updatedUser);
        
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } catch {
        // Silently handle error
      }
    };

    fetchProfileData();
    loadProfile();
  }, [router]); // Only depend on router, not user

  // Handle refresh parameter separately
  useEffect(() => {
    const refreshParam = searchParams.get("refresh");
    if (refreshParam && user) {
      setLoading(true);
      loadProfile();
    }
  }, [searchParams, user, loadProfile]);

  // Refresh data when user returns to page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user && !loading) {
        loadProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, loading, loadProfile]);

  const handleDeleteBooking = async (id: string) => {
    if (!user) return;
    
    setConfirmModal({
      isOpen: true,
      bookingId: id,
      title: "Cancel Booking",
      message: "Are you sure you want to cancel this booking? This action cannot be undone."
    });
  };

  const confirmDeleteBooking = async () => {
    if (!user || !confirmModal.bookingId) return;
    
    try {
      await deleteBooking(confirmModal.bookingId, user.accessToken);
      setBookings(bookings.filter((b) => b.id !== confirmModal.bookingId));
    } catch {}
    
    setConfirmModal({ isOpen: false, title: "", message: "" });
  };

  const handleEditBooking = async (
    e: React.FormEvent<HTMLFormElement>,
    bookingId: string,
  ) => {
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
      const updatedBooking = await updateBooking(
        bookingId,
        {
          dateFrom: new Date(dateFrom).toISOString(),
          dateTo: new Date(dateTo).toISOString(),
          guests,
        },
        user.accessToken,
      );

      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, ...updatedBooking.data } : b,
        ),
      );
      setEditingBooking(null);
    } catch {
      setBookingError(
        "Failed to update booking. Please try again.",
      );
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-20 md:pt-32">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <ShimmerBox className="h-10 w-32 rounded mb-8" />
          <ProfileSkeleton />
          <div className="space-y-8">
            <div>
              <ShimmerBox className="h-8 w-32 rounded mb-4" />
              <BookingsSkeleton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-background">
      {/* Full-width Banner */}
      <div className="relative h-48 md:h-64 bg-secondary-lighter">
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

      {/* Profile Content */}
      <div className="mx-auto max-w-4xl px-4 -mt-16 relative z-10">
        {/* Profile Info Card */}
        <div className="bg-background-lighter rounded-lg p-6 mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {user.avatar?.url ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background">
                <Image
                  src={user.avatar.url}
                  alt={user.avatar.alt || user.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center border-4 border-background">
                <span className="text-3xl font-heading text-accent-darkest">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <h1 className="font-heading text-3xl">{user.name}</h1>
                  <span
                    className={`px-3 py-1 rounded-full text-sm mx-auto sm:mx-0 mt-2 sm:mt-0 w-fit ${
                      user.venueManager
                        ? "bg-primary/20 text-primary-darker"
                        : "bg-text/10 text-text/70"
                    }`}
                  >
                    {user.venueManager ? "Venue Manager" : "Customer"}
                  </span>
                </div>
                <Link
                  href="/profile/edit"
                  className="bg-primary text-accent-darkest px-6 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity mt-4 sm:mt-0 w-fit mx-auto sm:mx-0 cursor-pointer"
                >
                  Edit Profile
                </Link>
              </div>
              <p className="text-text/70 mb-4">{user.email}</p>
              {user.bio && <p className="text-text/80 text-lg">{user.bio}</p>}
            </div>
          </div>
        </div>

        <div className="pb-8">

        {/* My Bookings */}
        <div className="mb-8 pt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl">My Bookings</h2>
            {bookings.length > 0 && (
              <Link
                href="/bookings"
                className="text-sm text-primary-darker hover:underline cursor-pointer"
              >
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
              <p className="text-text/60 text-sm mb-4">
                Start planning your next adventure
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-accent-darkest px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm cursor-pointer"
              >
                Browse venues
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="bg-background-lighter rounded-xl p-6 border border-text/10 hover:border-primary/30 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex gap-4">
                    {booking.venue?.media?.[0]?.url && (
                      <Link
                        href={`/venues/${booking.venue.id}`}
                        className="relative w-24 h-24 bg-secondary-lighter rounded-lg overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
                      >
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
                            <Link
                              href={`/venues/${booking.venue.id}`}
                              className="font-medium text-lg mb-1 hover:text-primary-darker transition-colors block cursor-pointer"
                            >
                              {booking.venue.name}
                            </Link>
                          ) : (
                            <h3 className="font-medium text-lg mb-1">Venue</h3>
                          )}
                          <p className="text-text/60 text-sm">
                            {new Date(booking.dateFrom).toLocaleDateString()} -{" "}
                            {new Date(booking.dateTo).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg">
                            ${calculateBookingPrice(booking)}
                          </p>
                          <p className="text-text/60 text-sm">
                            {booking.guests} guest
                            {booking.guests !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {editingBooking === booking.id ? (
                        <div className="bg-background rounded-lg p-4 border border-text/20">
                          <form
                            onSubmit={(e) => handleEditBooking(e, booking.id)}
                            className="space-y-4"
                          >
                            {bookingError && (
                              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                                {bookingError}
                              </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-text/70 mb-1">
                                  Check-in
                                </label>
                                <input
                                  type="date"
                                  name="dateFrom"
                                  defaultValue={booking.dateFrom.split("T")[0]}
                                  className="w-full px-3 py-2 text-sm border border-text/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text/70 mb-1">
                                  Check-out
                                </label>
                                <input
                                  type="date"
                                  name="dateTo"
                                  defaultValue={booking.dateTo.split("T")[0]}
                                  className="w-full px-3 py-2 text-sm border border-text/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text/70 mb-1">
                                  Guests
                                </label>
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
                              <button
                                type="submit"
                                className="bg-primary text-accent-darkest px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity cursor-pointer"
                              >
                                Save Changes
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingBooking(null)}
                                className="px-4 py-2 text-sm text-text/70 hover:text-text transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setEditingBooking(booking.id)}
                            className="inline-flex items-center gap-1 text-primary-darker hover:underline text-sm cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-sm cursor-pointer"
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
                <Link
                  href="/bookings"
                  className="block text-center text-primary-darker hover:underline cursor-pointer"
                >
                  View all {bookings.length} bookings
                </Link>
              )}
            </div>
          )}
        </div>

        {/* My Venues (if venue manager) */}
        {user.venueManager && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl">My Venues</h2>
              {venues.length > 0 ? (
                <Link
                  href="/manage-venues"
                  className="text-sm text-primary-darker hover:underline cursor-pointer"
                >
                  Manage all ({venues.length})
                </Link>
              ) : (
                <Link
                  href="/manage-venues/create"
                  className="text-sm text-primary-darker hover:underline cursor-pointer"
                >
                  Create venue
                </Link>
              )}
            </div>
            {venues.length === 0 ? (
              <div className="bg-background-lighter rounded-lg p-6 text-center">
                <p className="text-text/70 mb-4">No venues yet</p>
                <Link
                  href="/manage-venues/create"
                  className="text-primary-darker hover:underline cursor-pointer"
                >
                  Create your first venue
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {venues.slice(0, 3).map((venue) => (
                  <div
                    key={venue.id}
                    className="bg-background-lighter rounded-lg p-4"
                  >
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
                          <Link
                            href={`/venues/${venue.id}`}
                            className="text-primary-darker hover:underline text-sm cursor-pointer"
                          >
                            View
                          </Link>
                          <Link
                            href={`/manage-venues/edit/${venue.id}`}
                            className="text-primary-darker hover:underline text-sm cursor-pointer"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {venues.length > 3 && (
                  <Link
                    href="/manage-venues"
                    className="block text-center text-primary-darker hover:underline cursor-pointer"
                  >
                    View all {venues.length} venues
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        variant="danger"
        onConfirm={confirmDeleteBooking}
        onCancel={() => setConfirmModal({ isOpen: false, title: "", message: "" })}
      />
    </main>
  );
}

/**
 * Profile page component with Suspense wrapper for loading states
 * 
 * Handles authentication redirect and provides fallback UI while loading.
 * Displays user profile, bookings, and venue management for authenticated users.
 * 
 * @returns JSX element with profile content or loading skeleton
 */
export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background pt-20 md:pt-32">
          <div className="mx-auto max-w-4xl px-4 py-8">
            <ShimmerBox className="h-10 w-32 rounded mb-8" />
            <ProfileSkeleton />
          </div>
        </main>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
