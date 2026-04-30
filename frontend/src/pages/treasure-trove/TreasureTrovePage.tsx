import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Gem, Plus } from 'lucide-react';
import { useAppSession } from '../../context/AppSessionContext';
import treasureService from '../../services/treasures';
import type { NewTreasure, Rating, Treasure } from '../../types';
import { TROVE_MEMBERS } from './data';
import type { TroveMember, TroveMovieRecord } from './types';
import { TroveMovieDetail } from './components/TroveMovieDetail';
import { TroveMovieForm } from './components/TroveMovieForm';
import { TroveMovieList } from './components/TroveMovieList';

const TREASURE_ENTRIES_QUERY_KEY = ['treasureEntries'] as const;
const TREASURE_ERROR_MESSAGE = 'Unable to load treasure trove right now. Please try again.';
const TREASURE_SAVE_ERROR_MESSAGE = 'Unable to save this treasure entry. Please try again.';
const TREASURE_DELETE_ERROR_MESSAGE = 'Unable to delete this treasure entry. Please try again.';
const TREASURE_DUPLICATE_ERROR_MESSAGE =
  'This movie is already in the Treasure Trove (same title and year).';
const TREASURE_TROVE_BASE_PATH = '/treasure-trove';

type TroveHistoryState = {
  idx?: number;
  key?: string;
  usr?: {
    troveModalSource?: 'in-app';
  } | null;
};

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
    directors: treasure.movie.directors,
    overview: treasure.movie.overview,
    mpaaRating: treasure.movie.mpaaRating ?? '',
    tmdbId: treasure.movie.tmdbId,
    imdbRating: treasure.movie.imdbRating,
    rottenTomatoesRating: treasure.movie.rottenTomatoesRating,
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
      tmdbId: movieRecord.tmdbId,
      posterUrl: movieRecord.posterUrl?.trim() || undefined,
    },
    ratings: ratings.length > 0 ? ratings : undefined,
    ctcstm,
  };
};

const normalizeTitle = (title: string) => title.trim().toLocaleLowerCase();

const createHistoryKey = () => Math.random().toString(36).substring(2, 10);

function buildTreasureTrovePath(treasureId?: string | null) {
  return treasureId ? `${TREASURE_TROVE_BASE_PATH}/${treasureId}` : TREASURE_TROVE_BASE_PATH;
}

function getTreasureIdFromPath(pathname: string): string | null {
  if (pathname === TREASURE_TROVE_BASE_PATH || pathname === `${TREASURE_TROVE_BASE_PATH}/`) {
    return null;
  }

  const detailPrefix = `${TREASURE_TROVE_BASE_PATH}/`;
  if (!pathname.startsWith(detailPrefix)) {
    return null;
  }

  const treasureId = pathname.slice(detailPrefix.length).trim();
  return treasureId || null;
}

function getCurrentTroveHistoryState(): TroveHistoryState {
  if (typeof window.history.state === 'object' && window.history.state !== null) {
    return window.history.state as TroveHistoryState;
  }

  return {};
}

function getCurrentHistoryIndex() {
  const historyIndex = getCurrentTroveHistoryState().idx;
  return typeof historyIndex === 'number' ? historyIndex : 0;
}

function getCurrentModalHistorySource() {
  return getCurrentTroveHistoryState().usr?.troveModalSource ?? null;
}

function pushTroveHistory(path: string, troveModalSource?: 'in-app') {
  const nextHistoryState: TroveHistoryState = {
    idx: getCurrentHistoryIndex() + 1,
    key: createHistoryKey(),
    usr: troveModalSource ? { troveModalSource } : null,
  };

  window.history.pushState(nextHistoryState, '', path);
}

function replaceTroveHistory(path: string, troveModalSource?: 'in-app') {
  const nextHistoryState: TroveHistoryState = {
    idx: getCurrentHistoryIndex(),
    key: createHistoryKey(),
    usr: troveModalSource ? { troveModalSource } : null,
  };

  window.history.replaceState(nextHistoryState, '', path);
}

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
  const queryClient = useQueryClient();
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [deepLinkErrorMessage, setDeepLinkErrorMessage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<TroveMovieRecord | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<TroveMovieRecord | null>(null);
  const [routeTreasureId, setRouteTreasureId] = useState<string | null>(() =>
    getTreasureIdFromPath(window.location.pathname),
  );

  const treasureQuery = useQuery({
    queryKey: TREASURE_ENTRIES_QUERY_KEY,
    queryFn: async () => {
      const treasures = await treasureService.getAll();
      return treasures.map(treasureToMovieRecord);
    },
  });
  const movies = treasureQuery.data ?? [];

  const addTreasureMutation = useMutation({
    mutationFn: (movieData: Omit<TroveMovieRecord, 'id' | 'averageRating'>) =>
      treasureService.addTreasure(movieRecordToTreasurePayload(movieData)),
    onMutate: async (movieData) => {
      setActionErrorMessage(null);
      await queryClient.cancelQueries({ queryKey: TREASURE_ENTRIES_QUERY_KEY });
      const previousMovies = queryClient.getQueryData<TroveMovieRecord[]>(TREASURE_ENTRIES_QUERY_KEY) ?? [];
      const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const optimisticMovie: TroveMovieRecord = {
        id: optimisticId,
        ...movieData,
        averageRating: calculateCTCSTM(movieData.ratings),
      };
      queryClient.setQueryData<TroveMovieRecord[]>(TREASURE_ENTRIES_QUERY_KEY, [...previousMovies, optimisticMovie]);
      return { previousMovies, optimisticId };
    },
    onError: (error: unknown, _movieData, context) => {
      if (context) {
        queryClient.setQueryData(TREASURE_ENTRIES_QUERY_KEY, context.previousMovies);
      }
      setActionErrorMessage(getRequestErrorMessage(error, TREASURE_SAVE_ERROR_MESSAGE));
    },
    onSuccess: (savedTreasure, _movieData, context) => {
      const savedMovie = treasureToMovieRecord(savedTreasure);
      queryClient.setQueryData<TroveMovieRecord[]>(TREASURE_ENTRIES_QUERY_KEY, (currentMovies = []) =>
        currentMovies.map((movie) => (movie.id === context?.optimisticId ? savedMovie : movie)),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TREASURE_ENTRIES_QUERY_KEY });
    },
  });

  const updateTreasureMutation = useMutation({
    mutationFn: ({ id, movieData }: { id: string; movieData: Omit<TroveMovieRecord, 'id' | 'averageRating'> }) =>
      treasureService.updateTreasure(id, movieRecordToTreasurePayload(movieData)),
    onMutate: async ({ id, movieData }) => {
      setActionErrorMessage(null);
      await queryClient.cancelQueries({ queryKey: TREASURE_ENTRIES_QUERY_KEY });
      const previousMovies = queryClient.getQueryData<TroveMovieRecord[]>(TREASURE_ENTRIES_QUERY_KEY) ?? [];
      const optimisticMovie: TroveMovieRecord = {
        id,
        ...movieData,
        averageRating: calculateCTCSTM(movieData.ratings),
      };
      queryClient.setQueryData<TroveMovieRecord[]>(TREASURE_ENTRIES_QUERY_KEY, (currentMovies = []) =>
        currentMovies.map((movie) => (movie.id === id ? optimisticMovie : movie)),
      );
      return { previousMovies };
    },
    onError: (error: unknown, _variables, context) => {
      if (context) {
        queryClient.setQueryData(TREASURE_ENTRIES_QUERY_KEY, context.previousMovies);
      }
      setActionErrorMessage(getRequestErrorMessage(error, TREASURE_SAVE_ERROR_MESSAGE));
    },
    onSuccess: (updatedTreasure) => {
      const updatedMovie = treasureToMovieRecord(updatedTreasure);
      queryClient.setQueryData<TroveMovieRecord[]>(TREASURE_ENTRIES_QUERY_KEY, (currentMovies = []) =>
        currentMovies.map((movie) => (movie.id === updatedMovie.id ? updatedMovie : movie)),
      );
      if (selectedMovie?.id === updatedMovie.id) {
        setSelectedMovie(updatedMovie);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TREASURE_ENTRIES_QUERY_KEY });
    },
  });

  const deleteTreasureMutation = useMutation({
    mutationFn: treasureService.deleteTreasure,
    onMutate: async (id: string) => {
      setActionErrorMessage(null);
      await queryClient.cancelQueries({ queryKey: TREASURE_ENTRIES_QUERY_KEY });
      const previousMovies = queryClient.getQueryData<TroveMovieRecord[]>(TREASURE_ENTRIES_QUERY_KEY) ?? [];
      queryClient.setQueryData<TroveMovieRecord[]>(TREASURE_ENTRIES_QUERY_KEY, (currentMovies = []) =>
        currentMovies.filter((movie) => movie.id !== id),
      );
      return { previousMovies };
    },
    onError: (error: unknown, _id, context) => {
      if (context) {
        queryClient.setQueryData(TREASURE_ENTRIES_QUERY_KEY, context.previousMovies);
      }
      setActionErrorMessage(getRequestErrorMessage(error, TREASURE_DELETE_ERROR_MESSAGE));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TREASURE_ENTRIES_QUERY_KEY });
    },
  });

  const isSaving = addTreasureMutation.isPending || updateTreasureMutation.isPending;
  const errorMessage = actionErrorMessage ??
    (treasureQuery.error ? getRequestErrorMessage(treasureQuery.error, TREASURE_ERROR_MESSAGE) : null);
  const isInitialLoading = treasureQuery.isPending && !treasureQuery.data;
  const isRefreshing = treasureQuery.isFetching && !!treasureQuery.data;

  useEffect(() => {
    const handlePopState = () => {
      setRouteTreasureId(getTreasureIdFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (treasureQuery.isPending || treasureQuery.error || deleteTreasureMutation.isPending) {
      return;
    }

    if (!routeTreasureId) {
      setSelectedMovie(null);
      return;
    }

    const matchingMovie = movies.find((movie) => movie.id === routeTreasureId);
    if (matchingMovie) {
      setSelectedMovie(matchingMovie);
      return;
    }

    setDeepLinkErrorMessage('That treasure trove entry could not be found.');
    setSelectedMovie(null);
    setRouteTreasureId(null);
    replaceTroveHistory(buildTreasureTrovePath());
  }, [
    movies,
    deleteTreasureMutation.isPending,
    routeTreasureId,
    treasureQuery.error,
    treasureQuery.isPending,
  ]);

  const handleSaveMovie = async (movieData: Omit<TroveMovieRecord, 'id' | 'averageRating'>) => {
    if (!editingMovie) {
      const normalizedNewTitle = normalizeTitle(movieData.title);
      const hasDuplicate = movies.some(
        (movie) =>
          movie.yearReleased === movieData.yearReleased &&
          normalizeTitle(movie.title) === normalizedNewTitle,
      );

      if (hasDuplicate) {
        setFormErrorMessage(TREASURE_DUPLICATE_ERROR_MESSAGE);
        return;
      }
    }

    try {
      if (editingMovie) {
        await updateTreasureMutation.mutateAsync({ id: editingMovie.id, movieData });
      } else {
        setActionErrorMessage(null);
        setFormErrorMessage(null);
        setDeepLinkErrorMessage(null);
        await addTreasureMutation.mutateAsync(movieData);
      }

      setIsFormOpen(false);
      setEditingMovie(null);
      setFormErrorMessage(null);
    } catch {
      // Mutation errors are surfaced via onError to keep messages consistent.
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this treasure entry?')) {
      return;
    }
    try {
      await deleteTreasureMutation.mutateAsync(id);
      if (selectedMovie?.id === id) {
        setSelectedMovie(null);
      }
      if (editingMovie?.id === id) {
        setEditingMovie(null);
        setIsFormOpen(false);
      }
      if (routeTreasureId === id) {
        setRouteTreasureId(null);
        if (getCurrentModalHistorySource() === 'in-app') {
          window.history.back();
        } else {
          replaceTroveHistory(buildTreasureTrovePath());
        }
      }
    } catch {
      // Mutation errors are surfaced via onError to keep messages consistent.
    }
  };

  const openEditForm = (movie: TroveMovieRecord) => {
    setEditingMovie(movie);
    setFormErrorMessage(null);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingMovie(null);
    setFormErrorMessage(null);
    setDeepLinkErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleViewDetail = useCallback((movie: TroveMovieRecord) => {
    setDeepLinkErrorMessage(null);
    setSelectedMovie(movie);
    setRouteTreasureId(movie.id);
    pushTroveHistory(buildTreasureTrovePath(movie.id), 'in-app');
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedMovie(null);
    setRouteTreasureId(null);

    if (getCurrentModalHistorySource() === 'in-app') {
      window.history.back();
      return;
    }

    replaceTroveHistory(buildTreasureTrovePath());
  }, []);

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {deepLinkErrorMessage && (
          <div className="mb-6 rounded-xl border border-amber-400/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{deepLinkErrorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setDeepLinkErrorMessage(null)}
              className="shrink-0 rounded-full border border-amber-200/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-100 hover:bg-amber-200/10"
            >
              Dismiss
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/50 bg-red-900/30 px-4 py-3 text-sm text-red-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setActionErrorMessage(null);
                void treasureQuery.refetch();
              }}
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
              style={{ backgroundImage: "url('/trove-banner.jpg')" }}
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
                  The films deemed National Treasures by at least one club member, ranked by CTCSTM score.
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

          </div>
        </div>

        {isRefreshing && (
          <p className="mb-4 text-xs uppercase tracking-wider text-[var(--color-silver-500)]">Refreshing treasure trove...</p>
        )}

        {isInitialLoading ? (
          <div className="rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)] p-12 text-center text-[var(--color-silver-400)]">
            Loading treasure trove...
          </div>
        ) : (
          <TroveMovieList
            movies={movies}
            onViewDetail={handleViewDetail}
          />
        )}
      </section>

      {selectedMovie && !isFormOpen && (
        <TroveMovieDetail
          movie={selectedMovie}
          isLoggedIn={!!currentUser}
          onClose={handleCloseDetail}
          onEdit={openEditForm}
          onDelete={(id) => void handleDeleteMovie(id)}
        />
      )}

      {isFormOpen && (
        <TroveMovieForm
          movie={editingMovie}
          onSave={(movieData) => void handleSaveMovie(movieData)}
          onClose={() => {
            setIsFormOpen(false);
            setFormErrorMessage(null);
          }}
          isSubmitting={isSaving}
          formError={formErrorMessage}
          onIdentityFieldChange={() => setFormErrorMessage(null)}
        />
      )}
    </>
  );
}
