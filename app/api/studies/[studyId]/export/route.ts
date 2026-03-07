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
    include: { sessions: true }
  });
  if (!study) return NextResponse.json({ error: "Study not found" }, { status: 404 });

  const headers = [
    "participantCode",
    "startedAt",
    "completedAt",
    "isValid",
    "dScore",
    "dScoreLabel",
    "invalidReason"
  ];
  const rows = study.sessions.map((s) => [
    s.participantCode,
    s.startedAt.toISOString(),
    s.completedAt?.toISOString() ?? "",
    s.isValid ?? "",
    s.dScore ?? "",
    s.dScoreLabel ?? "",
    s.invalidReason ?? ""
  ]);

  const csv =
    headers.join(",") +
    "\n" +
    rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${study.title.replace(/[^a-z0-9]/gi, "_")}_sessions.csv`
    }
  });
}
