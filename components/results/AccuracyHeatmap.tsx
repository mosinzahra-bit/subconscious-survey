"use client";

interface AccuracyHeatmapProps {
  blockAccuracy: { blockIndex: number; correct: number; total: number }[];
}

const BLOCK_LABELS = [
  "Block 1 (Target)",
  "Block 2 (Attribute)",
  "Block 3 (Combined P)",
  "Block 4 (Combined P Test)",
  "Block 5 (Reversed)",
  "Block 6 (Combined I P)",
  "Block 7 (Combined I Test)"
];

export function AccuracyHeatmap({ blockAccuracy }: AccuracyHeatmapProps) {
  const maxTotal = Math.max(
    ...blockAccuracy.map((b) => b.total),
    1
  );
  const rows = blockAccuracy.map((b) => ({
    ...b,
    label: BLOCK_LABELS[b.blockIndex] ?? `Block ${b.blockIndex + 1}`,
    rate: b.total > 0 ? b.correct / b.total : 0
  }));

  return (
    <div className="card-elevated px-4 py-4 space-y-3">
      <h3 className="font-heading text-sm">Trial-level accuracy by block</h3>
      <p className="text-[11px] text-[var(--text-secondary)] max-w-xl">
        Shows whether a particular block caused unusual difficulty. High
        error rates in combined blocks are expected; we apply a 600ms
        penalty and still use the trial.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[var(--text-muted)] font-data uppercase tracking-[0.12em]">
              <th className="text-left py-2 pr-4">Block</th>
              <th className="text-right py-2">Correct</th>
              <th className="text-right py-2">Total</th>
              <th className="text-right py-2">Accuracy</th>
              <th className="w-32 pl-2">Heat</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.blockIndex} className="border-t border-[var(--border)]">
                <td className="py-2 pr-4 text-[var(--text-secondary)]">
                  {r.label}
                </td>
                <td className="text-right font-data">{r.correct}</td>
                <td className="text-right font-data">{r.total}</td>
                <td className="text-right font-data">
                  {r.total > 0 ? `${(r.rate * 100).toFixed(1)}%` : "—"}
                </td>
                <td className="pl-2">
                  <div
                    className="h-5 rounded-sm transition-opacity"
                    style={{
                      width: `${Math.min(100, (r.total / maxTotal) * 100)}%`,
                      backgroundColor:
                        r.rate >= 0.9
                          ? "var(--green-muted)"
                          : r.rate >= 0.7
                          ? "var(--green-deep)"
                          : r.rate >= 0.5
                          ? "var(--gold)"
                          : "var(--red-alert)"
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
