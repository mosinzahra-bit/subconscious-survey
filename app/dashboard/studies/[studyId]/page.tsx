import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import StudyDetailClient from "./study-detail-client";

export default async function StudyDetailPage({
  params
}: {
  params: { studyId: string };
}) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const study = await prisma.study.findFirst({
    where: { id: params.studyId, clientId: user.id },
    include: { sessions: true }
  });
  if (!study) notFound();

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/take/${study.shareToken}`;
  const completed = study.sessions.filter((s) => s.completedAt != null).length;
  const valid = study.sessions.filter((s) => s.isValid === true).length;
  const invalid = study.sessions.filter((s) => s.isValid === false).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="badge mb-1">
            {study.participantMode === "LIVE_IAT"
              ? "● Behavioral data"
              : "◈ Linguistic signals"}
          </p>
          <h1 className="font-heading text-2xl">{study.title}</h1>
          {study.description && (
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              {study.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/studies/${study.id}/results`}
            className="inline-flex items-center rounded-md border border-[var(--border-bright)] bg-[var(--green-deep)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--bg-primary)] hover:bg-[var(--green-vivid)]"
          >
            Results
          </Link>
          <Link
            href={`/dashboard/studies/${study.id}/report`}
            className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--text-secondary)] hover:border-[var(--border-bright)]"
          >
            Strategy report
          </Link>
        </div>
      </div>

      <StudyDetailClient
        studyId={study.id}
        status={study.status}
        shareUrl={shareUrl}
        participantCount={study.sessions.length}
        completedCount={completed}
        validCount={valid}
        invalidCount={invalid}
        participantMode={study.participantMode}
        passiveJobStatus={study.passiveJobStatus}
        passiveJobProgress={study.passiveJobProgress as Record<string, unknown> | null}
      />
    </div>
  );
}
