import { z } from "zod";

export const MediaSchema = z.object({
  url: z.string().url(),
  alt: z.string().nullable().optional(), // ✅ allow null/undefined
});

export const MetaSchema = z.object({
  wifi: z.boolean().optional(),
  parking: z.boolean().optional(),
  breakfast: z.boolean().optional(),
  pets: z.boolean().optional(),
});

export const LocationSchema = z.object({
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  zip: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  continent: z.string().nullable().optional(),
  lat: z.number().nullable().optional(), // ✅ allow null
  lng: z.number().nullable().optional(), // ✅ allow null
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
