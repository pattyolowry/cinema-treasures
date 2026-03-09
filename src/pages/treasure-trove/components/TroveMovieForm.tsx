import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { X } from 'lucide-react';
import { TROVE_MEMBERS } from '../data';
import type { TroveMember, TroveMovieRecord } from '../types';

interface TroveMovieFormProps {
  movie?: TroveMovieRecord | null;
  onSave: (movie: Omit<TroveMovieRecord, 'id' | 'averageRating'>) => void;
  onClose: () => void;
}

export function TroveMovieForm({ movie, onSave, onClose }: TroveMovieFormProps) {
  const [formData, setFormData] = useState({
    title: movie?.title || '',
    yearReleased: movie?.yearReleased || new Date().getFullYear(),
    originCountry: movie?.originCountry || '',
    runTime: movie?.runTime || '',
    mpaaRating: movie?.mpaaRating || '',
    posterUrl: movie?.posterUrl || '',
    ratings: movie?.ratings || TROVE_MEMBERS.reduce((acc, member) => ({ ...acc, [member]: null }), {} as Record<TroveMember, number | null>),
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : '') : value,
    }));
  };

  const handleRatingChange = (member: TroveMember, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [member]: value === '' ? null : Number(value),
      },
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<TroveMovieRecord, 'id' | 'averageRating'>);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="bg-[var(--color-cinema-dark)] border border-[var(--color-gold-600)]/30 rounded-2xl w-full max-w-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-cinema-gray)]">
            <h2 className="text-2xl font-serif text-[var(--color-gold-400)]">{movie ? 'Edit Trove Entry' : 'Add Trove Entry'}</h2>
            <button
              onClick={onClose}
              className="text-[var(--color-silver-500)] hover:text-white transition-colors p-2 rounded-full hover:bg-[var(--color-cinema-gray)]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">Title</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
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
              />
            </div>

            <div className="pt-6 border-t border-[var(--color-cinema-gray)]">
              <h3 className="text-sm font-serif text-[var(--color-gold-400)] mb-4">Member Ratings (0-10)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {TROVE_MEMBERS.map((member) => (
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
                Save Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
