"use client";
import { useState } from "react";
import { useUser } from "@/lib/contexts/UserContext";
import { createBooking } from "@/lib/api/bookings";
import type { Venue } from "@/lib/schemas/venue";
import AvailabilityCalendar from "./AvailabilityCalendar";

type Props = {
  venue: Venue;
  onBookingSuccess?: () => void;
};

export default function BookingForm({ venue, onBookingSuccess }: Props) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{ from?: string; to?: string }>({});

  if (!user) {
    return (
      <div className="bg-background-lighter rounded-lg p-6">
        <p className="text-center text-text/70">
          Please <a href="/login" className="text-primary hover:underline">log in</a> to make a booking
        </p>
      </div>
    );
  }

  const handleDateSelect = (dateFrom: string, dateTo: string) => {
    setSelectedDates({ from: dateFrom, to: dateTo });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const guests = parseInt(formData.get("guests") as string);

    if (!selectedDates.from || !selectedDates.to) {
      setError("Please select check-in and check-out dates from the calendar above");
      setLoading(false);
      return;
    }

    if (!guests || guests < 1) {
      setError("Please enter the number of guests");
      setLoading(false);
      return;
    }

    const dateFrom = selectedDates.from;
    const dateTo = selectedDates.to;

    if (new Date(dateFrom) >= new Date(dateTo)) {
      setError("Check-out date must be after check-in date");
      setLoading(false);
      return;
    }

    if (guests > venue.maxGuests) {
      setError(`Maximum ${venue.maxGuests} guests allowed`);
      setLoading(false);
      return;
    }

    try {
      await createBooking({
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo).toISOString(),
        guests,
        venueId: venue.id,
      }, user.accessToken);

      setSuccess(true);
      onBookingSuccess?.();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error('Booking error:', err);
      if (err instanceof Error) {
        // Handle specific API errors
        if (err.message.includes('already booked')) {
          setError("These dates are no longer available. Please select different dates.");
        } else if (err.message.includes('Invalid date')) {
          setError("Invalid dates selected. Please choose valid dates.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Unable to complete booking. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    if (!selectedDates.from || !selectedDates.to) return 0;
    const nights = Math.ceil((new Date(selectedDates.to).getTime() - new Date(selectedDates.from).getTime()) / (1000 * 60 * 60 * 24));
    return nights * venue.price;
  };

  const totalPrice = calculateTotal();
  const nights = selectedDates.from && selectedDates.to ? 
    Math.ceil((new Date(selectedDates.to).getTime() - new Date(selectedDates.from).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="bg-background-lighter rounded-lg p-6">
      <h3 className="font-heading text-xl mb-4">Book this venue</h3>
      
      {/* Availability Calendar */}
      <div className="mb-6">
        <AvailabilityCalendar 
          venueId={venue.id} 
          onDateSelect={handleDateSelect}
        />
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Booking successful! Check your profile for details.
          </div>
        )}

        {/* Hidden inputs for form submission */}
        <input type="hidden" name="dateFrom" value={selectedDates.from || ""} />
        <input type="hidden" name="dateTo" value={selectedDates.to || ""} />
        
        {selectedDates.from && selectedDates.to && (
          <div className="bg-background rounded-lg p-4 mb-4">
            <div className="text-sm mb-2">
              <strong>Selected:</strong> {new Date(selectedDates.from).toLocaleDateString()} - {new Date(selectedDates.to).toLocaleDateString()}
            </div>
            <div className="text-xs text-text/70">
              {nights} night{nights !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="guests" className="block text-sm font-medium mb-1">
            Guests (max {venue.maxGuests})
          </label>
          <input
            type="number"
            id="guests"
            name="guests"
            min="1"
            max={venue.maxGuests}
            required
            className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="bg-background rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span>Price per night:</span>
            <span>${venue.price}</span>
          </div>
          {selectedDates.from && selectedDates.to && (
            <>
              <div className="flex justify-between items-center text-sm">
                <span>{nights} night{nights !== 1 ? 's' : ''}:</span>
                <span>${venue.price} × {nights}</span>
              </div>
              <div className="border-t border-text/10 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-lg">Total:</span>
                  <span className="text-xl font-heading text-primary">${totalPrice}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !selectedDates.from || !selectedDates.to}
          className="w-full bg-primary text-accent-darkest py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
        >
          {loading ? "Booking..." : selectedDates.from && selectedDates.to ? `Book for $${totalPrice}` : "Select dates to book"}
        </button>
      </form>
    </div>
  );
}