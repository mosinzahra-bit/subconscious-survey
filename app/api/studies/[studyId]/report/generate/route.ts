import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { generateStrategyReport } from "@/lib/report/generate-strategy";
import { calculateDScore } from "@/lib/iat/scoring";

export async function POST(
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
      client: true,
      sessions: { include: { trials: true } }
    }
  });
  if (!study) return NextResponse.json({ error: "Study not found" }, { status: 404 });

  let meanDScore = 0;
  let meanRTCongruent = 0;
  let meanRTIncongruent = 0;
  let avgErrorRate = 0;
  let avgCompletionTime = 0;
  let n = 0;

  if (study.participantMode === "PASSIVE_INTELLIGENCE") {
    const progress = study.passiveJobProgress as { pas?: number } | null;
    meanDScore = progress?.pas ?? 0;
    meanRTCongruent = 500;
    meanRTIncongruent = 500 + meanDScore * 80;
    n = 1;
  } else {
    const validSessions = study.sessions.filter(
      (s) => s.completedAt && s.isValid === true && typeof s.dScore === "number"
    );
    for (const session of study.sessions) {
      if (!session.completedAt || !session.trials.length) continue;
      const result = calculateDScore(session.trials);
      if (result.isValid && result.details) {
        meanDScore += result.dScore;
        meanRTCongruent += result.details.meanCongruent;
        meanRTIncongruent += result.details.meanIncongruent;
        avgErrorRate += result.details.errorRate;
        avgCompletionTime +=
          (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000;
        n++;
      }
    }
    if (n > 0) {
      meanDScore /= n;
      meanRTCongruent /= n;
      meanRTIncongruent /= n;
      avgErrorRate /= n;
      avgCompletionTime = Math.round(avgCompletionTime / n);
    }
  }

  const config = study.config as any;
  const interpretationLabel =
    meanDScore > 0.35
      ? `Moderate preference for ${config?.categoryA?.label ?? "A"}`
      : meanDScore > 0.15
      ? `Slight preference for ${config?.categoryA?.label ?? "A"}`
      : meanDScore >= -0.15
      ? "No significant implicit preference"
      : meanDScore >= -0.35
      ? `Slight preference for ${config?.categoryB?.label ?? "B"}`
      : `Moderate preference for ${config?.categoryB?.label ?? "B"}`;

  const reportData = await generateStrategyReport({
    study: {
      title: study.title,
      config: study.config as object,
      participantMode: study.participantMode
    },
    client: {
      businessType: study.client.businessType,
      industry: study.client.industry,
      targetMarket: study.client.targetMarket
    },
    results: {
      validSessionCount: n,
      meanDScore,
      interpretationLabel,
      avgErrorRate,
      avgCompletionTime,
      meanRTCongruent,
      meanRTIncongruent,
      rtGap: meanRTIncongruent - meanRTCongruent
    }
  });

  const latestVersion = await prisma.strategyReport.findFirst({
    where: { studyId: params.studyId },
    orderBy: { version: "desc" }
  });
  const version = (latestVersion?.version ?? 0) + 1;

  const report = await prisma.strategyReport.create({
    data: {
      studyId: params.studyId,
      reportData: reportData as object,
      version
    }
  });

  return NextResponse.json({ report, version: report.version });
}
