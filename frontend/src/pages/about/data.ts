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
      { posterUrl: 'https://image.tmdb.org/t/p/w342/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', alt: 'Parasite poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg', alt: 'Mad Max: Fury Road poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/iYypPT4OqTDX4DClqOQPEFm6mU.jpg', alt: 'In the Mood for Love poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', alt: 'The Godfather poster' },
    ],
  },
  {
    name: 'Greg',
    title: 'Comptroller',
    photoUrl: gregProfile,
    favorites: [
      { posterUrl: 'https://image.tmdb.org/t/p/w342/pEzNVQfdzYDzVK0XqxERIw2x2se.jpg', alt: 'Arrival poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/4wBG5kbfagTQclETblPRRGihk0I.jpg', alt: 'Midnight in Paris poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/eClg8QPg8mwB6INIC4pyR5pAbDr.jpg', alt: 'The Birds poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/or1gBugydmjToAEq7OZY0owwFk.jpg', alt: 'Braveheart poster' },
    ],
  },
  {
    name: 'Max',
    title: 'General Counsel',
    photoUrl: maxProfile,
    favorites: [
      { posterUrl: 'https://image.tmdb.org/t/p/w342/9mprbw31MGdd66LR0AQKoDMoFRv.jpg', alt: 'Big Lebowski poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/fa0RDkAlCec0STeMNAhPaF89q6U.jpg', alt: 'There Will Be Blood poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg', alt: 'Return of the King poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/bSqt9rhDZx1Q7UZ86dBPKdNomp2.jpg', alt: 'Its A Wonderful Life poster' },
    ],
  },
  {
    name: 'Quinn',
    title: 'Medical Director',
    photoUrl: quinnProfile,
    favorites: [
      { posterUrl: 'https://image.tmdb.org/t/p/w342/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', alt: 'Fellowship of the Ring poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/aKCvdFFF5n80P2VdS7d8YBwbCjh.jpg', alt: 'Perks of Being a Wallflower poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/4sW5XH9ZfYXpvFzev00S1IGAEbg.jpg', alt: 'Before Sunset poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/7sfbEnaARXDDhKm0CZ7D7uc2sbo.jpg', alt: 'Inglourious Bastards poster' },
    ],
  },
  {
    name: 'Patio',
    title: 'Principal Data Analyst',
    photoUrl: patioProfile,
    favorites: [
      { posterUrl: 'https://image.tmdb.org/t/p/w342/7fn624j5lj3xTme2SgiLCeuedmO.jpg', alt: 'Whiplash poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/aKCvdFFF5n80P2VdS7d8YBwbCjh.jpg', alt: 'Perks of Being a Wallflower poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/4LdpBXiCyGKkR8FGHgjKlphrfUc.jpg', alt: 'Dumb and Dumber poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/4sW5XH9ZfYXpvFzev00S1IGAEbg.jpg', alt: 'Before Sunset poster' },
    ],
  },
  {
    name: 'Ian',
    title: 'Best Boy',
    photoUrl: ianProfile,
    favorites: [
      { posterUrl: 'https://image.tmdb.org/t/p/w342/705nQHqe4JGdEisrQmVYmXyjs1U.jpg', alt: 'Sinners poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/dR1Ju50iudrOh3YgfwkAU1g2HZe.jpg', alt: 'Ford vs Ferrari poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/6d5XOczc226jECq0LIX0siKtgHR.jpg', alt: 'No Country for Old Men poster' },
      { posterUrl: 'https://image.tmdb.org/t/p/w342/iAo1hlzsPV9XpYcLQp6Ud065tGO.jpg', alt: 'Secret Life of Walter Mitty poster' },
    ],
  },
];
