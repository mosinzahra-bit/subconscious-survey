import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const client = await prisma.client.findUnique({
    where: { id: user.id }
  });

  if (!client) {
    // Create a minimal client profile if registration skipped the API
    await prisma.client.create({
      data: {
        id: user.id,
        email: user.email ?? "",
        companyName: user.user_metadata?.companyName ?? "Unnamed Client",
        plan: "STARTER"
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--bg-primary)]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[var(--green-muted)] to-[var(--green-deep)] flex items-center justify-center font-data text-[var(--bg-primary)] text-xs">
              H
            </div>
            <div>
              <p className="font-heading text-sm">Subconscious Survey</p>
              <p className="text-[10px] text-[var(--text-muted)]">
                Husbar · Behavioral Intelligence System
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-xs font-data uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            <a href="/dashboard" className="hover:text-[var(--green-muted)]">
              Overview
            </a>
            <a href="/dashboard/studies" className="hover:text-[var(--green-muted)]">
              Studies
            </a>
            <a href="/dashboard/billing" className="hover:text-[var(--green-muted)]">
              Billing
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
}

