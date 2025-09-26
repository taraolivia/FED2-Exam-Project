/**
 * Booking schema definitions and validation for venue reservations
 * 
 * Defines TypeScript types and Zod validation schemas for:
 * - Booking data structure with dates, guests, and venue information
 * - Booking creation with validation rules
 * - API response formats for bookings
 * - Date validation to prevent past dates and invalid ranges
 */
import { z } from "zod";
import { VenueSchema } from "./venue";

/**
 * Validates that check-out date is after check-in date
 * @param data - Object containing dateFrom and dateTo strings
 * @returns True if date range is valid
 */
const validateDateRange = (data: { dateFrom: string; dateTo: string }) =>
  new Date(data.dateFrom) < new Date(data.dateTo);

/**
 * Validates that check-in date is not in the past
 * @param data - Object containing dateFrom string
 * @returns True if date is today or in the future
 */
const validateFutureDate = (data: { dateFrom: string }) => {
  const from = new Date(data.dateFrom);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return from >= now;
};

export const BookingSchema = z.object({
  id: z.string(),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  guests: z.number().min(1),
  created: z.string().datetime(),
  updated: z.string().datetime(),
  venue: VenueSchema.optional(),
});

export const BookingCreateSchema = z
  .object({
    dateFrom: z.string().datetime(),
    dateTo: z.string().datetime(),
    guests: z.number().min(1),
    venueId: z.string(),
  })
  .refine(validateFutureDate, {
    message: "Check-in date cannot be in the past",
    path: ["dateFrom"],
  })
  .refine(validateDateRange, {
    message: "Check-in date must be before check-out date",
    path: ["dateTo"],
  });

export const BookingListResponseSchema = z.object({
  data: z.array(BookingSchema),
  meta: z.object({
    isFirstPage: z.boolean(),
    isLastPage: z.boolean(),
    currentPage: z.number(),
    previousPage: z.number().nullable(),
    nextPage: z.number().nullable(),
    pageCount: z.number(),
    totalCount: z.number(),
  }),
});

export const BookingSingleResponseSchema = z.object({
  data: BookingSchema,
  meta: z.object({}),
});

export type Booking = z.infer<typeof BookingSchema>;
export type BookingCreate = z.infer<typeof BookingCreateSchema>;
export type BookingListResponse = z.infer<typeof BookingListResponseSchema>;
export type BookingSingleResponse = z.infer<typeof BookingSingleResponseSchema>;
