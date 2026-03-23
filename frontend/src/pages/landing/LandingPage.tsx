import { Link } from 'react-router-dom';
import { ArrowRight, Film } from 'lucide-react';

export default function LandingPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-10 sm:py-14 lg:py-16">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-cinema-gray)] min-h-[60vh] sm:min-h-[65vh]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/landing-hero.jpg')" }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/70"
          aria-hidden="true"
        />

        <div className="relative z-10 px-6 py-20 sm:px-10 sm:py-24 lg:px-14 lg:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/60 px-4 py-1.5 text-xs tracking-widest uppercase text-[var(--color-silver-400)]">
            <Film size={14} className="text-[var(--color-gold-400)]" />
            A Film Club
          </div>

          <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-tight text-white sm:text-6xl">
            A celebration of the fine art of cinema
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-[var(--color-silver-300)]">
            Established 2023
          </p>

          <div className="mt-10">
            <Link
              to="/history"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold-500)] px-6 py-3 font-semibold text-black transition-colors hover:bg-[var(--color-gold-400)]"
            >
              Film Log
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
