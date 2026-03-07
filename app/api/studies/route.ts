import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { enqueuePassiveJob } from "@/lib/passive/queue";

export async function GET() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const studies = await prisma.study.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(studies);
}

interface CreateBody {
  title: string;
  description?: string;
  config: unknown;
  participantMode: "LIVE_IAT" | "PASSIVE_INTELLIGENCE";
  passiveConfig?: unknown;
}

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as CreateBody;

  const study = await prisma.study.create({
    data: {
      clientId: user.id,
      title: body.title,
      description: body.description ?? "",
      status: "ACTIVE",
      config: body.config as any,
      participantMode: body.participantMode,
      passiveJobStatus:
        body.participantMode === "PASSIVE_INTELLIGENCE" ? "queued" : null,
      passiveJobProgress:
        body.participantMode === "PASSIVE_INTELLIGENCE"
          ? {
              sources: (body.passiveConfig as any)?.sources ?? [],
              collected: 0,
              total: (body.passiveConfig as any)?.minSamples ?? 0
            }
          : null
    }
  });

  if (body.participantMode === "PASSIVE_INTELLIGENCE" && body.passiveConfig) {
    const cfg = body.config as { categoryA?: { label: string; stimuli: string[] }; categoryB?: { label: string; stimuli: string[] }; attributePositive?: { label: string; stimuli: string[] }; attributeNegative?: { label: string; stimuli: string[] } };
    try {
      await enqueuePassiveJob({
        studyId: study.id,
        concepts: {
          categoryA: cfg?.categoryA?.stimuli ?? [cfg?.categoryA?.label ?? "A"],
          categoryB: cfg?.categoryB?.stimuli ?? [cfg?.categoryB?.label ?? "B"],
          attributePositive: cfg?.attributePositive?.stimuli ?? [cfg?.attributePositive?.label ?? "Positive"],
          attributeNegative: cfg?.attributeNegative?.stimuli ?? [cfg?.attributeNegative?.label ?? "Negative"]
        },
        sources: (body.passiveConfig as any)?.sources ?? ["reddit", "reviews"],
        targetAudience: (body.passiveConfig as any)?.targetAudience ?? "",
        dateRange: (body.passiveConfig as any)?.dateRange ?? "90d",
        language: (body.passiveConfig as any)?.language ?? "en",
        minSamples: (body.passiveConfig as any)?.minSamples ?? 200
      });
    } catch (_) {
      // Redis unavailable; job remains queued for when worker runs
    }
  }

  return NextResponse.json({
    id: study.id,
    shareToken: study.shareToken
  });
}

