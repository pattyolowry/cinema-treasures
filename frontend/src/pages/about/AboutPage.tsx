import { Info } from 'lucide-react';
import { MEMBER_PROFILES } from './data';

export default function AboutPage() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <h2 className="text-3xl font-serif text-white flex items-center gap-3">
          <Info className="text-[var(--color-gold-500)]" size={28} />
          About The Club
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[var(--color-silver-400)]">
          Six best friends with a shared love of cinema. Meet the members behind Cinema Treasures.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MEMBER_PROFILES.map((member) => (
          <article
            key={member.name}
            className="rounded-2xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/85 shadow-[0_8px_24px_rgba(0,0,0,0.35)] overflow-hidden"
          >
            <div className="p-5 border-b border-[var(--color-cinema-gray)] bg-gradient-to-r from-[var(--color-cinema-black)] to-[var(--color-cinema-dark)]">
              <div className="flex items-center gap-4">
                <img
                  src={member.photoUrl}
                  alt={`${member.name} profile`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[var(--color-gold-500)]/60 shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-xl font-serif text-white leading-tight">{member.name}</h3>
                  <p className="mt-1 text-sm uppercase tracking-wider text-[var(--color-gold-400)]">{member.title}</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-silver-500)] mb-3">
                4 Favorites
              </p>
              <div className="grid grid-cols-2 gap-3">
                {member.favorites.map((favorite) => (
                  <div
                    key={favorite.posterUrl}
                    className="aspect-[2/3] rounded-lg overflow-hidden border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)]"
                  >
                    <img
                      src={favorite.posterUrl}
                      alt={favorite.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
