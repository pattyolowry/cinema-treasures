import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Film } from 'lucide-react';
import { TROVE_MEMBERS } from '../data';
import type { TroveMember, TroveMovieRecord } from '../types';

type SortDirection = 'asc' | 'desc';
type SortableColumn = 'title' | 'averageRating' | TroveMember;

interface NumericFilters {
  averageRating: string;
  memberRatings: Record<TroveMember, string>;
}

const createDefaultMemberRatingFilters = (): Record<TroveMember, string> =>
  TROVE_MEMBERS.reduce(
    (acc, member) => ({ ...acc, [member]: '' }),
    {} as Record<TroveMember, string>,
  );

interface TroveMovieListProps {
  movies: TroveMovieRecord[];
  onViewDetail: (movie: TroveMovieRecord) => void;
}

function parseNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function matchesNumericFilter(value: number | null, rawQuery: string): boolean {
  const query = rawQuery.trim();
  if (!query) return true;
  if (value === null) return false;

  const rangeMatch = query.match(/^(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)$/);
  if (rangeMatch) {
    const minValue = parseNumber(rangeMatch[1]);
    const maxValue = parseNumber(rangeMatch[2]);
    if (minValue === null || maxValue === null) return true;
    const lowerBound = Math.min(minValue, maxValue);
    const upperBound = Math.max(minValue, maxValue);
    return value >= lowerBound && value <= upperBound;
  }

  const comparatorMatch = query.match(/^(<=|>=|<|>|=)\s*(-?\d+(?:\.\d+)?)$/);
  if (comparatorMatch) {
    const operator = comparatorMatch[1];
    const target = parseNumber(comparatorMatch[2]);
    if (target === null) return true;

    if (operator === '<') return value < target;
    if (operator === '<=') return value <= target;
    if (operator === '>') return value > target;
    if (operator === '>=') return value >= target;
    return value === target;
  }

  const exact = parseNumber(query);
  if (exact === null) return true;
  return value === exact;
}

function memberRating(movie: TroveMovieRecord, member: TroveMember): number | null {
  return movie.ratings[member] ?? null;
}

function formatRunTime(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return 'Runtime N/A';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

function compareValues(
  aValue: string | number | null,
  bValue: string | number | null,
  direction: SortDirection,
): number {
  const aIsNull = aValue === null;
  const bIsNull = bValue === null;
  if (aIsNull && bIsNull) return 0;
  if (aIsNull) return 1;
  if (bIsNull) return -1;

  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  }

  const aNumber = aValue as number;
  const bNumber = bValue as number;
  return direction === 'asc' ? aNumber - bNumber : bNumber - aNumber;
}

export function TroveMovieList({ movies, onViewDetail }: TroveMovieListProps) {
  const [showMemberRatings, setShowMemberRatings] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortableColumn>('averageRating');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [titleFilter, setTitleFilter] = useState('');
  const [numericFilters, setNumericFilters] = useState<NumericFilters>({
    averageRating: '',
    memberRatings: createDefaultMemberRatingFilters(),
  });

  useEffect(() => {
    if (!showMemberRatings) {
      setNumericFilters((prev) => ({
        ...prev,
        memberRatings: createDefaultMemberRatingFilters(),
      }));
    }
  }, [showMemberRatings]);

  const filteredMovies = useMemo(() => {
    const normalizedTitleFilter = titleFilter.trim().toLowerCase();

    return movies.filter((movie) => {
      const titleMatches =
        normalizedTitleFilter === '' || movie.title.toLowerCase().includes(normalizedTitleFilter);
      const ctcstmMatches = matchesNumericFilter(movie.averageRating, numericFilters.averageRating);

      if (!titleMatches || !ctcstmMatches) {
        return false;
      }

      if (!showMemberRatings) {
        return true;
      }

      return TROVE_MEMBERS.every((member) =>
        matchesNumericFilter(memberRating(movie, member), numericFilters.memberRatings[member]),
      );
    });
  }, [movies, numericFilters, showMemberRatings, titleFilter]);

  const sortedMovies = useMemo(() => {
    return [...filteredMovies].sort((a, b) => {
      if (sortColumn === 'title') {
        const titleComparison = compareValues(
          a.title.toLowerCase(),
          b.title.toLowerCase(),
          sortDirection,
        );
        if (titleComparison !== 0) return titleComparison;
      } else if (sortColumn === 'averageRating') {
        const ratingComparison = compareValues(a.averageRating, b.averageRating, sortDirection);
        if (ratingComparison !== 0) return ratingComparison;
      } else {
        const memberComparison = compareValues(
          memberRating(a, sortColumn),
          memberRating(b, sortColumn),
          sortDirection,
        );
        if (memberComparison !== 0) return memberComparison;
      }

      return a.title.localeCompare(b.title);
    });
  }, [filteredMovies, sortColumn, sortDirection]);

  const onSortColumn = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortColumn(column);
    setSortDirection(column === 'title' ? 'asc' : 'desc');
  };

  const sortIcon = (column: SortableColumn) => {
    if (column !== sortColumn) {
      return <span className="inline-block w-3.5 h-3.5 shrink-0" aria-hidden="true"></span>;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="text-[var(--color-gold-400)] shrink-0" />
    ) : (
      <ArrowDown size={14} className="text-[var(--color-gold-400)] shrink-0" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/85 px-4 py-3">
        <p className="text-xs sm:text-sm text-[var(--color-silver-400)]">
          Sort by clicking headers. Numeric filters support values like <code>8</code>, <code>8-9.5</code>, <code>&gt;=9</code>.
        </p>
        <label className="inline-flex items-center gap-3 text-sm text-[var(--color-silver-300)]">
          <span>Show member ratings</span>
          <button
            type="button"
            onClick={() => setShowMemberRatings((current) => !current)}
            role="switch"
            aria-checked={showMemberRatings}
            className={`inline-flex items-center h-6 w-11 p-0.5 rounded-full overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-cinema-dark)] ${
              showMemberRatings ? 'bg-[var(--color-gold-500)]' : 'bg-[var(--color-cinema-gray)]'
            }`}
            aria-label="Toggle member rating columns"
          >
            <span
              className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                showMemberRatings ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/85">
        <table
          className={`w-full border-collapse ${
            showMemberRatings ? 'min-w-[900px] lg:min-w-0 lg:table-fixed' : 'min-w-0 table-fixed'
          }`}
        >
          <thead className="bg-[var(--color-cinema-black)]/80">
            <tr className="text-left text-xs uppercase tracking-wider text-[var(--color-silver-400)]">
              <th className="px-2 sm:px-3 py-3 w-12 sm:w-16"></th>
              <th className="px-2 sm:px-3 py-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 sm:gap-2 hover:text-[var(--color-gold-400)] transition-colors whitespace-nowrap"
                  onClick={() => onSortColumn('title')}
                >
                  Movie Title
                  {sortIcon('title')}
                </button>
              </th>
              <th className={`px-2 sm:px-3 lg:px-3 py-3 w-24 sm:w-28 ${showMemberRatings ? 'lg:w-20' : ''}`}>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 sm:gap-2 hover:text-[var(--color-gold-400)] transition-colors whitespace-nowrap"
                  onClick={() => onSortColumn('averageRating')}
                >
                  CTCSTM
                  {sortIcon('averageRating')}
                </button>
              </th>
              {showMemberRatings &&
                TROVE_MEMBERS.map((member) => (
                  <th key={member} className="px-2 sm:px-3 lg:px-3 py-3 w-16 lg:w-20">
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-between gap-1 whitespace-nowrap hover:text-[var(--color-gold-400)] transition-colors"
                      onClick={() => onSortColumn(member)}
                    >
                      <span className="truncate">{member}</span>
                      {sortIcon(member)}
                    </button>
                  </th>
                ))}
            </tr>
            <tr className="border-t border-[var(--color-cinema-gray)]/70">
              <th className="px-2 sm:px-3 py-2" />
              <th className="px-2 sm:px-3 py-2">
                <input
                  type="text"
                  value={titleFilter}
                  onChange={(event) => setTitleFilter(event.target.value)}
                  placeholder="Filter title..."
                  className="w-full rounded-md border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)] px-2 py-1.5 text-sm text-white placeholder:text-[var(--color-silver-500)] focus:outline-none focus:border-[var(--color-gold-500)]"
                />
              </th>
              <th className="px-2 sm:px-3 lg:px-3 py-2">
                <input
                  type="text"
                  value={numericFilters.averageRating}
                  onChange={(event) =>
                    setNumericFilters((prev) => ({ ...prev, averageRating: event.target.value }))
                  }
                  placeholder="e.g. 8-10"
                  className="w-full rounded-md border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)] px-2 py-1.5 text-sm text-white placeholder:text-[var(--color-silver-500)] focus:outline-none focus:border-[var(--color-gold-500)]"
                />
              </th>
              {showMemberRatings &&
                TROVE_MEMBERS.map((member) => (
                  <th key={`${member}-filter`} className="px-2 sm:px-3 lg:px-3 py-2 w-16 lg:w-20">
                    <input
                      type="text"
                      value={numericFilters.memberRatings[member]}
                      onChange={(event) =>
                        setNumericFilters((prev) => ({
                          ...prev,
                          memberRatings: {
                            ...prev.memberRatings,
                            [member]: event.target.value,
                          },
                        }))
                      }
                      placeholder="e.g. >=9"
                      className="w-full rounded-md border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)] px-2 py-1.5 text-sm text-white placeholder:text-[var(--color-silver-500)] focus:outline-none focus:border-[var(--color-gold-500)]"
                    />
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {sortedMovies.map((movie) => (
              <tr
                key={movie.id}
                className="border-t border-[var(--color-cinema-gray)]/70 hover:bg-[var(--color-cinema-gray)]/35 cursor-pointer transition-colors"
                onClick={() => onViewDetail(movie)}
              >
                <td className="px-2 sm:px-3 py-2 align-middle">
                  <div className="w-10 h-14 sm:w-12 sm:h-16 rounded overflow-hidden border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)]">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={`${movie.title} poster`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-silver-500)]">
                        <Film size={16} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-2 sm:px-3 py-2 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm sm:text-lg font-semibold text-white tracking-wide leading-tight truncate [text-shadow:0_1px_6px_rgba(212,175,55,0.25)]">
                      {movie.title}
                    </p>
                    <p className="mt-1 text-[11px] sm:text-sm text-[var(--color-silver-400)] truncate">
                      {movie.yearReleased} • {formatRunTime(movie.runTime)}
                    </p>
                  </div>
                </td>
                <td className="px-2 sm:px-3 lg:px-3 py-2 text-center text-sm sm:text-base font-mono font-semibold text-[var(--color-gold-400)] [text-shadow:0_1px_6px_rgba(212,175,55,0.3)]">
                  {movie.averageRating !== null ? movie.averageRating.toFixed(1) : '-'}
                </td>
                {showMemberRatings &&
                  TROVE_MEMBERS.map((member) => (
                    <td
                      key={`${movie.id}-${member}`}
                      className="px-2 sm:px-3 lg:px-3 py-2 w-16 lg:w-20 text-center text-sm sm:text-base font-mono text-[var(--color-silver-300)]"
                    >
                      {movie.ratings[member] ?? '-'}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedMovies.length === 0 && (
        <div className="p-12 text-center text-[var(--color-silver-500)] italic border border-[var(--color-cinema-gray)] rounded-xl bg-[var(--color-cinema-dark)]">
          No trove entries match the current filters.
        </div>
      )}
    </div>
  );
}
