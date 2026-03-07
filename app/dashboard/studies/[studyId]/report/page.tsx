import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import ReportClient from "./report-client";

export default async function ReportPage({
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
    include: { client: true }
  });
  if (!study) notFound();

  const reports = await prisma.strategyReport.findMany({
    where: { studyId: params.studyId },
    orderBy: { version: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="badge mb-1">Strategy report</p>
          <h1 className="font-heading text-2xl">{study.title}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Psychology-based marketing blueprint — 6 pillars from Husbar.
          </p>
        </div>
        <a
          href={`/dashboard/studies/${study.id}`}
          className="text-xs font-data uppercase tracking-[0.18em] text-[var(--text-secondary)] underline decoration-[var(--green-muted)] underline-offset-4"
        >
          ← Study detail
        </a>
      </div>
      <ReportClient
        studyId={study.id}
        studyTitle={study.title}
        initialReports={reports}
        calendlyUrl={study.client?.calendlyUrl}
      />
    </div>
  );
}
