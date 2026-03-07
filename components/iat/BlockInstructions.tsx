import type { StudyConfig } from "@/types/iat";
import type { BlockDefinition } from "@/lib/iat/blocks";

interface BlockInstructionsProps {
  block: BlockDefinition;
  config: StudyConfig;
  onContinue: () => void;
}

export function BlockInstructions({
  block,
  config,
  onContinue
}: BlockInstructionsProps) {
  const isFirstBlock = block.index === 0;
  const isCombinedCongruent =
    block.type === "combined_congruent_practice" ||
    block.type === "combined_congruent_test";
  const isCombinedIncongruent =
    block.type === "combined_incongruent_practice" ||
    block.type === "combined_incongruent_test";

  let heading = "Instructions";
  let body: string[] = [];

  if (isFirstBlock) {
    heading = "Quick categorization task";
    body = [
      "You'll see words appear one at a time.",
      "Press E if it belongs to the LEFT category, I if it belongs to the RIGHT.",
      "Go as fast as you can while being accurate. Ready? Press SPACE or click Continue."
    ];
  } else if (isCombinedCongruent) {
    heading = "Now both tasks together";
    body = [
      `LEFT key (E) = ${config.categoryA.label} OR ${config.attributePositive.label}.`,
      `RIGHT key (I) = ${config.categoryB.label} OR ${config.attributeNegative.label}.`,
      "This may feel challenging at first. Go as fast as you can while staying accurate."
    ];
  } else if (isCombinedIncongruent) {
    heading = "Key assignments have changed";
    body = [
      `LEFT key (E) = ${config.categoryB.label} OR ${config.attributePositive.label}.`,
      `RIGHT key (I) = ${config.categoryA.label} OR ${config.attributeNegative.label}.`,
      "This reversal is intentional. Keep going quickly and trust your first response."
    ];
  } else {
    heading = "Short practice block";
    body = [
      "Same keys, new pattern of words.",
      "Use E for the LEFT category and I for the RIGHT.",
      "Go for speed, but correct mistakes before moving on."
    ];
  }

  const handleContinue = () => {
    onContinue();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
      <div className="max-w-xl card-elevated px-8 py-6 space-y-4">
        <p className="badge mb-1">Part {block.index + 1} of 7</p>
        <h2 className="font-heading text-xl mb-2">{heading}</h2>
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          {body.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <button
          type="button"
          onClick={handleContinue}
          className="mt-4 inline-flex items-center justify-center rounded-md border border-[var(--border-bright)] bg-[var(--green-deep)] px-4 py-2 text-sm font-data tracking-[0.18em] uppercase text-[var(--bg-primary)] hover:bg-[var(--green-vivid)] transition-colors"
        >
          Continue
        </button>
        <p className="text-[10px] text-[var(--text-muted)] mt-1">
          You can also press SPACE to begin this block.
        </p>
      </div>
    </div>
  );
}

