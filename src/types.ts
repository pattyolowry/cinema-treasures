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
