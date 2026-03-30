import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowUp, Film, Filter } from 'lucide-react';
import { TROVE_MEMBERS } from '../data';
import type { TroveMember, TroveMovieRecord } from '../types';

type SortDirection = 'asc' | 'desc';
type SortableColumn = 'title' | 'averageRating' | TroveMember;
type FilterMenuColumn = 'averageRating' | TroveMember;

interface RatingRangeFilter {
  min: number;
  max: number;
}

interface MemberRatingFilter extends RatingRangeFilter {
  includeEmpty: boolean;
}

interface NumericFilters {
  averageRating: RatingRangeFilter;
  memberRatings: Record<TroveMember, MemberRatingFilter>;
}

const MIN_RATING = 1;
const MAX_RATING = 10;
const RATING_STEP = 0.5;
const FILTER_MENU_WIDTH = 256;
const FILTER_MENU_MARGIN = 8;
const FILTER_MENU_OFFSET = 8;

const createDefaultRangeFilter = (): RatingRangeFilter => ({
  min: MIN_RATING,
  max: MAX_RATING,
});

const createDefaultMemberRatingFilter = (): MemberRatingFilter => ({
  ...createDefaultRangeFilter(),
  includeEmpty: true,
});

const createDefaultMemberRatingFilters = (): Record<TroveMember, MemberRatingFilter> =>
  TROVE_MEMBERS.reduce(
    (acc, member) => ({ ...acc, [member]: createDefaultMemberRatingFilter() }),
    {} as Record<TroveMember, MemberRatingFilter>,
  );

interface TroveMovieListProps {
  movies: TroveMovieRecord[];
  onViewDetail: (movie: TroveMovieRecord) => void;
}

function normalizeRange(min: number, max: number): RatingRangeFilter {
  return {
    min: Math.min(min, max),
    max: Math.max(min, max),
  };
}

function matchesRangeFilter(
  value: number | null,
  filter: RatingRangeFilter,
  includeEmpty: boolean = false,
): boolean {
  if (value === null) {
    return includeEmpty;
  }

  const normalized = normalizeRange(filter.min, filter.max);
  return value >= normalized.min && value <= normalized.max;
}

function isRangeDefault(filter: RatingRangeFilter): boolean {
  const normalized = normalizeRange(filter.min, filter.max);
  return normalized.min === MIN_RATING && normalized.max === MAX_RATING;
}

function isMemberFilterDefault(filter: MemberRatingFilter): boolean {
  return isRangeDefault(filter) && filter.includeEmpty;
}

function formatRatingValue(value: number): string {
  return value.toFixed(1);
}

function isMemberColumn(column: FilterMenuColumn): column is TroveMember {
  return TROVE_MEMBERS.includes(column as TroveMember);
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
  const [openFilterMenu, setOpenFilterMenu] = useState<FilterMenuColumn | null>(null);
  const [filterMenuPosition, setFilterMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [numericFilters, setNumericFilters] = useState<NumericFilters>({
    averageRating: createDefaultRangeFilter(),
    memberRatings: createDefaultMemberRatingFilters(),
  });
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const filterMenuRef = useRef<HTMLDivElement | null>(null);

  const setFilterTriggerRef = useCallback(
    (column: FilterMenuColumn) => (element: HTMLButtonElement | null) => {
      triggerRefs.current[column] = element;
    },
    [],
  );

  const updateFilterMenuPosition = useCallback(() => {
    if (!openFilterMenu) {
      setFilterMenuPosition(null);
      return;
    }

    const trigger = triggerRefs.current[openFilterMenu];
    if (!trigger) {
      setFilterMenuPosition(null);
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const menuHeight = filterMenuRef.current?.offsetHeight ?? (isMemberColumn(openFilterMenu) ? 240 : 200);
    const menuWidth = filterMenuRef.current?.offsetWidth ?? FILTER_MENU_WIDTH;

    const preferredLeft = triggerRect.right - menuWidth;
    const minLeft = FILTER_MENU_MARGIN;
    const maxLeft = window.innerWidth - menuWidth - FILTER_MENU_MARGIN;
    const left = Math.min(Math.max(preferredLeft, minLeft), maxLeft);

    const fitsBelow = triggerRect.bottom + FILTER_MENU_OFFSET + menuHeight <= window.innerHeight - FILTER_MENU_MARGIN;
    const top = fitsBelow
      ? triggerRect.bottom + FILTER_MENU_OFFSET
      : Math.max(FILTER_MENU_MARGIN, triggerRect.top - menuHeight - FILTER_MENU_OFFSET);

    setFilterMenuPosition({ top, left });
  }, [openFilterMenu]);

  useEffect(() => {
    if (!showMemberRatings) {
      setNumericFilters((prev) => ({
        ...prev,
        memberRatings: createDefaultMemberRatingFilters(),
      }));

      setOpenFilterMenu((current) => (current && TROVE_MEMBERS.includes(current as TroveMember) ? null : current));
    }
  }, [showMemberRatings]);

  useEffect(() => {
    if (!openFilterMenu) {
      setFilterMenuPosition(null);
      return;
    }

    updateFilterMenuPosition();
    const frame = window.requestAnimationFrame(updateFilterMenuPosition);

    const handleReposition = () => updateFilterMenuPosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [openFilterMenu, updateFilterMenuPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-rating-filter-menu="true"]')) {
        return;
      }
      setOpenFilterMenu(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenFilterMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredMovies = useMemo(() => {
    const normalizedTitleFilter = titleFilter.trim().toLowerCase();

    return movies.filter((movie) => {
      const titleMatches =
        normalizedTitleFilter === '' || movie.title.toLowerCase().includes(normalizedTitleFilter);
      const ctcstmMatches = matchesRangeFilter(movie.averageRating, numericFilters.averageRating);

      if (!titleMatches || !ctcstmMatches) {
        return false;
      }

      if (!showMemberRatings) {
        return true;
      }

      return TROVE_MEMBERS.every((member) => {
        const memberFilter = numericFilters.memberRatings[member];
        return matchesRangeFilter(memberRating(movie, member), memberFilter, memberFilter.includeEmpty);
      });
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
          Sort by clicking headers. Use rating filter icons to filter by ratings.
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

      <div className="overflow-x-auto overflow-y-visible rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/85">
        <table
          className={`w-full border-collapse ${
            showMemberRatings ? 'min-w-[900px] table-fixed lg:min-w-0 lg:table-fixed' : 'min-w-0 table-fixed'
          }`}
        >
          <thead className="bg-[var(--color-cinema-black)]/80">
            <tr className="text-left text-xs uppercase tracking-wider text-[var(--color-silver-400)]">
              <th className="px-2 sm:px-3 py-3 w-12 sm:w-16"></th>
              <th className={`px-2 sm:px-3 py-3 ${showMemberRatings ? 'w-[12rem] sm:w-[14rem] lg:w-auto' : ''}`}>
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
                <div className="flex justify-center" data-rating-filter-menu="true">
                  <button
                    ref={setFilterTriggerRef('averageRating')}
                    type="button"
                    onClick={() =>
                      setOpenFilterMenu((current) => (current === 'averageRating' ? null : 'averageRating'))
                    }
                    className={`relative inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold-500)] ${
                      openFilterMenu === 'averageRating' || !isRangeDefault(numericFilters.averageRating)
                        ? 'border-[var(--color-gold-500)] text-[var(--color-gold-400)] bg-[var(--color-cinema-gray)]/60'
                        : 'border-[var(--color-cinema-gray)] text-[var(--color-silver-400)] hover:text-[var(--color-gold-400)] hover:border-[var(--color-gold-600)]'
                    }`}
                    aria-label="Filter CTCSTM ratings"
                    aria-expanded={openFilterMenu === 'averageRating'}
                  >
                    <Filter size={15} />
                    {!isRangeDefault(numericFilters.averageRating) && (
                      <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--color-gold-400)]" />
                    )}
                  </button>
                </div>
              </th>
              {showMemberRatings &&
                TROVE_MEMBERS.map((member) => (
                  <th key={`${member}-filter`} className="px-2 sm:px-3 lg:px-3 py-2 w-16 lg:w-20">
                    <div className="flex justify-center" data-rating-filter-menu="true">
                      <button
                        ref={setFilterTriggerRef(member)}
                        type="button"
                        onClick={() => setOpenFilterMenu((current) => (current === member ? null : member))}
                        className={`relative inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold-500)] ${
                          openFilterMenu === member || !isMemberFilterDefault(numericFilters.memberRatings[member])
                            ? 'border-[var(--color-gold-500)] text-[var(--color-gold-400)] bg-[var(--color-cinema-gray)]/60'
                            : 'border-[var(--color-cinema-gray)] text-[var(--color-silver-400)] hover:text-[var(--color-gold-400)] hover:border-[var(--color-gold-600)]'
                        }`}
                        aria-label={`Filter ${member} ratings`}
                        aria-expanded={openFilterMenu === member}
                      >
                        <Filter size={15} />
                        {!isMemberFilterDefault(numericFilters.memberRatings[member]) && (
                          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--color-gold-400)]" />
                        )}
                      </button>
                    </div>
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
                <td className={`px-2 sm:px-3 py-2 min-w-0 ${showMemberRatings ? 'w-[12rem] sm:w-[14rem] lg:w-auto' : ''}`}>
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

      {openFilterMenu && filterMenuPosition &&
        createPortal(
          <div
            ref={filterMenuRef}
            data-rating-filter-menu="true"
            className="z-[70] rounded-lg border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)] p-3 text-left shadow-2xl"
            style={{
              position: 'fixed',
              top: `${filterMenuPosition.top}px`,
              left: `${filterMenuPosition.left}px`,
              width: `${FILTER_MENU_WIDTH}px`,
            }}
          >
            {openFilterMenu === 'averageRating' ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-silver-400)]">
                  CTCSTM Range
                </p>
                <div className="mt-3 space-y-3">
                  <label className="block">
                    <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-silver-400)]">
                      <span>Min</span>
                      <span className="font-mono text-[var(--color-gold-400)]">
                        {formatRatingValue(numericFilters.averageRating.min)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={MIN_RATING}
                      max={MAX_RATING}
                      step={RATING_STEP}
                      value={numericFilters.averageRating.min}
                      onChange={(event) => {
                        const nextMin = Number(event.target.value);
                        setNumericFilters((prev) => ({
                          ...prev,
                          averageRating: {
                            min: Math.min(nextMin, prev.averageRating.max),
                            max: prev.averageRating.max,
                          },
                        }));
                      }}
                      className="w-full accent-[var(--color-gold-500)]"
                    />
                  </label>
                  <label className="block">
                    <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-silver-400)]">
                      <span>Max</span>
                      <span className="font-mono text-[var(--color-gold-400)]">
                        {formatRatingValue(numericFilters.averageRating.max)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={MIN_RATING}
                      max={MAX_RATING}
                      step={RATING_STEP}
                      value={numericFilters.averageRating.max}
                      onChange={(event) => {
                        const nextMax = Number(event.target.value);
                        setNumericFilters((prev) => ({
                          ...prev,
                          averageRating: {
                            min: prev.averageRating.min,
                            max: Math.max(nextMax, prev.averageRating.min),
                          },
                        }));
                      }}
                      className="w-full accent-[var(--color-gold-500)]"
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-silver-400)]">
                  {openFilterMenu} Rating
                </p>
                <div className="mt-3 space-y-3">
                  <label className="block">
                    <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-silver-400)]">
                      <span>Min</span>
                      <span className="font-mono text-[var(--color-gold-400)]">
                        {formatRatingValue(numericFilters.memberRatings[openFilterMenu].min)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={MIN_RATING}
                      max={MAX_RATING}
                      step={RATING_STEP}
                      value={numericFilters.memberRatings[openFilterMenu].min}
                      onChange={(event) => {
                        const nextMin = Number(event.target.value);
                        setNumericFilters((prev) => ({
                          ...prev,
                          memberRatings: {
                            ...prev.memberRatings,
                            [openFilterMenu]: {
                              ...prev.memberRatings[openFilterMenu],
                              min: Math.min(nextMin, prev.memberRatings[openFilterMenu].max),
                            },
                          },
                        }));
                      }}
                      className="w-full accent-[var(--color-gold-500)]"
                    />
                  </label>
                  <label className="block">
                    <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-silver-400)]">
                      <span>Max</span>
                      <span className="font-mono text-[var(--color-gold-400)]">
                        {formatRatingValue(numericFilters.memberRatings[openFilterMenu].max)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={MIN_RATING}
                      max={MAX_RATING}
                      step={RATING_STEP}
                      value={numericFilters.memberRatings[openFilterMenu].max}
                      onChange={(event) => {
                        const nextMax = Number(event.target.value);
                        setNumericFilters((prev) => ({
                          ...prev,
                          memberRatings: {
                            ...prev.memberRatings,
                            [openFilterMenu]: {
                              ...prev.memberRatings[openFilterMenu],
                              max: Math.max(nextMax, prev.memberRatings[openFilterMenu].min),
                            },
                          },
                        }));
                      }}
                      className="w-full accent-[var(--color-gold-500)]"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[var(--color-silver-300)]">
                    <input
                      type="checkbox"
                      checked={numericFilters.memberRatings[openFilterMenu].includeEmpty}
                      onChange={(event) =>
                        setNumericFilters((prev) => ({
                          ...prev,
                          memberRatings: {
                            ...prev.memberRatings,
                            [openFilterMenu]: {
                              ...prev.memberRatings[openFilterMenu],
                              includeEmpty: event.target.checked,
                            },
                          },
                        }))
                      }
                      className="h-4 w-4 rounded border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] accent-[var(--color-gold-500)]"
                    />
                    Include empty ratings
                  </label>
                </div>
              </>
            )}
          </div>,
          document.body,
        )}

      {sortedMovies.length === 0 && (
        <div className="p-12 text-center text-[var(--color-silver-500)] italic border border-[var(--color-cinema-gray)] rounded-xl bg-[var(--color-cinema-dark)]">
          No trove entries match the current filters.
        </div>
      )}
    </div>
  );
}
