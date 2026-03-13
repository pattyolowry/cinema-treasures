import { Member } from '../types';
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
    backdropUrl: z.optional(z.string())
  }),
  yearWatched: z.optional(z.int()),
  streamingPlatform: z.optional(z.string()),
  ratings: z.optional(z.array(z.object({
    user: z.enum(Member),
    rating: z.number()
  }))),
  averageRating: z.optional(z.number())
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
    backdropUrl: z.optional(z.string())
  }),
  ratings: z.optional(z.array(z.object({
    user: z.enum(Member),
    rating: z.number()
  }))),
  ctcstm: z.optional(z.number())
});




