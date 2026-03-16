import React from 'react';
import { X, Edit2, Star, Calendar, Globe, MonitorPlay } from 'lucide-react';
import { MEMBERS } from '../../../data';
import type { LogEntry, Member } from '../../../types';

interface MovieDetailProps {
  movie: LogEntry;
  isLoggedIn: boolean;
  onClose: () => void;
  onEdit: (movie: LogEntry) => void;
}

function getMemberRating(entry: LogEntry, member: Member): number | null {
  const match = entry.ratings?.find((rating) => rating.user === member);
  return match ? match.rating : null;
}

export function MovieDetail({ movie, isLoggedIn, onClose, onEdit }: MovieDetailProps) {
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
                  {movie.averageRating !== undefined && movie.averageRating !== null ? movie.averageRating.toFixed(1) : '-'}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-serif text-white mb-2 leading-tight">{movie.movie.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-silver-400)]">
                  {movie.pickedBy && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[var(--color-gold-500)]">Picked By:</span>
                      <span>{movie.pickedBy}</span>
                    </div>
                  )}
                  {movie.movie.yearReleased && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-[var(--color-gold-500)]" />
                      <span>{movie.movie.yearReleased}</span>
                    </div>
                  )}
                  {movie.movie.originCountry && (
                    <div className="flex items-center gap-1.5">
                      <Globe size={14} className="text-[var(--color-gold-500)]" />
                      <span>{movie.movie.originCountry}</span>
                    </div>
                  )}
                  {movie.streamingPlatform && (
                    <div className="flex items-center gap-1.5">
                      <MonitorPlay size={14} className="text-[var(--color-gold-500)]" />
                      <span>{movie.streamingPlatform}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif text-[var(--color-gold-400)] flex items-center gap-2">
                  <Star size={18} />
                  Member Ratings
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {MEMBERS.map((member) => {
                  const rating = getMemberRating(movie, member);
                  return (
                    <div key={member} className="bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-[var(--color-silver-400)] uppercase tracking-wider font-semibold mb-2">{member}</span>
                      {rating !== null ? (
                        <span className={`text-2xl font-mono font-bold ${rating >= 9 ? 'text-[var(--color-gold-400)]' : 'text-white'}`}>
                          {rating}
                        </span>
                      ) : (
                        <span className="text-2xl font-mono text-[var(--color-cinema-gray)]">-</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-[var(--color-cinema-gray)]">
              <div className="text-sm text-[var(--color-silver-500)]">
                {movie.yearWatched ? `Watched in ${movie.yearWatched}` : 'Watch year unavailable'}
              </div>
              {isLoggedIn && (
                <button
                  onClick={() => onEdit(movie)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-cinema-gray)] text-white hover:bg-[var(--color-gold-500)] hover:text-black transition-all font-medium text-sm"
                >
                  <Edit2 size={16} />
                  Edit Record
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
