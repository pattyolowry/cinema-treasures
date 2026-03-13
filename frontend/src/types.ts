export type Member = 'Ren' | 'Patio' | 'Greg' | 'Max' | 'Quinn' | 'Ian';

export interface MovieRecord {
  id: string;
  clubNumber: number;
  title: string;
  yearReleased: number;
  yearWatched: number;
  originCountry: string;
  streamingPlatform: string;
  runTime?: string;
  mpaaRating?: string;
  posterUrl?: string;
  backdropUrl?: string;
  ratings: Record<Member, number | null>;
  averageRating: number | null;
}

export interface TmdbSearchMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
}

export interface TmdbSearchResults {
  results: TmdbSearchMovie[];
}

export interface TmdbProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  origin_country?: string[];
  production_countries?: TmdbProductionCountry[];
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface LoggedUser {
  name: string,
  username: string,
  token: string
}

export interface MovieInfo {
  title: string,
  yearReleased?: number,
  originCountry?: string,
  runTime?: number,
  mpaaRating?: string,
  tmdbId?: number,
  posterUrl?: string,
  backdropUrl?: string
}

export interface Rating {
  user: Member,
  rating: number
}

export interface LogEntry {
    id: string
    clubNumber: number,
    movie: MovieInfo,
    yearWatched?: number,
    streamingPlatform?: string,
    ratings?: Rating[],
    averageRating?:  number
}

export type NewLogEntry = Omit<LogEntry, 'id'>;