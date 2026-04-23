import { SQSEvent, SQSRecord } from "aws-lambda";
import { z } from "zod";
import connectToDatabase from "../utils/db";
import config from "../utils/config";
import tmdbService from "../services/tmdbService";
import Movie from "../models/movie";

let dbIsConnected = false;

const jobSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("HISTORY_ADDED"),
    movieId: z.string(),
  }),
  z.object({
    type: z.literal("TREASURE_ADDED"),
    user: z.string(),
    movieId: z.string(),
  }),
]);

const connectDB = async () => {
  if (dbIsConnected) {
    return;
  }
  await connectToDatabase(config.MONGODB_URI);

  dbIsConnected = true;
};

export const movieHandler = async (event: SQSEvent) => {
  await connectDB();

  for (const record of event.Records) {
    const body = parseBody(record);
    const movieId = body.movieId;

    const movie = await Movie.findById(movieId);

    if (movie?.tmdbId) {
      // Fetch movie details from tmdb API
      const movieDetails = await tmdbService.getMovieDetails(
        movie.tmdbId.toString(),
      );

      // Description / overview
      movie.overview = movieDetails.overview;

      // TMDB Rating
      movie.tmdbRating = movieDetails.vote_average;

      // Genres
      movie.genres = movieDetails.genres?.map((genre) => genre.name);

      // Language
      const languageCode = movieDetails.original_language;
      if (languageCode) {
        movie.language = new Intl.DisplayNames(["en"], { type: "language" }).of(
          languageCode,
        );
      }

      // Director(s)
      const movieCredits = await tmdbService.getMovieCredits(
        movie.tmdbId.toString(),
      );

      const directors = movieCredits.crew.filter((c) => c.job === "Director");
      movie.directors = directors.map((d) => d.name);

      // Parental guidance
      // MPAA Rating
    }
  }
};

function parseBody(record: SQSRecord) {
  return jobSchema.parse(JSON.parse(record.body));
}
