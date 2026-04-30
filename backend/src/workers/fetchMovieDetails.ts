import { SQSEvent, SQSRecord } from "aws-lambda";
import { z } from "zod";
import connectToDatabase from "../utils/db";
import config from "../utils/config";
import tmdbService from "../services/tmdbService";
import Movie from "../models/movie";
import webpush from "web-push";
import User from "../models/user";
import TreasureActivity from "../models/treasureActivity";
import omdbService from "../services/omdbService";

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
    troveId: z.string(),
  }),
  z.object({
    type: z.literal("TREASURE_UPDATED"),
    user: z.string(),
    movieId: z.string(),
    troveId: z.string(),
    old: z.object({
      ratings: z.optional(
        z.array(
          z.object({
            user: z.string(),
            rating: z.number(),
          }),
        ),
      ),
    }),
    new: z.object({
      ratings: z.optional(
        z.array(
          z.object({
            user: z.string(),
            rating: z.number(),
          }),
        ),
      ),
    }),
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
  try {
    console.log("Handling new movie event");
    await connectDB();

    for (const record of event.Records) {
      const body = parseBody(record);
      const movieId = body.movieId;

      const movie = await Movie.findById(movieId);
      console.log(`Movie: ${movie?.title}`);

      if (movie?.tmdbId) {
        // Fetch movie details from tmdb API
        const movieDetails = await tmdbService.getMovieDetails(
          movie.tmdbId.toString(),
        );

        console.log("Fetched movie details from tmdb");

        // IMDB ID
        movie.imdbId = movieDetails.imdb_id;

        // Description / overview
        movie.overview = movieDetails.overview ? movieDetails.overview : "";

        // TMDB Rating
        movie.tmdbRating = movieDetails.vote_average
          ? movieDetails.vote_average
          : 0;

        // Genres
        movie.genres = movieDetails.genres?.map((genre) => genre.name);

        // Origin Country
        const countryCode =
          movieDetails.origin_country &&
          movieDetails.origin_country.length !== 0
            ? movieDetails.origin_country[0]
            : "";
        if (countryCode) {
          movie.originCountry = new Intl.DisplayNames(["en"], {
            type: "region",
          }).of(countryCode);
        }

        // Language
        const languageCode = movieDetails.original_language
          ? movieDetails.original_language
          : "";
        if (languageCode) {
          movie.language = new Intl.DisplayNames(["en"], {
            type: "language",
          }).of(languageCode);
        }

        // Director(s)
        const movieCredits = await tmdbService.getMovieCredits(
          movie.tmdbId.toString(),
        );

        console.log("Fetched movie credits from tmdb");

        const directors = movieCredits.crew.filter((c) => c.job === "Director");
        if (directors.length !== 0) {
          movie.directors = directors.map((d) => d.name);
        }

        // MPAA Rating
        const releases = await tmdbService.getReleaseDates(
          movie.tmdbId.toString(),
        );

        console.log("Fetched release info from tmdb");

        const usResults = releases.results.filter((r) => r.iso_3166_1 === "US");
        let mpaaRating = "Not Rated";

        if (usResults.length !== 0) {
          for (const release of usResults[0].release_dates) {
            if (release.certification !== "") {
              mpaaRating = release.certification;
              break;
            }
          }
        }

        movie.mpaaRating = mpaaRating;

        // Fetch OMDB Ratings
        const omdbDetails = await omdbService.getMovieDetails(movie.imdbId);
        console.log("Fetched ratings from OMDB");

        if (omdbDetails.ratings.imdb) {
          movie.imdbRating = omdbDetails.ratings.imdb;
        }

        if (omdbDetails.ratings.rottenTomatoes) {
          movie.rottenTomatoesRating = omdbDetails.ratings.rottenTomatoes;
        }

        // Save movie back to DB
        await movie.save();

        console.log("Saved updates to DB");

        // Save activity and send notification for new Trove entries
        if (body.type === "TREASURE_ADDED") {
          const activity = new TreasureActivity({
            troveId: body.troveId,
            user: body.user,
            message: `Added to treasure trove`,
          });
          await activity.save();

          webpush.setVapidDetails(
            `mailto:${config.SUPPORT_EMAIL}`,
            config.VAPID_PUBLIC_KEY!,
            config.VAPID_PRIVATE_KEY!,
          );

          const users = await User.find({
            webPushSubscriptions: { $exists: true, $ne: [] },
          });

          for (const user of users) {
            for (const subscription of user.webPushSubscriptions) {
              await webpush.sendNotification(
                subscription,
                JSON.stringify({
                  title: "New movie added to Treasure Trove",
                  body: `${body.user} added ${movie.title} (${movie.yearReleased}) to the Treasure Trove. Seent it? Add your rating!`,
                  url: `/treasure-trove/${body.troveId}`,
                }),
              );
            }
          }
        }

        // Save activity and send notification for trove rating updates
        if (body.type === "TREASURE_UPDATED") {
          const oldRating =
            body.old.ratings?.find((r) => r.user === body.user)?.rating ??
            "None";
          const newRating =
            body.new.ratings?.find((r) => r.user === body.user)?.rating ??
            "None";

          console.log(`Old Rating: ${oldRating}`);
          console.log(`New Rating: ${newRating}`);
          if (oldRating !== newRating) {
            const activity = new TreasureActivity({
              troveId: body.troveId,
              user: body.user,
              message: `Updated rating from ${oldRating} to ${newRating}`,
            });
            await activity.save();

            webpush.setVapidDetails(
              `mailto:${config.SUPPORT_EMAIL}`,
              config.VAPID_PUBLIC_KEY!,
              config.VAPID_PRIVATE_KEY!,
            );

            const users = await User.find({
              webPushSubscriptions: { $exists: true, $ne: [] },
            });

            for (const user of users) {
              for (const subscription of user.webPushSubscriptions) {
                await webpush.sendNotification(
                  subscription,
                  JSON.stringify({
                    title: "Treasure Trove Updated",
                    body: `${body.user} updated his rating for ${movie.title} (${movie.yearReleased}): ${oldRating} --> ${newRating}`,
                    url: `/treasure-trove/${body.troveId}`,
                  }),
                );
                console.log("Sent push notification");
                console.log(`/treasure-trove/${body.troveId}`);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
};

function parseBody(record: SQSRecord) {
  return jobSchema.parse(JSON.parse(record.body));
}
