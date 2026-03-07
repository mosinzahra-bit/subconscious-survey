export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-3xl w-full space-y-10 text-center">
        <div className="space-y-3">
          <p className="badge mx-auto w-fit">
            Husbar · Behavioral Intelligence Platform
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl tracking-tight">
            Measure what surveys can&apos;t.
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto">
            Subconscious Survey runs research-grade Implicit Association Tests
            and passive linguistic analysis to reveal the associations your
            audience won&apos;t put in a form — and turns them into a complete,
            executable strategy.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
          <div className="card p-5 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-[var(--text-muted)] font-data">
                Mode 1
              </span>
              <span className="badge text-[var(--green-soft)]">
                ● Behavioral Data
              </span>
            </div>
            <h2 className="font-heading text-lg">Live IAT Studies</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              7-block, reaction-time IATs built on the Harvard protocol. 
              Participants respond in 3–5 minutes; you see population-level 
              implicit preference scores.
            </p>
          </div>
          <div className="card p-5 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-[var(--text-muted)] font-data">
                Mode 2
              </span>
              <span className="badge text-[var(--gold)] border-[var(--gold)]/60">
                ◈ Linguistic Signals
              </span>
            </div>
            <h2 className="font-heading text-lg">Passive Intelligence</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Behavioral linguistics over Reddit threads, reviews, and social text
              to estimate association patterns when no one thinks they&apos;re 
              being surveyed.
            </p>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] max-w-xl mx-auto">
          Built by psychologists who learned to code, not the other way around.
          Log in to create a study, or jump into the demo dashboard seeded with
          a Nike vs Adidas brand preference test.
        </p>
      </div>
    </main>
  );
}

