export interface FavoritePoster {
  posterUrl: string;
  alt: string;
}

export interface ClubMemberProfile {
  name: string;
  title: string;
  photoUrl: string;
  favorites: [FavoritePoster, FavoritePoster, FavoritePoster, FavoritePoster];
}
