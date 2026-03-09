import { useMemo, useState } from 'react';
import { Gem, Plus } from 'lucide-react';
import { useAppSession } from '../../context/AppSessionContext';
import { DUMMY_TREASURE_TROVE_MOVIES } from './data';
import type { TroveMovieRecord } from './types';
import { TroveMovieDetail } from './components/TroveMovieDetail';
import { TroveMovieForm } from './components/TroveMovieForm';
import { TroveMovieList } from './components/TroveMovieList';

export default function TreasureTrovePage() {
  const { currentUser } = useAppSession();
  const [movies, setMovies] = useState<TroveMovieRecord[]>(DUMMY_TREASURE_TROVE_MOVIES);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<TroveMovieRecord | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<TroveMovieRecord | null>(null);

  const sortedMovies = useMemo(() => {
    return [...movies].sort((a, b) => {
      const aRating = a.averageRating ?? -1;
      const bRating = b.averageRating ?? -1;
      if (bRating !== aRating) {
        return bRating - aRating;
      }
      return a.title.localeCompare(b.title);
    });
  }, [movies]);

  const calculateAverage = (ratings: TroveMovieRecord['ratings']) => {
    const validRatings = Object.values(ratings).filter((r): r is number => r !== null);
    if (validRatings.length === 0) return null;
    const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
    return sum / validRatings.length;
  };

  const handleSaveMovie = (movieData: Omit<TroveMovieRecord, 'id' | 'averageRating'>) => {
    const averageRating = calculateAverage(movieData.ratings);

    if (editingMovie) {
      setMovies(movies.map((m) => (m.id === editingMovie.id ? { ...movieData, id: m.id, averageRating } : m)));
    } else {
      const newMovie: TroveMovieRecord = {
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
    if (window.confirm('Are you sure you want to delete this treasure entry?')) {
      setMovies(movies.filter((m) => m.id !== id));
    }
  };

  const openEditForm = (movie: TroveMovieRecord) => {
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
              <Gem className="text-[var(--color-gold-500)]" size={28} />
              Treasure Trove
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[var(--color-silver-400)]">
              The highest-rated films of all time from club members, ranked by CTCSTM score.
            </p>
          </div>

          {currentUser && (
            <button
              onClick={openAddForm}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-gold-500)] text-black hover:bg-[var(--color-gold-400)] transition-all shadow-[0_0_10px_rgba(212,175,55,0.2)] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              title="Add Treasure"
            >
              <Plus size={20} />
            </button>
          )}
        </div>

        <TroveMovieList
          movies={sortedMovies}
          isLoggedIn={!!currentUser}
          onEdit={openEditForm}
          onDelete={handleDeleteMovie}
          onViewDetail={setSelectedMovie}
        />
      </section>

      {selectedMovie && (
        <TroveMovieDetail
          movie={selectedMovie}
          isLoggedIn={!!currentUser}
          onClose={() => setSelectedMovie(null)}
          onEdit={openEditForm}
        />
      )}

      {isFormOpen && (
        <TroveMovieForm
          movie={editingMovie}
          onSave={handleSaveMovie}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </>
  );
}
