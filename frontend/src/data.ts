import { MovieRecord } from './types';

export const MEMBERS = ['Ren', 'Patio', 'Greg', 'Max', 'Quinn', 'Ian'] as const;

export const DUMMY_MOVIES: MovieRecord[] = [
  {
    id: '1',
    clubNumber: 1,
    title: 'Parasite',
    yearReleased: 2019,
    yearWatched: 2023,
    originCountry: 'South Korea',
    streamingPlatform: 'Max',
    runTime: '2h 12m',
    mpaaRating: 'R',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    ratings: {
      Ren: 10,
      Patio: 9.5,
      Greg: 10,
      Max: 9,
      Quinn: 10,
      Ian: null
    },
    averageRating: 9.7
  },
  {
    id: '2',
    clubNumber: 2,
    title: 'Everything Everywhere All at Once',
    yearReleased: 2022,
    yearWatched: 2023,
    originCountry: 'USA',
    streamingPlatform: 'Showtime',
    runTime: '2h 19m',
    mpaaRating: 'R',
    posterUrl: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    ratings: {
      Ren: 9,
      Patio: 10,
      Greg: 8.5,
      Max: 9.5,
      Quinn: 9,
      Ian: null
    },
    averageRating: 9.2
  },
  {
    id: '3',
    clubNumber: 3,
    title: 'Portrait of a Lady on Fire',
    yearReleased: 2019,
    yearWatched: 2023,
    originCountry: 'France',
    streamingPlatform: 'Hulu',
    runTime: '2h 2m',
    mpaaRating: 'R',
    posterUrl: 'https://image.tmdb.org/t/p/w500/2LquswEwHysFzXzQkKqE2K0Kx5b.jpg',
    ratings: {
      Ren: 10,
      Patio: 9,
      Greg: 9.5,
      Max: 8,
      Quinn: 10,
      Ian: null
    },
    averageRating: 9.3
  },
  {
    id: '4',
    clubNumber: 4,
    title: 'In the Mood for Love',
    yearReleased: 2000,
    yearWatched: 2024,
    originCountry: 'Hong Kong',
    streamingPlatform: 'Criterion Channel',
    runTime: '1h 38m',
    mpaaRating: 'PG',
    posterUrl: 'https://image.tmdb.org/t/p/w500/iYypPT4OqTDX4DClqOQPEFm6mU.jpg',
    ratings: {
      Ren: 10,
      Patio: 10,
      Greg: 9,
      Max: 9.5,
      Quinn: 10,
      Ian: null
    },
    averageRating: 9.7
  },
  {
    id: '5',
    clubNumber: 5,
    title: 'Mad Max: Fury Road',
    yearReleased: 2015,
    yearWatched: 2024,
    originCountry: 'Australia',
    streamingPlatform: 'Max',
    runTime: '2h 0m',
    mpaaRating: 'R',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',
    ratings: {
      Ren: 8.5,
      Patio: 9,
      Greg: 10,
      Max: 10,
      Quinn: 9.5,
      Ian: null
    },
    averageRating: 9.4
  },
  {
    id: '6',
    clubNumber: 6,
    title: 'The Holdovers',
    yearReleased: 2023,
    yearWatched: 2025,
    originCountry: 'USA',
    streamingPlatform: 'Peacock',
    runTime: '2h 13m',
    mpaaRating: 'R',
    posterUrl: 'https://image.tmdb.org/t/p/w500/3gfeJfMNa2Q9Pz7sA9p0A6FQ5mK.jpg',
    ratings: {
      Ren: 8.5,
      Patio: 8.5,
      Greg: 8,
      Max: 8.5,
      Quinn: 9,
      Ian: 8.5
    },
    averageRating: 8.5
  },
  {
    id: '7',
    clubNumber: 7,
    title: 'Past Lives',
    yearReleased: 2023,
    yearWatched: 2025,
    originCountry: 'USA',
    streamingPlatform: 'Paramount+',
    runTime: '1h 46m',
    mpaaRating: 'PG-13',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7iK9L2NmA4KjW8vD2xQkUeM4x3P.jpg',
    ratings: {
      Ren: 9,
      Patio: 9,
      Greg: 9,
      Max: 8.5,
      Quinn: 9.5,
      Ian: 9
    },
    averageRating: 9
  },
  {
    id: '8',
    clubNumber: 8,
    title: 'Anatomy of a Fall',
    yearReleased: 2023,
    yearWatched: 2025,
    originCountry: 'France',
    streamingPlatform: 'Hulu',
    runTime: '2h 31m',
    mpaaRating: 'R',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kQs6keheMwCxJxrzV83VUwFtHkB.jpg',
    ratings: {
      Ren: 8.5,
      Patio: 8,
      Greg: 9,
      Max: 8.5,
      Quinn: 8.5,
      Ian: 8.5
    },
    averageRating: 8.5
  },
  {
    id: '9',
    clubNumber: 9,
    title: 'Dune: Part Two',
    yearReleased: 2024,
    yearWatched: 2026,
    originCountry: 'USA',
    streamingPlatform: 'Max',
    runTime: '2h 46m',
    mpaaRating: 'PG-13',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    ratings: {
      Ren: 9,
      Patio: 9,
      Greg: 9,
      Max: 9,
      Quinn: 9,
      Ian: 9
    },
    averageRating: 9
  },
  {
    id: '10',
    clubNumber: 10,
    title: 'The Zone of Interest',
    yearReleased: 2023,
    yearWatched: 2026,
    originCountry: 'United Kingdom',
    streamingPlatform: 'Max',
    runTime: '1h 45m',
    mpaaRating: 'PG-13',
    posterUrl: 'https://image.tmdb.org/t/p/w500/hUu9zyZmDd8VZegKi1iK1Vk0RYS.jpg',
    ratings: {
      Ren: 8,
      Patio: 8,
      Greg: 8,
      Max: 8.5,
      Quinn: 7.5,
      Ian: 8
    },
    averageRating: 8
  },
  {
    id: '11',
    clubNumber: 11,
    title: 'Poor Things',
    yearReleased: 2023,
    yearWatched: 2026,
    originCountry: 'Ireland',
    streamingPlatform: 'Hulu',
    runTime: '2h 21m',
    mpaaRating: 'R',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/zh6IdheEYinU4TPtorWsjx6qPQE.jpg',
    ratings: {
      Ren: 8.5,
      Patio: 8.5,
      Greg: 8.5,
      Max: 9,
      Quinn: 8,
      Ian: 8.5
    },
    averageRating: 8.5
  }
];
