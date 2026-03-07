import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { shareToken: string } }
) {
  try {
    const study = await prisma.study.findUnique({
      where: { shareToken: params.shareToken }
    });

    if (!study) {
      return NextResponse.json({ error: "Study not found" }, { status: 404 });
    }

    const { id, title, description, config, status, participantMode } = study;

    if (status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Study is not accepting responses" },
        { status: 403 }
      );
    }

    if (participantMode !== "LIVE_IAT") {
      return NextResponse.json(
        { error: "This study is configured for Passive Intelligence mode." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      id,
      title,
      description,
      config,
      participantMode
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error fetching study" },
      { status: 500 }
    );
  }
}

