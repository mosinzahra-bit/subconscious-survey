import { prisma } from "@/lib/db/prisma";
import { getSupabaseServerClient } from "@/lib/auth/server";

export default async function StudiesListPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const studies = await prisma.study.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="badge mb-1">Studies</p>
          <h1 className="font-heading text-2xl">Your behavioral questions, structured.</h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
            Each study is a precise question about how your market&apos;s brain treats two
            competing concepts under time pressure.
          </p>
        </div>
        <a
          href="/dashboard/studies/new"
          className="inline-flex items-center rounded-md border border-[var(--border-bright)] bg-[var(--green-deep)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--bg-primary)] hover:bg-[var(--green-vivid)]"
        >
          New study
        </a>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/40 text-[var(--text-muted)] font-data text-[10px] uppercase tracking-[0.2em]">
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Mode</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Created</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {studies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-xs text-[var(--text-secondary)]">
                  You haven&apos;t run a study yet. Start with a simple brand preference
                  test — two brands, one subconscious winner.
                </td>
              </tr>
            ) : (
              studies.map((study) => (
                <tr
                  key={study.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--bg-secondary)]/80"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-heading text-sm">{study.title}</span>
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        {study.description}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-data text-[var(--text-secondary)]">
                    {study.participantMode === "LIVE_IAT" ? (
                      <span className="badge">● Behavioral data</span>
                    ) : (
                      <span className="badge border-[var(--gold)]/60 text-[var(--gold)]">
                        ◈ Linguistic signals
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="font-data px-2 py-1 rounded-md border border-[var(--border)] text-[var(--text-secondary)]">
                      {study.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                    {study.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-right">
                    <a
                      href={`/dashboard/studies/${study.id}`}
                      className="underline decoration-[var(--green-muted)] underline-offset-4"
                    >
                      Open
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

