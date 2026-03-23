import React from 'react';
import { Edit2, Trash2, Film } from 'lucide-react';
import type { LogEntry } from '../../../types';

export interface MovieYearSection {
  year: number;
  entries: LogEntry[];
}

interface MovieListProps {
  sections: MovieYearSection[];
  isLoggedIn: boolean;
  onEdit: (entry: LogEntry) => void;
  onDelete: (id: string) => void;
  onViewDetail: (entry: LogEntry) => void;
}

function formatRuntime(minutes?: number): string | null {
  if (!minutes || minutes <= 0) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function MovieList({ sections, isLoggedIn, onEdit, onDelete, onViewDetail }: MovieListProps) {
  const hasMovies = sections.some((section) => section.entries.length > 0);

  return (
    <div className="w-full flex flex-col gap-4">
      {sections.map((section) => (
        <div key={section.year} className="space-y-3">
          <div className="flex items-center gap-3 px-1 pt-2">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-silver-500)]">{section.year}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-gold-600)]/40 via-[var(--color-cinema-gray)] to-transparent" />
          </div>

          {section.entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-stretch bg-[var(--color-cinema-dark)] border border-[var(--color-cinema-gray)] rounded-xl overflow-hidden hover:bg-[var(--color-cinema-gray)]/30 transition-colors duration-200 cursor-pointer shadow-lg"
              onClick={() => onViewDetail(entry)}
            >
              <div className="w-16 sm:w-24 shrink-0 bg-[var(--color-cinema-black)] relative border-r border-[var(--color-cinema-gray)]/50 group">
                {entry.movie.posterUrl ? (
                  <img src={entry.movie.posterUrl} alt={entry.movie.title} loading="lazy" decoding="async" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-silver-500)]">
                    <Film className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                )}
              </div>

              <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center min-w-0">
                <div className="bg-[#1565c0] text-white px-2 sm:px-3 py-0.5 text-sm sm:text-lg font-bold w-fit mb-1 rounded-sm [clip-path:polygon(0_0,100%_0,85%_100%,0_100%)] pr-4 sm:pr-6">
                  #{entry.clubNumber}
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white leading-tight mb-1 truncate">{entry.movie.title}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-lg text-[var(--color-silver-400)] font-medium">
                  {entry.movie.yearReleased && <span>{entry.movie.yearReleased}</span>}
                  {formatRuntime(entry.movie.runTime) && <span>{formatRuntime(entry.movie.runTime)}</span>}
                  {entry.movie.mpaaRating && <span>{entry.movie.mpaaRating}</span>}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center px-4 sm:px-8 border-l border-[var(--color-cinema-gray)] bg-[var(--color-cinema-gray)]/10 shrink-0">
                <span className="text-[8px] sm:text-[10px] text-[var(--color-silver-500)] uppercase tracking-wider font-semibold mb-1">CTCSTM</span>
                <span className="text-xl sm:text-3xl font-mono font-bold text-[var(--color-gold-400)]">
                  {entry.averageRating !== undefined && entry.averageRating !== null ? entry.averageRating.toFixed(1) : '-'}
                </span>
              </div>

              {isLoggedIn && (
                <div className="hidden sm:flex flex-col justify-center gap-2 sm:gap-4 px-2 sm:px-4 border-l border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)]/30 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(entry);
                    }}
                    className="text-[var(--color-silver-500)] hover:text-[var(--color-gold-400)] transition-colors p-1.5 sm:p-2 hover:bg-[var(--color-cinema-gray)] rounded-full"
                    title="Edit Movie"
                  >
                    <Edit2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(entry.id);
                    }}
                    className="text-[var(--color-silver-500)] hover:text-red-400 transition-colors p-1.5 sm:p-2 hover:bg-[var(--color-cinema-gray)] rounded-full"
                    title="Delete Movie"
                  >
                    <Trash2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {!hasMovies && (
        <div className="p-12 text-center text-[var(--color-silver-500)] italic border border-[var(--color-cinema-gray)] rounded-xl bg-[var(--color-cinema-dark)]">
          No movies recorded yet. Time to start watching!
        </div>
      )}
    </div>
  );
}
