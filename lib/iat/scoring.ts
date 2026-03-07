import type { Trial } from "@prisma/client";

export interface DScoreDetails {
  meanCongruent: number;
  meanIncongruent: number;
  pooledSD: number;
  congruentTrialCount: number;
  incongruentTrialCount: number;
  errorRate: number;
  fastTrialPct: number;
}

export interface DScoreResult {
  dScore: number;
  isValid: boolean;
  invalidReason?: string;
  details?: DScoreDetails;
}

// Greenwald, Nosek & Banaji (2003) D-Score Algorithm
export function calculateDScore(trials: Trial[]): DScoreResult {
  // Step 1: Filter to CRITICAL blocks only (blocks 3, 4, 6, 7)
  const criticalTrials = trials.filter((t) => [2, 3, 5, 6].includes(t.blockIndex));
  // Note: blockIndex is 0-based, so blocks 3,4,6,7 = indices 2,3,5,6

  if (criticalTrials.length === 0) {
    return {
      dScore: 0,
      isValid: false,
      invalidReason: "No critical block trials available."
    };
  }

  // Step 2: Validity check — exclude participants with >10% sub-300ms responses
  const fastTrials = criticalTrials.filter((t) => t.reactionTimeMs < 300);
  const fastTrialPct = fastTrials.length / criticalTrials.length;
  if (fastTrialPct > 0.1) {
    return {
      dScore: 0,
      isValid: false,
      invalidReason:
        "Too many fast responses (>10% under 300ms). Data unreliable."
    };
  }

  // Step 3: Remove trials with RT > 10,000ms (timed out / distracted)
  const validTrials = criticalTrials.filter(
    (t) => t.reactionTimeMs <= 10000 && t.reactionTimeMs >= 300
  );

  if (validTrials.length === 0) {
    return {
      dScore: 0,
      isValid: false,
      invalidReason: "No trials remained after RT filtering."
    };
  }

  // Step 4: Apply error penalty — replace error trial RT with mean RT of block + 600ms
  // (errors already flagged with hadError=true and errorPenaltyMs=600)
  const adjustedTrials = validTrials.map((t) => ({
    ...t,
    adjustedRT: t.hadError ? t.reactionTimeMs + 600 : t.reactionTimeMs
  }));

  // Step 5: Separate into congruent (blocks 3+4, indices 2+3) and incongruent (blocks 6+7, indices 5+6)
  const congruent = adjustedTrials.filter((t) => [2, 3].includes(t.blockIndex));
  const incongruent = adjustedTrials.filter((t) => [5, 6].includes(t.blockIndex));

  if (congruent.length < 10 || incongruent.length < 10) {
    return {
      dScore: 0,
      isValid: false,
      invalidReason: "Insufficient trial data"
    };
  }

  // Step 6: Calculate means
  const meanCongruent =
    congruent.reduce((sum, t) => sum + (t as any).adjustedRT, 0) /
    congruent.length;
  const meanIncongruent =
    incongruent.reduce((sum, t) => sum + (t as any).adjustedRT, 0) /
    incongruent.length;

  // Step 7: Calculate pooled standard deviation of ALL critical trials combined
  const allRTs = [...congruent, ...incongruent].map(
    (t) => (t as any).adjustedRT as number
  );
  const grandMean =
    allRTs.reduce((sum, rt) => sum + rt, 0) / allRTs.length;
  const variance =
    allRTs.reduce((sum, rt) => sum + Math.pow(rt - grandMean, 2), 0) /
    (allRTs.length - 1);
  const pooledSD = Math.sqrt(variance);

  if (!isFinite(pooledSD) || pooledSD === 0) {
    return {
      dScore: 0,
      isValid: false,
      invalidReason: "Pooled standard deviation is zero or invalid."
    };
  }

  // Step 8: D = (mean_incongruent - mean_congruent) / pooled_SD
  const dScore = (meanIncongruent - meanCongruent) / pooledSD;

  return {
    dScore: parseFloat(dScore.toFixed(4)),
    isValid: true,
    details: {
      meanCongruent,
      meanIncongruent,
      pooledSD,
      congruentTrialCount: congruent.length,
      incongruentTrialCount: incongruent.length,
      errorRate:
        validTrials.filter((t) => t.hadError).length / validTrials.length,
      fastTrialPct
    }
  };
}

