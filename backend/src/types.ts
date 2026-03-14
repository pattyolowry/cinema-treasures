import mongoose from 'mongoose'

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

declare global {
  namespace Express {
    interface Request {
      token?: string | null;
      user?: mongoose.Model<UserInfo> | null;
    }
  }
}

export {};