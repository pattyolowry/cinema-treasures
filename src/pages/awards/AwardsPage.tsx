import { useMemo, useState } from 'react';
import { Award } from 'lucide-react';
import { useAppSession } from '../../context/AppSessionContext';
import { DUMMY_AWARDS } from './data';

export default function AwardsPage() {
  const { currentUser } = useAppSession();
  const isLoggedIn = currentUser !== null;

  const sortedYears = useMemo(
    () => [...DUMMY_AWARDS].sort((a, b) => b.year - a.year),
    [],
  );

  const mostRecentYear = sortedYears[0]?.year ?? new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(mostRecentYear);

  const selectedYearData = useMemo(
    () => sortedYears.find((entry) => entry.year === selectedYear) ?? sortedYears[0] ?? null,
    [selectedYear, sortedYears],
  );

  const visibleCategories = useMemo(() => {
    if (!selectedYearData) return [];
    if (isLoggedIn) return selectedYearData.categories;
    return selectedYearData.categories.filter((category) => category.isVisible);
  }, [isLoggedIn, selectedYearData]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-serif text-white flex items-center gap-3">
            <Award className="text-[var(--color-gold-500)]" size={28} />
            Golden Treasures
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[var(--color-silver-400)]">
            Annual club awards honoring the standout films and performances of each year.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm text-[var(--color-silver-300)]">
          <span className="font-semibold uppercase tracking-wider text-[var(--color-silver-500)]">Year</span>
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
            aria-label="Select awards year"
          >
            {sortedYears.map((entry) => (
              <option key={entry.year} value={entry.year}>
                {entry.year}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedYearData && visibleCategories.length > 0 && (
        <div className="grid grid-cols-1 gap-5">
          {visibleCategories.map((category) => (
            <article
              key={category.name}
              className="rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/80 p-5"
            >
              <h3 className="text-xl font-serif uppercase tracking-wide text-[var(--color-gold-400)] [text-shadow:0_1px_6px_rgba(255,255,255,0.55)] mb-4">
                {category.name}
              </h3>
              <ul className="space-y-2">
                {category.nominees.map((nominee) => (
                  <li
                    key={nominee.name}
                    className={`flex items-start justify-between gap-3 rounded-lg px-3 py-2 border ${
                      nominee.isWinner
                        ? 'border-[var(--color-gold-500)] bg-[var(--color-gold-600)]/20'
                        : 'border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)]/60'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`${nominee.isWinner ? 'font-bold text-[var(--color-gold-300)]' : 'text-[var(--color-silver-300)]'}`}>
                        {nominee.name}
                      </p>
                      {nominee.subText && (
                        <p className="mt-0.5 text-sm text-[var(--color-silver-500)] truncate">
                          {nominee.subText}
                        </p>
                      )}
                    </div>
                    {nominee.isWinner && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-400)] shrink-0">
                        Winner
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      {!selectedYearData && (
        <div className="rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/80 p-8 text-center text-[var(--color-silver-500)]">
          No awards data available.
        </div>
      )}

      {selectedYearData && visibleCategories.length === 0 && (
        <div className="rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/80 p-8 text-center text-[var(--color-silver-500)]">
          No award categories are visible for this year.
        </div>
      )}
    </section>
  );
}
