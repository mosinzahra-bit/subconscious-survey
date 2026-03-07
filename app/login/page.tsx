"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/auth/client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    if (error) {
      setError("We couldn't log you in. Check your details and try again.");
      return;
    }
    router.push(redirectTo);
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    setLoading(false);
    if (error) {
      setError("Google sign-in failed. Try email or another browser.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full card-elevated px-8 py-10 space-y-6">
        <div className="space-y-2 text-center">
          <p className="badge mx-auto w-fit mb-2">Husbar · Client access</p>
          <h1 className="font-heading text-2xl">Log in to Subconscious Survey</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Built for CMOs and research leaders who want behavioral truth, not
            polite survey answers.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-data tracking-[0.18em] uppercase text-[var(--text-muted)]">
              Work email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-data tracking-[0.18em] uppercase text-[var(--text-muted)]">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--border-bright)]"
            />
          </div>
          {error && (
            <p className="text-xs text-[var(--red-alert)] text-left">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md border border-[var(--border-bright)] bg-[var(--green-deep)] px-3 py-2 text-sm font-data tracking-[0.18em] uppercase text-[var(--bg-primary)] hover:bg-[var(--green-vivid)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Checking credentials..." : "Log in"}
          </button>
        </form>
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-data tracking-[0.18em] uppercase text-[var(--text-secondary)] hover:border-[var(--border-bright)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Continue with Google
          </button>
          <p className="text-[11px] text-center text-[var(--text-muted)]">
            No marketing fluff here. Logging in gives you access to live implicit
            data and strategy reports, nothing else.
          </p>
          <p className="text-[11px] text-center text-[var(--text-muted)]">
            Need an account?{" "}
            <a
              href="/register"
              className="underline decoration-[var(--green-muted)] underline-offset-4"
            >
              Request access
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full card-elevated px-8 py-10 animate-pulse text-center text-[var(--text-muted)]">
          Loading…
        </div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}

