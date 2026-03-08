import { useMemo, useState } from 'react';
import { Award, Plus } from 'lucide-react';
import type { MovieRecord } from '../../types';
import { DUMMY_MOVIES } from '../../data';
import { useAppSession } from '../../context/AppSessionContext';
import { MovieDetail } from './components/MovieDetail';
import { MovieForm } from './components/MovieForm';
import { MovieList } from './components/MovieList';

export default function HistoryPage() {
  const { currentUser } = useAppSession();
  const [movies, setMovies] = useState<MovieRecord[]>(DUMMY_MOVIES);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieRecord | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<MovieRecord | null>(null);

  const sortedMovies = useMemo(() => {
    return [...movies].sort((a, b) => b.clubNumber - a.clubNumber);
  }, [movies]);

  const nextClubNumber = useMemo(() => {
    if (movies.length === 0) return 1;
    return Math.max(...movies.map((m) => m.clubNumber)) + 1;
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
          <h2 className="text-3xl font-serif text-white flex items-center gap-3">
            <Award className="text-[var(--color-gold-500)]" size={28} />
            History
          </h2>

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

        <MovieList
          movies={sortedMovies}
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
