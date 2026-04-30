import { OMDBMovieDetails } from "../types";
import config from "../utils/config";
import axios from "axios";

const baseUrl = "https://www.omdbapi.com/";

const getMovieDetails = async (id: string) => {
  const response: { ratings: Record<string, number> } = {
    ratings: {},
  };
  const { data } = await axios.get<OMDBMovieDetails>(
    `${baseUrl}/?i=${id}&apikey=${config.OMDB_API_KEY}`,
  );

  for (const rating of data.Ratings) {
    // Check if IMDB Rating
    if (rating.Source === "Internet Movie Database") {
      const value = rating.Value.match(/^(\d+(\.\d+)?)/);
      const imdbRating = value ? parseFloat(value[1]) : null;
      if (imdbRating) {
        response.ratings.imdb = imdbRating;
      }
    }

    // Check if Rotten Tomatoes Rating
    if (rating.Source === "Rotten Tomatoes") {
      const value = rating.Value.replace("%", "");
      const rottenTomatoesRating = parseFloat(value);
      if (rottenTomatoesRating) {
        response.ratings.rottenTomatoes = rottenTomatoesRating;
      }
    }
  }

  return response;
};

export default {
  getMovieDetails,
};
