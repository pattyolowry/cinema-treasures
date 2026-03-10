import axios from "axios";
import { TmdbSearchResults, TmdbMovie } from "../types";
const api_key = import.meta.env.VITE_TMDB_API_KEY;

const baseUrl = "https://api.themoviedb.org/3"

const config = {
    headers: { Authorization: `Bearer ${api_key}` }
}

const searchMovie = async ( text: string ) => {
  const { data } = await axios.get<TmdbSearchResults>(
    `${baseUrl}/search/movie?query=${text}`, config
  );

  return data;
};

const getMovieDetails = async ( id: number ) => {
  const { data } = await axios.get<TmdbMovie>(
    `${baseUrl}/movie/${id}`, config
  );

  return data;
};

export default {
  searchMovie,
  getMovieDetails
};

