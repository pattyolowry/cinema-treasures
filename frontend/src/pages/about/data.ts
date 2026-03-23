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
      { posterUrl: 'https://image.tmdb.org/t/p/w500/pEzNVQfdzYDzVK0XqxERIw2x2se.jpg', alt: 'Arrival poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/4wBG5kbfagTQclETblPRRGihk0I.jpg', alt: 'Midnight in Paris poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/eClg8QPg8mwB6INIC4pyR5pAbDr.jpg', alt: 'The Birds poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/or1gBugydmjToAEq7OZY0owwFk.jpg', alt: 'Braveheart poster' },
    ],
  },
  {
    name: 'Max',
    title: 'General Counsel',
    photoUrl: maxProfile,
    favorites: [
      { posterUrl: 'https://image.tmdb.org/t/p/w500/9mprbw31MGdd66LR0AQKoDMoFRv.jpg', alt: 'Big Lebowski poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/fa0RDkAlCec0STeMNAhPaF89q6U.jpg', alt: 'There Will Be Blood poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg', alt: 'Return of the King poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/bSqt9rhDZx1Q7UZ86dBPKdNomp2.jpg', alt: 'Its A Wonderful Life poster' },
    ],
  },
  {
    name: 'Quinn',
    title: 'Medical Director',
    photoUrl: quinnProfile,
    favorites: [
      { posterUrl: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', alt: 'Fellowship of the Ring poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/aKCvdFFF5n80P2VdS7d8YBwbCjh.jpg', alt: 'Perks of Being a Wallflower poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/4sW5XH9ZfYXpvFzev00S1IGAEbg.jpg', alt: 'Before Sunset poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w500/7sfbEnaARXDDhKm0CZ7D7uc2sbo.jpg', alt: 'Inglourious Bastards poster' },
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
