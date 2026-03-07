"use client";

export function PassiveDataDisclaimer() {
  return (
    <div className="card px-4 py-3 border-[var(--gold)]/50 bg-[var(--bg-elevated)]">
      <p className="text-[10px] font-data uppercase tracking-[0.2em] text-[var(--gold)] mb-2">
        Passive Intelligence mode — population-level linguistic patterns
      </p>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        This study uses behavioral linguistics analysis of publicly available,
        aggregated online language. No individuals are tracked or identified.
        Results are pattern-based estimates of population-level associations,
        not measured reaction times. Treat as directional intelligence, not
        clinical precision.
      </p>
    </div>
  );
}
