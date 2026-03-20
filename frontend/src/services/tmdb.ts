import axios from 'axios';
import { TmdbMovieDetails, TmdbSearchResults } from '../types';
import utils from './utils'

const baseUrl = '/api/tmdb';

const searchMovie = async (text: string) => {
  const { data } = await axios.get<TmdbSearchResults>(
    `${baseUrl}/search/movie?query=${encodeURIComponent(text)}`,
    utils.getAuthConfig()
  );

  return data;
};

const getMovieDetails = async (id: number) => {
  const { data } = await axios.get<TmdbMovieDetails>(
    `${baseUrl}/movie/${id}`,
    utils.getAuthConfig()
  );

  return data;
};

export default {
  searchMovie,
  getMovieDetails,
};
