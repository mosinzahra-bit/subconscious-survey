"use client";

import { MeasurementGoal } from "@/types/iat";

const GOAL_OPTIONS: { id: MeasurementGoal; label: string; description: string }[] = [
  {
    id: "brand_preference",
    label: "Brand Preference",
    description:
      "Which brand your audience&apos;s nervous system reaches for first under time pressure."
  },
  {
    id: "product_preference",
    label: "Product Preference",
    description:
      "Which offer variant, feature bundle, or package feels &quot;right&quot; before conscious thought catches up."
  },
  {
    id: "pricing_sensitivity",
    label: "Pricing Sensitivity",
    description:
      "How your price points are implicitly coded: fair, expensive, or risky-cheap."
  },
  {
    id: "message_resonance",
    label: "Message Resonance",
    description:
      "Which message frame the brain tags as true, relevant, and worth acting on."
  },
  {
    id: "custom",
    label: "Custom",
    description:
      "A bespoke psychological question. We&apos;ll still keep the structure scientifically sound."
  }
];

type ParticipantMode = "LIVE_IAT" | "PASSIVE_INTELLIGENCE";

interface Step1GoalProps {
  title: string;
  description: string;
  measurementGoal: MeasurementGoal;
  participantMode: ParticipantMode;
  onChange: (value: {
    title: string;
    description: string;
    measurementGoal: MeasurementGoal;
    participantMode: ParticipantMode;
  }) => void;
}

export function Step1Goal({
  title,
  description,
  measurementGoal,
  participantMode,
  onChange
}: Step1GoalProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="badge mb-1">Step 1 · Frame the question</p>
        <h2 className="font-heading text-xl">What are you really trying to learn?</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
          We&apos;ll translate this into a research-grade IAT or Passive Intelligence
          study, but we start with the business question.
        </p>
      </div>
      <div className="grid md:grid-cols-[1.8fr,1.2fr] gap-6 items-start">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-data tracking-[0.18em] uppercase text-[var(--text-muted)]">
              Study title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) =>
                onChange({
                  title: e.target.value,
                  description,
                  measurementGoal,
                  participantMode
                })
              }
              placeholder="Nike vs Adidas — Brand Preference"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-data tracking-[0.18em] uppercase text-[var(--text-muted)]">
              Short description
            </label>
            <textarea
              value={description}
              onChange={(e) =>
                onChange({
                  title,
                  description: e.target.value,
                  measurementGoal,
                  participantMode
                })
              }
              rows={3}
              placeholder="Measure which brand holds the faster, more automatic &quot;good&quot; association among our target audience."
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)] resize-none"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Participant mode
            </p>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    title,
                    description,
                    measurementGoal,
                    participantMode: "LIVE_IAT"
                  })
                }
                className={`text-left px-3 py-2 rounded-md border text-xs ${
                  participantMode === "LIVE_IAT"
                    ? "border-[var(--green-vivid)] bg-[var(--bg-elevated)]"
                    : "border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-bright)]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-data text-[10px] uppercase tracking-[0.2em] text-[var(--green-soft)]">
                    ● Behavioral data
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">Live IAT</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Participants complete a 7-block IAT. We analyze reaction times to
                  compute D-scores.
                </p>
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    title,
                    description,
                    measurementGoal,
                    participantMode: "PASSIVE_INTELLIGENCE"
                  })
                }
                className={`text-left px-3 py-2 rounded-md border text-xs ${
                  participantMode === "PASSIVE_INTELLIGENCE"
                    ? "border-[var(--gold)] bg-[var(--bg-elevated)]"
                    : "border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-bright)]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-data text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                    ◈ Linguistic signals
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Passive Intelligence
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  We mine real, unguarded language from Reddit, reviews, and social
                  text to infer association patterns.
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Measurement focus
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          {GOAL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() =>
                onChange({
                  title,
                  description,
                  measurementGoal: opt.id,
                  participantMode
                })
              }
              className={`text-left px-3 py-3 rounded-md border ${
                measurementGoal === opt.id
                  ? "border-[var(--green-vivid)] bg-[var(--bg-elevated)]"
                  : "border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-bright)]"
              }`}
            >
              <p className="font-heading text-sm mb-1">{opt.label}</p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {opt.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

