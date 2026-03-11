import React, { useEffect, useRef, useState } from 'react';
import { Film, X } from 'lucide-react';
import { Member, MovieRecord, TmdbMovieDetails, TmdbSearchMovie } from '../../../types';
import { MEMBERS } from '../../../data';
import tmdb from '../../../services/tmdb';

interface MovieFormProps {
  movie?: MovieRecord | null;
  onSave: (movie: Omit<MovieRecord, 'id' | 'averageRating'>) => void;
  onClose: () => void;
  nextClubNumber: number;
}

const TMDB_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/';
const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_CHARS = 2;
const MAX_RESULTS = 3;

function toTmdbImageUrl(path: string | null | undefined, size: string): string {
  if (!path) return '';
  return `${TMDB_POSTER_BASE_URL}${size}${path}`;
}

function parseReleaseYear(releaseDate: string | undefined): number | null {
  if (!releaseDate) return null;
  const year = Number.parseInt(releaseDate.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

function formatRuntime(minutes: number | null): string {
  if (!minutes || minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

function getOriginCountry(details: TmdbMovieDetails): string {
  const countryName = details.production_countries?.find((country) => country.name?.trim())?.name?.trim();
  if (countryName) return countryName;

  const productionCountryCode = details.production_countries?.find((country) => country.iso_3166_1?.trim())?.iso_3166_1?.trim();
  if (productionCountryCode) return productionCountryCode;

  return details.origin_country?.find((countryCode) => countryCode.trim())?.trim() ?? '';
}

export function MovieForm({ movie, onSave, onClose, nextClubNumber }: MovieFormProps) {
  const isAddMode = !movie;
  const [formData, setFormData] = useState({
    clubNumber: movie?.clubNumber || nextClubNumber,
    title: movie?.title || '',
    yearReleased: movie?.yearReleased || '',
    yearWatched: movie?.yearWatched || new Date().getFullYear(),
    originCountry: movie?.originCountry || '',
    streamingPlatform: movie?.streamingPlatform || '',
    runTime: movie?.runTime || '',
    mpaaRating: movie?.mpaaRating || '',
    posterUrl: movie?.posterUrl || '',
    backdropUrl: movie?.backdropUrl || '',
    ratings: movie?.ratings || MEMBERS.reduce((acc, member) => ({ ...acc, [member]: null }), {} as Record<Member, number | null>),
  });
  const [suggestions, setSuggestions] = useState<TmdbSearchMovie[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const titleContainerRef = useRef<HTMLDivElement | null>(null);
  const searchRequestIdRef = useRef(0);
  const detailsRequestIdRef = useRef(0);
  const skipSearchForTitleRef = useRef<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : '') : value,
    }));
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

    setIsSuggestionsOpen(false);
    setSuggestions([]);
    setSearchError(null);

    setFormData((prev) => ({
      ...prev,
      title: match.title || prev.title,
      yearReleased: searchReleaseYear ?? prev.yearReleased,
      posterUrl: toTmdbImageUrl(match.poster_path, 'w500') || prev.posterUrl,
      backdropUrl: toTmdbImageUrl(match.backdrop_path, 'original') || prev.backdropUrl,
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
        posterUrl: toTmdbImageUrl(details.poster_path, 'w500') || prev.posterUrl,
        backdropUrl: toTmdbImageUrl(details.backdrop_path, 'original') || prev.backdropUrl,
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
    if (!isAddMode) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (titleContainerRef.current && !titleContainerRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAddMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<MovieRecord, 'id' | 'averageRating'>);
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
              {MEMBERS.map(member => (
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
              className="px-6 py-2 rounded-full bg-[var(--color-gold-500)] text-black hover:bg-[var(--color-gold-400)] transition-colors font-semibold shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
