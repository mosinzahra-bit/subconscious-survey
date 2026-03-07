import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { calculateDScore } from "@/lib/iat/scoring";
import { interpretDScore } from "@/lib/iat/interpret";

export async function GET(
  _req: Request,
  { params }: { params: { studyId: string } }
) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const study = await prisma.study.findFirst({
    where: { id: params.studyId, clientId: user.id },
    include: {
      sessions: {
        include: { trials: true }
      }
    }
  });
  if (!study) return NextResponse.json({ error: "Study not found" }, { status: 404 });

  if (study.participantMode === "PASSIVE_INTELLIGENCE") {
    const config = study.config as {
      categoryA?: { label: string };
      categoryB?: { label: string };
      attributePositive?: { label: string };
      attributeNegative?: { label: string };
    };
    const categoryA = config?.categoryA?.label ?? "Category A";
    const categoryB = config?.categoryB?.label ?? "Category B";
    const progress = study.passiveJobProgress as {
      pas?: number;
      confidence?: number;
      sampleCount?: number;
      validSamples?: number;
    } | null;
    const pas = progress?.pas ?? 0;
    const confidence = progress?.confidence ?? 0;
    const sampleCount = progress?.sampleCount ?? 0;
    const interpretation = interpretDScore(pas, categoryA, categoryB);
    const binWidth = 0.2;
    const bins: number[] = [];
    for (let i = -2; i <= 2; i += binWidth) {
      bins.push(Number((i + binWidth / 2).toFixed(2)));
    }
    const histogram: Record<string, number> = {};
    bins.forEach((b) => (histogram[String(b)] = 0));
    const bin = bins.find((b) => pas >= b - binWidth / 2 && pas < b + binWidth / 2);
    if (bin !== undefined) histogram[String(bin)] = 1;
    return NextResponse.json({
      studyId: study.id,
      title: study.title,
      participantMode: "PASSIVE_INTELLIGENCE",
      categoryA,
      categoryB,
      validSessionCount: 0,
      totalSessions: 0,
      invalidCount: 0,
      meanDScore: pas,
      dScoreStd: 0,
      confidenceInterval: [pas - (1 - confidence), pas + (1 - confidence)] as [number, number],
      interpretationLabel: interpretation.label,
      interpretationStrength: interpretation.strength,
      interpretationColor: interpretation.color,
      avgErrorRate: 0,
      avgCompletionTime: 0,
      meanRTCongruent: 0,
      meanRTIncongruent: 0,
      rtGap: 0,
      dScoreDistribution: bins.map((b) => ({ bin: b, count: histogram[String(b)] ?? 0 })),
      rtComparison: { congruent: 0, incongruent: 0 },
      blockAccuracy: [],
      associationMap: {
        [categoryA]: {
          positive: pas > 0 ? Math.min(1, (pas + 2) / 4) : 0.5,
          negative: pas < 0 ? Math.min(1, (-pas + 2) / 4) : 0.5
        },
        [categoryB]: {
          positive: pas < 0 ? Math.min(1, (-pas + 2) / 4) : 0.5,
          negative: pas > 0 ? Math.min(1, (pas + 2) / 4) : 0.5
        }
      },
      sessions: [],
      isPassive: true,
      pasConfidence: confidence,
      pasSampleCount: sampleCount
    });
  }

  const config = study.config as {
    categoryA?: { label: string };
    categoryB?: { label: string };
  };
  const categoryA = config?.categoryA?.label ?? "Category A";
  const categoryB = config?.categoryB?.label ?? "Category B";

  const validSessions = study.sessions.filter(
    (s) => s.completedAt && s.isValid === true && typeof s.dScore === "number"
  );
  const invalidSessions = study.sessions.filter((s) => s.isValid === false);
  const dScores = validSessions.map((s) => s.dScore!);

  let meanDScore = 0;
  let meanRTCongruent = 0;
  let meanRTIncongruent = 0;
  let avgErrorRate = 0;
  let avgCompletionTime = 0;

  const sessionDetails: {
    sessionId: string;
    participantCode: string;
    completedAt: string;
    dScore: number;
    isValid: boolean;
    invalidReason: string | null;
    completionTimeSec: number;
    meanCongruent: number;
    meanIncongruent: number;
    errorRate: number;
  }[] = [];

  for (const session of study.sessions) {
    if (!session.completedAt || !session.trials.length) continue;
    const result = calculateDScore(session.trials);
    const started = new Date(session.startedAt).getTime();
    const completed = new Date(session.completedAt).getTime();
    const completionTimeSec = Math.round((completed - started) / 1000);
    sessionDetails.push({
      sessionId: session.id,
      participantCode: session.participantCode,
      completedAt: session.completedAt.toISOString(),
      dScore: result.dScore,
      isValid: result.isValid,
      invalidReason: result.invalidReason ?? null,
      completionTimeSec,
      meanCongruent: result.details?.meanCongruent ?? 0,
      meanIncongruent: result.details?.meanIncongruent ?? 0,
      errorRate: result.details?.errorRate ?? 0
    });
    if (result.isValid && result.details) {
      meanRTCongruent += result.details.meanCongruent;
      meanRTIncongruent += result.details.meanIncongruent;
      avgErrorRate += result.details.errorRate;
      avgCompletionTime += completionTimeSec;
    }
  }

  const n = validSessions.length;
  let dScoreStd = 0;
  let confidenceInterval: [number, number] = [0, 0];
  if (n > 0) {
    meanDScore = dScores.reduce((a, b) => a + b, 0) / n;
    const variance =
      n > 1
        ? dScores.reduce((sum, d) => sum + Math.pow(d - meanDScore, 2), 0) / (n - 1)
        : 0;
    dScoreStd = Math.sqrt(variance);
    meanRTCongruent /= n;
    meanRTIncongruent /= n;
    avgErrorRate /= n;
    avgCompletionTime = Math.round(avgCompletionTime / n);
    const se = dScoreStd / Math.sqrt(n);
    confidenceInterval = [
      meanDScore - 1.96 * se,
      meanDScore + 1.96 * se
    ];
  }

  const interpretation = interpretDScore(meanDScore, categoryA, categoryB);

  const bins: number[] = [];
  const binWidth = 0.2;
  for (let i = -2; i <= 2; i += binWidth) {
    bins.push(Number((i + binWidth / 2).toFixed(2)));
  }
  const histogram: Record<string, number> = {};
  bins.forEach((b) => (histogram[String(b)] = 0));
  dScores.forEach((d) => {
    const bin = bins.find((b) => d >= b - binWidth / 2 && d < b + binWidth / 2);
    if (bin !== undefined) histogram[String(bin)] += 1;
  });

  const blockAccuracy: { blockIndex: number; correct: number; total: number }[] = [];
  for (let b = 0; b <= 6; b++) {
    let correct = 0;
    let total = 0;
    for (const session of study.sessions) {
      for (const t of session.trials) {
        if (t.blockIndex === b) {
          total += 1;
          if (t.isCorrect) correct += 1;
        }
      }
    }
    blockAccuracy.push({ blockIndex: b, correct, total });
  }

  return NextResponse.json({
    studyId: study.id,
    title: study.title,
    participantMode: study.participantMode,
    categoryA,
    categoryB,
    validSessionCount: n,
    totalSessions: study.sessions.length,
    invalidCount: invalidSessions.length,
    meanDScore,
    dScoreStd,
    confidenceInterval,
    interpretationLabel: interpretation.label,
    interpretationStrength: interpretation.strength,
    interpretationColor: interpretation.color,
    avgErrorRate,
    avgCompletionTime,
    meanRTCongruent,
    meanRTIncongruent,
    rtGap: meanRTIncongruent - meanRTCongruent,
    dScoreDistribution: bins.map((b) => ({ bin: b, count: histogram[String(b)] })),
    rtComparison: {
      congruent: meanRTCongruent,
      incongruent: meanRTIncongruent
    },
    blockAccuracy,
    associationMap: {
      [categoryA]: {
        positive: meanDScore > 0 ? Math.min(1, (meanDScore + 2) / 4) : 0.5,
        negative: meanDScore < 0 ? Math.min(1, (-meanDScore + 2) / 4) : 0.5
      },
      [categoryB]: {
        positive: meanDScore < 0 ? Math.min(1, (-meanDScore + 2) / 4) : 0.5,
        negative: meanDScore > 0 ? Math.min(1, (meanDScore + 2) / 4) : 0.5
      }
    },
    sessions: sessionDetails,
    isPassive: false,
    pasConfidence: undefined,
    pasSampleCount: undefined
  });
}
