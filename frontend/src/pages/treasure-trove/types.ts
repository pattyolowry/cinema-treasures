export type TroveMember = 'Ren' | 'Patio' | 'Greg' | 'Max' | 'Quinn';

export interface ExternalRatings {
  imdb: number | null;
  rottenTomatoes: number | null;
}

export interface TroveMovieRecord {
  id: string;
  title: string;
  yearReleased: number;
  originCountry: string;
  runTime?: number | null;
  directors?: string[];
  overview?: string;
  mpaaRating?: string;
  tmdbId?: number;
  posterUrl?: string;
  ratings: Record<TroveMember, number | null>;
  averageRating: number | null;
}
