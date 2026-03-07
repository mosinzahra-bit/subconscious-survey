import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";

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
    where: { id: params.studyId, clientId: user.id }
  });
  if (!study) return NextResponse.json({ error: "Study not found" }, { status: 404 });

  const list = await prisma.strategyReport.findMany({
    where: { studyId: params.studyId },
    orderBy: { version: "desc" }
  });

  return NextResponse.json({
    study: {
      id: study.id,
      title: study.title,
      config: study.config
    },
    reports: list,
    latest: list[0] ?? null
  });
}
