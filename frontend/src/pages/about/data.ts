import type { ClubMemberProfile } from './types';
import renProfile from '/ren-profile.png'
import gregProfile from '/greg-profile.png'
import maxProfile from '/max-profile.png'
import quinnProfile from '/quinn-profile.png'
import patioProfile from '/patio-profile.png'
import ianProfile from '/ian-profile.png'

export const MEMBER_PROFILES: ClubMemberProfile[] = [
  {
    name: 'Ren',
    title: 'President',
    photoUrl: renProfile,
    favorites: [
      { posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', alt: 'Parasite poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg', alt: 'Mad Max: Fury Road poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/iYypPT4OqTDX4DClqOQPEFm6mU.jpg', alt: 'In the Mood for Love poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', alt: 'The Godfather poster' },
    ],
  },
  {
    name: 'Greg',
    title: 'Comptroller',
    photoUrl: gregProfile,
    favorites: [
      { posterUrl: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg', alt: 'Everything Everywhere All at Once poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/fa0RDkAlCec0STeMNAhPaF89q6U.jpg', alt: 'There Will Be Blood poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', alt: 'Spirited Away poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/kQs6keheMwCxJxrzV83VUwFtHkB.jpg', alt: 'Anatomy of a Fall poster' },
    ],
  },
  {
    name: 'Max',
    title: 'General Counsel',
    photoUrl: maxProfile,
    favorites: [
      { posterUrl: 'https://image.tmdb.org/t/p/w500/oKyY4TFaLjQTgyX8oH1KuJnnxvB.jpg', alt: 'Mulholland Drive poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/2LquswEwHysFzXzQkKqE2K0Kx5b.jpg', alt: 'Portrait of a Lady on Fire poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', alt: 'Dune: Part Two poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/g2rxhG7Uq5D8QKzQ2AqGQh0f9fW.jpg', alt: 'Tokyo Story poster' },
    ],
  },
  {
    name: 'Quinn',
    title: 'Medical Director',
    photoUrl: quinnProfile,
    favorites: [
      { posterUrl: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg', alt: 'Poor Things poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/3gfeJfMNa2Q9Pz7sA9p0A6FQ5mK.jpg', alt: 'The Holdovers poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/7iK9L2NmA4KjW8vD2xQkUeM4x3P.jpg', alt: 'Past Lives poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/8k6W6U8n8iWJ3xV9hQv0PjW2VJX.jpg', alt: 'Yi Yi poster' },
    ],
  },
  {
    name: 'Patio',
    title: 'Principal Data Analyst',
    photoUrl: patioProfile,
    favorites: [
      { posterUrl: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg', alt: 'Whiplash poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/aKCvdFFF5n80P2VdS7d8YBwbCjh.jpg', alt: 'Perks of Being a Wallflower poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/4LdpBXiCyGKkR8FGHgjKlphrfUc.jpg', alt: 'Dumb and Dumber poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/4sW5XH9ZfYXpvFzev00S1IGAEbg.jpg', alt: 'Before Sunset poster' },
    ],
  },
  {
    name: 'Ian',
    title: 'Best Boy',
    photoUrl: ianProfile,
    favorites: [
      { posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', alt: 'The Godfather poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg', alt: 'Everything Everywhere All at Once poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/fa0RDkAlCec0STeMNAhPaF89q6U.jpg', alt: 'There Will Be Blood poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/kQs6keheMwCxJxrzV83VUwFtHkB.jpg', alt: 'Anatomy of a Fall poster' },
    ],
  },
];
