import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";

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
    include: { client: true }
  });
  if (!study) return NextResponse.json({ error: "Study not found" }, { status: 404 });

  const report = await prisma.strategyReport.findFirst({
    where: { studyId: params.studyId },
    orderBy: { version: "desc" }
  });
  const reportData = report?.reportData as { pillar1_signal?: { awarenessStage?: string } } | undefined;
  const dScore = report ? "—" : "—";

  const existing = await prisma.strategyReport.findFirst({
    where: { studyId: params.studyId, dfyRequested: true }
  });
  if (existing) {
    return NextResponse.json({ ok: true, alreadySent: true });
  }

  await prisma.strategyReport.updateMany({
    where: { studyId: params.studyId },
    data: { dfyRequested: true, dfyRequestedAt: new Date() }
  });

  const webhookUrl = study.client.slackWebhook ?? process.env.SLACK_DFY_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `New DFY interest from: ${study.client.companyName}\nStudy: ${study.title}\nD-Score: ${dScore}\nBusiness type: ${study.client.businessType ?? "—"}\nIndustry: ${study.client.industry ?? "—"}\nView study: ${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard/studies/${study.id}`
        })
      });
    } catch (_) {}
  }

  return NextResponse.json({ ok: true });
}
