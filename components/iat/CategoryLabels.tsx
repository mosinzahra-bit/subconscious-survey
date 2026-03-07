import type { StudyConfig } from "@/types/iat";
import type { BlockDefinition } from "@/lib/iat/blocks";

interface CategoryLabelsProps {
  config: StudyConfig;
  block: BlockDefinition;
}

export function CategoryLabels({ config, block }: CategoryLabelsProps) {
  const isCongruent =
    block.type === "combined_congruent_practice" ||
    block.type === "combined_congruent_test";
  const isIncongruent =
    block.type === "combined_incongruent_practice" ||
    block.type === "combined_incongruent_test";

  // Block 1/4 (target, reversed target) define pure mapping for A/B
  // Congruent: LEFT = A + Positive, RIGHT = B + Negative
  // Incongruent: LEFT = B + Positive, RIGHT = A + Negative

  const leftTargets =
    block.type === "reversed_target_practice" || isIncongruent
      ? config.categoryB.label
      : config.categoryA.label;

  const rightTargets =
    block.type === "reversed_target_practice" || isIncongruent
      ? config.categoryA.label
      : config.categoryB.label;

  const leftAttributes =
    isCongruent || isIncongruent ? config.attributePositive.label : null;
  const rightAttributes =
    isCongruent || isIncongruent ? config.attributeNegative.label : null;

  return (
    <>
      <div className="absolute top-4 left-4 text-xs font-data">
        <div className="px-2 py-1 rounded-md bg-black/40 border border-[var(--border-bright)] shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--green-soft)] mb-1">
            E · Left
          </p>
          <p className="font-heading text-xs">
            {leftTargets}
            {leftAttributes && (
              <>
                <span className="text-[var(--text-muted)]"> + </span>
                <span>{leftAttributes}</span>
              </>
            )}
          </p>
        </div>
      </div>
      <div className="absolute top-4 right-4 text-xs font-data">
        <div className="px-2 py-1 rounded-md bg-black/40 border border-[var(--border-bright)] shadow-sm text-right">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--green-soft)] mb-1">
            I · Right
          </p>
          <p className="font-heading text-xs">
            {rightTargets}
            {rightAttributes && (
              <>
                <span className="text-[var(--text-muted)]"> + </span>
                <span>{rightAttributes}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
}

