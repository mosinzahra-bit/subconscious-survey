"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/auth/client";

const BUSINESS_TYPES = ["B2B", "B2C", "E-commerce", "Service", "SaaS"] as const;

export default function RegisterPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [businessType, setBusinessType] = useState<(typeof BUSINESS_TYPES)[number] | "">("");
  const [industry, setIndustry] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error || !data.user) {
      setLoading(false);
      setError("We couldn't create your account. Try a different email or check your connection.");
      return;
    }

    try {
      await fetch("/api/register-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data.user.id,
          email,
          companyName,
          businessType,
          industry,
          targetMarket
        })
      });
    } catch (e) {
      console.error(e);
      // still proceed; client profile can be completed later
    }

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl w-full card-elevated px-8 py-10 space-y-6">
        <div className="space-y-2 text-center">
          <p className="badge mx-auto w-fit mb-2">Husbar · New client</p>
          <h1 className="font-heading text-2xl">Create your Husbar research space</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            A focused workspace for implicit testing and strategy, not another generic
            survey dashboard.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-data tracking-[0.18em] uppercase text-[var(--text-muted)]">
                Work email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-data tracking-[0.18em] uppercase text-[var(--text-muted)]">
                Company
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)]"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-data tracking-[0.18em] uppercase text-[var(--text-muted)]">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)]"
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-data tracking-[0.18em] uppercase text-[var(--text-muted)]">
                Business type
              </label>
              <select
                required
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as any)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs outline-none focus:border-[var(--border-bright)]"
              >
                <option value="">Select</option>
                {BUSINESS_TYPES.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-data tracking-[0.18em] uppercase text-[var(--text-muted)]">
                Industry
              </label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs outline-none focus:border-[var(--border-bright)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-data tracking-[0.18em] uppercase text-[var(--text-muted)]">
                Target market
              </label>
              <input
                type="text"
                required
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs outline-none focus:border-[var(--border-bright)]"
              />
            </div>
          </div>
          {error && (
            <p className="text-xs text-[var(--red-alert)] text-left">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md border border-[var(--border-bright)] bg-[var(--green-deep)] px-3 py-2 text-sm font-data tracking-[0.18em] uppercase text-[var(--bg-primary)] hover:bg-[var(--green-vivid)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating your space..." : "Create account and enter dashboard"}
          </button>
          <p className="text-[11px] text-[var(--text-muted)]">
            We use your business context to tailor strategy reports and automation
            stacks, not to sell your data.
          </p>
        </form>
      </div>
    </main>
  );
}

