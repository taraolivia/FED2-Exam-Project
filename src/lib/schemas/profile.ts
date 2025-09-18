import { z } from "zod";

const MediaSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
});

export const ProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  bio: z.string().optional(),
  avatar: MediaSchema.optional(),
  banner: MediaSchema.optional(),
  venueManager: z.boolean().default(false),
  _count: z.object({
    venues: z.number(),
    bookings: z.number(),
  }).optional(),
});

export const ProfileUpdateSchema = z.object({
  bio: z.string().optional(),
  avatar: MediaSchema.optional(),
  banner: MediaSchema.optional(),
  venueManager: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});

export const ProfileListResponseSchema = z.object({
  data: z.array(ProfileSchema),
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

export const ProfileSingleResponseSchema = z.object({
  data: ProfileSchema,
  meta: z.object({}),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type ProfileListResponse = z.infer<typeof ProfileListResponseSchema>;
export type ProfileSingleResponse = z.infer<typeof ProfileSingleResponseSchema>;