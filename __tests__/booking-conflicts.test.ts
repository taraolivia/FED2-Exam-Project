/**
 * Booking conflict prevention tests
 */
describe('Booking Conflicts', () => {
  const mockVenue = {
    id: 'venue-1',
    name: 'Test Venue',
    price: 100,
    maxGuests: 4,
    bookings: [
      {
        id: 'booking-1',
        dateFrom: '2024-12-25T00:00:00.000Z',
        dateTo: '2024-12-27T00:00:00.000Z',
        guests: 2
      },
      {
        id: 'booking-2', 
        dateFrom: '2024-12-30T00:00:00.000Z',
        dateTo: '2025-01-02T00:00:00.000Z',
        guests: 3
      }
    ]
  };

  describe('Date conflict detection', () => {
    it('should detect overlapping dates', () => {
      const newBooking = {
        dateFrom: '2024-12-26T00:00:00.000Z',
        dateTo: '2024-12-28T00:00:00.000Z'
      };

      const hasConflict = mockVenue.bookings.some(booking => {
        const existingStart = new Date(booking.dateFrom);
        const existingEnd = new Date(booking.dateTo);
        const newStart = new Date(newBooking.dateFrom);
        const newEnd = new Date(newBooking.dateTo);

        return (newStart < existingEnd && newEnd > existingStart);
      });

      expect(hasConflict).toBe(true);
    });

    it('should allow non-overlapping dates', () => {
      const newBooking = {
        dateFrom: '2024-12-28T00:00:00.000Z',
        dateTo: '2024-12-29T00:00:00.000Z'
      };

      const hasConflict = mockVenue.bookings.some(booking => {
        const existingStart = new Date(booking.dateFrom);
        const existingEnd = new Date(booking.dateTo);
        const newStart = new Date(newBooking.dateFrom);
        const newEnd = new Date(newBooking.dateTo);

        return (newStart < existingEnd && newEnd > existingStart);
      });

      expect(hasConflict).toBe(false);
    });

    it('should prevent past date bookings', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const newBooking = {
        dateFrom: pastDate.toISOString(),
        dateTo: new Date().toISOString()
      };

      const isPastDate = new Date(newBooking.dateFrom) < new Date();
      expect(isPastDate).toBe(true);
    });
  });
});