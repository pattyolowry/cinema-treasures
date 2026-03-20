import mongoose from 'mongoose'
import 'express'

export interface UserInfo {
    id: string,
    name: string,
    username: string,
    password: string
}

export enum Member {
  Ren = "Ren",
  Patio = "Patio",
  Greg = "Greg",
  Max = "Max",
  Quinn = "Quinn",
  Ian = "Ian"
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

export interface NewLogEntry {
    clubNumber: number,
    movie: MovieInfo,
    pickedBy: Member,
    yearWatched?: number,
    streamingPlatform?: string,
    ratings?: Rating[],
    averageRating?:  number
}

export interface NewTreasure {
  movie: MovieInfo,
  ratings?: Rating[],
  ctcstm?:  number
}

export interface AwardNominee {
  name: string;
  isWinner?: boolean;
  subText?: string;
}

export interface AwardCategory {
  name: string;
  isVisible: boolean;
  nominees: AwardNominee[];
}

export interface AwardYearType {
  year: number;
  categories: AwardCategory[];
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

declare module 'express-serve-static-core' {
  interface Request {
    token?: string | null;
    user?: mongoose.Model<UserInfo> | null;
  }
}

export {};