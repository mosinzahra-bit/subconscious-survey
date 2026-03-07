"use client";

interface AssociationMapProps {
  categoryA: string;
  categoryB: string;
  associationMap: Record<
    string,
    { positive: number; negative: number }
  >;
}

export function AssociationMap({
  categoryA,
  categoryB,
  associationMap
}: AssociationMapProps) {
  const a = associationMap[categoryA] ?? { positive: 0.5, negative: 0.5 };
  const b = associationMap[categoryB] ?? { positive: 0.5, negative: 0.5 };

  const strokeWidth = (strength: number) =>
    Math.max(2, Math.min(12, 2 + strength * 10));

  return (
    <div className="card-elevated px-4 py-4 space-y-3">
      <h3 className="font-heading text-sm">Aggregate association map</h3>
      <p className="text-[11px] text-[var(--text-secondary)] max-w-xl">
        Line thickness reflects implicit association strength: how strongly
        each concept is linked to positive vs negative in the aggregate.
      </p>
      <div className="flex items-center justify-center py-6">
        <svg
          viewBox="0 0 320 160"
          className="w-full max-w-md h-48"
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="pos" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--green-muted)" />
              <stop offset="100%" stopColor="var(--green-vivid)" />
            </linearGradient>
            <linearGradient id="neg" x1="0%" y2="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--red-alert)" />
              <stop offset="100%" stopColor="var(--gold)" />
            </linearGradient>
          </defs>
          {/* Concept nodes */}
          <circle
            cx="80"
            cy="80"
            r="36"
            fill="var(--bg-elevated)"
            stroke="var(--border-bright)"
            strokeWidth="2"
          />
          <text
            x="80"
            y="78"
            textAnchor="middle"
            className="font-heading text-sm fill-[var(--text-primary)]"
            style={{ fontSize: 12 }}
          >
            {categoryA}
          </text>
          <circle
            cx="240"
            cy="80"
            r="36"
            fill="var(--bg-elevated)"
            stroke="var(--border-bright)"
            strokeWidth="2"
          />
          <text
            x="240"
            y="78"
            textAnchor="middle"
            className="font-heading text-sm fill-[var(--text-primary)]"
            style={{ fontSize: 12 }}
          >
            {categoryB}
          </text>
          {/* Positive / Negative labels */}
          <text
            x="80"
            y="128"
            textAnchor="middle"
            fill="var(--green-soft)"
            style={{ fontSize: 9 }}
          >
            + Positive
          </text>
          <text
            x="80"
            y="140"
            textAnchor="middle"
            fill="var(--red-alert)"
            style={{ fontSize: 9 }}
          >
            − Negative
          </text>
          <text
            x="240"
            y="128"
            textAnchor="middle"
            fill="var(--green-soft)"
            style={{ fontSize: 9 }}
          >
            + Positive
          </text>
          <text
            x="240"
            y="140"
            textAnchor="middle"
            fill="var(--red-alert)"
            style={{ fontSize: 9 }}
          >
            − Negative
          </text>
          {/* Lines: A → Positive (left side) */}
          <line
            x1="80"
            y1="60"
            x2="40"
            y2="30"
            stroke="url(#pos)"
            strokeWidth={strokeWidth(a.positive)}
            strokeLinecap="round"
          />
          <line
            x1="80"
            y1="100"
            x2="40"
            y2="130"
            stroke="url(#neg)"
            strokeWidth={strokeWidth(a.negative)}
            strokeLinecap="round"
          />
          {/* Lines: B → Positive (right side) */}
          <line
            x1="240"
            y1="60"
            x2="280"
            y2="30"
            stroke="url(#pos)"
            strokeWidth={strokeWidth(b.positive)}
            strokeLinecap="round"
          />
          <line
            x1="240"
            y1="100"
            x2="280"
            y2="130"
            stroke="url(#neg)"
            strokeWidth={strokeWidth(b.negative)}
            strokeLinecap="round"
          />
          <text x="40" y="20" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: 8 }}>
            Positive
          </text>
          <text x="40" y="150" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: 8 }}>
            Negative
          </text>
          <text x="280" y="20" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: 8 }}>
            Positive
          </text>
          <text x="280" y="150" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: 8 }}>
            Negative
          </text>
        </svg>
      </div>
    </div>
  );
}
