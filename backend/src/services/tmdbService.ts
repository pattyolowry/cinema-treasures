import { TmdbMovieDetails, TmdbSearchResults } from '../types'
import config from '../utils/config'
import axios from 'axios';

const baseUrl = 'https://api.themoviedb.org/3';

const apiConfig = {
  headers: { Authorization: `Bearer ${config.TMDB_API_KEY}` },
};

const searchMovie = async (text: string) => {
  const { data } = await axios.get<TmdbSearchResults>(
    `${baseUrl}/search/movie?query=${encodeURIComponent(text)}`,
    apiConfig,
  );

  return data;
};

const getMovieDetails = async (id: string) => {
  const { data } = await axios.get<TmdbMovieDetails>(
    `${baseUrl}/movie/${id}`,
    apiConfig,
  );

  return data;
};

export default {
    searchMovie,
    getMovieDetails
}