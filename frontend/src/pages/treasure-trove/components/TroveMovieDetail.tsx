import { useQuery } from '@tanstack/react-query';
import { Calendar, Edit2, Globe, ScrollText, Star, Trash2, X } from 'lucide-react';
import treasureService from '../../../services/treasures';
import { TROVE_MEMBERS } from '../data';
import type { TroveMovieRecord } from '../types';
import type { TreasureActivity } from '../../../types';

const TREASURE_ACTIVITY_QUERY_KEY = ['treasureActivity'] as const;

function formatActivityDate(createdAt: string): string {
  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return createdAt;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

function getActivityErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { error?: unknown } } }).response;
    if (typeof response?.data?.error === 'string') {
      return response.data.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to load activity right now.';
}

function formatRunTime(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

interface TroveMovieDetailProps {
  movie: TroveMovieRecord;
  isLoggedIn: boolean;
  onClose: () => void;
  onEdit: (movie: TroveMovieRecord) => void;
  onDelete: (id: string) => void;
}

export function TroveMovieDetail({ movie, isLoggedIn, onClose, onEdit, onDelete }: TroveMovieDetailProps) {
  const formattedRunTime = formatRunTime(movie.runTime);
  const overview = movie.overview?.trim();
  const activityQuery = useQuery({
    queryKey: [...TREASURE_ACTIVITY_QUERY_KEY, movie.id],
    queryFn: () => treasureService.getTreasureActivity(movie.id),
    enabled: Boolean(movie.id),
    staleTime: 5 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const activities = activityQuery.data ?? [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="bg-[var(--color-cinema-dark)] border border-[var(--color-gold-600)]/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-[var(--color-cinema-black)] to-[var(--color-cinema-dark)] p-6 border-b border-[var(--color-cinema-gray)] relative">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-[var(--color-silver-500)] hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-start gap-4 pr-12">
              <div className="w-16 h-16 rounded-xl bg-[var(--color-cinema-gray)] border border-[var(--color-gold-600)]/30 flex items-center justify-center shadow-lg shrink-0">
                <span className="text-2xl font-mono font-bold text-[var(--color-gold-400)]">
                  {movie.averageRating !== null ? movie.averageRating.toFixed(1) : '-'}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-serif text-white mb-2 leading-tight">{movie.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-silver-400)]">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[var(--color-gold-500)]" />
                    <span>{movie.yearReleased}</span>
                  </div>
                  {formattedRunTime && (
                    <div className="flex items-center gap-1.5">
                      <span>{formattedRunTime}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Globe size={14} className="text-[var(--color-gold-500)]" />
                    <span>{movie.originCountry}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {overview && (
              <div className="mb-8">
                <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--color-silver-300)]">
                  {overview}
                </p>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-lg font-serif text-[var(--color-gold-400)] flex items-center gap-2 mb-4">
                <Star size={18} />
                Member Ratings
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {TROVE_MEMBERS.map((member) => (
                  <div key={member} className="bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-[var(--color-silver-400)] uppercase tracking-wider font-semibold mb-2">{member}</span>
                    {movie.ratings[member] !== null ? (
                      <span className={`text-2xl font-mono font-bold ${movie.ratings[member]! >= 9 ? 'text-[var(--color-gold-400)]' : 'text-white'}`}>
                        {movie.ratings[member]}
                      </span>
                    ) : (
                      <span className="text-2xl font-mono text-[var(--color-cinema-gray)]">-</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-serif text-[var(--color-gold-400)] flex items-center gap-2 mb-4">
                <ScrollText size={18} />
                Activity Log
              </h3>

              {activityQuery.isPending ? (
                <div className="rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] px-4 py-3 text-sm text-[var(--color-silver-400)]">
                  Loading activity...
                </div>
              ) : activityQuery.error ? (
                <div className="rounded-xl border border-red-500/40 bg-red-900/20 px-4 py-3 text-sm text-red-100">
                  {getActivityErrorMessage(activityQuery.error)}
                </div>
              ) : activities.length === 0 ? (
                <div className="rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] px-4 py-3 text-sm text-[var(--color-silver-400)]">
                  No activity yet
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity: TreasureActivity) => (
                    <div
                      key={activity.id}
                      className="rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] px-4 py-4"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-wider text-[var(--color-silver-500)]">
                        <span>{formatActivityDate(activity.createdAt)}</span>
                        <span className="text-[var(--color-gold-400)]">{activity.user}</span>
                      </div>
                      <p className="text-sm leading-6 text-[var(--color-silver-300)]">{activity.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-[var(--color-cinema-gray)]">
              <div className="text-sm text-[var(--color-silver-500)]">Treasure Trove</div>
              {isLoggedIn && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(movie)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-cinema-gray)] text-white hover:bg-[var(--color-gold-500)] hover:text-black transition-all font-medium text-sm"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(movie.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-700/80 text-white hover:bg-red-600 transition-all font-medium text-sm"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
