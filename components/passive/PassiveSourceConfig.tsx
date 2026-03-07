"use client";

type SourceKey = "reddit" | "reviews" | "twitter" | "quora" | "youtube";

export interface PassiveSourceConfig {
  sources: SourceKey[];
  targetAudience: string;
  dateRange: "30d" | "90d" | "1y";
  language: "en" | "ur" | "both";
  minSamples: number;
}

interface PassiveSourceConfigProps {
  value: PassiveSourceConfig;
  onChange: (value: PassiveSourceConfig) => void;
}

const SOURCE_LABELS: Record<
  SourceKey,
  { label: string; description: string }
> = {
  reddit: {
    label: "Reddit communities",
    description:
      "Unfiltered, late-night opinions — often where real sentiment leaks out."
  },
  reviews: {
    label: "Product reviews",
    description:
      "Amazon, Trustpilot, G2 and similar surfaces where people justify their choices."
  },
  twitter: {
    label: "Twitter / X posts",
    description:
      "Short, emotionally-loaded takes — useful for quick association reads."
  },
  quora: {
    label: "Quora answers",
    description:
      "Long-form reasoning where people explain why they think what they think."
  },
  youtube: {
    label: "YouTube comments",
    description:
      "Reactions to content that already frames the brand or category in a certain way."
  }
};

export function PassiveSourceConfig({ value, onChange }: PassiveSourceConfigProps) {
  const toggleSource = (key: SourceKey) => {
    if (value.sources.includes(key)) {
      onChange({ ...value, sources: value.sources.filter((s) => s !== key) });
    } else {
      onChange({ ...value, sources: [...value.sources, key] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Passive Intelligence sources
        </p>
        <p className="text-[11px] text-[var(--text-secondary)] max-w-xl">
          We&apos;ll only ever work with aggregated, public, anonymized text. No individual
          is tracked; we care about patterns, not people.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {(Object.keys(SOURCE_LABELS) as SourceKey[]).map((key) => {
          const selected = value.sources.includes(key);
          const src = SOURCE_LABELS[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleSource(key)}
              className={`text-left px-3 py-3 rounded-md border text-xs ${
                selected
                  ? "border-[var(--gold)] bg-[var(--bg-elevated)]"
                  : "border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-bright)]"
              }`}
            >
              <p className="font-heading text-sm mb-1">{src.label}</p>
              <p className="text-[11px] text-[var(--text-secondary)]">{src.description}</p>
            </button>
          );
        })}
      </div>
      <div className="grid md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <label className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Target audience description
          </label>
          <textarea
            value={value.targetAudience}
            onChange={(e) => onChange({ ...value, targetAudience: e.target.value })}
            rows={3}
            placeholder="Pakistani women aged 25–35 interested in skincare"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs outline-none focus:border-[var(--border-bright)] resize-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Date range
          </label>
          <select
            value={value.dateRange}
            onChange={(e) =>
              onChange({ ...value, dateRange: e.target.value as PassiveSourceConfig["dateRange"] })
            }
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs outline-none focus:border-[var(--border-bright)]"
          >
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last 12 months</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Language &amp; sample size
          </label>
          <div className="flex gap-2">
            <select
              value={value.language}
              onChange={(e) =>
                onChange({
                  ...value,
                  language: e.target.value as PassiveSourceConfig["language"]
                })
              }
              className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs outline-none focus:border-[var(--border-bright)]"
            >
              <option value="en">English</option>
              <option value="ur">Urdu</option>
              <option value="both">English + Urdu</option>
            </select>
            <input
              type="number"
              min={100}
              max={10000}
              value={value.minSamples}
              onChange={(e) =>
                onChange({ ...value, minSamples: Number(e.target.value || 0) })
              }
              className="w-24 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-2 text-xs outline-none focus:border-[var(--border-bright)]"
            />
          </div>
          <p className="text-[10px] text-[var(--text-secondary)]">
            Minimum 200 samples recommended for a stable read. This study will collect at
            least {value.minSamples || 0} texts — included in your plan.
          </p>
        </div>
      </div>
      <div className="card px-4 py-3 text-[11px] text-[var(--text-secondary)]">
        <p className="font-data text-[10px] uppercase tracking-[0.2em] mb-1 text-[var(--gold)]">
          Passive Intelligence methodology
        </p>
        <p>
          This study uses behavioral linguistics analysis of publicly available, aggregated
          online language. No individuals are tracked or identified. Results are
          pattern-based estimates of population-level associations, not measured reaction
          times. Treat as directional intelligence, not clinical precision.
        </p>
      </div>
    </div>
  );
}

