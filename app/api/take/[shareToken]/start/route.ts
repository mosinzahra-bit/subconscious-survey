import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface StartBody {
  deviceInfo?: unknown;
}

export async function POST(
  req: Request,
  { params }: { params: { shareToken: string } }
) {
  try {
    const body = (await req.json()) as StartBody;

    const study = await prisma.study.findUnique({
      where: { shareToken: params.shareToken },
      include: { client: true }
    });

    if (!study) {
      return NextResponse.json({ error: "Study not found" }, { status: 404 });
    }

    if (study.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Study is not accepting responses" },
        { status: 403 }
      );
    }

    if (study.participantMode !== "LIVE_IAT") {
      return NextResponse.json(
        { error: "This study is configured for Passive Intelligence mode." },
        { status: 400 }
      );
    }

    const participantCode = `P-${Math.random().toString(36).slice(2, 10)}`;

    const session = await prisma.session.create({
      data: {
        studyId: study.id,
        participantCode,
        deviceInfo: body.deviceInfo ?? null
      }
    });

    return NextResponse.json({
      sessionId: session.id,
      participantCode
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error starting session" },
      { status: 500 }
    );
  }
}

