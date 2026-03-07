import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { calculateDScore } from "@/lib/iat/scoring";
import { interpretDScore } from "@/lib/iat/interpret";

interface CompleteBody {
  sessionId: string;
}

export async function POST(
  req: Request,
  { params }: { params: { shareToken: string } }
) {
  try {
    const body = (await req.json()) as CompleteBody;

    const session = await prisma.session.findFirst({
      where: {
        id: body.sessionId,
        study: {
          shareToken: params.shareToken
        }
      },
      include: {
        trials: true,
        study: true
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found for this study" },
        { status: 404 }
      );
    }

    if (session.completedAt) {
      return NextResponse.json(
        { error: "Session already completed" },
        { status: 400 }
      );
    }

    const dScoreResult = calculateDScore(session.trials);

    const studyConfig = session.study.config as any;
    const categoryALabel = studyConfig?.categoryA?.label ?? "Category A";
    const categoryBLabel = studyConfig?.categoryB?.label ?? "Category B";

    const interpretation = dScoreResult.isValid
      ? interpretDScore(dScoreResult.dScore, categoryALabel, categoryBLabel)
      : null;

    await prisma.session.update({
      where: { id: session.id },
      data: {
        completedAt: new Date(),
        isValid: dScoreResult.isValid,
        dScore: dScoreResult.dScore,
        dScoreLabel: interpretation?.label ?? null,
        invalidReason: dScoreResult.invalidReason ?? null
      }
    });

    return NextResponse.json({
      dScore: dScoreResult.dScore,
      isValid: dScoreResult.isValid,
      invalidReason: dScoreResult.invalidReason,
      interpretation
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error completing session" },
      { status: 500 }
    );
  }
}

