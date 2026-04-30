import type { MovieInfo } from "../../types";

export interface ExternalRatings {
  imdb: number | null;
  rottenTomatoes: number | null;
}

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
    tmdbId: 3780,
    title: "Red Beard",
    yearReleased: 1965,
    ratings: { imdb: 8.3, rottenTomatoes: 94 },
  },
  {
    tmdbId: 18148,
    title: "Tokyo Story",
    yearReleased: 1953,
    ratings: { imdb: 8.1, rottenTomatoes: 100 },
  },
  {
    tmdbId: 1018,
    title: "Mulholland Drive",
    yearReleased: 2001,
    ratings: { imdb: 7.9, rottenTomatoes: 83 },
  },
  {
    tmdbId: 129,
    title: "Spirited Away",
    yearReleased: 2001,
    ratings: { imdb: 8.6, rottenTomatoes: 96 },
  },
  {
    tmdbId: 7345,
    title: "There Will Be Blood",
    yearReleased: 2007,
    ratings: { imdb: 8.2, rottenTomatoes: 91 },
  },
  {
    tmdbId: 843,
    title: "In the Mood for Love",
    yearReleased: 2000,
    ratings: { imdb: 8.1, rottenTomatoes: 92 },
  },
  {
    tmdbId: 496243,
    title: "Parasite",
    yearReleased: 2019,
    ratings: { imdb: 8.5, rottenTomatoes: 99 },
  },
  {
    tmdbId: 25538,
    title: "Yi Yi",
    yearReleased: 2000,
    ratings: { imdb: 8.1, rottenTomatoes: 97 },
  },
];

const EXTERNAL_RATINGS_BY_TMDB_ID = new Map(
  DUMMY_EXTERNAL_RATINGS.flatMap((entry) =>
    entry.tmdbId ? [[entry.tmdbId, entry.ratings] as const] : [],
  ),
);

const EXTERNAL_RATINGS_BY_TITLE_YEAR = new Map(
  DUMMY_EXTERNAL_RATINGS.map((entry) => [
    normalizeMovieKey(entry.title, entry.yearReleased),
    entry.ratings,
  ]),
);

export function getDummyExternalRatings(
  movie: Pick<MovieInfo, "title" | "yearReleased" | "tmdbId">,
): ExternalRatings | null {
  if (movie.tmdbId) {
    const tmdbMatch = EXTERNAL_RATINGS_BY_TMDB_ID.get(movie.tmdbId);
    if (tmdbMatch) {
      return tmdbMatch;
    }
  }

  if (!movie.yearReleased) {
    return null;
  }

  return (
    EXTERNAL_RATINGS_BY_TITLE_YEAR.get(
      normalizeMovieKey(movie.title, movie.yearReleased),
    ) ?? null
  );
}
