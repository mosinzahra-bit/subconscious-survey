import type { CollectedSample } from "./collectors";
import type { TextAnalysisResult } from "./pas-scoring";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

function extractConcepts(text: string, terms: string[]): { concept: string; count: number }[] {
  const lower = text.toLowerCase();
  const out: { concept: string; count: number }[] = [];
  for (const t of terms) {
    const re = new RegExp(t.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const count = (lower.match(re) ?? []).length;
    if (count) out.push({ concept: t, count });
  }
  return out;
}

function simpleValence(text: string): number {
  const pos = ["good", "great", "love", "best", "excellent", "amazing", "happy", "trust"];
  const neg = ["bad", "hate", "worst", "terrible", "awful", "sad", "fake", "scam"];
  const lower = text.toLowerCase();
  let v = 0;
  pos.forEach((w) => {
    if (lower.includes(w)) v += 0.2;
  });
  neg.forEach((w) => {
    if (lower.includes(w)) v -= 0.2;
  });
  return Math.max(-1, Math.min(1, v));
}

function detectMarkers(text: string): TextAnalysisResult["linguisticMarkers"] {
  const lower = text.toLowerCase();
  return {
    certaintyLanguage: /\b(definitely|always|never|absolutely|certainly)\b/.test(lower),
    hedgingLanguage: /\b(maybe|perhaps|kind of|I guess|sort of)\b/.test(lower),
    emotionalLanguage: /\b(love|hate|feel|felt|amazing|terrible)\b/.test(lower),
    comparisonLanguage: /\b(vs|versus|compared to|better than|worse than)\b/.test(lower)
  };
}

function findCoOccurrence(
  text: string,
  concept1: string[],
  concept2: string[]
): { concept1: string; concept2: string }[] {
  const pairs: { concept1: string; concept2: string }[] = [];
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  for (const s of sentences) {
    const low = s.toLowerCase();
    for (const c1 of concept1) {
      for (const c2 of concept2) {
        if (low.includes(c1.toLowerCase()) && low.includes(c2.toLowerCase())) {
          pairs.push({ concept1: c1, concept2: c2 });
        }
      }
    }
  }
  return pairs;
}

export async function analyzeWithClaude(
  sample: CollectedSample,
  concepts: {
    categoryA: string[];
    categoryB: string[];
    attributePositive: string[];
    attributeNegative: string[];
  }
): Promise<TextAnalysisResult> {
  const allTerms = [
    ...concepts.categoryA,
    ...concepts.categoryB,
    ...concepts.attributePositive,
    ...concepts.attributeNegative
  ];
  const conceptMentions = extractConcepts(sample.rawText, allTerms);
  const coOccurrencePairs = [
    ...findCoOccurrence(sample.rawText, concepts.categoryA, concepts.attributePositive),
    ...findCoOccurrence(sample.rawText, concepts.categoryA, concepts.attributeNegative),
    ...findCoOccurrence(sample.rawText, concepts.categoryB, concepts.attributePositive),
    ...findCoOccurrence(sample.rawText, concepts.categoryB, concepts.attributeNegative)
  ];
  const emotionalValence = simpleValence(sample.rawText);
  const emotionalIntensity = Math.min(1, sample.rawText.length / 500);
  const markers = detectMarkers(sample.rawText);

  if (ANTHROPIC_API_KEY && sample.rawText.length > 100) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 200,
          messages: [
            {
              role: "user",
              content: `Analyze this text for implicit associations. Reply with only a JSON object (no markdown) with keys: valence (number -1 to 1), intensity (0 to 1), certaintyLanguage (boolean), hedgingLanguage (boolean), emotionalLanguage (boolean). Text: ${sample.rawText.slice(0, 1500)}`
            }
          ]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text ?? "";
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (typeof parsed.valence === "number")
          return {
            rawText: sample.rawText,
            source: sample.source,
            conceptMentions,
            coOccurrencePairs,
            emotionalValence: parsed.valence,
            emotionalIntensity: typeof parsed.intensity === "number" ? parsed.intensity : emotionalIntensity,
            implicitAssociationSignals: {
              conceptA_positive: coOccurrencePairs.filter(
                (p) =>
                  concepts.categoryA.some((c) => p.concept1 === c || p.concept2 === c) &&
                  concepts.attributePositive.some((c) => p.concept1 === c || p.concept2 === c)
              ).length,
              conceptA_negative: coOccurrencePairs.filter(
                (p) =>
                  concepts.categoryA.some((c) => p.concept1 === c || p.concept2 === c) &&
                  concepts.attributeNegative.some((c) => p.concept1 === c || p.concept2 === c)
              ).length,
              conceptB_positive: coOccurrencePairs.filter(
                (p) =>
                  concepts.categoryB.some((c) => p.concept1 === c || p.concept2 === c) &&
                  concepts.attributePositive.some((c) => p.concept1 === c || p.concept2 === c)
              ).length,
              conceptB_negative: coOccurrencePairs.filter(
                (p) =>
                  concepts.categoryB.some((c) => p.concept1 === c || p.concept2 === c) &&
                  concepts.attributeNegative.some((c) => p.concept1 === c || p.concept2 === c)
              ).length
            },
            linguisticMarkers: {
              certaintyLanguage: !!parsed.certaintyLanguage,
              hedgingLanguage: !!parsed.hedgingLanguage,
              emotionalLanguage: !!parsed.emotionalLanguage,
              comparisonLanguage: markers.comparisonLanguage
            }
          };
      }
    } catch (_) {}
  }

  return {
    rawText: sample.rawText,
    source: sample.source,
    conceptMentions,
    coOccurrencePairs,
    emotionalValence,
    emotionalIntensity,
    implicitAssociationSignals: {
      conceptA_positive: coOccurrencePairs.filter(
        (p) =>
          concepts.categoryA.some((c) => p.concept1 === c || p.concept2 === c) &&
          concepts.attributePositive.some((c) => p.concept1 === c || p.concept2 === c)
      ).length,
      conceptA_negative: coOccurrencePairs.filter(
        (p) =>
          concepts.categoryA.some((c) => p.concept1 === c || p.concept2 === c) &&
          concepts.attributeNegative.some((c) => p.concept1 === c || p.concept2 === c)
      ).length,
      conceptB_positive: coOccurrencePairs.filter(
        (p) =>
          concepts.categoryB.some((c) => p.concept1 === c || p.concept2 === c) &&
          concepts.attributePositive.some((c) => p.concept1 === c || p.concept2 === c)
      ).length,
      conceptB_negative: coOccurrencePairs.filter(
        (p) =>
          concepts.categoryB.some((c) => p.concept1 === c || p.concept2 === c) &&
          concepts.attributeNegative.some((c) => p.concept1 === c || p.concept2 === c)
      ).length
    },
    linguisticMarkers: markers
  };
}
