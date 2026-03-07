"use client";

import type { StudyCategoryConfig } from "@/types/iat";

const DEFAULT_POSITIVE = [
  "Wonderful",
  "Excellent",
  "Joyful",
  "Pleasant",
  "Brilliant",
  "Happy"
];

const DEFAULT_NEGATIVE = [
  "Awful",
  "Terrible",
  "Dreadful",
  "Unpleasant",
  "Miserable",
  "Failure"
];

interface Step3AttributesProps {
  attributePositive: StudyCategoryConfig;
  attributeNegative: StudyCategoryConfig;
  onChange: (value: {
    attributePositive: StudyCategoryConfig;
    attributeNegative: StudyCategoryConfig;
  }) => void;
}

function parseStimuli(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function Step3Attributes({
  attributePositive,
  attributeNegative,
  onChange
}: Step3AttributesProps) {
  const handleChange =
    (which: "pos" | "neg", field: "label" | "stimuli") =>
    (value: string) => {
      if (which === "pos") {
        onChange({
          attributePositive: {
            ...attributePositive,
            [field]: field === "stimuli" ? parseStimuli(value) : value
          },
          attributeNegative
        });
      } else {
        onChange({
          attributePositive,
          attributeNegative: {
            ...attributeNegative,
            [field]: field === "stimuli" ? parseStimuli(value) : value
          }
        });
      }
    };

  const applyDefaults = () => {
    onChange({
      attributePositive: { ...attributePositive, stimuli: DEFAULT_POSITIVE },
      attributeNegative: { ...attributeNegative, stimuli: DEFAULT_NEGATIVE }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="badge mb-1">Step 3 · Psychological attributes</p>
        <h2 className="font-heading text-xl">How does the brain tag each brand?</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
          These are the emotional &amp; evaluative qualities we pair with each concept.
          Most brand preference studies use a Good/Bad attribute set — it&apos;s
          scientifically well-validated.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-elevated px-4 py-4 space-y-3">
          <h3 className="font-heading text-sm">Positive attribute side</h3>
          <div className="space-y-1">
            <label className="text-xs font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Label
            </label>
            <input
              type="text"
              value={attributePositive.label}
              onChange={(e) => handleChange("pos", "label")(e.target.value)}
              placeholder="Trustworthy"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Positive words
            </label>
            <textarea
              defaultValue={attributePositive.stimuli.join("\n")}
              onBlur={(e) => handleChange("pos", "stimuli")(e.target.value)}
              rows={5}
              placeholder={DEFAULT_POSITIVE.join("\n")}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)] resize-none"
            />
            <p className="text-[11px] text-[var(--text-secondary)]">
              Think &quot;emotionally positive&quot; more than corporate-sounding. The
              brain reacts faster to simple, human words.
            </p>
          </div>
        </div>
        <div className="card-elevated px-4 py-4 space-y-3">
          <h3 className="font-heading text-sm">Negative attribute side</h3>
          <div className="space-y-1">
            <label className="text-xs font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Label
            </label>
            <input
              type="text"
              value={attributeNegative.label}
              onChange={(e) => handleChange("neg", "label")(e.target.value)}
              placeholder="Untrustworthy"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Negative words
            </label>
            <textarea
              defaultValue={attributeNegative.stimuli.join("\n")}
              onBlur={(e) => handleChange("neg", "stimuli")(e.target.value)}
              rows={5}
              placeholder={DEFAULT_NEGATIVE.join("\n")}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)] resize-none"
            />
            <p className="text-[11px] text-[var(--text-secondary)]">
              Don&apos;t be afraid of strong language — the point is to see which side
              &quot;fits&quot; faster under pressure.
            </p>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={applyDefaults}
        className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--text-secondary)] hover:border-[var(--border-bright)]"
      >
        Use standard Good / Bad word sets
      </button>
    </div>
  );
}

