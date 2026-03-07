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
  }
];
