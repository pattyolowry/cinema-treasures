import type { AwardYearType } from './types';

export const DUMMY_AWARDS: AwardYearType[] = [
  {
    year: 2025,
    categories: [
      {
        name: 'Best Picture',
        isVisible: true,
        nominees: [
          { name: 'The Brutalist', isWinner: false },
          { name: 'Conclave', isWinner: false },
          { name: 'Nickel Boys', isWinner: true },
          { name: 'A Real Pain', isWinner: false },
        ],
      },
      {
        name: 'Best Actor',
        isVisible: true,
        nominees: [
          { name: 'Adrien Brody', isWinner: true, subText: 'The Brutalist' },
          { name: 'Ralph Fiennes', isWinner: false, subText: 'Conclave' },
          { name: 'Colman Domingo', isWinner: false, subText: 'Sing Sing' },
        ],
      },
      {
        name: 'Best Supporting Actor',
        isVisible: true,
        nominees: [
          { name: 'Kieran Culkin', isWinner: true, subText: 'A Real Pain' },
          { name: 'Guy Pearce', isWinner: false, subText: 'The Brutalist' },
          { name: 'Edward Norton', isWinner: false, subText: 'A Complete Unknown' },
        ],
      },
      {
        name: 'Best Ensemble Chaos',
        isVisible: false,
        nominees: [
          { name: 'The Apprentice', isWinner: false },
          { name: 'Anora', isWinner: true },
          { name: 'Dune: Part Two', isWinner: false },
        ],
      },
      {
        name: 'Most Rewatchable Scene',
        isVisible: false,
        nominees: [
          { name: 'Conclave - final reveal', isWinner: true },
          { name: 'The Brutalist - overture', isWinner: false },
          { name: 'A Real Pain - airport argument', isWinner: false },
        ],
      },
    ],
  },
  {
    year: 2024,
    categories: [
      {
        name: 'Best Picture',
        isVisible: true,
        nominees: [
          { name: 'Past Lives', isWinner: false },
          { name: 'Poor Things', isWinner: false },
          { name: 'The Zone of Interest', isWinner: true },
          { name: 'Anatomy of a Fall', isWinner: false },
        ],
      },
      {
        name: 'Best Director',
        isVisible: true,
        nominees: [
          { name: 'Jonathan Glazer', isWinner: true },
          { name: 'Yorgos Lanthimos', isWinner: false },
          { name: 'Celine Song', isWinner: false },
        ],
      },
      {
        name: 'Best Actress',
        isVisible: true,
        nominees: [
          { name: 'Emma Stone', isWinner: true, subText: 'Poor Things' },
          { name: 'Sandra Huller', isWinner: false, subText: 'Anatomy of a Fall' },
          { name: 'Lily Gladstone', isWinner: false, subText: 'Killers of the Flower Moon' },
        ],
      },
      {
        name: "Treasurer's Pick",
        isVisible: false,
        nominees: [
          { name: 'Fallen Leaves', isWinner: true },
          { name: 'May December', isWinner: false },
          { name: 'Monster', isWinner: false },
        ],
      },
    ],
  },
  {
    year: 2023,
    categories: [
      {
        name: 'Best Picture',
        isVisible: true,
        nominees: [
          { name: 'Parasite', isWinner: true },
          { name: 'Portrait of a Lady on Fire', isWinner: false },
          { name: 'Everything Everywhere All at Once', isWinner: false },
        ],
      },
      {
        name: 'Best International Feature',
        isVisible: true,
        nominees: [
          { name: 'Parasite', isWinner: true },
          { name: 'Portrait of a Lady on Fire', isWinner: false },
          { name: 'Decision to Leave', isWinner: false },
        ],
      },
      {
        name: 'Best Cinematography',
        isVisible: true,
        nominees: [
          { name: 'In the Mood for Love', isWinner: true },
          { name: 'Blade Runner 2049', isWinner: false },
          { name: 'The Lighthouse', isWinner: false },
        ],
      },
    ],
  },
];
