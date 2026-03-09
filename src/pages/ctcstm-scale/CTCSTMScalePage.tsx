const CTCSTM_SCALE = [
  { score: 1, label: 'Dirt' },
  { score: 2, label: 'Gravel' },
  { score: 3, label: 'Sand' },
  { score: 4, label: 'Wood' },
  { score: 5, label: 'Ivory' },
  { score: 6, label: 'Bronze' },
  { score: 7, label: 'Silver' },
  { score: 8, label: 'Gold' },
  { score: 9, label: 'Diamond' },
  { score: 10, label: 'National Treasure' },
];

export default function CTCSTMScalePage() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-serif text-white">CTCSTM Scale</h2>
        <p className="mt-3 text-[var(--color-silver-400)] max-w-2xl">
          Our club rates each film from 1 to 10 on the Cinema Treasures Club Standard Treasure Measurement (CTCSTM) scale. The official rating scale is as follows:
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CTCSTM_SCALE.map((entry) => (
          <article
            key={entry.score}
            className="flex items-center justify-between rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/90 px-5 py-4 shadow-lg"
          >
            <span className="font-mono text-lg text-[var(--color-gold-400)]">{entry.score}</span>
            <span className="text-lg sm:text-xl font-serif text-white">{entry.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
