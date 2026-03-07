export interface TextAnalysisResult {
  rawText: string;
  source: string;
  conceptMentions: { concept: string; count: number }[];
  coOccurrencePairs: { concept1: string; concept2: string }[];
  emotionalValence: number;
  emotionalIntensity: number;
  implicitAssociationSignals: {
    conceptA_positive: number;
    conceptA_negative: number;
    conceptB_positive: number;
    conceptB_negative: number;
  };
  linguisticMarkers: {
    certaintyLanguage: boolean;
    hedgingLanguage: boolean;
    emotionalLanguage: boolean;
    comparisonLanguage: boolean;
  };
}

export interface PassiveAssociationScore {
  pas: number;
  confidence: number;
  sampleCount: number;
  validSamples: number;
}

function avgValence(
  concept: string,
  samples: TextAnalysisResult[]
): number {
  const relevant = samples.filter((s) =>
    s.conceptMentions.some((c) => c.concept.toLowerCase().includes(concept.toLowerCase()))
  );
  if (relevant.length === 0) return 0;
  const sum = relevant.reduce((a, s) => a + s.emotionalValence, 0);
  return sum / relevant.length;
}

function applyLinguisticWeight(
  count: number,
  samples: TextAnalysisResult[],
  _concept: string
): number {
  const withCertainty = samples.filter((s) => s.linguisticMarkers.certaintyLanguage).length;
  const withHedging = samples.filter((s) => s.linguisticMarkers.hedgingLanguage).length;
  const certaintyBoost = 1 + (withCertainty / Math.max(1, samples.length)) * 0.2;
  const hedgingPenalty = 1 - (withHedging / Math.max(1, samples.length)) * 0.15;
  return count * certaintyBoost * hedgingPenalty;
}

export function calculatePassiveAssociationScore(
  samples: TextAnalysisResult[],
  categoryA: string,
  categoryB: string,
  attributePositive: string,
  attributeNegative: string
): PassiveAssociationScore {
  if (samples.length < 10) {
    return {
      pas: 0,
      confidence: 0,
      sampleCount: samples.length,
      validSamples: samples.filter((s) => s.linguisticMarkers.emotionalLanguage).length
    };
  }

  const cooccA_Pos = samples.filter((s) =>
    s.coOccurrencePairs.some(
      (p) =>
        (p.concept1.toLowerCase().includes(categoryA.toLowerCase()) ||
          p.concept2.toLowerCase().includes(categoryA.toLowerCase())) &&
        (p.concept1.toLowerCase().includes(attributePositive.toLowerCase()) ||
          p.concept2.toLowerCase().includes(attributePositive.toLowerCase()))
    )
  ).length;

  const cooccB_Pos = samples.filter((s) =>
    s.coOccurrencePairs.some(
      (p) =>
        (p.concept1.toLowerCase().includes(categoryB.toLowerCase()) ||
          p.concept2.toLowerCase().includes(categoryB.toLowerCase())) &&
        (p.concept1.toLowerCase().includes(attributePositive.toLowerCase()) ||
          p.concept2.toLowerCase().includes(attributePositive.toLowerCase()))
    )
  ).length;

  const valenceDiff = avgValence(categoryA, samples) - avgValence(categoryB, samples);

  const certaintyCorrected_A = applyLinguisticWeight(cooccA_Pos, samples, categoryA);
  const certaintyCorrected_B = applyLinguisticWeight(cooccB_Pos, samples, categoryB);

  const rawDiff = certaintyCorrected_A - certaintyCorrected_B;
  const total = certaintyCorrected_A + certaintyCorrected_B || 1;
  const pooledDeviation = Math.sqrt(total) || 1;
  const rawPAS = (rawDiff / pooledDeviation) * 0.5 + (valenceDiff * 0.3);
  const pas = Math.max(-2, Math.min(2, rawPAS));

  const validSamples = samples.filter((s) => s.linguisticMarkers.emotionalLanguage).length;
  const confidence = Math.min(
    0.95,
    0.5 + (validSamples / 500) * 0.45
  );

  return {
    pas: parseFloat(pas.toFixed(4)),
    confidence,
    sampleCount: samples.length,
    validSamples
  };
}
