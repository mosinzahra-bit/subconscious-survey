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
    where: { id: params.studyId, clientId: user.id },
    include: {
      sessions: true,
      _count: { select: { sessions: true } }
    }
  });
  if (!study) return NextResponse.json({ error: "Study not found" }, { status: 404 });

  const completed = study.sessions.filter((s) => s.completedAt != null).length;
  const valid = study.sessions.filter((s) => s.isValid === true).length;
  const invalid = study.sessions.filter((s) => s.isValid === false).length;

  return NextResponse.json({
    ...study,
    participantCount: study.sessions.length,
    completedCount: completed,
    validCount: valid,
    invalidCount: invalid
  });
}

export async function PATCH(
  req: Request,
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

  const body = (await req.json()) as { status?: "DRAFT" | "ACTIVE" | "CLOSED" };
  if (!body.status) return NextResponse.json({ error: "status required" }, { status: 400 });

  const updated = await prisma.study.update({
    where: { id: params.studyId },
    data: { status: body.status }
  });
  return NextResponse.json(updated);
}
