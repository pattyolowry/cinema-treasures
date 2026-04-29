export type Member = "Ren" | "Patio" | "Greg" | "Max" | "Quinn" | "Ian";

export type Month =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

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
  name: string;
  username: string;
  token: string;
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
  overview?: string;
  tmdbRating?: number;
  genres?: string[];
  language?: string;
  directors?: string[];
}

export interface Rating {
  user: Member;
  rating: number;
}

export interface LogEntry {
  id: string;
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

export type NewLogEntry = Omit<LogEntry, "id">;

export interface Treasure {
  id: string;
  movie: MovieInfo;
  ratings?: Rating[];
  ctcstm?: number;
}

export type NewTreasure = Omit<Treasure, "id">;

export interface AwardNominee {
  name: string;
  isWinner: boolean;
  subText?: string;
}

export interface AwardCategory {
  name: string;
  isVisible: boolean;
  nominees: AwardNominee[];
}

export interface AwardYear {
  id: string;
  year: number;
  categories: AwardCategory[];
}

export interface Blog {
  id: string;
  title: string;
  authors: Member[];
  url: string;
  date: string;
  imageKey?: string;
  shortDescription?: string;
}

export interface NewBlog {
  title: string;
  authors: Member[];
  url: string;
  date: Date;
  imageKey?: string;
  shortDescription?: string;
}

type SubscriptionKey = {
  p256dh: string;
  auth: string;
};

export interface PushSubscription {
  endpoint: string;
  keys: SubscriptionKey;
}

export interface TreasureActivity {
  id: string;
  troveId: string;
  user: string;
  message: string;
  createdAt: string;
}
