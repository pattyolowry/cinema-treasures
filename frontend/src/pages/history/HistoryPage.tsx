import { useMemo, useState, type KeyboardEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Award, Plus } from 'lucide-react';
import type { LogEntry, NewLogEntry } from '../../types';
import { useAppSession } from '../../context/AppSessionContext';
import historyService from '../../services/history';
import { MovieDetail } from './components/MovieDetail';
import { MovieForm } from './components/MovieForm';
import { MovieList, type MovieYearSection } from './components/MovieList';

const HISTORY_ENTRIES_QUERY_KEY = ['historyEntries'] as const;
const HISTORY_ERROR_MESSAGE = 'Unable to load film history right now. Please try again.';
const HISTORY_SAVE_ERROR_MESSAGE = 'Unable to save this record. Please try again.';
const HISTORY_DELETE_ERROR_MESSAGE = 'Unable to delete this record. Please try again.';

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

export default function HistoryPage() {
  const { currentUser } = useAppSession();
  const queryClient = useQueryClient();
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);

  const historyQuery = useQuery({
    queryKey: HISTORY_ENTRIES_QUERY_KEY,
    queryFn: historyService.getAllEntries,
  });
  const entries = historyQuery.data ?? [];

  const addEntryMutation = useMutation({
    mutationFn: historyService.addEntry,
    onMutate: async (entryData: NewLogEntry) => {
      setActionErrorMessage(null);
      await queryClient.cancelQueries({ queryKey: HISTORY_ENTRIES_QUERY_KEY });
      const previousEntries = queryClient.getQueryData<LogEntry[]>(HISTORY_ENTRIES_QUERY_KEY) ?? [];
      const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const optimisticEntry: LogEntry = {
        id: optimisticId,
        ...entryData,
      };
      queryClient.setQueryData<LogEntry[]>(HISTORY_ENTRIES_QUERY_KEY, [...previousEntries, optimisticEntry]);
      return { previousEntries, optimisticId };
    },
    onError: (error: unknown, _entryData, context) => {
      if (context) {
        queryClient.setQueryData(HISTORY_ENTRIES_QUERY_KEY, context.previousEntries);
      }
      setActionErrorMessage(getRequestErrorMessage(error, HISTORY_SAVE_ERROR_MESSAGE));
    },
    onSuccess: (savedEntry, _entryData, context) => {
      queryClient.setQueryData<LogEntry[]>(HISTORY_ENTRIES_QUERY_KEY, (currentEntries = []) =>
        currentEntries.map((entry) => (entry.id === context?.optimisticId ? savedEntry : entry)),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: HISTORY_ENTRIES_QUERY_KEY });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ id, entryData }: { id: string; entryData: NewLogEntry }) =>
      historyService.updateEntry(id, entryData),
    onMutate: async ({ id, entryData }) => {
      setActionErrorMessage(null);
      await queryClient.cancelQueries({ queryKey: HISTORY_ENTRIES_QUERY_KEY });
      const previousEntries = queryClient.getQueryData<LogEntry[]>(HISTORY_ENTRIES_QUERY_KEY) ?? [];
      queryClient.setQueryData<LogEntry[]>(HISTORY_ENTRIES_QUERY_KEY, (currentEntries = []) =>
        currentEntries.map((entry) => (entry.id === id ? { ...entry, ...entryData, id } : entry)),
      );
      return { previousEntries };
    },
    onError: (error: unknown, _variables, context) => {
      if (context) {
        queryClient.setQueryData(HISTORY_ENTRIES_QUERY_KEY, context.previousEntries);
      }
      setActionErrorMessage(getRequestErrorMessage(error, HISTORY_SAVE_ERROR_MESSAGE));
    },
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData<LogEntry[]>(HISTORY_ENTRIES_QUERY_KEY, (currentEntries = []) =>
        currentEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: HISTORY_ENTRIES_QUERY_KEY });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: historyService.deleteEntry,
    onMutate: async (id: string) => {
      setActionErrorMessage(null);
      await queryClient.cancelQueries({ queryKey: HISTORY_ENTRIES_QUERY_KEY });
      const previousEntries = queryClient.getQueryData<LogEntry[]>(HISTORY_ENTRIES_QUERY_KEY) ?? [];
      queryClient.setQueryData<LogEntry[]>(HISTORY_ENTRIES_QUERY_KEY, (currentEntries = []) =>
        currentEntries.filter((entry) => entry.id !== id),
      );
      return { previousEntries };
    },
    onError: (error: unknown, _id, context) => {
      if (context) {
        queryClient.setQueryData(HISTORY_ENTRIES_QUERY_KEY, context.previousEntries);
      }
      setActionErrorMessage(getRequestErrorMessage(error, HISTORY_DELETE_ERROR_MESSAGE));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: HISTORY_ENTRIES_QUERY_KEY });
    },
  });

  const isSaving = addEntryMutation.isPending || updateEntryMutation.isPending;
  const errorMessage =
    actionErrorMessage ??
    (historyQuery.error ? getRequestErrorMessage(historyQuery.error, HISTORY_ERROR_MESSAGE) : null);
  const isInitialLoading = historyQuery.isPending && !historyQuery.data;
  const isRefreshing = historyQuery.isFetching && !!historyQuery.data;

  const compareByCurrentWatchPriority = (a: LogEntry, b: LogEntry) => {
    if (b.clubNumber !== a.clubNumber) return b.clubNumber - a.clubNumber;
    if ((b.yearWatched ?? 0) !== (a.yearWatched ?? 0)) return (b.yearWatched ?? 0) - (a.yearWatched ?? 0);
    return a.id.localeCompare(b.id);
  };

  const currentWatchEntry = useMemo(() => {
    if (entries.length === 0) return null;
    return [...entries].sort(compareByCurrentWatchPriority)[0];
  }, [entries]);

  const sortedEntries = useMemo(() => {
    return entries
      .filter((entry) => entry.id !== currentWatchEntry?.id)
      .sort(compareByCurrentWatchPriority);
  }, [entries, currentWatchEntry]);

  const movieSections = useMemo<MovieYearSection[]>(() => {
    const startYear = 2023;
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

    const entriesByYear = sortedEntries.reduce<Record<number, LogEntry[]>>((acc, entry) => {
      const yearWatched = entry.yearWatched;
      if (!yearWatched) {
        return acc;
      }

      if (!acc[yearWatched]) {
        acc[yearWatched] = [];
      }

      acc[yearWatched].push(entry);
      return acc;
    }, {});

    return years.map((year) => ({
      year,
      entries: entriesByYear[year] ?? [],
    }));
  }, [sortedEntries]);

  const nextClubNumber = useMemo(() => {
    if (entries.length === 0) return 1;
    return Math.max(...entries.map((entry) => entry.clubNumber)) + 1;
  }, [entries]);

  const treasuresSince2023 = useMemo(() => {
    return entries.filter((entry) => (entry.yearWatched ?? 0) >= 2023).length;
  }, [entries]);

  const handleSaveMovie = async (entryData: NewLogEntry) => {
    try {
      if (editingEntry) {
        await updateEntryMutation.mutateAsync({ id: editingEntry.id, entryData });
      } else {
        await addEntryMutation.mutateAsync(entryData);
      }

      setIsFormOpen(false);
      setEditingEntry(null);
    } catch {
      // Mutation errors are surfaced via onError to keep messages consistent.
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      await deleteEntryMutation.mutateAsync(id);
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
      if (editingEntry?.id === id) {
        setEditingEntry(null);
        setIsFormOpen(false);
      }
    } catch {
      // Mutation errors are surfaced via onError to keep messages consistent.
    }
  };

  const openEditForm = (entry: LogEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
    setSelectedEntry(null);
  };

  const openAddForm = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
  };

  const handleCurrentMovieEdit = () => {
    if (!currentUser || !currentWatchEntry) return;
    openEditForm(currentWatchEntry);
  };

  const handleCurrentMovieKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCurrentMovieEdit();
    }
  };

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-serif text-white flex items-center gap-3">
              <Award className="text-[var(--color-gold-500)]" size={28} />
              The Treasures
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
                void historyQuery.refetch();
              }}
              className="shrink-0 rounded-full border border-red-200/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-100 hover:bg-red-200/10"
            >
              Retry
            </button>
          </div>
        )}

        {isRefreshing && (
          <p className="mb-4 text-xs uppercase tracking-wider text-[var(--color-silver-500)]">Refreshing history...</p>
        )}

        {isInitialLoading ? (
          <div className="rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)] p-12 text-center text-[var(--color-silver-400)]">
            Loading film history...
          </div>
        ) : (
          <>
            {currentWatchEntry && (
              <div
                className={`group mb-8 relative overflow-hidden rounded-2xl border border-[var(--color-cinema-gray)] ${
                  currentWatchEntry.movie.backdropUrl ? 'min-h-[220px] sm:min-h-[260px]' : ''
                } ${
                  currentUser
                    ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold-500)]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-cinema-black)]'
                    : ''
                }`}
                onClick={currentUser ? handleCurrentMovieEdit : undefined}
                onKeyDown={currentUser ? handleCurrentMovieKeyDown : undefined}
                role={currentUser ? 'button' : undefined}
                tabIndex={currentUser ? 0 : undefined}
              >
                {currentWatchEntry.movie.backdropUrl ? (
                  <>
                    <img
                      src={currentWatchEntry.movie.backdropUrl}
                      alt={`${currentWatchEntry.movie.title} backdrop`}
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 transition-colors ${
                        currentUser ? 'group-hover:from-black/75 group-hover:via-black/55 group-hover:to-black/30' : ''
                      }`}
                    />
                    <div className="relative z-10 p-6 sm:p-8 md:p-10">
                      <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-gold-400)]">Now Screening</p>
                      <h3 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-serif text-white">
                        {currentWatchEntry.movie.title} {currentWatchEntry.movie.yearReleased ? `(${currentWatchEntry.movie.yearReleased})` : ''}
                      </h3>
                    </div>
                  </>
                ) : (
                  <div className="bg-gradient-to-r from-[var(--color-cinema-dark)] via-[var(--color-cinema-black)] to-[var(--color-cinema-dark)] p-6 sm:p-8">
                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-gold-400)]">Now Screening</p>
                    <h3 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-serif text-white">
                      {currentWatchEntry.movie.title} {currentWatchEntry.movie.yearReleased ? `(${currentWatchEntry.movie.yearReleased})` : ''}
                    </h3>
                  </div>
                )}
              </div>
            )}

            <MovieList
              sections={movieSections}
              isLoggedIn={!!currentUser}
              onEdit={openEditForm}
              onDelete={(id) => void handleDeleteMovie(id)}
              onViewDetail={setSelectedEntry}
            />
          </>
        )}
      </section>

      {selectedEntry && (
        <MovieDetail
          movie={selectedEntry}
          isLoggedIn={!!currentUser}
          onClose={() => setSelectedEntry(null)}
          onEdit={openEditForm}
        />
      )}

      {isFormOpen && (
        <MovieForm
          movie={editingEntry}
          onSave={(entryData) => void handleSaveMovie(entryData)}
          onClose={() => setIsFormOpen(false)}
          nextClubNumber={nextClubNumber}
          isSubmitting={isSaving}
        />
      )}
    </>
  );
}
