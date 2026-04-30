import connectToDatabase from "../utils/db";
import config from "../utils/config";
import tmdbService from "../services/tmdbService";
import Movie from "../models/movie";
import { setTimeout as sleep } from "timers/promises";
import mongoose from "mongoose";
import omdbService from "../services/omdbService";

const main = async () => {
  await connectToDatabase(config.MONGODB_URI);
  const movies = await Movie.find({});

  let count = 0;
  for (const movie of movies) {
    if (movie.tmdbId) {
      // Fetch movie details from tmdb API
      const movieDetails = await tmdbService.getMovieDetails(
        movie.tmdbId.toString(),
      );

      movie.imdbId = movieDetails.imdb_id;

      // // Description / overview
      // movie.overview = movieDetails.overview ? movieDetails.overview : "";

      // // TMDB Rating
      // movie.tmdbRating = movieDetails.vote_average
      //   ? movieDetails.vote_average
      //   : 0;

      // // Genres
      // movie.genres = movieDetails.genres?.map((genre) => genre.name);

      // // Origin Country
      // const countryCode =
      //   movieDetails.origin_country && movieDetails.origin_country.length !== 0
      //     ? movieDetails.origin_country[0]
      //     : "";
      // if (countryCode) {
      //   movie.originCountry = new Intl.DisplayNames(["en"], {
      //     type: "region",
      //   }).of(countryCode);
      // }

      // // Language
      // const languageCode = movieDetails.original_language
      //   ? movieDetails.original_language
      //   : "";
      // if (languageCode) {
      //   movie.language = new Intl.DisplayNames(["en"], {
      //     type: "language",
      //   }).of(languageCode);
      // }

      // // Director(s)
      // const movieCredits = await tmdbService.getMovieCredits(
      //   movie.tmdbId.toString(),
      // );

      // const directors = movieCredits.crew.filter((c) => c.job === "Director");
      // if (directors.length !== 0) {
      //   movie.directors = directors.map((d) => d.name);
      // }

      // // MPAA Rating
      // const releases = await tmdbService.getReleaseDates(
      //   movie.tmdbId.toString(),
      // );

      // const usResults = releases.results.filter((r) => r.iso_3166_1 === "US");
      // let mpaaRating = "Not Rated";

      // if (usResults.length !== 0) {
      //   for (const release of usResults[0].release_dates) {
      //     if (release.certification !== "") {
      //       mpaaRating = release.certification;
      //       break;
      //     }
      //   }
      // }

      // movie.mpaaRating = mpaaRating;

      // Fetch OMDB Ratings
      const omdbDetails = await omdbService.getMovieDetails(movie.imdbId);

      if (omdbDetails.ratings.imdb) {
        movie.imdbRating = omdbDetails.ratings.imdb;
      }

      if (omdbDetails.ratings.rottenTomatoes) {
        movie.rottenTomatoesRating = omdbDetails.ratings.rottenTomatoes;
      }

      // Save movie back to DB
      await movie.save();

      console.log(`Updated ${movie.title}`);
      count++;
      if (count % 50 === 0) {
        console.log(`${count} records complete`);
        //break;
      }

      await sleep(2000);
    }
  }

  await mongoose.connection.close();
};

main().catch(console.error);
