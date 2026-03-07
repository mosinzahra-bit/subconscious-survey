export interface StimulusItem {
  value: string;
  type: "target_a" | "target_b" | "attribute_pos" | "attribute_neg";
}

/**
 * Shuffle stimuli for a block while:
 * - avoiding more than 2 identical stimuli in a row
 * - keeping approximate balance between categories
 */
export function shuffleStimuli(
  items: StimulusItem[],
  totalTrials: number
): StimulusItem[] {
  const pool = [...items];
  const result: StimulusItem[] = [];

  if (pool.length === 0 || totalTrials <= 0) return result;

  // Simple proportional sampling with constraints
  while (result.length < totalTrials) {
    // Reshuffle pool when exhausted
    if (pool.length === 0) {
      pool.push(...items);
    }

    // Shuffle copy of pool to pick from
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    let picked: StimulusItem | undefined;
    for (const candidate of shuffled) {
      const last = result[result.length - 1];
      const secondLast = result[result.length - 2];
      const wouldRepeatThreeTimes =
        last && secondLast && last.value === candidate.value && secondLast.value === candidate.value;

      if (!wouldRepeatThreeTimes) {
        picked = candidate;
        break;
      }
    }

    // Fallback if all candidates would repeat 3x
    if (!picked) {
      picked = shuffled[0];
    }

    // Remove one instance of picked from pool
    const idx = pool.findIndex(
      (p) => p.value === picked!.value && p.type === picked!.type
    );
    if (idx >= 0) {
      pool.splice(idx, 1);
    }

    result.push(picked);
  }

  return result;
}

