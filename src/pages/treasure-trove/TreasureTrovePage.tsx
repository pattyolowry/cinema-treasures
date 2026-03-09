import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Gem, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppSession } from '../../context/AppSessionContext';
import { DUMMY_TREASURE_TROVE_MOVIES, TROVE_MEMBERS } from './data';
import type { TroveMember, TroveMovieRecord } from './types';
import { TroveMovieDetail } from './components/TroveMovieDetail';
import { TroveMovieForm } from './components/TroveMovieForm';
import { TroveMovieList, type RankedTroveMovie } from './components/TroveMovieList';

export default function TreasureTrovePage() {
  const { currentUser } = useAppSession();
  const [movies, setMovies] = useState<TroveMovieRecord[]>(DUMMY_TREASURE_TROVE_MOVIES);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<TroveMovieRecord | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<TroveMovieRecord | null>(null);
  const [titleQuery, setTitleQuery] = useState('');
  const [reviewedBy, setReviewedBy] = useState<TroveMember[]>([]);
  const [notReviewedBy, setNotReviewedBy] = useState<TroveMember[]>([]);
  const [isReviewedByOpen, setIsReviewedByOpen] = useState(false);
  const [isNotReviewedByOpen, setIsNotReviewedByOpen] = useState(false);
  const reviewedByRef = useRef<HTMLDivElement | null>(null);
  const notReviewedByRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  const rankedAllMovies = useMemo<RankedTroveMovie[]>(() => {
    const sortedMovies = [...movies].sort((a, b) => {
      const aRating = a.averageRating ?? -1;
      const bRating = b.averageRating ?? -1;
      if (bRating !== aRating) {
        return bRating - aRating;
      }
      return a.title.localeCompare(b.title);
    });

    let previousAverageRating: number | null | undefined = undefined;
    let previousRank = 0;

    return sortedMovies.map((movie, index) => {
      const rank =
        index === 0 || movie.averageRating !== previousAverageRating
          ? index + 1
          : previousRank;

      previousAverageRating = movie.averageRating;
      previousRank = rank;

      return { movie, rank };
    });
  }, [movies]);

  const visibleMovies = useMemo(() => {
    const normalizedTitleQuery = titleQuery.trim().toLowerCase();

    return rankedAllMovies.filter(({ movie }) => {
      const titleMatches = normalizedTitleQuery === '' || movie.title.toLowerCase().includes(normalizedTitleQuery);
      const reviewedByMatches = reviewedBy.every((member) => movie.ratings[member] !== null);
      const notReviewedByMatches = notReviewedBy.every((member) => movie.ratings[member] === null);

      return titleMatches && reviewedByMatches && notReviewedByMatches;
    });
  }, [rankedAllMovies, titleQuery, reviewedBy, notReviewedBy]);

  const toggleMember = (members: TroveMember[], member: TroveMember, setter: (members: TroveMember[]) => void) => {
    if (members.includes(member)) {
      setter(members.filter((m) => m !== member));
      return;
    }
    setter([...members, member]);
  };

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (reviewedByRef.current && !reviewedByRef.current.contains(target)) {
        setIsReviewedByOpen(false);
      }
      if (notReviewedByRef.current && !notReviewedByRef.current.contains(target)) {
        setIsNotReviewedByOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsReviewedByOpen(false);
    setIsNotReviewedByOpen(false);
  }, [location.pathname]);

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

        <div className="mb-8 rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/70 p-4 sm:p-5 space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">
              Movie Title
            </label>
            <input
              type="text"
              value={titleQuery}
              onChange={(e) => setTitleQuery(e.target.value)}
              placeholder="Search title..."
              className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2" ref={reviewedByRef}>
              <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">
                Reviewed By
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsReviewedByOpen((open) => !open)}
                  aria-label="Toggle reviewed by filter menu"
                  aria-expanded={isReviewedByOpen}
                  aria-controls="reviewed-by-menu"
                  className="w-full flex items-center justify-between bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-left text-white hover:border-[var(--color-gold-600)] focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
                >
                  <span className="text-sm">
                    Reviewed By{reviewedBy.length > 0 ? ` (${reviewedBy.length})` : ''}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--color-silver-400)] transition-transform ${isReviewedByOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isReviewedByOpen && (
                  <div
                    id="reviewed-by-menu"
                    className="absolute z-20 mt-2 w-full rounded-lg border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] shadow-[0_8px_24px_rgba(0,0,0,0.4)] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[var(--color-silver-400)] uppercase tracking-wider">Select Members</p>
                      <button
                        type="button"
                        onClick={() => setReviewedBy([])}
                        className="text-xs text-[var(--color-silver-500)] hover:text-[var(--color-gold-400)] transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-1">
                      {TROVE_MEMBERS.map((member) => (
                        <label
                          key={member}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--color-silver-200)] hover:bg-[var(--color-cinema-gray)] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={reviewedBy.includes(member)}
                            onChange={() => toggleMember(reviewedBy, member, setReviewedBy)}
                            className="accent-[var(--color-gold-500)]"
                          />
                          {member}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2" ref={notReviewedByRef}>
              <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">
                Not Reviewed By
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotReviewedByOpen((open) => !open)}
                  aria-label="Toggle not reviewed by filter menu"
                  aria-expanded={isNotReviewedByOpen}
                  aria-controls="not-reviewed-by-menu"
                  className="w-full flex items-center justify-between bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-left text-white hover:border-[var(--color-gold-600)] focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
                >
                  <span className="text-sm">
                    Not Reviewed By{notReviewedBy.length > 0 ? ` (${notReviewedBy.length})` : ''}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--color-silver-400)] transition-transform ${isNotReviewedByOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isNotReviewedByOpen && (
                  <div
                    id="not-reviewed-by-menu"
                    className="absolute z-20 mt-2 w-full rounded-lg border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] shadow-[0_8px_24px_rgba(0,0,0,0.4)] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[var(--color-silver-400)] uppercase tracking-wider">Select Members</p>
                      <button
                        type="button"
                        onClick={() => setNotReviewedBy([])}
                        className="text-xs text-[var(--color-silver-500)] hover:text-[var(--color-gold-400)] transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-1">
                      {TROVE_MEMBERS.map((member) => (
                        <label
                          key={member}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--color-silver-200)] hover:bg-[var(--color-cinema-gray)] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={notReviewedBy.includes(member)}
                            onChange={() => toggleMember(notReviewedBy, member, setNotReviewedBy)}
                            className="accent-[var(--color-gold-500)]"
                          />
                          {member}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <TroveMovieList
          movies={visibleMovies}
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
