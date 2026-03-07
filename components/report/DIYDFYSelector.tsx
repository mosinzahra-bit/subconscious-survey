"use client";

import { useState, useEffect } from "react";

interface DIYDFYSelectorProps {
  studyId: string;
  reportId: string;
  calendlyUrl?: string | null;
}

export function DIYDFYSelector({ studyId, reportId, calendlyUrl }: DIYDFYSelectorProps) {
  const [dfyOpen, setDfyOpen] = useState(false);
  const [toolkitLoading, setToolkitLoading] = useState(false);
  const [dfySent, setDfySent] = useState(false);
  const [url, setUrl] = useState(calendlyUrl ?? "");
  useEffect(() => {
    if (calendlyUrl) setUrl(calendlyUrl);
    else
      fetch("/api/me")
        .then((r) => r.json())
        .then((d) => setUrl(d.calendlyUrl ?? ""))
        .catch(() => {});
  }, [calendlyUrl]);

  const handleDownloadToolkit = async () => {
    setToolkitLoading(true);
    try {
      const res = await fetch(`/api/studies/${studyId}/toolkit?reportId=${reportId}`);
      if (!res.ok) throw new Error("Toolkit failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Husbar_DIY_Toolkit_${studyId}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setToolkitLoading(false);
    }
  };

  const handleBookCall = () => {
    if (!dfySent) {
      fetch(`/api/studies/${studyId}/dfy-notify`, { method: "POST" }).catch(() => {});
      setDfySent(true);
    }
    setDfyOpen(true);
  };

  return (
    <div className="card-elevated px-6 py-6 space-y-6">
      <h2 className="font-heading text-lg">Your next move</h2>
      <p className="text-sm text-[var(--text-secondary)]">
        You have the strategy. Now you need execution. Choose how you want to move forward.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card px-4 py-4 space-y-3">
          <h3 className="font-heading text-sm">Do it yourself</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Get the full implementation toolkit: n8n workflow templates, GHL funnel blueprint,
            email sequence copy, ad headlines, and a one-page psychology cheatsheet.
          </p>
          <ul className="text-[11px] text-[var(--text-muted)] space-y-1">
            <li>✓ n8n workflow JSON</li>
            <li>✓ GHL funnel notes</li>
            <li>✓ Email sequence PDF</li>
            <li>✓ Copy templates</li>
            <li>✓ Strategy summary PDF</li>
            <li>✓ Psychology cheatsheet</li>
          </ul>
          <button
            type="button"
            onClick={handleDownloadToolkit}
            disabled={toolkitLoading}
            className="w-full inline-flex items-center justify-center rounded-md border border-[var(--border-bright)] bg-[var(--green-deep)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--bg-primary)] hover:bg-[var(--green-vivid)] disabled:opacity-60"
          >
            {toolkitLoading ? "Generating…" : "Download toolkit"}
          </button>
        </div>
        <div className="card px-4 py-4 space-y-3 border-[var(--gold)]/40">
          <h3 className="font-heading text-sm">Husbar does it for you</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Our psychology-trained team builds your entire funnel: strategy → GoHighLevel setup,
            copy written from your D-score insights, automation configured and tested.
          </p>
          <ul className="text-[11px] text-[var(--text-muted)] space-y-1">
            <li>✓ Strategy → funnel built in GoHighLevel</li>
            <li>✓ All copy using your D-score insights</li>
            <li>✓ Automation configured and tested</li>
            <li>✓ Starting at $1,800 one-time + $800/mo</li>
          </ul>
          <button
            type="button"
            onClick={handleBookCall}
            className="w-full inline-flex items-center justify-center rounded-md border border-[var(--gold)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--gold)] hover:bg-[var(--gold)]/10"
          >
            Book strategy call →
          </button>
        </div>
      </div>

      {dfyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setDfyOpen(false)}
        >
          <div
            className="card-elevated max-w-lg w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-lg">Book a strategy call with Husbar</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              We’re a psychology-based marketing firm, not a generic agency. This engagement
              includes: strategy translated into your funnel, copy written using your implicit
              data, and automation configured. Funnel typically live within 14 days.
            </p>
            <div className="aspect-video bg-[var(--bg-secondary)] rounded-md flex items-center justify-center text-xs text-[var(--text-muted)] overflow-hidden">
              {url ? (
                <iframe
                  src={url.startsWith("http") ? url : `https://calendly.com/${url.replace(/^\/+/, "")}`}
                  className="w-full h-full min-h-[400px] border-0"
                  title="Book a call"
                />
              ) : (
                "Calendly embed — set CALENDLY_URL in env or add calendlyUrl to your client profile to show your booking page."
              )}
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              We’ll follow up within 24 hours. No SDR sequence — a direct conversation.
            </p>
            <button
              type="button"
              onClick={() => setDfyOpen(false)}
              className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--text-secondary)]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
