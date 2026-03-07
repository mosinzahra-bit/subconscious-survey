import { prisma } from "@/lib/db/prisma";
import { getSupabaseServerClient } from "@/lib/auth/server";

const PLAN_COPY: Record<
  string,
  { label: string; description: string; detail: string }
> = {
  STARTER: {
    label: "Starter — $499 per study",
    description:
      "For focused questions where you need one sharp answer, not a continuous program.",
    detail:
      "Run individual IAT or Passive Intelligence studies as needed. Ideal for testing key campaigns, positioning decisions, or investor-critical narratives."
  },
  RETAINER: {
    label: "Retainer — $800/month, unlimited studies",
    description:
      "For teams who want behavioral signal baked into every major decision.",
    detail:
      "Launch as many studies as you need across brands, markets, and cycles. Includes ongoing strategy report updates as new data comes in."
  },
  ENTERPRISE: {
    label: "Enterprise — talk to Husbar",
    description:
      "For groups who want Husbar wired into their entire research and go-to-market stack.",
    detail:
      "Custom plans, data integrations, and white-glove execution. Includes advanced governance, SSO, and private strategy workshops."
  }
};

export default async function BillingPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const client = await prisma.client.findUnique({
    where: { id: user.id }
  });

  const planKey = client?.plan ?? "STARTER";
  const plan = PLAN_COPY[planKey];

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="badge mb-1">Billing</p>
        <h1 className="font-heading text-2xl">Your Husbar footprint.</h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
          You&apos;re not paying for dashboards. You&apos;re paying for better decisions
          — anchored in subconscious evidence.
        </p>
      </section>
      <section className="grid md:grid-cols-[2fr,1.5fr] gap-6 items-start">
        <div className="card-elevated px-5 py-4 space-y-3">
          <h2 className="font-heading text-lg">{plan.label}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{plan.description}</p>
          <p className="text-xs text-[var(--text-secondary)]">{plan.detail}</p>
          <div className="mt-2 grid gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Company</span>
              <span className="font-data text-[var(--text-primary)]">
                {client?.companyName ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Business type</span>
              <span className="font-data text-[var(--text-primary)]">
                {client?.businessType ?? "Not set"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Industry</span>
              <span className="font-data text-[var(--text-primary)]">
                {client?.industry ?? "Not set"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Target market</span>
              <span className="font-data text-[var(--text-primary)]">
                {client?.targetMarket ?? "Not set"}
              </span>
            </div>
          </div>
        </div>
        <div className="card px-5 py-4 space-y-3">
          <h3 className="font-heading text-sm">Need more than your current plan?</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            If you&apos;re running more than a handful of studies a quarter, you&apos;re in
            retainer territory. If you&apos;re wiring implicit measures into every launch,
            you&apos;re ready for Enterprise.
          </p>
          <a
            href="mailto:hello@husbar.com?subject=Husbar%20plan%20upgrade"
            className="inline-flex items-center rounded-md border border-[var(--border-bright)] bg-[var(--green-deep)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--bg-primary)] hover:bg-[var(--green-vivid)]"
          >
            Talk to Husbar →
          </a>
          <p className="text-[10px] text-[var(--text-muted)]">
            No SDR sequence, no pressure. Just a conversation about whether deeper
            behavioral infrastructure would move the needle for you.
          </p>
        </div>
      </section>
    </div>
  );
}

