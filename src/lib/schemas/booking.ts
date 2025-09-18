import { z } from "zod";
import { VenueSchema } from "./venue";

export const BookingSchema = z.object({
  id: z.string(),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  guests: z.number().min(1),
  created: z.string().datetime(),
  updated: z.string().datetime(),
  venue: VenueSchema.optional(),
});

export const BookingCreateSchema = z.object({
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  guests: z.number().min(1),
  venueId: z.string(),
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
