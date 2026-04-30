import mongoose from "mongoose";
import "express";

export interface UserInfo {
  id: string;
  name: string;
  username: string;
  password: string;
  admin?: boolean;
}

export enum Member {
  Ren = "Ren",
  Patio = "Patio",
  Greg = "Greg",
  Max = "Max",
  Quinn = "Quinn",
  Ian = "Ian",
}

export type IdParams = {
  id: string;
};

export enum Month {
  January = "January",
  February = "February",
  March = "March",
  April = "April",
  May = "May",
  June = "June",
  July = "July",
  August = "August",
  September = "September",
  October = "October",
  November = "November",
  December = "December",
}

export interface MovieInfo {
  title: string;
  yearReleased?: number;
  originCountry?: string;
  runTime?: number;
  mpaaRating?: string;
  tmdbId?: number;
  posterUrl?: string;
  backdropUrl?: string;
}

export interface Rating {
  user: Member;
  rating: number;
}

export interface NewLogEntry {
  clubNumber: number;
  movie: MovieInfo;
  pickedBy: Member;
  monthWatched?: Month;
  yearWatched?: number;
  streamingPlatform?: string;
  ratings?: Rating[];
  averageRating?: number;
  notes?: string;
}

export interface NewTreasure {
  movie: MovieInfo;
  ratings?: Rating[];
  ctcstm?: number;
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

export type Genre = {
  id: number;
  name: string;
};

export interface TmdbMovieDetails {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  origin_country?: string[];
  production_countries?: TmdbProductionCountry[];
  overview?: string;
  vote_average?: number;
  genres: Genre[];
  original_language?: string;
  imdb_id: string;
}

type CastCredit = {
  name: string;
  order: number;
};

type CrewCredit = {
  name: string;
  job: string;
};

export interface TmdbMovieCredits {
  id: number;
  cast: CastCredit[];
  crew: CrewCredit[];
}

type ReleaseDate = {
  certification: string;
};

type Release = {
  iso_3166_1: string;
  release_dates: ReleaseDate[];
};

export interface TmdbReleaseResults {
  id: number;
  results: Release[];
}

export interface NewBlog {
  title: string;
  authors: Member[];
  url: string;
  date: Date;
  imageKey?: string;
  shortDescription?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    token?: string | null;
    user?: mongoose.Model<UserInfo> | null;
  }
}

type SubscriptionKey = {
  p256dh: string;
  auth: string;
};

export interface PushSubscription {
  endpoint: string;
  keys: SubscriptionKey;
}

type OMDBRating = {
  Source: string;
  Value: string;
};

export interface OMDBMovieDetails {
  Ratings: OMDBRating[];
}

export {};
