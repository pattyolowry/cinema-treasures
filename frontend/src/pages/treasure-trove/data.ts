import type { ExternalRatings, TroveMovieRecord } from './types';

type DummyExternalRatingsEntry = {
  tmdbId?: number;
  title: string;
  yearReleased: number;
  ratings: ExternalRatings;
};

const normalizeMovieKey = (title: string, yearReleased: number) =>
  `${title.trim().toLowerCase()}::${yearReleased}`;

const DUMMY_EXTERNAL_RATINGS: DummyExternalRatingsEntry[] = [
  {
    tmdbId: 238,
    title: 'The Godfather',
    yearReleased: 1972,
    ratings: { imdb: 9.2, rottenTomatoes: 97 },
  },
  {
    tmdbId: 18148,
    title: 'Tokyo Story',
    yearReleased: 1953,
    ratings: { imdb: 8.1, rottenTomatoes: 100 },
  },
  {
    tmdbId: 1018,
    title: 'Mulholland Drive',
    yearReleased: 2001,
    ratings: { imdb: 7.9, rottenTomatoes: 83 },
  },
  {
    tmdbId: 129,
    title: 'Spirited Away',
    yearReleased: 2001,
    ratings: { imdb: 8.6, rottenTomatoes: 96 },
  },
  {
    tmdbId: 7345,
    title: 'There Will Be Blood',
    yearReleased: 2007,
    ratings: { imdb: 8.2, rottenTomatoes: 91 },
  },
  {
    tmdbId: 843,
    title: 'In the Mood for Love',
    yearReleased: 2000,
    ratings: { imdb: 8.1, rottenTomatoes: 92 },
  },
  {
    tmdbId: 496243,
    title: 'Parasite',
    yearReleased: 2019,
    ratings: { imdb: 8.5, rottenTomatoes: 99 },
  },
  {
    tmdbId: 25538,
    title: 'Yi Yi',
    yearReleased: 2000,
    ratings: { imdb: 8.1, rottenTomatoes: 97 },
  },
];

const EXTERNAL_RATINGS_BY_TMDB_ID = new Map(
  DUMMY_EXTERNAL_RATINGS.flatMap((entry) => (entry.tmdbId ? [[entry.tmdbId, entry.ratings] as const] : [])),
);

const EXTERNAL_RATINGS_BY_TITLE_YEAR = new Map(
  DUMMY_EXTERNAL_RATINGS.map((entry) => [
    normalizeMovieKey(entry.title, entry.yearReleased),
    entry.ratings,
  ]),
);

export function getDummyExternalRatings(
  movie: Pick<TroveMovieRecord, 'title' | 'yearReleased' | 'tmdbId'>,
): ExternalRatings | null {
  if (movie.tmdbId) {
    const tmdbMatch = EXTERNAL_RATINGS_BY_TMDB_ID.get(movie.tmdbId);
    if (tmdbMatch) {
      return tmdbMatch;
    }
  }

  return EXTERNAL_RATINGS_BY_TITLE_YEAR.get(
    normalizeMovieKey(movie.title, movie.yearReleased),
  ) ?? null;
}

export const TROVE_MEMBERS = ['Ren', 'Patio', 'Greg', 'Max', 'Quinn'] as const;

export const DUMMY_TREASURE_TROVE_MOVIES: TroveMovieRecord[] = [
  {
    id: 'tt1',
    title: 'The Godfather',
    yearReleased: 1972,
    originCountry: 'USA',
    runTime: 175,
    mpaaRating: 'R',
    posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    ratings: { Ren: 10, Patio: 10, Greg: 10, Max: 9.5, Quinn: 10 },
    averageRating: 9.9,
  },
  {
    id: 'tt2',
    title: 'Tokyo Story',
    yearReleased: 1953,
    originCountry: 'Japan',
    runTime: 136,
    mpaaRating: 'NR',
    posterUrl: 'https://image.tmdb.org/t/p/w500/g2rxhG7Uq5D8QKzQ2AqGQh0f9fW.jpg',
    ratings: { Ren: 10, Patio: 9.5, Greg: 9.5, Max: 9.5, Quinn: 10 },
    averageRating: 9.7,
  },
  {
    id: 'tt3',
    title: 'Mulholland Drive',
    yearReleased: 2001,
    originCountry: 'USA',
    runTime: 147,
    mpaaRating: 'R',
    posterUrl: 'https://image.tmdb.org/t/p/w500/oKyY4TFaLjQTgyX8oH1KuJnnxvB.jpg',
    ratings: { Ren: 9.5, Patio: 9.5, Greg: 9, Max: 9.5, Quinn: 10 },
    averageRating: 9.5,
  },
  {
    id: 'tt4',
    title: 'Spirited Away',
    yearReleased: 2001,
    originCountry: 'Japan',
    runTime: 125,
    mpaaRating: 'PG',
    posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    ratings: { Ren: 9.5, Patio: 9, Greg: 9.5, Max: 9, Quinn: 9.5 },
    averageRating: 9.3,
  },
  {
    id: 'tt5',
    title: 'There Will Be Blood',
    yearReleased: 2007,
    originCountry: 'USA',
    runTime: 158,
    mpaaRating: 'R',
    posterUrl: 'https://image.tmdb.org/t/p/w500/fa0RDkAlCec0STeMNAhPaF89q6U.jpg',
    ratings: { Ren: 9, Patio: 9.5, Greg: 9, Max: 9, Quinn: 9.5 },
    averageRating: 9.2,
  },
  {
    id: 'tt6',
    title: 'In the Mood for Love',
    yearReleased: 2000,
    originCountry: 'Hong Kong',
    runTime: 98,
    mpaaRating: 'PG',
    posterUrl: 'https://image.tmdb.org/t/p/w500/iYypPT4OqTDX4DClqOQPEFm6mU.jpg',
    ratings: { Ren: 10, Patio: 9.5, Greg: 9, Max: 9.5, Quinn: 10 },
    averageRating: 9.6,
  },
  {
    id: 'tt7',
    title: 'Parasite',
    yearReleased: 2019,
    originCountry: 'South Korea',
    runTime: 132,
    mpaaRating: 'R',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    ratings: { Ren: 10, Patio: 9.5, Greg: 10, Max: 9, Quinn: 10 },
    averageRating: 9.7,
  },
  {
    id: 'tt8',
    title: 'Yi Yi',
    yearReleased: 2000,
    originCountry: 'Taiwan',
    runTime: 173,
    mpaaRating: 'NR',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8k6W6U8n8iWJ3xV9hQv0PjW2VJX.jpg',
    ratings: { Ren: 9.5, Patio: 9, Greg: 9.5, Max: 9, Quinn: 9.5 },
    averageRating: 9.3,
  },
];
