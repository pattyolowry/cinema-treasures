import { Member, Month } from "../types";
import { z } from "zod";

export const newLogEntrySchema = z.object({
  clubNumber: z.int(),
  movie: z.object({
    title: z.string(),
    yearReleased: z.optional(z.int()),
    originCountry: z.optional(z.string()),
    runTime: z.optional(z.int()),
    mpaaRating: z.optional(z.string()),
    tmdbId: z.optional(z.number()),
    posterUrl: z.optional(z.string()),
    backdropUrl: z.optional(z.string()),
  }),
  pickedBy: z.enum(Member),
  monthWatched: z.optional(z.enum(Month)),
  yearWatched: z.optional(z.int()),
  streamingPlatform: z.optional(z.string()),
  ratings: z.optional(
    z.array(
      z.object({
        user: z.enum(Member),
        rating: z.number(),
      }),
    ),
  ),
  averageRating: z.optional(z.number()),
  notes: z.optional(z.string()),
});

export const newTreasureSchema = z.object({
  movie: z.object({
    title: z.string(),
    yearReleased: z.optional(z.int()),
    originCountry: z.optional(z.string()),
    runTime: z.optional(z.int()),
    mpaaRating: z.optional(z.string()),
    tmdbId: z.optional(z.number()),
    posterUrl: z.optional(z.string()),
    backdropUrl: z.optional(z.string()),
  }),
  ratings: z.optional(
    z.array(
      z.object({
        user: z.enum(Member),
        rating: z.number(),
      }),
    ),
  ),
  ctcstm: z.optional(z.number()),
});

export const newBlogSchema = z.object({
  title: z.string(),
  authors: z
    .union([z.enum(Member), z.array(z.enum(Member))])
    .transform((value): Member[] => (Array.isArray(value) ? value : [value])),
  url: z.url(),
  date: z.iso.date(),
  shortDescription: z.optional(z.string()),
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});
