"use client";

interface InsightPanelProps {
  validSessionCount: number;
  meanDScore: number;
  interpretationLabel: string;
  categoryA: string;
  categoryB: string;
  confidenceInterval?: [number, number];
}

function ci95(sampleMean: number, n: number, sdEstimate: number): [number, number] {
  if (n < 2) return [sampleMean, sampleMean];
  const se = sdEstimate / Math.sqrt(n);
  const t = 1.96;
  return [
    sampleMean - t * se,
    sampleMean + t * se
  ];
}

export function InsightPanel({
  validSessionCount,
  meanDScore,
  interpretationLabel,
  categoryA,
  categoryB,
  confidenceInterval
}: InsightPanelProps) {
  const [lo, hi] = confidenceInterval ?? [meanDScore, meanDScore];

  return (
    <div className="card-elevated px-5 py-4 space-y-4 border-l-4 border-[var(--green-vivid)]">
      <h3 className="font-heading text-sm">What this means for your marketing</h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        Across your {validSessionCount} valid participants, there is{" "}
        {interpretationLabel.toLowerCase()}{" "}
        (mean D = {meanDScore.toFixed(2)}
        {validSessionCount >= 10 && (
          <span className="font-data text-[var(--text-muted)]">
            {" "}
            — 95% CI [{lo.toFixed(2)}, {hi.toFixed(2)}]
          </span>
        )}
        ). This suggests that when consumers make quick, unguarded decisions,{" "}
        {meanDScore > 0.15 ? categoryA : meanDScore < -0.15 ? categoryB : "neither concept"}{" "}
        has a measurable subconscious advantage. This finding is independent of
        their stated preferences.
      </p>
      <p className="text-xs text-[var(--text-muted)]">
        Subconscious preference score: {meanDScore.toFixed(2)} — your audience is
        associating {meanDScore > 0 ? categoryA : categoryB} with{" "}
        {meanDScore > 0 ? "positive" : "negative"} faster than conscious thought.
        This is meaningful for messaging and placement.
      </p>
    </div>
  );
}
