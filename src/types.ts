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

export interface TmdbMovie {
  id: number
  title: string,
  poster_path: string,
  backdrop_path: string,
  release_date: string,
  origin_country: string[],
  runtime: number
}

export interface TmdbSearchResults {
  results: TmdbMovie[];
}