export type TroveMember = 'Ren' | 'Patio' | 'Greg' | 'Max' | 'Quinn';

export interface TroveMovieRecord {
  id: string;
  title: string;
  yearReleased: number;
  originCountry: string;
  streamingPlatform: string;
  runTime?: string;
  mpaaRating?: string;
  posterUrl?: string;
  ratings: Record<TroveMember, number | null>;
  averageRating: number | null;
}
