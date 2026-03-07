import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface TrialBody {
  sessionId: string;
  blockIndex: number;
  trialIndex: number;
  stimulus: string;
  stimulusType: string;
  correctKey: "e" | "i";
  pressedKey: string;
  isCorrect: boolean;
  reactionTimeMs: number;
  hadError: boolean;
}

export async function POST(
  req: Request,
  { params }: { params: { shareToken: string } }
) {
  try {
    const body = (await req.json()) as TrialBody;

    if (!Number.isInteger(body.reactionTimeMs)) {
      return NextResponse.json(
        { error: "reactionTimeMs must be an integer (ms)" },
        { status: 400 }
      );
    }

    const session = await prisma.session.findFirst({
      where: {
        id: body.sessionId,
        study: {
          shareToken: params.shareToken
        }
      },
      include: { study: true }
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

    await prisma.trial.create({
      data: {
        sessionId: session.id,
        blockIndex: body.blockIndex,
        trialIndex: body.trialIndex,
        stimulus: body.stimulus,
        stimulusType: body.stimulusType,
        correctKey: body.correctKey,
        pressedKey: body.pressedKey,
        isCorrect: body.isCorrect,
        reactionTimeMs: body.reactionTimeMs,
        hadError: body.hadError,
        errorPenaltyMs: body.hadError ? 600 : 0
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error recording trial" },
      { status: 500 }
    );
  }
}

