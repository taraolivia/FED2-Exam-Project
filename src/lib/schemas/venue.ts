/**
 * Venue schema definitions and validation for the Holidaze booking platform
 * 
 * Defines TypeScript types and Zod validation schemas for:
 * - Venue data structure with media, location, and amenities
 * - API response formats for single venues and venue lists
 * - Booking information embedded within venues
 */
import { z } from "zod";

/** Schema for media objects (images) with URL and alt text */
export const MediaSchema = z.object({
  url: z.string().url(),
  alt: z.string().nullable().optional(),
});

/** Schema for venue amenities and features */
export const MetaSchema = z.object({
  wifi: z.boolean().optional(),
  parking: z.boolean().optional(),
  breakfast: z.boolean().optional(),
  pets: z.boolean().optional(),
});

/** Schema for venue location information including coordinates */
export const LocationSchema = z.object({
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  zip: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  continent: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});

const BookingSchema = z.object({
  id: z.string(),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  guests: z.number().min(1),
  created: z.string().datetime(),
  updated: z.string().datetime(),
  customer: z
    .object({
      name: z.string(),
      email: z.string(),
      avatar: z
        .object({
          url: z.string(),
          alt: z.string().nullable().optional(),
        })
        .nullable()
        .optional(),
    })
    .optional(),
});

export const VenueSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  media: z.array(MediaSchema).default([]),
  price: z.number().min(0),
  maxGuests: z.number().min(1),
  rating: z.number().nullable().optional(), // ✅ allow null
  created: z.string().datetime(),
  updated: z.string().datetime(),
  meta: MetaSchema.optional(),
  location: LocationSchema.optional(),
  bookings: z.array(BookingSchema).optional(),
});

export const VenueListResponseSchema = z.object({
  data: z.array(VenueSchema),
  meta: z
    .object({
      isFirstPage: z.boolean().optional(),
      isLastPage: z.boolean().optional(),
      currentPage: z.number().optional(),
      previousPage: z.number().nullable().optional(),
      nextPage: z.number().nullable().optional(),
      pageCount: z.number().optional(),
      totalCount: z.number().optional(),
    })
    .default({}),
});

export const VenueSingleResponseSchema = z.object({
  data: VenueSchema,
  meta: z.object({}).default({}),
});

export type Venue = z.infer<typeof VenueSchema>;
export type VenueListResponse = z.infer<typeof VenueListResponseSchema>;
export type VenueSingleResponse = z.infer<typeof VenueSingleResponseSchema>;
