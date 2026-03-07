import { prisma } from "@/lib/db/prisma";
import { getSupabaseServerClient } from "@/lib/auth/server";

export default async function DashboardHomePage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    // Protected by layout, but keep type-safe
    return null;
  }

  const client = await prisma.client.findUnique({
    where: { id: user.id },
    include: {
      studies: {
        include: {
          sessions: true
        }
      }
    }
  });

  const studies = client?.studies ?? [];
  const totalStudies = studies.length;
  const totalSessions = studies.reduce(
    (acc, s) => acc + s.sessions.length,
    0
  );
  const validSessions = studies.reduce(
    (acc, s) => acc + s.sessions.filter((sess) => sess.isValid).length,
    0
  );
  const meanDScore =
    studies
      .flatMap((s) => s.sessions)
      .filter((sess) => sess.isValid && typeof sess.dScore === "number")
      .reduce(
        (acc, sess, _, arr) => acc + (sess.dScore ?? 0) / arr.length,
        0
      ) || 0;

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="badge mb-1">Dashboard</p>
        <h1 className="font-heading text-2xl">
          See how fast your market&apos;s brain moves.
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
          Every number here comes from behavior under time pressure. Treat it as
          subconscious truth, not survey politeness.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <div className="card-elevated px-4 py-3 space-y-1">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Active studies
          </p>
          <p className="font-data text-2xl">
            {studies.filter((s) => s.status === "ACTIVE").length}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Each study runs a full 7-block IAT or linguistic analysis.
          </p>
        </div>
        <div className="card-elevated px-4 py-3 space-y-1">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Participants measured
          </p>
          <p className="font-data text-2xl">{totalSessions}</p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Live IAT sessions completed across all studies.
          </p>
        </div>
        <div className="card-elevated px-4 py-3 space-y-1">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Valid sessions
          </p>
          <p className="font-data text-2xl">
            {validSessions}
            <span className="text-[11px] text-[var(--text-secondary)] ml-1">
              ({totalSessions > 0 ? Math.round((validSessions / totalSessions) * 100) : 0}
              %)
            </span>
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            We automatically exclude rushed, unreliable data.
          </p>
        </div>
        <div className="card-elevated px-4 py-3 space-y-1">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Mean association score
          </p>
          <p className="font-data text-2xl">
            {meanDScore.toFixed(2)}
            <span className="text-[11px] text-[var(--text-secondary)] ml-1">
              (−2 to +2)
            </span>
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Direction and strength of implicit preference across all valid sessions.
          </p>
        </div>
      </section>
      <section className="card px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-sm mb-1">
            Start a new implicit study
          </h2>
          <p className="text-[11px] text-[var(--text-secondary)] max-w-md">
            Choose between a live 7-block IAT or Passive Intelligence scan.
            Both feed into the same Husbar strategy engine.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/dashboard/studies/new"
            className="inline-flex items-center rounded-md border border-[var(--border-bright)] bg-[var(--green-deep)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--bg-primary)] hover:bg-[var(--green-vivid)]"
          >
            New study →
          </a>
          <a
            href="/dashboard/studies"
            className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--text-secondary)] hover:border-[var(--border-bright)]"
          >
            View all studies
          </a>
        </div>
      </section>
    </div>
  );
}

