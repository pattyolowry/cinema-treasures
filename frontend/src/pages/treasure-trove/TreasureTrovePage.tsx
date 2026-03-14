import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ChevronDown, Gem, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppSession } from '../../context/AppSessionContext';
import treasureService from '../../services/treasures';
import type { NewTreasure, Rating, Treasure } from '../../types';
import { TROVE_MEMBERS } from './data';
import type { TroveMember, TroveMovieRecord } from './types';
import { TroveMovieDetail } from './components/TroveMovieDetail';
import { TroveMovieForm } from './components/TroveMovieForm';
import { TroveMovieList, type RankedTroveMovie } from './components/TroveMovieList';

const TREASURE_ERROR_MESSAGE = 'Unable to load treasure trove right now. Please try again.';
const TREASURE_SAVE_ERROR_MESSAGE = 'Unable to save this treasure entry. Please try again.';
const TREASURE_DELETE_ERROR_MESSAGE = 'Unable to delete this treasure entry. Please try again.';

const createDefaultRatings = (): Record<TroveMember, number | null> =>
  TROVE_MEMBERS.reduce(
    (acc, member) => ({ ...acc, [member]: null }),
    {} as Record<TroveMember, number | null>,
  );

const calculateCTCSTM = (ratings: Record<TroveMember, number | null>) => {
  const total = TROVE_MEMBERS.reduce((sum, member) => {
    const rating = ratings[member];
    return sum + (rating ?? 7);
  }, 0);
  return total / TROVE_MEMBERS.length;
};

const ratingsArrayToRecord = (ratings: Rating[] | undefined) => {
  const ratingsRecord = createDefaultRatings();
  if (!ratings) return ratingsRecord;

  for (const rating of ratings) {
    if (TROVE_MEMBERS.includes(rating.user as TroveMember)) {
      ratingsRecord[rating.user as TroveMember] = rating.rating;
    }
  }

  return ratingsRecord;
};

const treasureToMovieRecord = (treasure: Treasure): TroveMovieRecord => {
  const ratings = ratingsArrayToRecord(treasure.ratings);
  return {
    id: treasure.id,
    title: treasure.movie.title,
    yearReleased: treasure.movie.yearReleased ?? 0,
    originCountry: treasure.movie.originCountry ?? '',
    runTime: treasure.movie.runTime ?? null,
    mpaaRating: treasure.movie.mpaaRating ?? '',
    posterUrl: treasure.movie.posterUrl ?? '',
    ratings,
    averageRating: calculateCTCSTM(ratings),
  };
};

const movieRecordToTreasurePayload = (
  movieRecord: Omit<TroveMovieRecord, 'id' | 'averageRating'>,
): NewTreasure => {
  const ratings = TROVE_MEMBERS.flatMap((member) => {
    const rating = movieRecord.ratings[member];
    return rating === null ? [] : [{ user: member, rating }];
  });
  const ctcstm = calculateCTCSTM(movieRecord.ratings);

  return {
    movie: {
      title: movieRecord.title.trim(),
      yearReleased: movieRecord.yearReleased,
      originCountry: movieRecord.originCountry.trim() || undefined,
      runTime: movieRecord.runTime ?? undefined,
      mpaaRating: movieRecord.mpaaRating?.trim() || undefined,
      posterUrl: movieRecord.posterUrl?.trim() || undefined,
    },
    ratings: ratings.length > 0 ? ratings : undefined,
    ctcstm,
  };
};

function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { error?: unknown } } }).response;
    if (typeof response?.data?.error === 'string') {
      return response.data.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function TreasureTrovePage() {
  const { currentUser } = useAppSession();
  const [movies, setMovies] = useState<TroveMovieRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  const loadTreasures = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const treasures = await treasureService.getAll();
      setMovies(treasures.map(treasureToMovieRecord));
    } catch (error: unknown) {
      setErrorMessage(getRequestErrorMessage(error, TREASURE_ERROR_MESSAGE));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTreasures();
  }, [loadTreasures]);

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

  const handleSaveMovie = async (movieData: Omit<TroveMovieRecord, 'id' | 'averageRating'>) => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload = movieRecordToTreasurePayload(movieData);

      if (editingMovie) {
        const updatedTreasure = await treasureService.updateTreasure(editingMovie.id, payload);
        const updatedMovie = treasureToMovieRecord(updatedTreasure);
        setMovies((currentMovies) =>
          currentMovies.map((movie) => (movie.id === editingMovie.id ? updatedMovie : movie)),
        );
        if (selectedMovie?.id === editingMovie.id) {
          setSelectedMovie(updatedMovie);
        }
      } else {
        const createdTreasure = await treasureService.addTreasure(payload);
        setMovies((currentMovies) => [...currentMovies, treasureToMovieRecord(createdTreasure)]);
      }

      setIsFormOpen(false);
      setEditingMovie(null);
    } catch (error: unknown) {
      setErrorMessage(getRequestErrorMessage(error, TREASURE_SAVE_ERROR_MESSAGE));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this treasure entry?')) {
      return;
    }

    setErrorMessage(null);

    try {
      await treasureService.deleteTreasure(id);
      setMovies((currentMovies) => currentMovies.filter((movie) => movie.id !== id));
      if (selectedMovie?.id === id) {
        setSelectedMovie(null);
      }
      if (editingMovie?.id === id) {
        setEditingMovie(null);
        setIsFormOpen(false);
      }
    } catch (error: unknown) {
      setErrorMessage(getRequestErrorMessage(error, TREASURE_DELETE_ERROR_MESSAGE));
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
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/50 bg-red-900/30 px-4 py-3 text-sm text-red-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => void loadTreasures()}
              className="shrink-0 rounded-full border border-red-200/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-100 hover:bg-red-200/10"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-8 relative rounded-2xl border border-[var(--color-cinema-gray)]">
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none" aria-hidden="true">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/trove-banner.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />
          </div>

          <div className="relative z-10 p-4 sm:p-6">
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

            <div className="rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/70 p-4 sm:p-5 space-y-5">
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
          </div>
        </div>

        {isLoading && movies.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)] p-12 text-center text-[var(--color-silver-400)]">
            Loading treasure trove...
          </div>
        ) : (
          <TroveMovieList
            movies={visibleMovies}
            isLoggedIn={!!currentUser}
            onEdit={openEditForm}
            onDelete={(id) => void handleDeleteMovie(id)}
            onViewDetail={setSelectedMovie}
          />
        )}
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
          onSave={(movieData) => void handleSaveMovie(movieData)}
          onClose={() => setIsFormOpen(false)}
          isSubmitting={isSaving}
        />
      )}
    </>
  );
}
