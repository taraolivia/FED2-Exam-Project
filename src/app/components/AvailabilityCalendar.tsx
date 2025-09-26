"use client";
import { useState, useEffect, useCallback } from "react";
import { ShimmerBox } from "./LoadingSkeleton";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type Booking = {
  dateFrom: string;
  dateTo: string;
};

type Props = {
  venueId: string;
  onDateSelect?: (dateFrom: string, dateTo: string) => void;
};

/**
 * Interactive calendar showing venue availability and booking dates
 * @param venueId - ID of venue to show availability for
 * @param onDateSelect - Callback when date range is selected
 */
export default function AvailabilityCalendar({ venueId, onDateSelect }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDates, setSelectedDates] = useState<{
    from?: string;
    to?: string;
  }>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVenueBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `https://v2.api.noroff.dev/holidaze/venues/${venueId}?_bookings=true`;

      const apiKey = process.env.NEXT_PUBLIC_NOROFF_API_KEY;
      const res = await fetch(url, {
        headers: apiKey ? { "X-Noroff-API-Key": apiKey } : {},
      });
      if (!res.ok) throw new Error(`Failed to load availability`);
      const data = await res.json();
      setBookings(data.data.bookings || []);
    } catch {
      setError("Unable to load availability. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    loadVenueBookings();
  }, [loadVenueBookings]);



  const isDateBooked = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return bookings.some((booking) => {
      const from = new Date(booking.dateFrom).toISOString().split("T")[0];
      const to = new Date(booking.dateTo).toISOString().split("T")[0];
      return dateStr >= from && dateStr <= to;
    });
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (date: Date) => {
    if (isDateBooked(date) || isDateInPast(date)) return;

    const dateStr = date.toISOString().split("T")[0];

    if (!selectedDates.from || (selectedDates.from && selectedDates.to)) {
      // Start new selection
      setSelectedDates({ from: dateStr });
    } else if (dateStr < selectedDates.from) {
      // Selected date is before start date
      setSelectedDates({ from: dateStr });
    } else {
      // Complete the range
      setSelectedDates({ from: selectedDates.from, to: dateStr });
      onDateSelect?.(selectedDates.from, dateStr);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateSelected = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (!selectedDates.from) return false;
    if (!selectedDates.to) return dateStr === selectedDates.from;
    return dateStr >= selectedDates.from && dateStr <= selectedDates.to;
  };

  const days = getDaysInMonth(currentMonth);

  if (loading) {
    return (
      <div className="bg-background-lighter rounded-lg p-6">
        <div>
          <ShimmerBox className="h-6 rounded mb-4" />
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <ShimmerBox key={i} className="h-8 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background-lighter rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadVenueBookings}
            className="bg-primary text-accent-darkest px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-lighter rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
            )
          }
          className="p-2 hover:bg-background rounded cursor-pointer"
        >
          ←
        </button>
        <h3 className="font-heading text-lg">
          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
            )
          }
          className="p-2 hover:bg-background rounded cursor-pointer"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-text/70 p-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="p-2"></div>;
          }

          const isBooked = isDateBooked(date);
          const isPast = isDateInPast(date);
          const isSelected = isDateSelected(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={isBooked || isPast}
              className={`
                p-2 text-sm rounded transition-colors
                ${isSelected ? "bg-primary text-accent-darkest" : ""}
                ${isBooked ? "bg-red-100 text-red-400 cursor-not-allowed" : ""}
                ${isPast ? "text-text/30 cursor-not-allowed" : ""}
                ${!isBooked && !isPast && !isSelected ? "hover:bg-background" : ""}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded"></div>
          <span>Selected dates</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 rounded"></div>
          <span>Booked (unavailable)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-text/10 rounded"></div>
          <span>Available</span>
        </div>
      </div>

      {selectedDates.from && selectedDates.to && (
        <div className="mt-4 p-3 bg-background rounded-lg">
          <p className="text-sm">
            <strong>Selected:</strong> {selectedDates.from} to{" "}
            {selectedDates.to}
          </p>
        </div>
      )}
    </div>
  );
}
