import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Film, X } from 'lucide-react';
import { MEMBERS } from '../../../data';
import type { LogEntry, Member, Month, NewLogEntry, Rating, TmdbMovieDetails, TmdbSearchMovie } from '../../../types';
import tmdb from '../../../services/tmdb';

interface MovieFormProps {
  movie?: LogEntry | null;
  onSave: (movie: NewLogEntry) => void;
  onClose: () => void;
  nextClubNumber: number;
  isSubmitting?: boolean;
}

const TMDB_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/';
const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_CHARS = 2;
const MAX_RESULTS = 3;
const MONTH_OPTIONS: Month[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const MONTH_SELECT_OPTIONS: Array<Month | ''> = ['', ...MONTH_OPTIONS];

function getCurrentMonth(): Month {
  return MONTH_OPTIONS[new Date().getMonth()];
}

interface MovieFormState {
  clubNumber: number | '';
  title: string;
  pickedBy: Member | '';
  monthWatched: Month | '';
  yearReleased: number | '';
  yearWatched: number | '';
  originCountry: string;
  streamingPlatform: string;
  runTime: string;
  mpaaRating: string;
  posterUrl: string;
  backdropUrl: string;
  ratings: Record<Member, number | null>;
  notes: string;
}

function toTmdbImageUrl(path: string | null | undefined, size: string): string {
  if (!path) return '';
  return `${TMDB_POSTER_BASE_URL}${size}${path}`;
}

function parseReleaseYear(releaseDate: string | undefined): number | null {
  if (!releaseDate) return null;
  const year = Number.parseInt(releaseDate.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

function parseRuntimeToMinutes(runtime: string): number | undefined {
  const value = runtime.trim().toLowerCase();
  if (!value) return undefined;

  const hourMinuteMatch = value.match(/^(?:(\d+)\s*h)?\s*(?:(\d+)\s*m?)?$/i);
  if (hourMinuteMatch) {
    const hours = hourMinuteMatch[1] ? Number(hourMinuteMatch[1]) : 0;
    const minutes = hourMinuteMatch[2] ? Number(hourMinuteMatch[2]) : 0;
    if (Number.isFinite(hours) && Number.isFinite(minutes) && (hours > 0 || minutes > 0)) {
      return hours * 60 + minutes;
    }
  }

  const numericMinutes = Number(value);
  if (Number.isFinite(numericMinutes) && numericMinutes > 0) {
    return Math.floor(numericMinutes);
  }

  return undefined;
}

function getOriginCountry(details: TmdbMovieDetails): string {
  const countryName = details.production_countries?.find((country) => country.name?.trim())?.name?.trim();
  if (countryName) return countryName;

  const productionCountryCode = details.production_countries?.find((country) => country.iso_3166_1?.trim())?.iso_3166_1?.trim();
  if (productionCountryCode) return productionCountryCode;

  return details.origin_country?.find((countryCode) => countryCode.trim())?.trim() ?? '';
}

function ratingsArrayToMap(ratings: Rating[] | undefined): Record<Member, number | null> {
  const initial = MEMBERS.reduce(
    (acc, member) => ({ ...acc, [member]: null }),
    {} as Record<Member, number | null>,
  );

  if (!ratings) {
    return initial;
  }

  return ratings.reduce((acc, rating) => {
    acc[rating.user] = rating.rating;
    return acc;
  }, initial);
}

function ratingsMapToArray(ratingsMap: Record<Member, number | null>): Rating[] | undefined {
  const ratings = MEMBERS.flatMap((member) => {
    const rating = ratingsMap[member];
    return rating === null ? [] : [{ user: member, rating }];
  });

  return ratings.length > 0 ? ratings : undefined;
}

function calculateAverage(ratingsMap: Record<Member, number | null>): number | undefined {
  const validRatings = Object.values(ratingsMap).filter((rating): rating is number => rating !== null);
  if (validRatings.length === 0) {
    return undefined;
  }

  const sum = validRatings.reduce((total, rating) => total + rating, 0);
  return sum / validRatings.length;
}

export function MovieForm({ movie, onSave, onClose, nextClubNumber, isSubmitting = false }: MovieFormProps) {
  const isAddMode = !movie;
  const PICKED_BY_OPTIONS: Member[] = ['Ren', 'Greg', 'Max', 'Quinn', 'Patio', 'Ian'];
  const [formData, setFormData] = useState<MovieFormState>({
    clubNumber: movie?.clubNumber ?? nextClubNumber,
    title: movie?.movie.title ?? '',
    pickedBy: movie?.pickedBy ?? '',
    monthWatched: movie ? (movie.monthWatched ?? '') : getCurrentMonth(),
    yearReleased: movie?.movie.yearReleased ?? '',
    yearWatched: movie?.yearWatched ?? new Date().getFullYear(),
    originCountry: movie?.movie.originCountry ?? '',
    streamingPlatform: movie?.streamingPlatform ?? '',
    runTime: formatRuntime(movie?.movie.runTime),
    mpaaRating: movie?.movie.mpaaRating ?? '',
    posterUrl: movie?.movie.posterUrl ?? '',
    backdropUrl: movie?.movie.backdropUrl ?? '',
    ratings: ratingsArrayToMap(movie?.ratings),
    notes: movie?.notes ?? '',
  });
  const [suggestions, setSuggestions] = useState<TmdbSearchMovie[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [selectedTmdbId, setSelectedTmdbId] = useState<number | null>(null);
  const [selectedTmdbTitle, setSelectedTmdbTitle] = useState<string | null>(null);
  const [isPickedByMenuOpen, setIsPickedByMenuOpen] = useState(false);
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [pickedByError, setPickedByError] = useState<string | null>(null);
  const [highlightedPickedByIndex, setHighlightedPickedByIndex] = useState(0);
  const [highlightedMonthIndex, setHighlightedMonthIndex] = useState(0);
  const titleContainerRef = useRef<HTMLDivElement | null>(null);
  const pickedByContainerRef = useRef<HTMLDivElement | null>(null);
  const pickedByButtonRef = useRef<HTMLButtonElement | null>(null);
  const pickedByOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const monthContainerRef = useRef<HTMLDivElement | null>(null);
  const monthButtonRef = useRef<HTMLButtonElement | null>(null);
  const monthOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const searchRequestIdRef = useRef(0);
  const detailsRequestIdRef = useRef(0);
  const skipSearchForTitleRef = useRef<string | null>(null);
  const isPickedByPlaceholder = formData.pickedBy === '';
  const isMonthPlaceholder = formData.monthWatched === '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumberInput = e.target instanceof HTMLInputElement && e.target.type === 'number';

    if (isAddMode && name === 'title' && selectedTmdbTitle && value.trim() !== selectedTmdbTitle) {
      setSelectedTmdbId(null);
      setSelectedTmdbTitle(null);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: isNumberInput ? (value ? Number(value) : '') : value,
    }));
  };

  const movePickedByHighlight = (delta: number) => {
    setHighlightedPickedByIndex((prev) => {
      const next = prev + delta;
      if (next < 0) return PICKED_BY_OPTIONS.length - 1;
      if (next >= PICKED_BY_OPTIONS.length) return 0;
      return next;
    });
  };

  const openPickedByMenu = (initialIndex: number) => {
    setIsPickedByMenuOpen(true);
    setHighlightedPickedByIndex(initialIndex);
  };

  const moveMonthHighlight = (delta: number) => {
    setHighlightedMonthIndex((prev) => {
      const next = prev + delta;
      if (next < 0) return MONTH_SELECT_OPTIONS.length - 1;
      if (next >= MONTH_SELECT_OPTIONS.length) return 0;
      return next;
    });
  };

  const openMonthMenu = (initialIndex: number) => {
    setIsMonthMenuOpen(true);
    setHighlightedMonthIndex(initialIndex);
  };

  const selectPickedBy = (member: Member) => {
    setFormData((prev) => ({ ...prev, pickedBy: member }));
    setPickedByError(null);
    setIsPickedByMenuOpen(false);
    window.requestAnimationFrame(() => pickedByButtonRef.current?.focus());
  };

  const selectMonth = (month: Month | '') => {
    setFormData((prev) => ({ ...prev, monthWatched: month }));
    setIsMonthMenuOpen(false);
    window.requestAnimationFrame(() => monthButtonRef.current?.focus());
  };

  const handleRatingChange = (member: Member, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [member]: value === '' ? null : Number(value),
      },
    }));
  };

  const handleSuggestionSelect = async (match: TmdbSearchMovie) => {
    const searchReleaseYear = parseReleaseYear(match.release_date);
    skipSearchForTitleRef.current = match.title.trim();
    setSelectedTmdbId(match.id);
    setSelectedTmdbTitle(match.title.trim());

    setIsSuggestionsOpen(false);
    setSuggestions([]);
    setSearchError(null);

    setFormData((prev) => ({
      ...prev,
      title: match.title || prev.title,
      yearReleased: searchReleaseYear ?? prev.yearReleased,
      posterUrl: toTmdbImageUrl(match.poster_path, 'w154') || prev.posterUrl,
      backdropUrl: toTmdbImageUrl(match.backdrop_path, 'w1280') || prev.backdropUrl,
    }));

    const requestId = ++detailsRequestIdRef.current;
    setIsFetchingDetails(true);

    try {
      const details = await tmdb.getMovieDetails(match.id);
      if (requestId !== detailsRequestIdRef.current) return;

      const detailsReleaseYear = parseReleaseYear(details.release_date);
      const originCountry = getOriginCountry(details);
      const runTime = formatRuntime(details.runtime);

      setFormData((prev) => ({
        ...prev,
        yearReleased: detailsReleaseYear ?? prev.yearReleased,
        originCountry: originCountry || prev.originCountry,
        runTime: runTime || prev.runTime,
        posterUrl: toTmdbImageUrl(details.poster_path, 'w154') || prev.posterUrl,
        backdropUrl: toTmdbImageUrl(details.backdrop_path, 'w1280') || prev.backdropUrl,
      }));
    } catch {
      // Keep already selected values if details lookup fails.
    } finally {
      if (requestId === detailsRequestIdRef.current) {
        setIsFetchingDetails(false);
      }
    }
  };

  useEffect(() => {
    if (!isAddMode) return;

    const query = formData.title.trim();
    if (skipSearchForTitleRef.current && query === skipSearchForTitleRef.current) {
      skipSearchForTitleRef.current = null;
      setIsSearching(false);
      setSearchError(null);
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }

    if (query.length < MIN_SEARCH_CHARS) {
      setIsSearching(false);
      setSearchError(null);
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }

    const requestId = ++searchRequestIdRef.current;
    setIsSearching(true);
    setSearchError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await tmdb.searchMovie(query);
        if (requestId !== searchRequestIdRef.current) return;

        setSuggestions(data.results.slice(0, MAX_RESULTS));
        setIsSuggestionsOpen(true);
      } catch {
        if (requestId !== searchRequestIdRef.current) return;

        setSuggestions([]);
        setSearchError('Unable to fetch movie suggestions.');
        setIsSuggestionsOpen(true);
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setIsSearching(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [formData.title, isAddMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isAddMode && titleContainerRef.current && !titleContainerRef.current.contains(target)) {
        setIsSuggestionsOpen(false);
      }
      if (pickedByContainerRef.current && !pickedByContainerRef.current.contains(target)) {
        setIsPickedByMenuOpen(false);
      }
      if (monthContainerRef.current && !monthContainerRef.current.contains(target)) {
        setIsMonthMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAddMode]);

  useEffect(() => {
    if (!isPickedByMenuOpen) return;
    const option = pickedByOptionRefs.current[highlightedPickedByIndex];
    option?.focus();
  }, [highlightedPickedByIndex, isPickedByMenuOpen]);

  useEffect(() => {
    if (!isMonthMenuOpen) return;
    const option = monthOptionRefs.current[highlightedMonthIndex];
    option?.focus();
  }, [highlightedMonthIndex, isMonthMenuOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pickedBy) {
      setPickedByError('Please select who picked this movie.');
      setIsPickedByMenuOpen(false);
      return;
    }
    setPickedByError(null);

    const ratings = ratingsMapToArray(formData.ratings);

    const payload: NewLogEntry = {
      clubNumber: Number(formData.clubNumber),
      movie: {
        title: formData.title.trim(),
        yearReleased: Number(formData.yearReleased),
        originCountry: formData.originCountry.trim() || undefined,
        runTime: parseRuntimeToMinutes(formData.runTime),
        mpaaRating: formData.mpaaRating.trim() || undefined,
        tmdbId: selectedTmdbId ?? undefined,
        posterUrl: formData.posterUrl.trim() || undefined,
        backdropUrl: formData.backdropUrl.trim() || undefined,
      },
      pickedBy: formData.pickedBy as Member,
      monthWatched: formData.monthWatched || undefined,
      yearWatched: Number(formData.yearWatched),
      streamingPlatform: formData.streamingPlatform.trim() || undefined,
      ratings,
      averageRating: calculateAverage(formData.ratings),
      notes: formData.notes.trim(),
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="bg-[var(--color-cinema-dark)] border border-[var(--color-gold-600)]/30 rounded-2xl w-full max-w-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-cinema-gray)]">
            <h2 className="text-2xl font-serif text-[var(--color-gold-400)]">
              {movie ? 'Edit Movie Record' : 'Add New Movie'}
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--color-silver-500)] hover:text-white transition-colors p-2 rounded-full hover:bg-[var(--color-cinema-gray)]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative" ref={titleContainerRef}>
                <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">Title</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onFocus={() => {
                    if (!isAddMode) return;
                    const query = formData.title.trim();
                    const canOpen = query.length >= MIN_SEARCH_CHARS && (suggestions.length > 0 || isSearching || !!searchError);
                    if (canOpen) setIsSuggestionsOpen(true);
                  }}
                  className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
                  placeholder="e.g. Parasite"
                />
                {isAddMode && isSuggestionsOpen && (
                  <div className="absolute left-0 right-0 mt-1 rounded-lg border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] shadow-[0_12px_24px_rgba(0,0,0,0.45)] z-30 overflow-hidden">
                    {isSearching ? (
                      <p className="px-4 py-3 text-sm text-[var(--color-silver-400)]">Searching...</p>
                    ) : searchError ? (
                      <p className="px-4 py-3 text-sm text-red-300">{searchError}</p>
                    ) : suggestions.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-[var(--color-silver-400)]">No matches found.</p>
                    ) : (
                      <ul className="divide-y divide-[var(--color-cinema-gray)]">
                        {suggestions.map((match) => {
                          const releaseYear = parseReleaseYear(match.release_date);
                          return (
                            <li key={match.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  void handleSuggestionSelect(match);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[var(--color-cinema-gray)]/70 transition-colors"
                              >
                                <div className="w-10 h-14 rounded overflow-hidden border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)] shrink-0">
                                  {match.poster_path ? (
                                    <img
                                      src={toTmdbImageUrl(match.poster_path, 'w92')}
                                      alt={`${match.title} poster`}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[var(--color-silver-500)]">
                                      <Film size={14} />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm text-white truncate">{match.title}</p>
                                  <p className="text-xs text-[var(--color-silver-400)]">
                                    {releaseYear ?? 'Unknown year'}
                                  </p>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
                {isAddMode && isFetchingDetails && (
                  <p className="text-xs text-[var(--color-silver-500)]">Fetching movie details...</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">Club Movie #</label>
                <input
                  required
                  type="number"
                  name="clubNumber"
                  value={formData.clubNumber}
                  onChange={handleChange}
                  className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">Year Released</label>
                <input
                  required
                  type="number"
                  name="yearReleased"
                  value={formData.yearReleased}
                  onChange={handleChange}
                  className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all font-mono"
                  placeholder="e.g. 2000"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">Picked By</label>
                <div className="relative" ref={pickedByContainerRef}>
                  <button
                    ref={pickedByButtonRef}
                    type="button"
                    aria-haspopup="listbox"
                    aria-controls="picked-by-listbox"
                    aria-expanded={isPickedByMenuOpen}
                    onClick={() => {
                      if (isPickedByMenuOpen) {
                        setIsPickedByMenuOpen(false);
                        return;
                      }
                      const selectedIndex = PICKED_BY_OPTIONS.indexOf(formData.pickedBy as Member);
                      openPickedByMenu(selectedIndex >= 0 ? selectedIndex : 0);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        const selectedIndex = PICKED_BY_OPTIONS.indexOf(formData.pickedBy as Member);
                        openPickedByMenu(selectedIndex >= 0 ? selectedIndex : 0);
                        return;
                      }
                      if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        const selectedIndex = PICKED_BY_OPTIONS.indexOf(formData.pickedBy as Member);
                        openPickedByMenu(selectedIndex >= 0 ? selectedIndex : PICKED_BY_OPTIONS.length - 1);
                        return;
                      }
                      if (event.key === 'Escape') {
                        setIsPickedByMenuOpen(false);
                      }
                    }}
                    className={`w-full bg-[var(--color-cinema-black)] border rounded-lg pl-4 pr-10 py-3 md:py-2 min-h-11 text-left focus:outline-none focus:ring-1 transition-all text-sm md:text-base ${
                      pickedByError
                        ? 'border-red-400/80 focus:border-red-300 focus:ring-red-300/60'
                        : 'border-[var(--color-cinema-gray)] focus:border-[var(--color-gold-500)] focus:ring-[var(--color-gold-500)]'
                    } ${isPickedByPlaceholder ? 'text-[var(--color-silver-500)]' : 'text-white'}`}
                  >
                    {isPickedByPlaceholder ? 'Select member' : formData.pickedBy}
                  </button>
                  <ChevronDown
                    size={16}
                    className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-transform text-[var(--color-silver-400)] ${
                      isPickedByMenuOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                  {isPickedByMenuOpen && (
                    <div
                      id="picked-by-listbox"
                      role="listbox"
                      aria-label="Picked by"
                      className="absolute left-0 right-0 mt-1 z-40 max-h-64 overflow-y-auto rounded-lg border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
                    >
                      {PICKED_BY_OPTIONS.map((member, index) => {
                        const isSelected = formData.pickedBy === member;
                        return (
                          <button
                            key={member}
                            ref={(element) => {
                              pickedByOptionRefs.current[index] = element;
                            }}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => selectPickedBy(member)}
                            onMouseEnter={() => setHighlightedPickedByIndex(index)}
                            onKeyDown={(event) => {
                              if (event.key === 'ArrowDown') {
                                event.preventDefault();
                                movePickedByHighlight(1);
                                return;
                              }
                              if (event.key === 'ArrowUp') {
                                event.preventDefault();
                                movePickedByHighlight(-1);
                                return;
                              }
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                selectPickedBy(member);
                                return;
                              }
                              if (event.key === 'Escape') {
                                event.preventDefault();
                                setIsPickedByMenuOpen(false);
                                window.requestAnimationFrame(() => pickedByButtonRef.current?.focus());
                                return;
                              }
                              if (event.key === 'Tab') {
                                setIsPickedByMenuOpen(false);
                              }
                            }}
                            className={`w-full text-left px-4 py-3 text-sm md:text-base transition-colors ${
                              highlightedPickedByIndex === index
                                ? 'bg-[var(--color-cinema-gray)] text-white'
                                : 'text-[var(--color-silver-300)]'
                            } ${isSelected ? 'font-semibold text-[var(--color-gold-400)]' : ''}`}
                          >
                            {member}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {pickedByError && <p className="text-xs text-red-300">{pickedByError}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">Year Watched</label>
                <input
                  required
                  type="number"
                  name="yearWatched"
                  value={formData.yearWatched}
                  onChange={handleChange}
                  className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">Month Watched</label>
                <div className="relative" ref={monthContainerRef}>
                  <button
                    ref={monthButtonRef}
                    type="button"
                    aria-haspopup="listbox"
                    aria-controls="month-watched-listbox"
                    aria-expanded={isMonthMenuOpen}
                    onClick={() => {
                      if (isMonthMenuOpen) {
                        setIsMonthMenuOpen(false);
                        return;
                      }
                      const selectedIndex = MONTH_SELECT_OPTIONS.indexOf(formData.monthWatched);
                      openMonthMenu(selectedIndex >= 0 ? selectedIndex : 0);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        const selectedIndex = MONTH_SELECT_OPTIONS.indexOf(formData.monthWatched);
                        openMonthMenu(selectedIndex >= 0 ? selectedIndex : 0);
                        return;
                      }
                      if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        const selectedIndex = MONTH_SELECT_OPTIONS.indexOf(formData.monthWatched);
                        openMonthMenu(selectedIndex >= 0 ? selectedIndex : MONTH_SELECT_OPTIONS.length - 1);
                        return;
                      }
                      if (event.key === 'Escape') {
                        setIsMonthMenuOpen(false);
                      }
                    }}
                    className={`w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg pl-4 pr-10 py-3 md:py-2 min-h-11 text-left focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all text-sm md:text-base ${
                      isMonthPlaceholder ? 'text-[var(--color-silver-500)]' : 'text-white'
                    }`}
                  >
                    {isMonthPlaceholder ? 'Select month' : formData.monthWatched}
                  </button>
                  <ChevronDown
                    size={16}
                    className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-transform text-[var(--color-silver-400)] ${
                      isMonthMenuOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                  {isMonthMenuOpen && (
                    <div
                      id="month-watched-listbox"
                      role="listbox"
                      aria-label="Month watched"
                      className="absolute left-0 right-0 mt-1 z-40 max-h-64 overflow-y-auto rounded-lg border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
                    >
                      {MONTH_SELECT_OPTIONS.map((month, index) => {
                        const isSelected = formData.monthWatched === month;
                        const label = month || 'No month';
                        return (
                          <button
                            key={month || 'no-month'}
                            ref={(element) => {
                              monthOptionRefs.current[index] = element;
                            }}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => selectMonth(month)}
                            onMouseEnter={() => setHighlightedMonthIndex(index)}
                            onKeyDown={(event) => {
                              if (event.key === 'ArrowDown') {
                                event.preventDefault();
                                moveMonthHighlight(1);
                                return;
                              }
                              if (event.key === 'ArrowUp') {
                                event.preventDefault();
                                moveMonthHighlight(-1);
                                return;
                              }
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                selectMonth(month);
                                return;
                              }
                              if (event.key === 'Escape') {
                                event.preventDefault();
                                setIsMonthMenuOpen(false);
                                window.requestAnimationFrame(() => monthButtonRef.current?.focus());
                                return;
                              }
                              if (event.key === 'Tab') {
                                setIsMonthMenuOpen(false);
                              }
                            }}
                            className={`w-full text-left px-4 py-3 text-sm md:text-base transition-colors ${
                              highlightedMonthIndex === index
                                ? 'bg-[var(--color-cinema-gray)] text-white'
                                : month
                                  ? 'text-[var(--color-silver-300)]'
                                  : 'text-[var(--color-silver-500)]'
                            } ${isSelected ? 'font-semibold text-[var(--color-gold-400)]' : ''}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">Origin Country</label>
                <input
                  required
                  type="text"
                  name="originCountry"
                  value={formData.originCountry}
                  onChange={handleChange}
                  className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
                  placeholder="e.g. South Korea"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">Streaming Platform</label>
                <input
                  required
                  type="text"
                  name="streamingPlatform"
                  value={formData.streamingPlatform}
                  onChange={handleChange}
                  className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
                  placeholder="e.g. Max, Criterion"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">Run Time</label>
                <input
                  type="text"
                  name="runTime"
                  value={formData.runTime}
                  onChange={handleChange}
                  className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
                  placeholder="e.g. 2h 12m"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">MPAA Rating</label>
                <input
                  type="text"
                  name="mpaaRating"
                  value={formData.mpaaRating}
                  onChange={handleChange}
                  className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
                  placeholder="e.g. R, PG-13"
                />
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">Poster Image URL</label>
              <input
                type="url"
                name="posterUrl"
                value={formData.posterUrl}
                onChange={handleChange}
                className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
                placeholder="https://example.com/poster.jpg"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">Backdrop Image URL</label>
              <input
                type="url"
                name="backdropUrl"
                value={formData.backdropUrl}
                onChange={handleChange}
                className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
                placeholder="https://example.com/backdrop.jpg"
              />
            </div>

            <div className="pt-6 border-t border-[var(--color-cinema-gray)]">
              <h3 className="text-sm font-serif text-[var(--color-gold-400)] mb-4">Member Ratings (0-10)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {MEMBERS.map((member) => (
                  <div key={member} className="space-y-2">
                    <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">{member}</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formData.ratings[member] === null ? '' : formData.ratings[member]}
                      onChange={(e) => handleRatingChange(member, e.target.value)}
                      className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all font-mono text-center"
                      placeholder="-"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full resize-y bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
                placeholder="Add discussion notes, context, or observations..."
              />
            </div>

            <div className="pt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-full border border-[var(--color-cinema-gray)] text-[var(--color-silver-300)] hover:bg-[var(--color-cinema-gray)] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-full bg-[var(--color-gold-500)] text-black hover:bg-[var(--color-gold-400)] transition-colors font-semibold shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
