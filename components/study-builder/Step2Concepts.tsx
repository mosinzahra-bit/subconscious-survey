"use client";

import type { StudyCategoryConfig } from "@/types/iat";

interface Step2ConceptsProps {
  categoryA: StudyCategoryConfig;
  categoryB: StudyCategoryConfig;
  onChange: (value: { categoryA: StudyCategoryConfig; categoryB: StudyCategoryConfig }) => void;
}

function parseStimuli(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function Step2Concepts({
  categoryA,
  categoryB,
  onChange
}: Step2ConceptsProps) {
  const handleChange =
    (which: "A" | "B", field: "label" | "stimuli") =>
    (value: string) => {
      if (which === "A") {
        onChange({
          categoryA: {
            ...categoryA,
            [field]: field === "stimuli" ? parseStimuli(value) : value
          },
          categoryB
        });
      } else {
        onChange({
          categoryA,
          categoryB: {
            ...categoryB,
            [field]: field === "stimuli" ? parseStimuli(value) : value
          }
        });
      }
    };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="badge mb-1">Step 2 · Competing concepts</p>
        <h2 className="font-heading text-xl">What are we putting head-to-head?</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
          Think of these as &quot;mental folders&quot; your audience uses: Brand vs Brand,
          Product vs Product, Offer vs Status Quo.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-elevated px-4 py-4 space-y-3">
          <h3 className="font-heading text-sm">Category A — left side (E key)</h3>
          <div className="space-y-1">
            <label className="text-xs font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Label
            </label>
            <input
              type="text"
              value={categoryA.label}
              onChange={(e) => handleChange("A", "label")(e.target.value)}
              placeholder="Nike"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Stimuli (words or image URLs)
            </label>
            <textarea
              defaultValue={categoryA.stimuli.join("\n")}
              onBlur={(e) => handleChange("A", "stimuli")(e.target.value)}
              rows={5}
              placeholder={"Just Do It\nRunning\nPerformance\nAthlete"}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)] resize-none"
            />
            <p className="text-[11px] text-[var(--text-secondary)]">
              Use 4–8 clear, concrete items. &quot;Running shoe&quot; beats &quot;innovation&quot; here.
            </p>
          </div>
        </div>
        <div className="card-elevated px-4 py-4 space-y-3">
          <h3 className="font-heading text-sm">Category B — right side (I key)</h3>
          <div className="space-y-1">
            <label className="text-xs font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Label
            </label>
            <input
              type="text"
              value={categoryB.label}
              onChange={(e) => handleChange("B", "label")(e.target.value)}
              placeholder="Adidas"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Stimuli (words or image URLs)
            </label>
            <textarea
              defaultValue={categoryB.stimuli.join("\n")}
              onBlur={(e) => handleChange("B", "stimuli")(e.target.value)}
              rows={5}
              placeholder={"Three Stripes\nOriginals\nStreetwear\nComfort"}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)] resize-none"
            />
            <p className="text-[11px] text-[var(--text-secondary)]">
              Aim for language your market would actually use, not internal brand terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

