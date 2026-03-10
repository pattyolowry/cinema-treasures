import { useMemo, useState } from 'react';
import { Award, Plus } from 'lucide-react';
import type { MovieRecord } from '../../types';
import { DUMMY_MOVIES } from '../../data';
import { useAppSession } from '../../context/AppSessionContext';
import { MovieDetail } from './components/MovieDetail';
import { MovieForm } from './components/MovieForm';
import { MovieList, type MovieYearSection } from './components/MovieList';

export default function HistoryPage() {
  const { currentUser } = useAppSession();
  const [movies, setMovies] = useState<MovieRecord[]>(DUMMY_MOVIES);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieRecord | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<MovieRecord | null>(null);

  const compareByCurrentWatchPriority = (a: MovieRecord, b: MovieRecord) => {
    if (b.clubNumber !== a.clubNumber) return b.clubNumber - a.clubNumber;
    if (b.yearWatched !== a.yearWatched) return b.yearWatched - a.yearWatched;
    return a.id.localeCompare(b.id);
  };

  const currentWatchMovie = useMemo(() => {
    if (movies.length === 0) return null;
    return [...movies].sort(compareByCurrentWatchPriority)[0];
  }, [movies]);

  const sortedMovies = useMemo(() => {
    return movies
      .filter((movie) => movie.id !== currentWatchMovie?.id)
      .sort(compareByCurrentWatchPriority);
  }, [movies, currentWatchMovie]);

  const movieSections = useMemo<MovieYearSection[]>(() => {
    const startYear = 2023;
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

    const moviesByYear = sortedMovies.reduce<Record<number, MovieRecord[]>>((acc, movie) => {
      if (!acc[movie.yearWatched]) {
        acc[movie.yearWatched] = [];
      }
      acc[movie.yearWatched].push(movie);
      return acc;
    }, {});

    return years.map((year) => ({
      year,
      movies: moviesByYear[year] ?? [],
    }));
  }, [sortedMovies]);

  const nextClubNumber = useMemo(() => {
    if (movies.length === 0) return 1;
    return Math.max(...movies.map((m) => m.clubNumber)) + 1;
  }, [movies]);

  const treasuresSince2023 = useMemo(() => {
    return movies.filter((movie) => movie.yearWatched >= 2023).length;
  }, [movies]);

  const calculateAverage = (ratings: MovieRecord['ratings']) => {
    const validRatings = Object.values(ratings).filter((r): r is number => r !== null);
    if (validRatings.length === 0) return null;
    const sum = validRatings.reduce((a, b) => a + b, 0);
    return sum / validRatings.length;
  };

  const handleSaveMovie = (movieData: Omit<MovieRecord, 'id' | 'averageRating'>) => {
    const averageRating = calculateAverage(movieData.ratings);

    if (editingMovie) {
      setMovies(movies.map((m) => (m.id === editingMovie.id ? { ...movieData, id: m.id, averageRating } : m)));
    } else {
      const newMovie: MovieRecord = {
        ...movieData,
        id: Math.random().toString(36).substr(2, 9),
        averageRating,
      };
      setMovies([...movies, newMovie]);
    }
    setIsFormOpen(false);
    setEditingMovie(null);
  };

  const handleDeleteMovie = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setMovies(movies.filter((m) => m.id !== id));
    }
  };

  const openEditForm = (movie: MovieRecord) => {
    setEditingMovie(movie);
    setIsFormOpen(true);
    setSelectedMovie(null);
  };

  const openAddForm = () => {
    setEditingMovie(null);
    setIsFormOpen(true);
  };

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-serif text-white flex items-center gap-3">
              <Award className="text-[var(--color-gold-500)]" size={28} />
              Films Watched
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[var(--color-silver-400)]">
              Charting our course through film history: {treasuresSince2023} treasures unearthed since 2023.
            </p>
          </div>

          {currentUser && (
            <button
              onClick={openAddForm}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-gold-500)] text-black hover:bg-[var(--color-gold-400)] transition-all shadow-[0_0_10px_rgba(212,175,55,0.2)] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              title="Add Record"
            >
              <Plus size={20} />
            </button>
          )}
        </div>

        {currentWatchMovie && (
          <div
            className={`mb-8 relative overflow-hidden rounded-2xl border border-[var(--color-cinema-gray)] ${
              currentWatchMovie.backdropUrl ? 'min-h-[220px] sm:min-h-[260px]' : ''
            }`}
          >
            {currentWatchMovie.backdropUrl ? (
              <>
                <img
                  src={currentWatchMovie.backdropUrl}
                  alt={`${currentWatchMovie.title} backdrop`}
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
                <div className="relative z-10 p-6 sm:p-8 md:p-10">
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-gold-400)]">Now Screening</p>
                  <h3 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-serif text-white">{currentWatchMovie.title} ({currentWatchMovie.yearReleased})</h3>
                </div>
              </>
            ) : (
              <div className="bg-gradient-to-r from-[var(--color-cinema-dark)] via-[var(--color-cinema-black)] to-[var(--color-cinema-dark)] p-6 sm:p-8">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-gold-400)]">Now Screening</p>
                <h3 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-serif text-white">{currentWatchMovie.title} ({currentWatchMovie.yearReleased})</h3>
              </div>
            )}
          </div>
        )}

        <MovieList
          sections={movieSections}
          isLoggedIn={!!currentUser}
          onEdit={openEditForm}
          onDelete={handleDeleteMovie}
          onViewDetail={setSelectedMovie}
        />
      </section>

      {selectedMovie && (
        <MovieDetail
          movie={selectedMovie}
          isLoggedIn={!!currentUser}
          onClose={() => setSelectedMovie(null)}
          onEdit={openEditForm}
        />
      )}

      {isFormOpen && (
        <MovieForm
          movie={editingMovie}
          onSave={handleSaveMovie}
          onClose={() => setIsFormOpen(false)}
          nextClubNumber={nextClubNumber}
        />
      )}
    </>
  );
}
